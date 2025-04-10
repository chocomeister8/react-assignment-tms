const db = require("../config/database"); // Import MySQL connection

exports.getAllApplications = (req, res) => {

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }
    try{
        db.query('SELECT App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create FROM application', 
            (err, results) => {
            if (err) {
                return res.status(500).json({ error : err.message });
            }
            res.json(results);
        });
    } catch (error) {
        console.error("Error fetching groups:", error);
        return res.status(500).json({ error: "Internal server error."})
    }
};

exports.createApp = (req, res) => {

    let { App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create } = req.body;

    if(!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid."});
    }
    try{
        db.query('SELECT App_Acronym FROM application WHERE App_Acronym = ?', [App_Acronym], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error occurred.' });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: 'Application name already exists!'});
            }
            db.query('INSERT INTO Application (App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create) VALUES (?,?,?,?,?,?,?,?,?,?)', 
                [App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create], (err, results) => {
                    if(err){
                        console.log('Error details:', err);
                        return res.status(500).json({ error: 'Failed to create application.'})
                    }
                    res.status(200).json({ success: 'Application created successfully!', application:{ App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create }
                    });
                }
            )
        })
    }
    catch (error) {
        console.log('Error creating application:', error);
        return res.status(200).json({ error: 'Internal server error'});
    }
}