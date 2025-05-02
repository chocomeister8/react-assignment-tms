const bcrypt = require("bcrypt");
const db = require('../config/database');

exports.getAllUsers = async (req, res) => {

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }
    db.query('SELECT username, email, password, isActive, user_groupName FROM user', (err, results) => {
        if(err) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ success: true, results: results});
    });
};

exports.getUserByUserName = async (req, res) => {

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }

    const { username } = req.params;

    db.query('SELECT username FROM user WHERE username = ?', [username], (err, results) =>{
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(200).json({ message: 'User not found!' });
        res.json(results[0]);
    })
};

exports.createUser = async (req, res) => {
    let { username, email, password, user_groupName } = req.body;
    username = username.toLowerCase();
    let { isActive } = req.body;

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }

    if (isActive === undefined || isActive === null) {
        isActive = 1;
    }

    // Validate required fields
    if (!username || !password) {
        return res.status(200).json({ error: "Please fill in all fields!" });
    }

    const usernameRegex = /^[a-z0-9_\-\/]{1,50}$/;
    if (!usernameRegex.test(username)) {
        return res.status(200).json({
            error: "Username can only contain lowercase letters, numbers, and _ - / characters, and must be 50 characters or fewer."
        });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,10}$/;
    if (!passwordRegex.test(password)) {
        return res.status(200).json({
            error: "Password must be 8-10 characters long and contain at least one letter, one number, and one special character."
        });
    }

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

            db.beginTransaction((err) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to start transaction." });
                }
                const groupsArray = `,${user_groupName.split(',').join(',')},`;

                // Create the user
                db.query('INSERT INTO user (username, email, password, isActive, user_groupName) VALUES (?, ?, ?, ?, ?)',
                [username, email, hashedPassword, isActive, groupsArray], (err, results) => {
                    if (err) {return db.rollback(() =>{
                        return res.status(500).json({ error: 'Failed to create user.' });
                        });
                    }
                    db.commit((err) => {
                        if(err) {
                        return db.rollback(() => {
                            return res.status(500).json({ error: "Transaction commit failed."});
                        });
                    }
                    res.status(200).json({ success: 'User created successfully!', user: { username, email, user_groupName, isActive }});
                    });
                });
            });
        });
    });  
};

exports.updateUser = (req, res) => {
    const { username } = req.params;
    const { email, password, isActive, user_groupName } = req.body;
    const trimmedPassword = typeof password === 'string' ? password.trim() : '';
    let groupsArray = '';

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
    if (!username) {
        return res.status(200).json({ error: "Please fill in all fields!" });
    }

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }

    if (user_groupName && user_groupName.trim() !== '') {
        groupsArray = `,${user_groupName.split(',').map(g => g.trim()).join(',')},`;
    }
    
    if (!trimmedPassword) {
        db.beginTransaction((err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to start transaction." });
            }
            db.query('UPDATE user SET email = ?, isActive = ?, user_groupName = ? WHERE username = ?', [email, isActive, groupsArray, username], (err, results) => {
                if (err) {
                    return db.rollback(() => {
                        return res.status(500).json({ error: 'Database error occurred.' });
                    });
                }    
                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            return res.status(500).json({ error: "Transaction commit failed." });                           
                        });
                    }
                    return res.status(200).json({ success: 'User updated successfully!' });
                    });
                }
            );
        });
    }    
    else {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,10}$/;
        if (!passwordRegex.test(trimmedPassword)) {
            return res.status(200).json({
                error: "Password must be 8-10 characters long and contain at least one letter, one number, and one special character."
            });
        }
        db.beginTransaction((err) => {
            if(err) {
                return res.status(500).json({ error: "Failed to start transaction." });
            }
            bcrypt.hash(trimmedPassword, 10, (err, hashedPassword) => {
                if (err) {
                    return db.rollback(() => {
                        return res.status(500).json({ error: 'Error hashing password.' });
                    });
                }    
                db.query('UPDATE user SET email = ?, password = ?, isActive = ?, user_groupName = ? WHERE username = ?',
                    [email, hashedPassword, isActive, groupsArray, username],
                    (err, results) => {
                        if (err) {
                            return db.rollback(() => {
                                console.log('Error details:', err);
                                return res.status(500).json({ error: 'Failed to update user.' });
                            });
                        }
                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    return res.status(500).json({ error: 'Transaction commit failed.' });
                                });
                            }
                            return res.status(200).json({ success: 'User updated successfully!' });
                        });
                    }
                );
            });
        });
    }
};

exports.userUpdateEmail = (req, res) => {
    const { email } = req.body;

    if (!req.decoded || !req.decoded.username) {
        return res.status(200).json({ error: "Unauthorized access." });
    }

    const username = req.decoded.username;

    db.beginTransaction((err) => {
        if(err) {
            return res.status(500).json({ error: "Failed to start transaction." });
        }

        db.query('UPDATE user SET email = ? WHERE username = ?', [email, username], (err, result) => {
            if (err) {return db.rollback(() => {
                console.log('Error details:', err);
                return res.status(500).json({ error: 'Failed to update email.' });
                });
            }
            db.commit((err) => {
            if (err) {
                return db.rollback(() => {
                    return res.status(500).json({ error: 'Transaction commit failed.' });
                });
            }
            return res.status(200).json({ success: "Email updated successfully!" });            });
        });
    })
};

exports.userUpdatePassword = (req, res) => {
    const { password } = req.body;

    if (!req.decoded || !req.decoded.username) {
        return res.status(200).json({ error: "Unauthorized access." });
    }

    const username = req.decoded.username;

    const trimmedPassword = password.trim();
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,10}$/;

    if (!passwordRegex.test(trimmedPassword)) {
        return res.status(200).json({ 
            error: "Password must be 8–10 characters long, contain at least one letter, one number, and one special character." 
        });
    }

    db.beginTransaction((err) => {
        if(err) {
            return res.status(500).json({ error: "Failed to start transaction." });
        }
        bcrypt.hash(trimmedPassword, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ error: "Failed to hash password." });
            }
            db.query('UPDATE user SET password = ? WHERE username = ?', [hashedPassword, username], (err, result) => {
                if (err) {return db.rollback(() => {
                    console.log('Error details:', err);
                    return res.status(500).json({ error: 'Failed to update password.' });
                    });
                }
                db.commit((err) => {
                if (err) {
                    return db.rollback(() => {
                        return res.status(500).json({ error: 'Transaction commit failed.' });
                    });
                }
                return res.status(200).json({ success: "Password updated successfully!" });            });
            });
        });
    })
};

