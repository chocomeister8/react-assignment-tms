const connection = require("../config/database"); // Import MySQL connection
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const sendToken = (user, req, statusCode, res) => {
    // Extract IP address from request
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Extract browser type from User-Agent header
    const browserType = req.headers['user-agent'];

    // Create JWT Token with additional details
    const token = jwt.sign(
        { username: user.username, group: user.group, ipAddress, browserType }, process.env.JWT_SECRET, // Replace with an environment variable
        { expiresIn: "2h" }
    );

    // Options for cookie
    const options = {
        expires: new Date(Date.now() + 120 * 60 * 1000),
        httpOnly: true,
        secure : false
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    });
};

exports.login = async (req, res, next) => {
    const { username, password } = req.body;
    

    // Finding user in database
    const sql = "SELECT username, email, password, isActive, user_groupName FROM user WHERE username = ? LIMIT 1";
    connection.query(sql, [username], async (err, results)=> {

        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "ET3", message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(200).json({ success: false, error: "EA2", message: "Invalid Login" });
        }

        const user = results[0];

        if (user.isActive === 0) {
            return res.status(200).json({ success: false, error: "EA2", message: "Invalid Login" });
        }

        try {

            const isPasswordMatched = await bcrypt.compare(password, user.password);

            if (!isPasswordMatched) {
                return res.status(200).json({ success: false, error: "EA2", message: "Invalid Login" });
            }
            sendToken(user, req, 200, res);
        } catch (error) {

            return res.status(500).json({ success: false, error: "EA2", message: "Error verifying password!" });
        }
    });
}

// Logout user => /logout
exports.logout = (req, res) => {
    try {
        res.clearCookie('token');
        // Respond with a success message
        res.status(200).json({ success: true, message: "Logged out successfully!" });
      } catch (error) {
        res.status(200).json({ success: false, error: "EA2", message: "Error logging out!" });
      }
};

exports.isAuthenticatedUser = async (req, res, next) => {
    let token = req.cookies.token;
    if (!token) {
        return res.status(200).json({ success: false, error: "EA2", message: "Unauthorized User." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentIpAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const currentBrowserType = req.headers["user-agent"];

        if (decoded.ipAddress !== currentIpAddress) {
            return res.status(200).json({ success: false, error: "EA2", message: "Unauthorized access: IP address mismatch." });
        }

        if (decoded.browserType !== currentBrowserType) {
            return res.status(200).json({ success: false, error: "EA2", message: "Unauthorized access: Browser type mismatch." });
        }

        // Fetch user from database
        connection.query("SELECT username, email, password, isActive, user_groupName FROM user WHERE username = ?", 
            [decoded.username], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, error: "ET3", message: "Database error." });
            }

            if (results.length === 0 || !results[0].isActive) {
                return res.status(200).json({ success: false, error: "EA1", message: "Unauthorized User." });
            }

            req.decoded = decoded;
            next(); // Proceed to the next middleware
        });
                
    } catch (err) {
        return res.status(200).json({ success: false, error: "EA2", message: "Invalid or expired token." });
    }
};

exports.validateAccess = (groupName) => {
    return (req, res, next) => {
        const { username } =  req.decoded;
        if(!username) {
            return res.status(200).json({success: false, error: "EA1", message: "User not authenticated."});
        }
        checkGroup(username, groupName, (err, groupString, isMember) => {
            if (err) {
                return res.status(500).json({success: false, error: "ET3", message: "Server error during group check" });
            }

            req.userGroup = groupString;
            req.isAdmin = groupString.includes(',admin,');

            if (groupName && !isMember) {
                return res.status(200).json({ success: false, error: "EA1", message: "Access denied: User is not in the required group" });
            }
            next();
        });
    }
}

const checkGroup = (username, groupName, callback) => {
    if (!groupName) {
        // If no group is specified, return the user's full group string
        connection.query('SELECT user_groupName FROM user WHERE username = ?', [username], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return callback(err, null);
            }

            if (results.length === 0) {
                return callback(null, "", false); // User not found
            }

            const groupString = results[0].user_groupName || "";
            return callback(null, groupString, false); // false because no group check
        });
    } else {
        // Normal check with groupName
        const values = [username, `%,${groupName},%`];
        connection.query('SELECT user_groupName FROM user WHERE username = ? AND user_groupName LIKE ?', values, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return callback(err, null);
            }

            if (results.length === 0) {
                return callback(null, "", false); // Not in group
            }

            const groupString = results[0].user_groupName || "";
            const isMember = groupString.includes(`,${groupName},`);
            return callback(null, groupString, isMember);
        });
    }
};

exports.getCreateTaskPermission = (req, res, next) => {
    const { username } =  req.decoded;
    const { appAcronym } = req.body;

    // Get groupname assigned to app_permit_create for app
    return connection.query('SELECT App_permit_Create FROM application WHERE App_Acronym = ?', [appAcronym], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: "ET3", message: "Database error while checking permissions." });
        }
        if (results.length === 0){
            return res.status(200).json({ success: false, error: "EA1", message: "User not allowed to perform this action."});
        }

        const groupName = results[0].App_permit_Create;

        // ❗ Check if no group assigned at all
        if (!groupName || groupName.trim() === "") {
            return res.status(200).json({ success: false, error: "EA1", message: "Access denied: No group assigned for task creation." });
        }

        checkGroup(username, groupName, (err, groupString, isMember) => {
            if (err) {
                return res.status(500).json({ success: false, error: "ET3", message: "Server error during group check" });
            }

            req.app_permit_create = groupString.includes(groupName);

            // if user's group is not part of app_permit_create
            if (groupName && !isMember) {
                return res.status(200).json({ success: false, error: "EA1", message: "Access denied: User is not in the required group" });
            }
            // Contunue to taskcontroller to create task
            req.app_permit_create = true;
            next();
        });
    });
}

exports.getUpdateTaskPermission = (req, res, next) => {
    const { username } = req.decoded;
    const { Task_id } = req.body;

    // Step 1: Get the current task state and acronym
    connection.query('SELECT Task_state, Task_app_Acronym FROM task WHERE Task_id = ?', [Task_id], (err, taskResults) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error retrieving task data." });
        }
        if (taskResults.length === 0) {
            return res.status(200).json({ success: false, message: "Task not found." });
        }

        const { Task_state, Task_app_Acronym } = taskResults[0];

        // Step 2: Determine correct permission column based on state
        let permitColumn;
        switch (Task_state) {
            case 'Open':
                permitColumn = 'App_permit_Open';
                break;
            case 'To Do':
                permitColumn = 'App_permit_toDoList';
                break;
            case 'Doing':
                permitColumn = 'App_permit_Doing';
                break;
            case 'Done':
                permitColumn = 'App_permit_Done';
                break;
            case 'Closed':
                permitColumn = null; // No permission check needed
                break;
            default:
                return res.status(400).json({ success: false, message: "Invalid task state for permission check." });
        }

        // Step 3: Get group name for the state from the application table
        connection.query(`SELECT ?? FROM application WHERE App_Acronym = ?`, [permitColumn, Task_app_Acronym], (err, appResults) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Error retrieving permission data." });
            }
            if (appResults.length === 0) {
                return res.status(200).json({ success: false, message: "Application not found." });
            }

            const groupName = appResults[0][permitColumn];

            // Step 4: Check if user is in the correct group
            checkGroup(username, groupName, (err, groupString, isMember) => {
                if (err) {
                    return res.status(500).json({ success: false, message: "Error during group membership check." });
                }

                if (!isMember) {
                    return res.status(200).json({ success: false, message: "Access denied: You are not permitted to update this task." });
                }

                req.task_state_permission = true; // optional, can be used later in controller
                next();
            });
        });
    });
};




