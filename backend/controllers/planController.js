// Import Database component
const db = require("../config/database");

exports.getAllPlan = (req, res) => {
    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }
     db.query('SELECT Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym, Plan_color FROM plan', (err, results) => {
        if (err) {
            return res.status(500).json({ error : err.message });
        }
        res.json(results);
    });
};

exports.createPlan = (req, res) => {
    let { Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym, Plan_color } = req.body;

    if(!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid."});
    }

    if(!Plan_MVP_name || !Plan_startDate || !Plan_endDate || !Plan_app_Acronym || !Plan_color){
        return res.status(200).json({ error: "All fields must be filled." });
    }

    const planMVPRegex = /^[a-zA-Z0-9]{1,300}$/;
    if(!planMVPRegex.test(Plan_MVP_name)){
        setError({ error: "Plan MVP Name can only consist of alphanumeric characters and not exceed 300 characters."});
        return;
    }
    db.query('SELECT Plan_MVP_name FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?', [Plan_MVP_name, Plan_app_Acronym], (err, results) => {
        if (err){
            return res.status(500).json({ error: 'Database error occurred.' });
        }
        if (results.length > 0) {
            return res.status(200).json({ error: 'Plan name already exists in this application!'});
        }
        db.beginTransaction((err) => {
            if(err) {
                return res.status(500).json({ error: "Failed to start transaction." });
            }
            db.query('INSERT INTO plan (Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym, Plan_color) VALUES (?,?,?,?,?)',
            [Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym, Plan_color], (err, results) => {
                if(err){return db.rollback(() => {
                    return res.status(500).json({ error: 'Failed to create plan.'})
                    });
                }
                db.commit((err) => {
                    if (err) {
                    return db.rollback(() => {
                        return res.status(500).json({ error: 'Transaction commmit failed.'});
                    });
                }
                res.status(200).json({ success: 'Plan created successfully!', plan:{ Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym, Plan_color }});
                });
            });
        });
    });
};

exports.updatePlan = (req, res) => {
    let { Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym, Plan_color } = req.body;

    if(!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid."});
    }

    if(!Plan_startDate || !Plan_endDate){
        return res.status(200).json({ error: "All fields must be filled." });
    }

    db.beginTransaction((err) => {
        if(err) {
            return res.status(500).json({ error: "Failed to start transaction." });
        }
        db.query('UPDATE plan SET Plan_startDate = ?, Plan_endDate = ?, Plan_color = ? WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?', 
            [Plan_startDate, Plan_endDate, Plan_color, Plan_MVP_name, Plan_app_Acronym], (err, results) => {
            if(err){
                return db.rollback(() => {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to update plan.' });
                });
            }
            db.commit((err) => {
                if(err) {
                return db.rollback(() => {
                    return res.status(500).json({ error: "Transaction commit failed." });
                });
            }
            res.status(200).json({ success: 'Plan updated successfully!', plan:{ Plan_MVP_name, Plan_startDate, Plan_color, Plan_endDate, Plan_app_Acronym }});
            });
        });
    });
}