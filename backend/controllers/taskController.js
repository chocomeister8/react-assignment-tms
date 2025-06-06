// Import Database component
const db = require("../config/database");
// Import nodemailer component
const nodemailer = require('nodemailer');

// Send Email method
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
  
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email to', recipientEmail, error);
            reject(error);
        } else {
            console.log('Email sent to', recipientEmail, info.response);
            resolve(info);
        }
    });
};

// Get all task method
exports.getAllTasks = (req, res) => {
    // If token does not exist
    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }
    db.query('SELECT Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate FROM task ORDER BY Task_createDate DESC', (err, results) => {
        if (err) {
        return res.status(500).json({ error : err.message });
        }
        res.status(200).json({ success : "Fetched all tasks!"});
    });
};

// Get task by app acornym method
exports.getTaskByAppAcronym = (req, res) => {
    // If token does not exist
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
        res.status(200).json({ success : `Fetched all tasks from app: ${Task_app_Acronym}`, tasks: results});
    })
};

// Get task by task_id method
exports.getTaskByTaskID = (req, res) => {
    // If token does not exist
    if (!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid." });
    }

    const { Task_id } = req.params;
    db.query('SELECT Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate FROM task WHERE Task_id = ?', [Task_id], (err, results) =>{
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0){
            return res.status(200).json([{ message: 'Task not found!' }]);
        }
        res.status(200).json({ success: true, Task: results[0] });
    })
};

// Get task by state method
exports.getTaskByState = (req, res) => {
    // If token does not exist
    if (!req.decoded) {
        return res.status(200).json({ success: false, error: "EA2" });
    }

    const { taskState } = req.params;

    if (!taskState) {
        return res.status(200).json({ success: false, error: "EP1", errorMsg: "All fields must be filled." });
    }

    // Define allowed states
    const allowedStates = ["Open", "To Do", "Doing", "Done", "Closed"];

    // Check if taskState is allowed
    if (!allowedStates.includes(taskState)) {
        return res.status(400).json({ success: false, error: "EP1", errorMsg: "Invalid task state provided."});
    }

    db.query('SELECT * FROM task WHERE Task_state = ?', [taskState], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: "ET3" });
        }
        if (results.length === 0) {
            return res.status(200).json([{ success: true, data: results }]);
        }
        res.status(200).json({ success: true, data: results });
    });
};

// Get create task method
exports.createTask = (req, res) => {

    // If token does not exist
    if(!req.decoded) {
        return res.status(200).json({ success: false, error: "EA2"});
    }

    const Task_creator = req.decoded.username;

    let { taskName, taskDescription, taskNotes, taskAppAcronym, taskPlan} = req.body;

    if(taskName.length === 0 || taskName.length > 300 ) {
        return res.status(200).json({ success: false, error: "EP1", message: "Task name cannot be empty and cannot have more than 300 characters."});
    }

    if (!taskNotes || taskNotes.trim() === "") {
        taskNotes = "Task created.";
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
        desc: taskNotes,
    }
    ]);
    // If task plan exists
    if (taskPlan) {
        db.beginTransaction((err) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).json({ success: false, error: "ET3"});
                });
            }
            // Check if plan with the same plan_mvp_name and plan_app_acronym exists
            db.query('SELECT * FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?',[taskPlan, taskAppAcronym], (err, planResults) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ success: false, error: 'ET3'});
                    });
                }

                if(planResults.length === 0) {
                    return db.rollback(() => {
                        res.status(200).json({ success: false, error: 'ET4'});
                    });
                }
                // Check if app with the same app Rnumber exists
                db.query('SELECT App_Rnumber FROM application WHERE App_Acronym = ?', [taskAppAcronym], (err, appResults) => {
                    if (err){
                        return db.rollback(() => {
                            res.status(500).json({ success: false, error: 'ET3'});
                        });
                    } 
                    if (appResults.length === 0) {
                        return db.rollback(() => {
                            res.status(200).json({ success: false, error: 'ET4'});
                        });
                    }
                    const task_number = appResults[0].App_Rnumber;
                    const Task_id = `${taskAppAcronym}_${task_number}`;
                    
                    // Check if task with the same task_id exists
                    db.query('SELECT Task_id FROM task WHERE Task_id = ?', [Task_id], (err, results) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({ success: false, error: 'ET3'});
                            });
                        }
                        if (results.length > 0) {
                            return db.rollback(() => {
                                res.status(200).json({ success: false, error: 'ET1'});
                            });
                        }

                        // Insert task statement
                        db.query('INSERT INTO task (Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [Task_id, taskName, taskDescription, Task_notes_json, taskPlan, taskAppAcronym, Task_state, Task_creator, Task_owner, formattedDatetime], (err, results) => {
                            if (err) {
                                return db.rollback(() => {
                                    res.status(200).json({ success: false, error: 'ET1'});
                                });
                            }
                            // Increase task RNumber after successfully inserting task
                            db.query('UPDATE application SET App_Rnumber = App_Rnumber + 1 WHERE App_Acronym = ?', [taskAppAcronym], (err, results) => {
                                if (err) {
                                    return db.rollback(() => {
                                        res.status(500).json({ success: false, error: 'ET2'});
                                    });
                                }
                                db.commit((err) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            res.status(500).json({ success: false, error: "ET3"});
                                        });
                                    }
                                    res.status(200).json({success: true, message: "Task Created Successfully."}
                                    );
                                });
                            });
                        });
                    });        
                });
            });
        });
    }
    // When plan does not exists
    else {
        db.beginTransaction((err) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).json({ success: false, error: "ET3"});
                });
            }
            // Check if app with the same app Rnumber exists
            db.query('SELECT App_Rnumber FROM application WHERE App_Acronym = ?', [taskAppAcronym], (err, appResults) => {
                if (err){
                    return db.rollback(() => {
                        res.status(500).json({ success: false, error: 'ET3'});
                    });
                } 
                if (appResults.length === 0) {
                    return db.rollback(() => {
                        res.status(200).json({ success: false, error: 'ET4'});
                    });
                }
                
                if (!taskPlan || taskPlan.trim() === "") {
                    taskPlan = null;
                }

                const task_number = appResults[0].App_Rnumber;
                const Task_id = `${taskAppAcronym}_${task_number}`;

                // Check if task with the same task_id exists
                db.query('SELECT Task_id FROM task WHERE Task_id = ?', [Task_id], (err, results) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ success: false, error: 'ET3'});
                        });
                    }
                    if (results.length > 0) {
                        return db.rollback(() => {
                            res.status(200).json({ success: false, error: 'ET1'});
                        });
                    }
                    // Insert task statement
                    db.query('INSERT INTO task (Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [Task_id, taskName, taskDescription, Task_notes_json, taskPlan, taskAppAcronym, Task_state, Task_creator, Task_owner, formattedDatetime], (err, results) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({ success: false, error: 'ET1'});
                            });
                        }
                        
                        // Increase task RNumber after successfully inserting task
                        db.query('UPDATE application SET App_Rnumber = App_Rnumber + 1 WHERE App_Acronym = ?', [taskAppAcronym], (err, results) => {
                            if (err) {
                                return db.rollback(() => {
                                    res.status(500).json({ success: false, error: 'ET2'});
                                });
                            }
                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        res.status(500).json({ success: false, error: "ET3"});
                                    });
                                }
                                res.status(200).json({success: true, message: "Task Created Successfully."});
                            });
                        });
                    });
                });        
            });
        });
    };
};

// Get update task method
exports.updateTask = (req, res) => {
    let { Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_owner} = req.body;
    
    // If token does not exist
    if(!req.decoded) {
        return res.status(200).json({ error: "Token is missing or invalid."});
    }
    // Field validation
    if(!Task_Name || !Task_state || !Task_owner){
        return res.status(200).json({ error: "All fields must be filled." });
    }
    // If task plan exists
    if (Task_plan) {
        // Check if plan with the same plan_mvp_name and plan_app_acronym exists 
        db.query('SELECT * FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ? ',[Task_plan, Task_app_Acronym], (err, planResults) => {
            if (err) {
                return res.status(500).json({ error: 'Database error during plan check.'});
            }

            if(planResults.length === 0) {
                return res.status(200).json({ error: 'Plan does not exist.' });
            }
            // Check if app with the same app Rnumber exists
            db.query('SELECT App_Rnumber FROM application WHERE App_Acronym = ?', [Task_app_Acronym], (err, appResults) => {
                if (err){
                    return res.status(500).json({ error: 'Database error during app check.' });
                } 
                if (appResults.length === 0) {
                    return res.status(200).json({ error: 'Application does not exist.' });
                }

                // Select the task_plan, state and notes based on task_id
                db.query("SELECT Task_plan, Task_state, Task_notes FROM task WHERE Task_id = ? ", [Task_id], (err, results) => {
                    if (err || results.length === 0){
                        return res.status(500).json({ error: "Failed to fetch task state."});
                    }

                    const currentState = results[0].Task_state;

                    // Defining valid change of states
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
                        // Update task method
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
                                    db.query('SELECT App_permit_Done FROM application WHERE App_Acronym = ?', [Task_app_Acronym], (err, permResult) => {
                                        if (err || permResult.length === 0 || !permResult[0].App_permit_Done) {
                                            console.error('Error fetching group or no group assigned:', err || 'No group assigned');
                                            return; // just stop email sending, DO NOT send response here
                                        }
                                    
                                        const permAppPermitDone = permResult[0].App_permit_Done;
                                        console.log("permAppPermitDone:", permAppPermitDone);
                                    
                                        const likeValue = `%,${permAppPermitDone},%`;
                                        console.log("Generated LIKE value:", likeValue);
                                    
                                        db.query('SELECT email FROM user WHERE REPLACE(user_groupName, " ", "") LIKE ?', [likeValue], (err, usersResults) => {
                                            if (err) {
                                                console.error('Error fetching emails:', err);
                                                return; // again, only log error, no response
                                            }
                                            if (usersResults.length === 0) {
                                                console.error('No users found in group:', permAppPermitDone);
                                                return;
                                            }
                                    
                                            usersResults.forEach(user => {
                                                const recipientEmail = user.email;
                                                sendStatusChangeEmail(Task_id, Task_Name, Task_owner, recipientEmail);
                                            });                                    
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
                                db.query('SELECT App_permit_Done FROM application WHERE App_Acronym = ?', [Task_app_Acronym], (err, permResult) => {
                                    if (err || permResult.length === 0 || !permResult[0].App_permit_Done) {
                                        console.error('Error fetching group or no group assigned:', err || 'No group assigned');
                                        return; // just stop email sending, DO NOT send response here
                                    }
                                
                                    const permAppPermitDone = permResult[0].App_permit_Done;
                                    console.log("permAppPermitDone:", permAppPermitDone);
                                
                                    const likeValue = `%,${permAppPermitDone},%`;
                                    console.log("Generated LIKE value:", likeValue);
                                
                                    db.query('SELECT email FROM user WHERE REPLACE(user_groupName, " ", "") LIKE ?', [likeValue], (err, usersResults) => {
                                        if (err) {
                                            console.error('Error fetching emails:', err);
                                            return; // again, only log error, no response
                                        }
                                        if (usersResults.length === 0) {
                                            console.error('No users found in group:', permAppPermitDone);
                                            return;
                                        }
                                
                                        usersResults.forEach(user => {
                                            const recipientEmail = user.email;
                                            sendStatusChangeEmail(Task_id, Task_Name, Task_owner, recipientEmail);
                                        });                                
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
};

// Approve task method
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

// Reject task method
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


exports.PromoteTask2Done = (req, res) => {

    let { taskId, taskName, taskDescription, taskNotes } = req.body;
    const Task_state = "Done";

    if (!req.decoded) {
        return res.status(200).json({ success: false, error: "EA2"});
    }

    const Task_owner = req.decoded.username;

    if (!Task_state || !taskId || !taskName) {
        return res.status(200).json({ success: false, error: "EP1", errorMsg: "All fields must be filled." });
    }

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ success: false, error: "ET3"});
        }

        // First: Fetch the existing Task_plan, Task_state, and Task_notes from DB
        db.query("SELECT Task_plan, Task_app_Acronym, Task_state, Task_notes FROM task WHERE Task_id = ?", [taskId], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, error: "ET3"});
            }

            if(results.length === 0) {
                return res.status(200).json({ success: false, error: "ET4"});
            }

            const currentState = results[0].Task_state;

            if (currentState !== "Doing") {
                return res.status(200).json({ success: false, error: "ET2"});
            }
            const validTransitions = {
                "Doing": ["Done"],
            };

            if (validTransitions[currentState] && !validTransitions[currentState].includes(Task_state)) {
                return res.status(200).json({ success: false, error: "ET5"});
            }

            const Task_app_Acronym = results[0].Task_app_Acronym;

            // ✅ Task_plan matches, continue with approval logic
            db.query('SELECT App_Rnumber FROM application WHERE App_Acronym = ?', [Task_app_Acronym], (err, appResults) => {
                if (err) {
                    return res.status(500).json({ success: false, error: "ET3"});
                }
                if (appResults.length === 0) {
                    return res.status(200).json({ success: false, error: "ET4"});
                }

                const localDatetime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" })).toLocaleString('sv-SE');
                const formattedDatetime = localDatetime.replace("T", " ").slice(0, 19);
                const taskNotesString = (taskNotes || "").trim();
                const noteDescription = taskNotesString === "" ? `Task promoted by ${Task_owner}` : taskNotesString;
                const newNote = {username: Task_owner, currentState: currentState, timestamp: formattedDatetime, desc: noteDescription};

                let existingNotes = [];
                try {
                    existingNotes = JSON.parse(results[0].Task_notes || "[]");
                } catch (e) {
                    existingNotes = [];
                }

                existingNotes.unshift(newNote);
                const updatedNotesJSON = JSON.stringify(existingNotes);

                db.query(`UPDATE task SET Task_Name = ?, Task_description = ?, Task_notes = ?, Task_state = ?, Task_owner = ? WHERE Task_id = ?`,
                [taskName, taskDescription, updatedNotesJSON, Task_state, Task_owner, taskId], (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            return res.status(200).json({ success: false, error: "ET2"});
                        });
                    }
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                return res.status(500).json({ success: false, error: "ET3"});
                            });
                        }
                        const shouldSendEmail = currentState === "Doing" && Task_state === "Done";

                        if (shouldSendEmail) {
                            db.query('SELECT App_permit_Done FROM application WHERE App_Acronym = ?', [Task_app_Acronym], (err, permResult) => {
                                if (err || permResult.length === 0 || !permResult[0].App_permit_Done) {
                                    console.error('Error fetching group or no group assigned:', err || 'No group assigned');
                                    return; // just stop email sending, DO NOT send response here
                                }
                            
                                const permAppPermitDone = permResult[0].App_permit_Done;
                                console.log("permAppPermitDone:", permAppPermitDone);
                            
                                const likeValue = `%,${permAppPermitDone},%`;
                                console.log("Generated LIKE value:", likeValue);
                            
                                db.query('SELECT email FROM user WHERE REPLACE(user_groupName, " ", "") LIKE ?', [likeValue], (err, usersResults) => {
                                    if (err) {
                                        console.error('Error fetching emails:', err);
                                        return res.status(500).json({ success: false, error: "ET3"});
                                    }
                                    if (usersResults.length === 0) {
                                        console.error('No users found in group:', permAppPermitDone);
                                        return res.status(200).json({ success: false, error: "ET4"});
                                    }
                            
                                    usersResults.forEach(user => {
                                        const recipientEmail = user.email;
                                        sendStatusChangeEmail(taskId, taskName, Task_owner, recipientEmail);
                                    });                                    
                                });
                            });
                        }                                
                        return res.status(200).json({ success: true, message: "Task updated to done successfully.", task: {taskId,  taskName, taskDescription, updatedNotesJSON, Task_state, Task_owner}
                        });
                    });
                });
            });
        });
    });
};