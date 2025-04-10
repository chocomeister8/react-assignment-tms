const db = require("../config/database"); // Import MySQL connection

exports.getAllTasks = (req, res) => {

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }
    try{
        db.query('SELECT Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate) FROM task', 
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

exports.createTask = (req, res) => {

    let { Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate } = req.body;

    if(!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid."});
    }
    try{
        db.query('SELECT Task_id FROM task WHERE Task_id = ?', [Task_id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error occurred.' });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: 'Task_id already exists!'});
            }
            db.query('INSERT INTO task (Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate) VALUES (?,?,?,?,?,?,?,?,?,?)', 
                [Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate], (err, results) => {
                    if(err){
                        console.log('Error details:', err);
                        return res.status(500).json({ error: 'Failed to create task.'})
                    }
                    res.status(200).json({ success: 'Task created successfully!', task:{ Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate }
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