const db = require("../config/database"); // Import MySQL connection

exports.getAllGroups = (req, res) => {

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }
    
    db.query('SELECT groupName FROM grp', (err, results) => {
        if(err){
            return res.status(500).json({ error : err.message });
        }
        return res.status(200).json({ success: true, results: results});
    });
};

exports.createGroup = (req, res) => {
    let { groupName } = req.body;
    
    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }

    if (!groupName || groupName.trim() === "") {
        return res.status(200).json({ error: "Group name cannot be empty." });
    }

    groupName = groupName.trim().toLowerCase();
    const validPattern = /^[a-zA-Z0-9_/]+$/;
    if (!groupName || groupName.length > 50 || !validPattern.test(groupName)) {
        return res.status(200).json({
            error: "Group Name can only contain lowercase letters, numbers, '_', and '/', and must be 50 characters or fewer."
        });
    }

    db.query('SELECT groupName FROM grp WHERE groupName = ?', [groupName], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error during check." });
        }

        if (results.length > 0) {
            return res.status(200).json({ error: "Group name already exists!" });
        }

        db.beginTransaction((err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to start transaction." });
            }
            db.query('INSERT INTO grp (groupName) VALUES (?)', [groupName], (err, result) => {
                if (err) {return db.rollback(() => { 
                    return res.status(500).json({ error: "Failed to insert group." });
                    });
                }
                db.commit((err) => {
                    if (err) { 
                    return db.rollback(() => {
                        return res.status(500).json({ error: "Transaction commit failed." });
                    });
                }
                return res.status(200).json({message: "Group created successfully!",group: { groupName }});
                });
            });
        });
    });
};