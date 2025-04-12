const db = require("../config/database"); // Import MySQL connection

exports.getAllApplications = (req, res) => {
    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }
    db.query('SELECT App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create FROM application', 
        (err, results) => {
        if (err) {
            return res.status(500).json({ error : err.message });
        }
        res.json(results);
    });
};

exports.createApp = (req, res) => {

    let { App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create } = req.body;
    const app_acronym = App_Acronym.trim().toLowerCase();
    
    if(!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid."});
    }

    if (!App_Acronym || !App_Description || !App_Rnumber || !App_startDate || !App_endDate || !App_permit_Open || !App_permit_toDoList || !App_permit_Doing || !App_permit_Done || !App_permit_Create){
        return res.status(200).json({ error: "All fields must be filled." });
    }

    const acronymRegex = /^[a-zA-Z0-9]{1,50}$/;
    if (!acronymRegex.test(app_acronym)) {
        return res.status(200).json({ error: 'App Acronym can only consist of alphanumeric characters and not exceed 50 characters.' });
    }

    if (App_Description.length > 255){
        return res.status(200).json({ error: 'App description cannot be more than 255 characters.'})
    }

    const appRNumberRegex = /^[1-9][0-9]{0,3}$/;
    if (!appRNumberRegex.test(App_Rnumber)){
      setError("App Rnumber must be a whole number between 1 and 9999 and cannot start with 0.");
      return;
    }
    db.query('SELECT App_Acronym FROM application WHERE App_Acronym = ? AND App_Rnumber = ?', [App_Acronym, App_Rnumber], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error occurred.' });
        }
        if (results.length > 0) {
            return res.status(200).json({ error: 'An application with this acronym and Rnumber already exists!'});
        }
        db.beginTransaction((err) => {
            if(err) {
                return res.status(500).json({ error: "Failed to start transaction." });
            }
            db.query('INSERT INTO Application (App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create) VALUES (?,?,?,?,?,?,?,?,?,?)', 
            [App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create], (err, results) => {
                if(err){
                    return res.status(500).json({ error: 'Failed to create application.'})
                }
                db.commit((err) => {
                    if(err) {
                    return db.rollback(() => {
                        return res.status(500).json({ error: "Transaction commit failed." });
                    });
                }
                res.status(200).json({ success: 'Application created successfully!', application:{ App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create }});
                });
            })
        });
    })
    
}