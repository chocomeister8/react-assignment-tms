const db = require("../config/database"); // Import MySQL connection

exports.getAllGroups = (req, res) => {

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }
    try{
        db.query('SELECT groupName FROM grp', (err, results) => {
            if(err){
                return res.status(500).json({ error : err.message });
            }
            res.json(results);
        })
    } catch (error) {
        console.error("Error fetching groups:", error);
        return res.status(500).json({ error: "Internal server error."})
    }
};

exports.createGroup = (req, res) => {
    
    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }

    let { groupName } = req.body;

    if (!groupName || groupName.trim() === "") {
        return res.status(200).json({ error: "Group name cannot be empty." });
    }

    groupName = groupName.trim().toLowerCase();
    const validPattern = /^[a-zA-Z0-9_/]+$/;
    if (!validPattern.test(groupName)) {
        return res.status(200).json({ error: "Group Name can only contain letters, numbers, '_', and '/'." });
    }

    try {
        db.query('SELECT groupName FROM grp WHERE groupName = ?', [groupName], (err, results) => {
            if (err) {
                console.log('Error details:', err);
                return res.status(500).json({ error: 'Database error occurred.' });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: 'Group name already exists!' });
            }
            db.query('INSERT INTO grp (groupName) VALUES (?)', [groupName], (err, results) => {
                if (err) {
                    console.log('Error details:', err);
                    return res.status(200).json({ error: 'Failed to create group.' });
                }
                res.status(200).json({
                    message: 'Group created successfully!',
                    group : { groupName }
                });
            })
        })
    } catch {

    }
};