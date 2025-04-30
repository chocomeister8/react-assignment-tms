// Import react-based libraries
import React , { useEffect, useState } from 'react';
import { Row, Col, Card, ListGroup, Modal, Button, Form, FloatingLabel, Alert } from 'react-bootstrap';

// Import backend API calls
import { fetchUsername, fetchPlans, updateTask, checkUpdateTaskPermission, approveTask, rejectTask, fetchTaskByTaskID } from '../assets/apiCalls';

const TaskSection = ({ selectedApp, tasks, allplans, refetchTasks, onUpdateSuccess, refreshTrigger }) => {
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [Modalerror, setModalError] = useState(null);

  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [userGroup, setUserGroup] = useState('');
  const [username, setUsername] = useState('');
  const [plans, setPlans] = useState([]);
  const [isEditingTask, setIsEditingTask] = useState(false);

  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskPlan, setTaskPlan] = useState('');
  const [taskState, setTaskState] = useState('');
  const [hasUpdatePermission, setHasUpdatePermission] = useState(false);
  const [previousState, setPreviousState] = useState("");

  const statusList = ['Open', 'To Do', 'Doing', 'Done', 'Closed'];
  const taskArray = Array.isArray(tasks) ? tasks : tasks?.tasks || [];

  useEffect (() => {
    // Setting the task details upon loading
    if (selectedTask) {
      setTaskName(selectedTask.Task_Name || '');
      setTaskDescription(selectedTask.Task_description || '');
      setTaskNotes("");
      setTaskPlan(selectedTask.Task_plan || '');
      setTaskState(selectedTask.Task_state || '');
    }

    const checkUpdatePermission = async () => {
      try {
        if (!selectedApp) {
          return;
        }
        
        // check for update permissions of the current user
        const response = await checkUpdateTaskPermission(selectedTask.Task_id); 
        if (response.success) {
          setHasUpdatePermission(true);
        } else {
          setHasUpdatePermission(false);
        }
      } catch (err) {
        setHasUpdatePermission(false);
      }
    };
  
    const loadData = async () => {
      try {
        const { username, group } = await fetchUsername();
        // Fetch plans     
        await fetchPlans().then(data => {
          setPlans(Array.isArray(data) ? data : []);
        });
        // set the user and group state
        setUsername(username);
        setUserGroup(group);
  
      } catch (err) {
        setError(err.message);
      }
    };
    checkUpdatePermission();
    loadData();
  
    // Error message duration
    if (error || success || Modalerror) {
      const timer = setTimeout(() => {
        setError('');
        setModalError('');
        setSuccess('');
      }, 2000);
  
      return () => clearTimeout(timer);
    }
  }, [selectedTask]);

  useEffect(() => {
    console.log("refreshTrigger changed, re-fetching tasks");
    // Ensure that the task will refetch upon reclicking app in sidebar
    if (selectedApp) {
      refetchTasks(selectedApp.App_Acronym);
    }
  }, [refreshTrigger]);

  // FIltering task to the states
  const getTasksByStatus = (status) => {
    if (!selectedApp || !Array.isArray(taskArray)) {
      return [];
    }
    const filteredTasks = taskArray.filter(
      (task) => task.Task_state === status && task.Task_app_Acronym === selectedApp.App_Acronym
    );
    return filteredTasks;
  };

  // Select task method
  const handleTaskClick = async (selectedTask) => {
    try {
      // Fetch task details based on selected task_id
      const result = await fetchTaskByTaskID(selectedTask.Task_id);
      if (result.success && result.Task) {
        // Set the selected task data
        setSelectedTask(result.Task); 
        setShowTaskDetailsModal(true);
      } else {
        setError("Task not found.");
      }
      refetchTasks();
    } catch (err) {
      console.error(err);
      setError("Could not fetch task details.");
    }
  };

  // Close modal
  const handleClose = () => {
    setShowTaskDetailsModal(false);
    setSelectedTask(null);
  };

  const parseTaskNotes = (notes) => {
    if (!notes) return [];
    try {
      const parsed = JSON.parse(notes);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Update task method
  const handleUpdateTask = async (task_state) => {
    setModalError(null);

    const task_id = selectedTask?.Task_id.trim();
    const task_name = taskName.trim().toLowerCase();
    const task_description = taskDescription.trim();
    const task_notes = taskNotes;
    const task_plan = taskPlan && taskPlan.trim() !== "" ? taskPlan.trim() : null;
    const task_app_acronym = selectedTask?.Task_app_Acronym;
    const task_owner = username.trim();

    if(!task_name){
      setModalError("Task Name cannot be empty!");
      return;
    }

    try {
      const updatetask = await updateTask(task_id, task_name, task_description, task_notes, task_plan, task_app_acronym, task_state, task_owner);
      if(updatetask.error) {
        setModalError(updatetask.error);
        return;
      }
      if(updatetask.success === false){
        setModalError(updatetask.message);
        return;
      }
      else {
        setIsEditingTask(false);
        setShowTaskDetailsModal(false);
        await refetchTasks();
        onUpdateSuccess("Task updated successfully!");
        }
    }
    catch (err) {
      console.error('Caught error:', err);  // <-- log it first to see what's inside
    
      if (err?.response?.data?.error) {
        setModalError(err.response.data.error); 
      } else if (err?.message) {
        setModalError(err.message); // maybe it's just a simple error with message
      } else {
        setModalError('Something went wrong.');
      }
    }
  }

  // Approve task method
  const handleApproveTask = async () => {
    setModalError(null);

    const task_id = selectedTask?.Task_id.trim();
    const task_name = taskName.trim().toLowerCase();
    const task_description = taskDescription.trim();
    const task_notes = taskNotes?.trim() === "" ? "" : taskNotes.trim();
    const task_plan = taskPlan && taskPlan.trim() !== "" ? taskPlan.trim() : null;
    const task_app_acronym = selectedTask?.Task_app_Acronym;
    const task_state = "Closed";
    const task_owner = username.trim();

    if(!task_state){
      setModalError("Please fill in all fields!");
      return;
    }

    const existingPlan = (selectedTask?.Task_plan || "").trim();
    const currentPlan = (taskPlan || "").trim();

    if (existingPlan !== currentPlan) {
      setModalError("Changing the task plan during approval is not allowed.");
      return;
    }
    try {
      
      const approvetask = await approveTask(task_id, task_name, task_description, task_notes, task_plan, task_app_acronym, task_state, task_owner);
      if(approvetask.error) {
        setModalError(approvetask.error);
        return;
      }
      if(approvetask.success === false){
        setModalError(approvetask.message);
        return;
      }
      else {
        setIsEditingTask(false);
        setShowTaskDetailsModal(false);
        await refetchTasks();
        setModalError('');
        onUpdateSuccess("Task approved successfully!");
      }
    }
    catch (err) {
      setModalError(err.message);
    }
  }

  // Reject task method
  const handleRejectTask = async () => {
    setModalError(null);

    const task_id = selectedTask?.Task_id.trim();
    const task_name = taskName.trim().toLowerCase();
    const task_description = taskDescription.trim();
    const task_notes = taskNotes?.trim() === "" ? null : taskNotes.trim();
    const task_plan = taskPlan && taskPlan.trim() !== "" ? taskPlan.trim() : null;
    const task_app_acronym = selectedTask?.Task_app_Acronym;
    const task_state = "Doing";
    const task_owner = username.trim();

    if(!task_state){
      setModalError("Please fill in all fields!");
      return;
    }

    try {
      const rejecttask = await rejectTask(task_id, task_name, task_description, task_notes, task_plan, task_app_acronym, task_state, task_owner);
      if(rejecttask.error) {
        setModalError(rejecttask.error);
        return;
      }
      if(rejecttask.success === false){
        setModalError(rejecttask.message);
        return;
      }
      else {
        setIsEditingTask(false);
        setShowTaskDetailsModal(false);
        await refetchTasks();
        setModalError('');
        onUpdateSuccess("Task rejected successfully!");
        }
    }
    catch (err) {
      setModalError(err.message);
    }
  }

  const getPlanColor = (planName) => {
    if (!planName) {
      return 'white'; // Return a default color if planName is invalid or undefined
    }
    const plan = allplans.find(p => p.Plan_MVP_name.toLowerCase() === planName.toLowerCase());
    return plan ? plan.Plan_color : 'white';
  };

  // Displaying the dropdownlist values based on the current task state
  const getStatusOptions = (taskStatus) => {
    switch (taskStatus) {
      case 'Open':
        return ['Open', 'To Do'];
      case 'To Do':
        return ['To Do', 'Doing']; 
      case 'Doing':
        return ['To Do', 'Doing', 'Done'];
      case 'Done':
        return ['Closed', 'Doing']; 
      case 'Closed':
      return []; 
      default:
        return []; 
    }
  };

  return (
    <div>
    {error && <div className="alert alert-danger">{error}</div>}
    <Row className="mt-3" style={{ rowGap: '1rem' }}>
      {statusList.map((status, idx) => {
        const filteredTasks = getTasksByStatus(status);
        return (
          <Col key={idx} style={{ flex: '0 0 20%', maxWidth: '20%' }}>
            <Card style={{ height: '425px', display: 'flex', flexDirection: 'column'}}>
              <Card.Header>
                <strong>{status}</strong>
              </Card.Header>
              <ListGroup variant="flush" style={{ overflowY: 'auto', flexGrow: 1 }}>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, itemIdx) => {
                  const planColor = getPlanColor(task.Task_plan);
                  return (
                    <ListGroup.Item key={itemIdx} className="px-1 border-0" style={{ padding: '0.25rem', cursor: 'pointer'}} onClick={() => handleTaskClick(task)}>
                      <Card className="shadow-sm">
                        <Card.Body className="p-2" style={{ flexGrow: 1, whiteSpace: 'nowrap', overflowX: 'auto', textOverflow: 'ellipsis', backgroundColor: planColor, borderRadius: '4px'}}>
                          <Card.Title as="h6" className="mb-2" style={{ fontSize: '1rem' }}>
                            {task.Task_Name}
                          </Card.Title>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted" style={{ fontSize: '0.6rem', marginRight: '10px' }}>Plan: {task.Task_plan || 'N/A'}</span>
                            <span className="text-muted" style={{ fontSize: '0.6rem' }}>Task owner: {task.Task_owner || 'Unassigned'}</span>
                          </div>
                        </Card.Body>
                      </Card>
                    </ListGroup.Item>
                  );
                })
              ) : (
                <ListGroup.Item className="text-center text-muted" style={{ fontSize: '0.8rem' }}>No task.</ListGroup.Item>
              )}
              </ListGroup>
            </Card>
          </Col>
        );
      })}
    </Row>
    <Modal size="xl" show={showTaskDetailsModal} onHide={handleClose} centered backdrop="static">
        <Modal.Header closeButton >
          <Modal.Title>Task Name: {selectedTask?.Task_Name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Row >
          <Col>
            <Form.Group controlId="taskid" className="mb-1">
              <FloatingLabel controlId="floatingTaskid" label="Task ID:">
                <Form.Control type="text" value={selectedTask?.Task_id || ""} disabled/>
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="taskAppAcronym" className="mb-1">
              <FloatingLabel controlId="floatingTaskAppAcronym" label="Task App Acronym:">
                <Form.Control type="text" value={selectedTask?.Task_app_Acronym || ""} disabled />
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="taskState" className="mb-1">
              <FloatingLabel controlId="floatingTaskState" label="Task State:">
                {isEditingTask ? (
                  <Form.Select required value={taskState} onChange={(e) => setTaskState(e.target.value)} >
                    <option value="">Select a State</option>{getStatusOptions(selectedTask?.Task_state).map((status, index) => (
                      <option key={index} value={status}>
                        {status}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Form.Control type="text" value={selectedTask?.Task_state || "No state assigned"} disabled readOnly/>
                )}
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="taskcreateDate" className="mb-1">
              <FloatingLabel controlId="floatingTaskDate" label="Date Created:">
                <Form.Control type="text" value={selectedTask?.Task_createDate ? new Date(selectedTask.Task_createDate).toISOString().split('T')[0] : ''} disabled />
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="taskcreator" className="mb-1">
              <FloatingLabel controlId="floatingTaskCreator" label="Creator:">
                <Form.Control type="text" value={selectedTask?.Task_creator || ""} disabled />
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="taskOwner">
              <FloatingLabel controlId="floatingOwner" label="Task Owner:">
                <Form.Control type="text" value={selectedTask?.Task_owner || ""} disabled />
              </FloatingLabel>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="taskName" className="mb-1">
              <FloatingLabel controlId="floatingTaskName" label="Task Name:">
                <Form.Control type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} disabled={!hasUpdatePermission} />
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="taskPlan" className="mb-1">
              <FloatingLabel label="Task Plan:">
                {/* Check if the task is in 'Open' state, if not, disable the select field */}
                {(selectedTask?.Task_state === "Open") || 
                (selectedTask?.Task_state === "Done" && hasUpdatePermission) ? (
                  <Form.Select required value={taskPlan} onChange={(e) => setTaskPlan(e.target.value)} disabled={!hasUpdatePermission} >
                    <option value="">Select a Plan</option>
                    {plans.filter(plan => plan.Plan_app_Acronym === selectedApp?.App_Acronym).map((plan, index) => (
                      <option key={index} value={plan.Plan_MVP_name}>{plan.Plan_MVP_name}</option>
                    ))}
                  </Form.Select>
                ) : (
                  <Form.Control type="text" value={selectedTask?.Task_plan || ""} disabled />
                )}
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="taskDesc" className="mb-1">
              <FloatingLabel controlId="floatingTaskDesc" label="Description:">
                <Form.Control as="textarea" style={{ height: "120px"}} value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} disabled={!hasUpdatePermission} />
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="editTaskNotes" className="mb-1">
              <FloatingLabel controlId="floatingEditTaskNotes" label="Task Notes:">
                <Form.Control type="textarea" style={{ height: "120px"}} onChange={(e) => setTaskNotes(e.target.value)} placeholder="Enter note (optional)" disabled={!(hasUpdatePermission || (selectedTask?.Task_state === "Done" && hasUpdatePermission))} />
              </FloatingLabel>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="taskNotes" style={{ position: 'relative' }}>
              <Form.Label 
                style={{position: 'absolute', top:'-0.75rem',left: '1rem',backgroundColor: '#fff',padding: '0 0.25rem',fontSize: '0.85rem',color: '#6c757d',zIndex: 1}}>
                Task Notes
              </Form.Label>
              <Card >
                <Card.Body style={{ maxHeight: '365px', overflowY: 'auto', padding: '0.75rem' }}>
                  {parseTaskNotes(selectedTask?.Task_notes).map((note, index) => (
                    <div key={index} className="mb-2 p-2 border rounded" style={{ backgroundColor: "#f8f9fa" }}>
                      {/* First row: formatted with | separator */}
                      <div className="mb-1">
                        <strong className="text-muted" style={{ fontSize: '0.9rem' }}>{note.username}</strong> 
                        <strong className="text-muted" style={{ fontSize: '0.9rem' }}> | {note.timestamp}</strong>
                        <strong className="text-muted" style={{ fontSize: '0.9rem' }}> | State: {note.currentState}</strong>
                      </div>
                      {/* Second row: Description (notes) */}
                      <div>{note.desc}</div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Form.Group>
          </Col>
        </Row>
        {Modalerror && <Alert variant="danger" className="mb-2">{Modalerror}</Alert>}
        </Modal.Body>
        <Modal.Footer>
         <div className="w-100 d-flex justify-content-center gap-2">
            {hasUpdatePermission ? (
              <>
                {selectedTask?.Task_state === "Done" ? (
                  <>
                    <Button variant="success" onClick={handleApproveTask} hidden={taskPlan !== selectedTask?.Task_plan}>Approve</Button>
                    <Button variant="danger" onClick={handleRejectTask}>Reject</Button>
                  </>
                ) : selectedTask?.Task_state === "Open" ? (
                  // If task is in Open state, show Release button
                  <Button variant="success" onClick={() => handleUpdateTask("To Do")}>Release</Button>

                ) : selectedTask?.Task_state === "To Do" ? (
                  // If task is in To Do state, show Assign button
                  <Button variant="success" onClick={() => handleUpdateTask("Doing")}>Assign</Button>

                ) : selectedTask?.Task_state === "Doing" ? (
                  <>
                  <Button variant="success" onClick={() => handleUpdateTask("Done")}>Send for Review</Button>
                  <Button variant="danger" onClick={() => handleUpdateTask("To Do")}>Re-Prioritise</Button>
                  </>
                ) : null}
                <Button variant="primary" onClick={() => handleUpdateTask(selectedTask.Task_state)} hidden={selectedTask?.Task_state === "Done" && taskPlan !== selectedTask?.Task_plan}>Update</Button>
              </>
            ) : null}
          </div>
        </Modal.Footer>
      </Modal>
  </div>
  );
};
export default TaskSection;
