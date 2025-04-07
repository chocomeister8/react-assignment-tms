const connection = require("../config/database"); // Import MySQL connection
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendToken = require('../utils/jwtToken');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
require("dotenv").config(); 

exports.login = async (req, res, next) => {
    const { username, password } = req.body;

    // Finding user in database
    const sql = "SELECT username, email, password, isActive, user_groupName FROM user WHERE username = ? LIMIT 1";
    connection.query(sql, [username], async (err, results)=> {

        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(200).json({ success: false, message: "Invalid Login" });
        }

        const user = results[0];

        if (user.isActive === 0) {
            return res.status(200).json({ success: false, message: "Invalid Login" });
        }

        try {

            const isPasswordMatched = await bcrypt.compare(password, user.password);

            if (!isPasswordMatched) {
                return res.status(200).json({ success: false, message: "Invalid Login" });
            }

            sendToken(user, req, 200, res);

        } catch (error) {

            return res.status(500).json({ success: false, message: "Error verifying password!" });
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
        console.error("Logout error:", error);
        res.status(500).json({ success: false, message: "Error logging out!" });
      }
};

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    let token = req.cookies.token;
    if (!token) {
        return res.status(200).json({ success: false, message: "Please log in to access this resource." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentIpAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const currentBrowserType = req.headers["user-agent"];

        if (decoded.ipAddress !== currentIpAddress) {
            return res.status(200).json({ success: false, message: "Unauthorized access: IP address mismatch." });
        }

        if (decoded.browserType !== currentBrowserType) {
            return res.status(200).json({ success: false, message: "Unauthorized access: Browser type mismatch." });
        }

        // Fetch user from database
        connection.query("SELECT * FROM user WHERE username = ?", [decoded.username], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Database error." });
            }

            if (results.length === 0) {
                return res.status(200).json({ success: false, message: "User not found" });
            }

            req.decoded = decoded; 

            next(); // Proceed to the next middleware
        });
                
    } catch (err) {
        return res.status(200).json({ success: false, message: "Invalid or expired token." });
    }

});

exports.validateAccess = (groupName) => {
    return (req, res, next) => {
        const { username } =  req.decoded;

        if(!username) {
            return res.status(200).json({ message: " User not authenticated."});
        }

        if (groupName) {
            return checkGroup(username, groupName, (err, groupString, isMember) => {
                if (err) {
                    return res.status(500).json({ message: "Server error during group check" });
                }

                if (!isMember) {
                    return res.status(200).json({ success: false, message: "Access denied: User is not in the required group" });
                }

                req.userGroup = groupString;
                req.isAdmin = isMember;
                next();
            });
        } else {
            // If no group is specified, just ensure the user is authenticated
            req.isAuthenticated = true;
            next();
        }
    }
}

const checkGroup = (username, groupName, callback) => {
    const values = [username, `%,${groupName},%`];

    connection.query('SELECT * FROM user WHERE username = ? AND user_groupName LIKE ?', values, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return callback(err, null); 
        }

        // If no results found, the user doesn't belong to the specified group
        if (results.length === 0) {
            return callback(null, false);  // User is not found in the group
        }

        const user = results[0];
        const groupString = user.user_groupName || "";
        const isMember = groupString.includes(`,${groupName},`);
        const isActive = user.isActive;

        // Return the result (whether the user is in the admin group)
        callback(null, groupString, isMember, isActive);
    });
};




