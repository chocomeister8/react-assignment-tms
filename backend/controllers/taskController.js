const db = require("../config/database"); // Import MySQL connection

exports.getAllTasks = (req, res) => {
    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }
    db.query('SELECT Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate FROM task', (err, results) => {
        if (err) {
        return res.status(500).json({ error : err.message });
        }
        res.json(results);
    });
};

exports.getTaskByAppAcronym = (req, res) => {

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }

    const { Task_app_Acronym } = req.params;

    db.query('SELECT Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate FROM task WHERE Task_app_Acronym = ?', [Task_app_Acronym], (err, results) =>{
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0){
            return res.status(200).json({ message: 'Task not found!' });
        }
        console.log(results);
        res.status(200).json({ tasks: results });
    })
}

exports.createTask = (req, res) => {

    let { Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate } = req.body;

    if(!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid."});
    }

    if (Task_plan) {
        db.query('SELECT * FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?',[Task_plan, Task_app_Acronym], (err, planResults) => {
            if (err) {
                return res.status(500).json({ error: 'Database error during plan check.'});
            }

            if(planResults.length === 0) {
                return res.status(200).json({ error: 'Plan does not exist.' });
            }
        
            db.query('SELECT App_Rnumber FROM application WHERE App_Acronym = ?', [Task_app_Acronym], (err, appResults) => {
                if (err){
                    return res.status(500).json({ error: 'Database error during app check.' });
                } 
                if (appResults.length === 0) {
                    return res.status(200).json({ error: 'Application does not exist.' });
                }
        
                const task_number = appResults[0];
                console.log(task_number);
        
                db.query('SELECT Task_id FROM task WHERE Task_id = ?', [Task_id], (err, results) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error occurred.' });
                    }
                    if (results.length > 0) {
                        return res.status(200).json({ error: 'Task_id already exists!'});
                    }
        
                    db.beginTransaction((err) => {
                        if (err) {
                            return res.status(500).json({ error: "Failed to start transaction." });
                        }
                    
                        db.query('INSERT INTO task (Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate], (err, results) => {
                            if (err) {return db.rollback(() => {res.status(500).json({ error: 'Failed to create task.' });
                                });
                            }

                            db.query('UPDATE application SET App_Rnumber = App_Rnumber + 1 WHERE App_Acronym = ?', [Task_app_Acronym], (err, results) => {
                                if (err) {
                                    return db.rollback(() => {
                                        res.status(500).json({ error: 'Failed to update Rnumber in app.' });
                                    });
                                }
                                db.commit((err) => {
                                    if (err) {return db.rollback(() => {res.status(500).json({ error: "Transaction commit failed." });
                                        });
                                    }
                                    res.status(200).json({success: 'Task created successfully!', task: {Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate}
                                    });
                                });
                            });
                        });
                    });        
                });
            });
        });
    }
    else {

        db.query('SELECT App_Rnumber FROM application WHERE App_Acronym = ?', [Task_app_Acronym], (err, appResults) => {
            if (err){
                return res.status(500).json({ error: 'Database error during app check.' });
            } 
            if (appResults.length === 0) {
                return res.status(200).json({ error: 'Application does not exist.' });
            }
    
            const task_number = appResults[0];
            console.log(task_number);
            
            if (!Task_plan || Task_plan.trim() === "") {
                Task_plan = null;
            }
    
            db.query('SELECT Task_id FROM task WHERE Task_id = ?', [Task_id], (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error occurred.' });
                }
                if (results.length > 0) {
                    return res.status(200).json({ error: 'Task_id already exists!'});
                }
    
                db.beginTransaction((err) => {
                    if (err) {
                        return res.status(500).json({ error: "Failed to start transaction." });
                    }
                
                    db.query('INSERT INTO task (Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate], (err, results) => {
                        if (err) {return db.rollback(() => {res.status(500).json({ error: 'Failed to create task.' });
                            });
                        }

                        db.query('UPDATE application SET App_Rnumber = App_Rnumber + 1 WHERE App_Acronym = ?', [Task_app_Acronym], (err, results) => {
                            if (err) {
                                return db.rollback(() => {
                                    res.status(500).json({ error: 'Failed to update Rnumber in app.' });
                                });
                            }
                            db.commit((err) => {
                                if (err) {return db.rollback(() => {res.status(500).json({ error: "Transaction commit failed." });
                                    });
                                }
                                res.status(200).json({success: 'Task created successfully!', task: {Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate}
                                });
                            });
                        });
                    });
                });        
            });
        });
    };
};
