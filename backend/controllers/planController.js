const db = require("../config/database");

exports.getAllPlan = (req, res) => {
    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }
    try{
        db.query('SELECT Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym FROM plan',
            (err, results) => {
            if (err) {
                return res.status(500).json({ error : err.message });
            }
            res.json(results);
        });
    } catch (error) {
        console.error("Error fetching plans:", error);
        return res.status(500).json({ error: "Internal server error."})
    }
};

exports.createPlan = (req, res) => {
    let { Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym } = req.body;

    if(!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid."});
    }

    if(!Plan_MVP_name || !Plan_startDate || !Plan_endDate || !Plan_app_Acronym){
        return res.status(200).json({ error: "All fields must be filled." });
    }

    const planMVPRegex = /^[a-zA-Z0-9]{1,50}$/;
    if(!planMVPRegex.test(Plan_MVP_name)){
        setError({ error: "Plan MVP Name can only consist of alphanumeric characters and not exceed 50 characters."});
        return;
    }
    try{
        db.query('SELECT Plan_MVP_name FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?', [Plan_MVP_name, Plan_app_Acronym], (err, results) => {
            if (err){
                return res.status(500).json({ error: 'Database error occurred.' });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: 'Plan name already exists in this application!'});
            }
            db.query('INSERT INTO plan (Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym) VALUES (?,?,?,?)',
                [Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym], (err, results) => {
                    if(err){
                        console.log('Error details:', err);
                        return res.status(500).json({ error: 'Failed to create plan.'})
                    }
                    res.status(200).json({ success: 'Plan created successfully!', plan:{ Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym }
                    });
                }
            )
        })
    }
    catch (error){
        console.log('Error creating plan:', error);
        return res.status(200).json({ error: 'Internal server error'});
    }
}