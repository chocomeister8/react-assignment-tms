const bcrypt = require("bcrypt");
const User = require('../models/users');

async function hashPW(password) {
    try{
        const salt = await bcrypt.genSalt(10);
        // Hash the password
        const hashedPW = await bcrypt.hash(password, salt);
        console.log('Hashed password', hashedPW);
        return hashedPW;

    } catch(error) {
        console.error('Error hashing password:', error);
        return null;
    }
};

exports.getAllUsers = async (req, res) => {

    if (!req.decoded) {
        return res.status(500).json({ error: "Token is missing or invalid." });
    }

    User.getAll((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getUserByUserName = async (req, res) => {

    if (!req.decoded) {
        return res.status(500).json({ error: "Token is missing or invalid." });
    }

    const { username } = req.params;
    User.getByUserName(username, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'User not found!' });
        res.json(results[0]);
    });
};

exports.createUser = async (req, res) => {
    console.log("📥 Received request body:", req.body);
    const { username, email, password, user_groupName } = req.body;
    let { isActive } = req.body;

    if (isActive === undefined || isActive === null) {
        isActive = 1;
    }

    // Validate required fields
    if (!username || !email || !password || !user_groupName) {
        return res.status(400).json({ error: "Please fill in all fields!" });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,10}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            error: "Password must be 8-10 characters long and contain at least one letter, one number, and one special character."
        });
    }

    if (!req.decoded) {
        return res.status(500).json({ error: "Token is missing or invalid." });
    }
    User.getByUserName(username, (err, results) => {
        if (err) {
            console.log('Error details:', err);
            return res.status(500).json({ error: 'Database error occurred.' });
        }
        if (results.length > 0) {
            return res.status(400).json({ error: 'Username already exists!' });
        }

        hashPW(password).then(hashedPassword => {
            const groupsArray = `,${user_groupName.split(',').join(',')},`; 

            // Use the user model's create function
            User.create(username, email, hashedPassword, isActive, groupsArray, (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to create user' });
                }

                res.status(201).json({ 
                    message: 'User created successfully!', 
                    user: { username, email, password, user_groupName, isActive }
                });
            });
        }).catch(err => {
            return res.status(500).json({ error: 'Error hashing password' });
        });
    });
};

exports.updateUser = (req, res) => {
    const { username } = req.params;
    const { email, password, isActive, user_groupName } = req.body;
    const groupsArray = `,${user_groupName.split(',').join(',')},`;

    if (isActive === undefined || isActive === null) {
        isActive = 1;
    }

    // Validate required fields
    if (!username || !email || !user_groupName) {
        return res.status(400).json({ error: "Please fill in all fields!" });
    }

    if (!req.decoded) {
        return res.status(500).json({ error: "Token is missing or invalid." });
    }

    const trimmedPassword = typeof password === 'string' ? password.trim() : '';

    // Case 1: password is empty or not provided
    if (!trimmedPassword) {
        User.update(email, isActive, groupsArray, username, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User updated successfully!' });
            console.log("Update result (no password):", results);
        });
    } 
    // Case 2: password is provided – validate and hash
    else {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,10}$/;
        if (!passwordRegex.test(trimmedPassword)) {
            return res.status(400).json({
                error: "Password must be 8-10 characters long and contain at least one letter, one number, and one special character."
            });
        }

        bcrypt.hash(trimmedPassword, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ error: err.message });

            User.updateWithPW(email, hashedPassword, isActive, groupsArray, username, (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'User updated successfully!' });
                console.log("Update result (with password):", results);
            });
        });
    }
};


