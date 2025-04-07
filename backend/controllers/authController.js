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
            return res.status(401).json({ success: false, message: "Invalid Login" });
        }

        const user = results[0];

        try {

            const isPasswordMatched = await bcrypt.compare(password, user.password);

            if (!isPasswordMatched) {
                return res.status(401).json({ success: false, message: "Invalid Login" });
            }

            sendToken(user, req, 200, res);

        } catch (error) {
            console.error("Password comparison error:", error);
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
    console.log("isAuthenticated user Ran!");
    if (!token) {
        return next(new ErrorHandler("It looks like you're not logged in. Please log in to access this resource.", 401));
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //console.log("Decoded Token:", decoded);

        const currentIpAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const currentBrowserType = req.headers["user-agent"];

        if (decoded.ipAddress !== currentIpAddress) {
            return next(new ErrorHandler("Unauthorized access: IP address mismatch.", 401));
        }

        if (decoded.browserType !== currentBrowserType) {
            return next(new ErrorHandler("Unauthorized access: Browser type mismatch.", 401));
        }

        // Fetch user from database
        const results = connection.query("SELECT * FROM user WHERE username = ?", [decoded.username]);

        if (results.length === 0) {
            return next(new ErrorHandler("User not found", 404));
        }
    
        req.decoded = decoded;
        console.log("User is authenticated:", req.decoded.username);

        next();
                
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        return next(new ErrorHandler("Invalid or expired token.", 401));
    }

});

exports.validateAccess = (groupName) => {
    return (req, res, next) => {
        const { username } =  req.decoded;

        console.log("validateAccess Ran!");

        if(!username) {
            return res.status(200).json({ message: " User not authenticated."});
        }
        return checkGroup(username, groupName, (err, groupString, isAdmin, isMember) => {
            if (err) {
                return res.status(500).json({ message: "Server error during group check" });
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
        })
    }
}

const checkGroup = (username, groupName, callback) => {
    const values = [username, `%,${groupName},%`];

    connection.query('SELECT * FROM user WHERE username = ? AND user_groupName LIKE ?', values, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return callback(err, null);  // Return the error via the callback
        }

        // If no results found, the user doesn't belong to the specified group
        if (results.length === 0) {
            return callback(null, false);  // User is not found in the group
        }

        const groupString = results[0].user_groupName || "";
        const isMember = groupString.includes(`,${groupName},`);
        console.log("Group string:", groupString);

        // Return the result (whether the user is in the admin group)
        callback(null, groupString, isMember);
    });
};


// exports.checkLogin = async (req, res) => {
//     try {
//         const { username } = req.decoded;

//         // Query user with group info
//         connection.query('SELECT user_groupName FROM user WHERE username = ?',[username],(err, results) => {
//             if (err) {
//                 console.error("DB error:", err);
//                 return res.status(500).json({ message: "Database error" });
//             }

//             if (results.length === 0) {
//                 return res.status(404).json({ authenticated: false, message: "User not found" });
//             }

//             const groupString = results[0].user_groupName || "";
//             const isAdmin = groupString.includes(",admin,");

//             res.status(200).json({authenticated: true, user: username, groups: groupString, isAdmin});
//         }
//     );
//     } catch (error) {
//         res.status(500).json({ message: "Server error while checking login status" });
//     }
// };

// exports.isAuthorized = (authorizedGroups) => {
//     return (req, res, next) => {
//         const { username } = req.decoded; // Get username from decoded token

//         let checkedGroups = 0;
//         let hasAccess = false;

//         console.log(`Checking authorization for ${username} in groups: ${authorizedGroups}`);

//         // Check each group asynchronously
//         authorizedGroups.forEach((group) => {
//             checkGroup(username, group, (err, isMember) => {
//                 if (err) {
//                     return res.status(500).json({ success: false, message: "Server error" });
//                 }
                
//                 if (isMember) {
//                     hasAccess = true;
//                 }

//                 checkedGroups++;

//                 // Proceed if all checks are done
//                 if (checkedGroups === authorizedGroups.length) {
//                     if (hasAccess) {
//                         return next(); // User has access, proceed to next middleware
//                     }
//                     return res.status(403).json({ success: false, message: "Access denied." });
//                 }
//             });
//         });
//     };
// };

// const checkGroup = (username, groupName, callback) => {
//     const values = [username, `%,${groupName},%`];
    
//     connection.query('SELECT * FROM user WHERE username = ? AND user_groupName LIKE ?', values, (err, results) => {
//         if (err) {
//             console.error("Database error:", err);
//             return callback(err, null);
//         }
//         if (results.length === 0) {
//             // return call
//         }
//         console.log(`Query result for user ${username} in group ${groupName}:`, results);

//         callback(null, results.length > 0); // Returns true if user is in the group
//     });
// };




