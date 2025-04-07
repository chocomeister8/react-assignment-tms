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

    Group.selectGroupByName(groupName, (err, results) => {
        if(err) {
            return res.status(500).json({ error: 'Database error occurred.' });
        }
        if(results.length > 0) {
            return res.status(400).json({ error: 'Group name already exists!'});
        }

        Group.createGroup(groupName, (err) => {
            if(err) {
                return res.status(500).json({ error: 'Failed to create group'})
            }
            else {
                res.status(201).json({ message: 'Group created successfully', group : { groupName }})
            }
        })
    })
};