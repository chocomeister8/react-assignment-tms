// Import Databae component
const db = require("../config/database");
// Import nodemailer component
const nodemailer = require('nodemailer');

const sendStatusChangeEmail = async (taskId, taskName, updatedBy, recipientEmail) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: 'wisexun@gmail.com',
        pass: 'wfyo fmze frpm ianb',
      },
    });
  
    const mailOptions = {
      from: '"Task Management System" <weissxun@gmail.com>',
      to: recipientEmail,
      subject: `Task ${taskName} sent for approval`,
      text: `Task ID :${taskId} , Task Name: ${taskName} was sent for approval by ${updatedBy}.`
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent!');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

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
            return res.status(200).json([{ message: 'Task not found!' }]);
        }
        console.log(results);
        res.status(200).json({ tasks: results });
    })
}

exports.getTaskByTaskID = (req, res) => {

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }

    const { Task_id } = req.params;
    console.log("Received Task_id:", Task_id);
    db.query('SELECT Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate FROM task WHERE Task_id = ?', [Task_id], (err, results) =>{
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0){
            return res.status(200).json([{ message: 'Task not found!' }]);
        }
        console.log(results);
        res.status(200).json({ success: true, Task: results[0] });
    })
}

exports.createTask = (req, res) => {

    let { Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_creator } = req.body;

    if (!Task_notes || Task_notes.trim() === "") {
        Task_notes = "Task created.";
    }

    const Task_state = 'Open';
    const task_createLocalDateTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" })).toLocaleString('sv-SE');
    const formattedDatetime = task_createLocalDateTime.replace("T", " ").slice(0, 19);
    const Task_owner = Task_creator;

    const Task_notes_json = JSON.stringify([
    {
        username: Task_creator,
        currentState: Task_state,
        timestamp: formattedDatetime,
        desc: Task_notes,
    }
    ]);

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
        
                const task_number = appResults[0].App_Rnumber;
                const Task_id = `${Task_app_Acronym}_${task_number}`;
                
        
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
                        [Task_id, Task_Name, Task_description, Task_notes_json, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, formattedDatetime], (err, results) => {
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
                                    res.status(200).json({success: 'Task created successfully!', task: {Task_id, Task_Name, Task_description, Task_notes_json, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, formattedDatetime}
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
            
            if (!Task_plan || Task_plan.trim() === "") {
                Task_plan = null;
            }

            const task_number = appResults[0].App_Rnumber;
            const Task_id = `${Task_app_Acronym}_${task_number}`;
    
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
                    [Task_id, Task_Name, Task_description, Task_notes_json, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, formattedDatetime], (err, results) => {
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
                                res.status(200).json({success: 'Task created successfully!', task: {Task_id, Task_Name, Task_description, Task_notes_json, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner,formattedDatetime}
                                });
                            });
                        });
                    });
                });        
            });
        });
    };
};

exports.updateTask = (req, res) => {
    let { Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_owner} = req.body;

    if(!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid."});
    }

    if(!Task_Name || !Task_state || !Task_owner){
        return res.status(200).json({ error: "All fields must be filled." });
    }

    if (Task_plan) {
        db.query('SELECT * FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ? ',[Task_plan, Task_app_Acronym], (err, planResults) => {
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

                db.query("SELECT Task_plan, Task_state, Task_notes FROM task WHERE Task_id = ? ", [Task_id], (err, results) => {
                    if (err || results.length === 0){
                        return res.status(500).json({ error: "Failed to fetch task state."});
                    }

                    const currentState = results[0].Task_state;

                    const validTransitions = {
                        "Open" : ["Open", "To Do"],
                        "To Do" : ["To Do", "Doing"],
                        "Doing" : ["To Do", "Done", "Doing"],
                        "Done" : ["Done", "Closed", "Doing"],
                        "Closed" : ["Closed"],
                    }

                    if (validTransitions[currentState] && !validTransitions[currentState].includes(Task_state)) {
                        return res.status(400).json({
                            error: `Invalid state transition from "${currentState}" to "${Task_state}".`
                        });
                    }

                    const localDatetime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" })).toLocaleString('sv-SE');
                
                    const formattedDatetime = localDatetime.replace("T", " ").slice(0, 19);

                    const noteDescription = (!Task_notes || Task_notes.trim() === "") ? `Task updated by ${Task_owner}` : Task_notes.trim();

                    const newNote = { username: Task_owner, currentState: currentState, timestamp: formattedDatetime, desc: noteDescription };

                    let existingNotes = [];

                    try {
                    existingNotes = JSON.parse(results[0].Task_notes || "[]");
                    } catch (e) {
                    existingNotes = [];
                    }

                    existingNotes.unshift(newNote);
                    const updatedNotesJSON = JSON.stringify(existingNotes);

                    db.beginTransaction((err) => {
                        if(err) {
                            return res.status(500).json({ error: "Failed to start transaction." });
                        }

                        db.query(`UPDATE task SET Task_Name = ?, Task_description = ?, Task_notes = ?, Task_plan = ?, Task_state = ? , Task_owner = ? WHERE Task_id = ?`, 
                            [Task_Name, Task_description, updatedNotesJSON, Task_plan, Task_state, Task_owner, Task_id], (err, result) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error("Update Error:", err); // Add this
                                    return res.status(500).json({ error: "Failed to update task." });
                                });
                            }
                        
                            db.commit((err) => {
                                if(err) {
                                    return db.rollback(() => {
                                        return res.status(500).json({ error: "Failed to commit transaction." });
                                    })
                                }
                                const shouldSendEmail = currentState === "Doing" && Task_state === "Done";

                                if (shouldSendEmail) {
                                    db.query('SELECT Task_creator FROM task WHERE Task_id = ?', [Task_id], (err, taskResult) => {
                                        if (err || taskResult.length === 0) {
                                          console.error('Error fetching task creator:', err);
                                          return;
                                        }
                                      
                                        const taskCreator = taskResult[0].Task_creator;
                                        db.query('SELECT email FROM user WHERE username = ?', [taskCreator], (err, userResult) => {
                                            if (err || userResult.length === 0) {
                                              console.error('Error fetching email for creator:', err);
                                              return;
                                            }
                                        
                                            const recipientEmail = userResult[0].email;
                                            sendStatusChangeEmail(Task_id, Task_Name, Task_owner, recipientEmail);
                                          });
                                    });
                                }
                                return res.status(200).json({ message: "Task updated successfully.", task: {Task_id, Task_Name, Task_description, updatedNotesJSON, Task_plan, Task_state, Task_owner} });
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

            db.query("SELECT Task_state, Task_notes FROM task WHERE Task_id = ? ", [Task_id], (err, results) => {
                if (err || results.length === 0){
                    return res.status(500).json({ error: "Failed to fetch task state."});
                }

                const currentState = results[0].Task_state;
                const validTransitions = {
                    "Open" : ["Open", "To Do"],
                    "To Do" : ["To Do", "Doing"],
                    "Doing" : ["To Do", "Done", "Doing"],
                    "Done" : ["Done", "Closed"],
                    "Closed" : ["Closed"],
                }

                if (validTransitions[currentState] && !validTransitions[currentState].includes(Task_state)) {
                    return res.status(400).json({
                        error: `Invalid state transition from "${currentState}" to "${Task_state}".`
                    });
                }

                const localDatetime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" })).toLocaleString('sv-SE');
            
                const formattedDatetime = localDatetime.replace("T", " ").slice(0, 19);

                const noteDescription = (!Task_notes || Task_notes.trim() === "")
                ? `Task updated by ${Task_owner}`
                : Task_notes.trim();

                const newNote = {
                    username: Task_owner,
                    currentState: currentState,
                    timestamp: formattedDatetime,
                    desc: noteDescription
                };

                let existingNotes = [];

                try {
                existingNotes = JSON.parse(results[0].Task_notes || "[]");
                } catch (e) {
                existingNotes = [];
                }

                existingNotes.unshift(newNote);
                const updatedNotesJSON = JSON.stringify(existingNotes);

                db.beginTransaction((err) => {
                    if(err) {
                        return res.status(500).json({ error: "Failed to start transaction." });
                    }

                    db.query(`UPDATE task SET Task_Name = ?, Task_description = ?, Task_notes = ?, Task_plan = ?, Task_state = ? , Task_owner = ? WHERE Task_id = ?`, 
                        [Task_Name, Task_description, updatedNotesJSON, Task_plan, Task_state, Task_owner, Task_id], (err, result) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error("Update Error:", err); // Add this
                                return res.status(500).json({ error: "Failed to update task." });
                            });
                        }
                        db.commit((err) => {
                            if(err) {
                                return db.rollback(() => {
                                    return res.status(500).json({ error: "Failed to commit transaction." });
                                })
                            }
                            const shouldSendEmail = currentState === "Doing" && Task_state === "Done";

                            if (shouldSendEmail) {
                                db.query('SELECT Task_creator FROM task WHERE Task_id = ?', [Task_id], (err, taskResult) => {
                                    if (err || taskResult.length === 0) {
                                      console.error('Error fetching task creator:', err);
                                      return;
                                    }
                                  
                                    const taskCreator = taskResult[0].Task_creator;
                                    db.query('SELECT email FROM user WHERE username = ?', [taskCreator], (err, userResult) => {
                                        if (err || userResult.length === 0) {
                                          console.error('Error fetching email for creator:', err);
                                          return;
                                        }
                                    
                                        const recipientEmail = userResult[0].email;
                                        sendStatusChangeEmail(Task_id, Task_Name, Task_owner, recipientEmail);
                                      });
                                });
                            }
                            return res.status(200).json({ message: "Task updated successfully.", task: {Task_id, Task_Name, Task_description, updatedNotesJSON, Task_plan, Task_state, Task_owner} });
                        });
                    });
                });
            });
        });
    }
}

exports.approveTask = (req, res) => {

    let { Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_owner } = req.body;

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }

    if (!Task_state || !Task_owner) {
        return res.status(200).json({ error: "All fields must be filled." });
    }

    // First: Fetch the existing Task_plan, Task_state, and Task_notes from DB
    db.query("SELECT Task_plan, Task_state, Task_notes FROM task WHERE Task_id = ?", [Task_id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).json({ error: "Failed to fetch task data." });
        }

        const existingPlan = results[0].Task_plan;

        console.log("current plan", existingPlan);
        console.log("plan by user", Task_plan);

        if ((existingPlan || '').trim() !== (Task_plan || '').trim()) {
            return res.status(200).json({ error: "Changing the task plan during approval is not allowed." });
          }

        // ✅ Task_plan matches, continue with approval logic
        db.query('SELECT App_Rnumber FROM application WHERE App_Acronym = ?', [Task_app_Acronym], (err, appResults) => {
            if (err) {
                return res.status(500).json({ error: 'Database error during app check.' });
            }
            if (appResults.length === 0) {
                return res.status(200).json({ error: 'Application does not exist.' });
            }

            const currentState = results[0].Task_state;
            const validTransitions = {
                "Open": ["Open", "To Do"],
                "To Do": ["To Do", "Doing"],
                "Doing": ["To Do", "Done", "Doing"],
                "Done": ["Done", "Closed", "Doing"],
                "Closed": ["Closed"],
            };

            if (validTransitions[currentState] && !validTransitions[currentState].includes(Task_state)) {
                return res.status(400).json({
                    error: `Invalid state transition from "${currentState}" to "${Task_state}".`
                });
            }

            const localDatetime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" })).toLocaleString('sv-SE');
            const formattedDatetime = localDatetime.replace("T", " ").slice(0, 19);
            const taskNotesString = (Task_notes || "").trim();
            const noteDescription = taskNotesString === "" ? `Task approved by ${Task_owner}` : taskNotesString;
            const newNote = {username: Task_owner, currentState: currentState, timestamp: formattedDatetime, desc: noteDescription};

            let existingNotes = [];
            try {
                existingNotes = JSON.parse(results[0].Task_notes || "[]");
            } catch (e) {
                existingNotes = [];
            }

            existingNotes.unshift(newNote);
            const updatedNotesJSON = JSON.stringify(existingNotes);

            db.beginTransaction((err) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to start transaction." });
                }

                db.query(`UPDATE task SET Task_Name = ?, Task_description = ?, Task_notes = ?, Task_state = ?, Task_owner = ? WHERE Task_id = ?`,
                [Task_Name, Task_description, updatedNotesJSON, Task_state, Task_owner, Task_id], (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Update Error:", err);
                            return res.status(500).json({ error: "Failed to approve task." });
                        });
                    }
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                return res.status(500).json({ error: "Failed to commit transaction." });
                            });
                        }
                        return res.status(200).json({
                            message: "Task approved successfully.",
                            task: {Task_id, Task_Name, Task_description, updatedNotesJSON, Task_plan, Task_state, Task_owner
                            }
                        });
                    });
                });
            });
        });
    });
};

exports.rejectTask = (req, res) => {
    let { Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_owner } = req.body;

    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }

    if (!Task_state || !Task_owner) {
        return res.status(200).json({ error: "All fields must be filled." });
    }

    console.log("task", Task_plan);
    const updatedTaskPlan = Task_plan && Task_plan.trim() !== "" ? Task_plan : null;
    console.log("updated plan", updatedTaskPlan);

    if (Task_plan){

        db.query("SELECT Task_plan, Task_state, Task_notes FROM task WHERE Task_id = ?", [Task_id], (err, results) => {
            if (err || results.length === 0) {
                return res.status(500).json({ error: "Failed to fetch task data." });
            }
        
            db.query('SELECT App_Rnumber FROM application WHERE App_Acronym = ?', [Task_app_Acronym], (err, appResults) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error during app check.' });
                }
                if (appResults.length === 0) {
                    return res.status(200).json({ error: 'Application does not exist.' });
                }

                const currentState = results[0].Task_state;
                const validTransitions = {
                    "Open": ["Open", "To Do"],
                    "To Do": ["To Do", "Doing"],
                    "Doing": ["To Do", "Done", "Doing"],
                    "Done": ["Done", "Closed", "Doing"],
                    "Closed": ["Closed"],
                };

                if (validTransitions[currentState] && !validTransitions[currentState].includes(Task_state)) {
                    return res.status(400).json({
                        error: `Invalid state transition from "${currentState}" to "${Task_state}".`
                    });
                }

                const localDatetime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" })).toLocaleString('sv-SE');
                const formattedDatetime = localDatetime.replace("T", " ").slice(0, 19);
                const noteDescription = (!Task_notes || Task_notes.trim() === "") ? `Task rejected by ${Task_owner}` : Task_notes.trim();
                const newNote = {
                    username: Task_owner,
                    currentState: currentState,
                    timestamp: formattedDatetime,
                    desc: noteDescription
                };

                let existingNotes = [];
                try {
                    existingNotes = JSON.parse(results[0].Task_notes || "[]");
                } catch (e) {
                    existingNotes = [];
                }

                existingNotes.unshift(newNote);
                const updatedNotesJSON = JSON.stringify(existingNotes);

                db.beginTransaction((err) => {
                    if (err) {
                        return res.status(500).json({ error: "Failed to start transaction." });
                    }

                    db.query(`UPDATE task SET Task_Name = ?, Task_description = ?, Task_notes = ?, Task_plan = ?, Task_state = ?, Task_owner = ? WHERE Task_id = ?`,
                    [Task_Name, Task_description, updatedNotesJSON, updatedTaskPlan, Task_state, Task_owner, Task_id], (err, result) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error("Update Error:", err);
                                return res.status(500).json({ error: "Failed to reject task." });
                            });
                        }
                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    return res.status(500).json({ error: "Failed to commit transaction." });
                                });
                            }
                            return res.status(200).json({
                                message: "Task rejected successfully.",
                                task: {Task_id, Task_Name, Task_description, updatedNotesJSON, Task_plan, Task_state, Task_owner
                                }
                            });
                        });
                    });
                });
            });
        });
    }
    else {
        db.query("SELECT Task_plan, Task_state, Task_notes FROM task WHERE Task_id = ?", [Task_id], (err, results) => {
            if (err || results.length === 0) {
                return res.status(500).json({ error: "Failed to fetch task data." });
            }
        
            db.query('SELECT App_Rnumber FROM application WHERE App_Acronym = ?', [Task_app_Acronym], (err, appResults) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error during app check.' });
                }
                if (appResults.length === 0) {
                    return res.status(200).json({ error: 'Application does not exist.' });
                }

                const currentState = results[0].Task_state;
                const validTransitions = {
                    "Open": ["Open", "To Do"],
                    "To Do": ["To Do", "Doing"],
                    "Doing": ["To Do", "Done", "Doing"],
                    "Done": ["Done", "Closed", "Doing"],
                    "Closed": ["Closed"],
                };

                if (validTransitions[currentState] && !validTransitions[currentState].includes(Task_state)) {
                    return res.status(400).json({
                        error: `Invalid state transition from "${currentState}" to "${Task_state}".`
                    });
                }

                const localDatetime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" })).toLocaleString('sv-SE');
                const formattedDatetime = localDatetime.replace("T", " ").slice(0, 19);
                const noteDescription = (!Task_notes || Task_notes.trim() === "") ? `Task rejected by ${Task_owner}` : Task_notes.trim();
                const newNote = {
                    username: Task_owner,
                    currentState: currentState,
                    timestamp: formattedDatetime,
                    desc: noteDescription
                };

                let existingNotes = [];
                try {
                    existingNotes = JSON.parse(results[0].Task_notes || "[]");
                } catch (e) {
                    existingNotes = [];
                }

                existingNotes.unshift(newNote);
                const updatedNotesJSON = JSON.stringify(existingNotes);

                db.beginTransaction((err) => {
                    if (err) {
                        return res.status(500).json({ error: "Failed to start transaction." });
                    }

                    db.query(`UPDATE task SET Task_Name = ?, Task_description = ?, Task_notes = ?, Task_plan = ?, Task_state = ?, Task_owner = ? WHERE Task_id = ?`,
                    [Task_Name, Task_description, updatedNotesJSON, Task_plan, Task_state, Task_owner, Task_id], (err, result) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error("Update Error:", err);
                                return res.status(500).json({ error: "Failed to reject task." });
                            });
                        }
                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    return res.status(500).json({ error: "Failed to commit transaction." });
                                });
                            }
                            return res.status(200).json({
                                message: "Task rejected successfully.",
                                task: {Task_id, Task_Name, Task_description, updatedNotesJSON, Task_plan, Task_state, Task_owner
                                }
                            });
                        });
                    });
                });
            });
        });
    }
};
