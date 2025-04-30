const db = require("../config/database"); // Import MySQL connection

// Get all applications method
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

// Create application method
exports.createApp = (req, res) => {

    let { App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create } = req.body;
    const app_acronym = App_Acronym.trim().toLowerCase();
    const startDate = App_startDate === '' ? null : App_startDate;
    const endDate = App_endDate === '' ? null : App_endDate;
    const permitCreateValue = App_permit_Create === '' ? null : App_permit_Create;
    const permitOpenValue = App_permit_Open === '' ? null : App_permit_Open;
    const permittoDoListValue = App_permit_toDoList === '' ? null : App_permit_toDoList;
    const permitDoingValue = App_permit_Doing === '' ? null : App_permit_Doing;
    const permitDoneValue = App_permit_Done === '' ? null : App_permit_Done;
    
    if(!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid."});
    }

    if (!App_Acronym || !App_Rnumber){
        return res.status(200).json({ error: "All fields must be filled." });
    }

    const acronymRegex = /^[a-zA-Z0-9]{1,300}$/;
    if (!acronymRegex.test(app_acronym)) {
        return res.status(200).json({ error: 'App Acronym can only consist of alphanumeric characters and not exceed 300 characters.' });
    }

    const appRNumberRegex = /^[1-9][0-9]{0,3}$/;
    if (!appRNumberRegex.test(App_Rnumber)){
      setError("App Rnumber must be a whole number between 1 and 9999 and cannot start with 0.");
      return;
    }
    db.query('SELECT App_Acronym, App_Rnumber FROM application WHERE App_Acronym = ?', [App_Acronym], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error occurred.' });
        }
        if (results.length > 0) {
            return res.status(200).json({ error: 'An application with this acronym already exists!'});
        }
        db.beginTransaction((err) => {
            if(err) {
                return res.status(500).json({ error: "Failed to start transaction." });
            }
            db.query('INSERT INTO Application (App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create) VALUES (?,?,?,?,?,?,?,?,?,?)', 
            [App_Acronym, App_Description, App_Rnumber, startDate, endDate, permitOpenValue, permittoDoListValue, permitDoingValue, permitDoneValue, permitCreateValue], (err, results) => {
                if(err){
                    return res.status(500).json({ error: 'Failed to create application.'})
                }
                db.commit((err) => {
                    if(err) {
                    return db.rollback(() => {
                        return res.status(500).json({ error: "Transaction commit failed." });
                    });
                }
                res.status(200).json({ success: 'Application created successfully!', application:{ App_Acronym, App_Description, App_Rnumber, startDate, endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create }});
                });
            })
        });
    });
}

// Update application method
exports.updateApp = (req, res) => {
    let { App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create } = req.body;
    const startDate = App_startDate === '' ? null : App_startDate;
    const endDate = App_endDate === '' ? null : App_endDate;
    const permitCreateValue = App_permit_Create === '' ? null : App_permit_Create;
    const permitOpenValue = App_permit_Open === '' ? null : App_permit_Open;
    const permittoDoListValue = App_permit_toDoList === '' ? null : App_permit_toDoList;
    const permitDoingValue = App_permit_Doing === '' ? null : App_permit_Doing;
    const permitDoneValue = App_permit_Done === '' ? null : App_permit_Done;

    console.log("BACKED", permitOpenValue);

    if(!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid."});
    }

    db.beginTransaction((err) => {
        if(err) {
            return res.status(500).json({ error: "Failed to start transaction." });
        }
        db.query('UPDATE application SET App_Description = ?, App_startDate = ?, App_endDate = ?, App_permit_Open = ?, App_permit_toDoList = ?, App_permit_Doing = ?, App_permit_Done = ?, App_permit_Create = ? WHERE App_Acronym = ?', 
            [App_Description, startDate, endDate, permitOpenValue, permittoDoListValue, permitDoingValue, permitDoneValue, permitCreateValue, App_Acronym], (err, results) => {
            if(err){
                return db.rollback(() => {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to update application.' });
                });
            }
            db.commit((err) => {
                if(err) {
                return db.rollback(() => {
                    return res.status(500).json({ error: "Transaction commit failed." });
                });
            }
            res.status(200).json({ success: 'Application updated successfully!', application:{results }});
            });
        });
    });
}