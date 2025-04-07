const jwt = require("jsonwebtoken");
require('dotenv').config();

// Create and send token and save in cookie
const sendToken = (user, req, statusCode, res) => {
    // Extract IP address from request
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Extract browser type from User-Agent header
    const browserType = req.headers['user-agent'];

    // Create JWT Token with additional details
    const token = jwt.sign(
        { username: user.username, group: user.group, ipAddress, browserType }, process.env.JWT_SECRET, // Replace with an environment variable
        { expiresIn: "1h" }
    );

    // Options for cookie
    const options = {
        expires: new Date(Date.now() + 60 * 60 * 1000),
        httpOnly: true,
        secure : false
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    });
};

module.exports = sendToken;
