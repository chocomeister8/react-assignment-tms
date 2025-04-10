const bcrypt = require("bcrypt");
const db = require('../config/database');

exports.getAllUsers = async (req, res) => {

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }

    try {
        db.query('SELECT username, email, password, isActive, user_groupName FROM user', (err, results) => {
            if(err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        })
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(200).json({ error: "Internal server error."})
    }

};

exports.getUserByUserName = async (req, res) => {

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }

    const { username } = req.params;

    db.query('SELECT username FRON user WHERE username = ?', [username], (err, results) =>{
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(200).json({ message: 'User not found!' });
        res.json(results[0]);
    })
};

exports.createUser = async (req, res) => {
    let { username, email, password, user_groupName } = req.body;
    username = username.toLowerCase();
    let { isActive } = req.body;

    if (isActive === undefined || isActive === null) {
        isActive = 1;
    }

    // Validate required fields
    if (!username || !email || !password) {
        return res.status(200).json({ error: "Please fill in all fields!" });
    }

    const usernameRegex = /^[a-z0-9_\-\/]{1,50}$/;
    if (!usernameRegex.test(username)) {
        return res.status(200).json({
            error: "Username can only contain lowercase letters, numbers, and _ - / characters, and must be 50 characters or fewer."
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
    return res.status(200).json({ error: "Please enter a valid email format!" });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,10}$/;
    if (!passwordRegex.test(password)) {
        return res.status(200).json({
            error: "Password must be 8-10 characters long and contain at least one letter, one number, and one special character."
        });
    }

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }
    try {
        // Check if the username already exists
        db.query('SELECT username FROM user WHERE username = ?', [username], (err, results) => {
            if (err) {
                console.log('Error details:', err);
                return res.status(500).json({ error: 'Database error occurred.' });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: 'Username already exists!' });
            }
            
            // Hash password before saving it
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    return res.status(200).json({ error: 'Error hashing password.' });
                }

                // Format the groupsArray (if multiple groups are provided, they will be stored as a comma-separated list)
                const groupsArray = `,${user_groupName.split(',').join(',')},`;

                // Create the user
                db.query('INSERT INTO user (username, email, password, isActive, user_groupName) VALUES (?, ?, ?, ?, ?)',
                    [username, email, hashedPassword, isActive, groupsArray],
                    (err, results) => {
                        if (err) {
                            console.log('Error details:', err);
                            return res.status(500).json({ error: 'Failed to create user.' });
                        }
                        res.status(200).json({ success: 'User created successfully!',
                            user: { username, email, user_groupName, isActive }
                        });
                    }
                );
            });
        });
    } catch (error) {
        console.log('Error creating user:', error);
        return res.status(200).json({ error: 'Internal server error' });
    }
};

exports.updateUser = (req, res) => {
    const { username } = req.params;
    const { email, password, isActive, user_groupName } = req.body;
    const trimmedPassword = typeof password === 'string' ? password.trim() : '';
    let groupsArray = null;

    if(username.toLowerCase() === "admin"){
        if (user_groupName && !user_groupName.includes("admin")) {
            return res.status(200).json({ error: "'admin' group cannot be removed for specific user." });
        }

        // Prevent modifying admin's status to inactive
        if (isActive === 0) {
            return res.status(200).json({ error: "specific user cannot be disabled." });
        }
    }
    if (isActive === undefined || isActive === null) {
        isActive = 1;
    }

    // Validate required fields
    if (!username || !email) {
        return res.status(200).json({ error: "Please fill in all fields!" });
    }

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }

    if (user_groupName && user_groupName.trim() !== '') {
        groupsArray = `,${user_groupName.split(',').map(g => g.trim()).join(',')},`;
    }
    // Case 1: password is empty or not provided
    if (!trimmedPassword) {
        db.query('UPDATE user SET email = ?, isActive = ?, user_groupName = ? WHERE username = ?',
            [email, isActive, groupsArray, username],
            (err, results) => {
                if (err) {
                    console.log('Error details:', err);
                    return res.status(500).json({ error: 'Database error occurred.' });
                }
                res.status(200).json({ success: 'User updated successfully!' });
            }
        );
    }
    // Case 2: password is provided – validate and hash
    else {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,10}$/;
        if (!passwordRegex.test(trimmedPassword)) {
            return res.status(200).json({
                error: "Password must be 8-10 characters long and contain at least one letter, one number, and one special character."
            });
        }

        bcrypt.hash(trimmedPassword, 10, (err, hashedPassword) => {
            if (err) return res.status(200).json({ error: 'Error hashing password' });

            db.query('UPDATE user SET email = ?, password = ?, isActive = ?, user_groupName = ? WHERE username = ?',
                [email, hashedPassword, isActive, groupsArray, username],
                (err, results) => {
                    if (err) {
                        console.log('Error details:', err);
                        return res.status(500).json({ error: 'Failed to update user.' });
                    }
                    res.status(200).json({ success: 'User updated successfully!' });
                }
            );
        });
    }
};


