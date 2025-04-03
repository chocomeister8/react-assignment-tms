const connection = require("../config/database"); // Import MySQL connection
const Group = require('../models/group');

exports.getAllGroups = (req, res) => {

    if (!req.decoded) {
        return res.status(500).json({ error: "Token is missing or invalid" });
    }

    Group.getAllGroups((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.createGroup = (req, res) => {
    
    if (!req.decoded) {
        return res.status(401).json({ error: "Token is missing or invalid" });
    }

    let { groupName } = req.body;

    if (!groupName || groupName.trim() === "") {
        return res.status(400).json({ error: "Group Name cannot be empty" });
    }

    groupName = groupName.trim().toLowerCase();
    const validPattern = /^[a-zA-Z0-9_/]+$/;
    if (!validPattern.test(groupName)) {
        return res.status(400).json({ error: "Group Name can only contain letters, numbers, '_', and '/'." });
    }

    connection.query('SELECT groupName FROM grp WHERE groupName = LOWER(?)', [groupName], (err, results) => {
        if (err) {
            console.log('Error details:', err);
            return res.status(500).json({ error: 'Database error occurred' });
        }
        if (results.length > 0) {
            // Step 2: If the username exists, send an error message
            return res.status(400).json({ error: 'Group Name already exists' });
        }

        connection.query('INSERT INTO grp (groupName) VALUES (?)', [groupName], (err, results) =>{
            if(err) {
                return res.status(500).json({ error: 'Failed to create group'})
            }
            else {
                res.status(201).json({ message: 'Group created successfully', group : { groupName }})
            }
        })
    });
};