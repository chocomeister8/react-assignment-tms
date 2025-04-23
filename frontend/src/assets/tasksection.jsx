// Import react-based libraries
import React , { useEffect, useState } from 'react';
import { Row, Col, Card, ListGroup, Modal, Button, Form, FloatingLabel, Alert } from 'react-bootstrap';

// Import backend API calls
import { fetchUsername, fetchPlans, updateTask, checkUpdateTaskPermission } from '../assets/apiCalls';

const TaskSection = ({ selectedApp, tasks, refetchTasks, onUpdateSuccess }) => {
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

  const statusList = ['Open', 'To Do', 'Doing', 'Done', 'Closed'];
  const taskArray = Array.isArray(tasks) ? tasks : tasks?.tasks || [];

  useEffect (() => {  
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
        await fetchPlans().then(data => {
          setPlans(Array.isArray(data) ? data : []);
        });
        setUsername(username);
        setUserGroup(group);
  
      } catch (err) {
        setError(err.message);
      }
    };
    checkUpdatePermission();
    loadData();
  
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 2000);
  
      return () => clearTimeout(timer);
    }
  }, [selectedTask]);


  const getTasksByStatus = (status) => {
    if (!selectedApp || !Array.isArray(taskArray)) {
      //console.log('Early return: selectedApp or taskArray invalid');
      return [];
    }
    const filteredTasks = taskArray.filter(
      (task) => task.Task_state === status && task.Task_app_Acronym === selectedApp.App_Acronym
    );
    return filteredTasks;
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetailsModal(true);
  };

  const handleClose = () => {
    setShowTaskDetailsModal(false);
    setSelectedTask(null);
  };

  const handleEditClick = () => {
    setIsEditingTask(true);
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

  const handleUpdateTask = async () => {
      setModalError(null);
    
      const task_id = selectedTask?.Task_id.trim();
      const task_name = taskName.trim().toLowerCase();
      const task_description = taskDescription.trim();
      const task_notes = taskNotes;
      const task_plan = taskPlan && taskPlan.trim() !== "" ? taskPlan.trim() : null;
      const task_app_acronym = selectedTask?.Task_app_Acronym;
      const task_state = taskState.trim();
      const task_owner = username.trim();

      if(!task_name || !task_state){
        setModalError("Please fill in all fields!");
        return;
      }
      const taskNameRegex = /^[a-zA-Z0-9]{1,50}$/;
      if(!taskNameRegex.test(task_name)) {
        setModalError("Task Name can only consists of alphanumeric, no special characters and not more than 50 characters!");
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
        setModalError(err.message);
      }
    }

  const getVariantClass = (status) => {
    switch (status) {
      case 'To Do':
        return 'bg-info';
      case 'Doing':
        return 'bg-warning';
      case 'Done':
        return 'bg-success';
      case 'Closed':
        return 'bg-secondary';
      default:
        return '';
    }
  };

  const handleStatusChange = (task, newStatus) => {
    // Update the task status based on user selection
    task.Task_status = newStatus;
    // Make sure to save the changes to your state or backend
  };
  
  const getStatusOptions = (taskStatus) => {
    switch (taskStatus) {
      case 'Open':
        return ['Open', 'To Do']; // Only allow "Open" or "To Do" from "Open"
      case 'To Do':
        return ['To Do', 'Doing']; // Only allow "To Do" or "Doing" from "To Do"
      case 'Doing':
        return ['Doing', 'Done']; // Only allow "Doing" or "Done" from "Doing"
      case 'Done':
        return ['Closed', 'Doing']; // Only allow "Closed" or "Doing" from "Done"
      default:
        return []; // No options for undefined status
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
                {filteredTasks.length > 0 ? (filteredTasks.map((task, itemIdx) => (
                <ListGroup.Item key={itemIdx} className="px-1 border-0" style = {{ padding: '0.25rem', cursor: 'pointer'}} onClick={() => handleTaskClick(task)}>
                  <Card className={`shadow-sm ${getVariantClass(task.Task_state)} `}>
                    <Card.Body className="p-2" style={{ flexGrow: 1, whiteSpace: 'nowrap', overflowX: 'auto', textOverflow: 'ellipsis' }}>
                      <Card.Title as="h6" className="mb-2" style={{ fontSize: '1rem' }}>
                        {task.Task_Name}
                      </Card.Title>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted" style={{ fontSize: '0.6rem', marginRight: '10px' }}>
                          Plan: {task.Task_plan || 'N/A'}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.6rem' }}>
                          Task owner: {task.Task_owner || 'Unassigned'}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </ListGroup.Item>
                ))
              ) : (
              <ListGroup.Item className="text-center text-muted" style={{ fontSize: '0.8rem' }}>
                No task.
              </ListGroup.Item>
              )}
              </ListGroup>
            </Card>
          </Col>
        );
      })}
    </Row>
    <Modal show={showTaskDetailsModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Task Name: {selectedTask?.Task_Name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Row className="align-items-end">
          <Col md={6}>
            <Form.Group controlId="taskName" className="mb-2">
              <FloatingLabel controlId="floatingTaskName" label="Task Name:">
                <Form.Control type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} disabled={!isEditingTask} />
              </FloatingLabel>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="taskid" className="mb-2">
              <FloatingLabel controlId="floatingTaskid" label="Task ID:">
                <Form.Control type="text" value={selectedTask?.Task_id || ""} disabled/>
              </FloatingLabel>
            </Form.Group>
          </Col>
        </Row>
        <Row className="align-items-end">
          <Col md={6}>
          <Form.Group controlId="taskState" className="mb-2">
            <FloatingLabel controlId="floatingTaskState" label="Task State:">
              {isEditingTask ? (
                <Form.Select required value={taskState} onChange={(e) => setTaskState(e.target.value)}>
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
          </Col>
          <Col md={6}>
            <Form.Group controlId="taskcreateDate" className="mb-2">
              <FloatingLabel controlId="floatingTaskDate" label="Date Created:">
                <Form.Control type="text" value={selectedTask?.Task_createDate ? new Date(selectedTask.Task_createDate).toISOString().split('T')[0] : ''} disabled />
              </FloatingLabel>
            </Form.Group>
          </Col>
        </Row>
        <Row className="align-items-end">
          <Col md={6}>
          <Form.Group controlId="taskPlan" className="mb-2">
            <FloatingLabel label="Task Plan:"> {isEditingTask ? (
              <Form.Select required value={taskPlan} onChange={(e) => setTaskPlan(e.target.value)}>
                <option value="">Select a Plan</option>
                {plans.filter(plan => plan.Plan_app_Acronym === selectedApp?.App_Acronym).map((plan, index) => (
                  <option key={index} value={plan.Plan_MVP_name}>{plan.Plan_MVP_name}</option>))}
              </Form.Select>
              ) : (
                <Form.Control type="text" value={selectedTask?.Task_plan || ""} disabled />
              )}
            </FloatingLabel>
          </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="taskcreator" className="mb-2">
              <FloatingLabel controlId="floatingTaskCreator" label="Creator:">
                <Form.Control type="text" value={selectedTask?.Task_creator || ""} disabled />
              </FloatingLabel>
            </Form.Group>
          </Col>
        </Row>
        <Row className="align-items-end">
          <Col md={6}>
            <Form.Group controlId="taskAppAcronym" className="mb-2">
              <FloatingLabel controlId="floatingTaskAppAcronym" label="Task App Acronym:">
                <Form.Control type="text" value={selectedTask?.Task_app_Acronym || ""} disabled />
              </FloatingLabel>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="taskOwner" className="mb-2">
              <FloatingLabel controlId="floatingOwner" label="Task Owner:">
                <Form.Control type="text" value={selectedTask?.Task_owner || ""} disabled />
              </FloatingLabel>
            </Form.Group>
          </Col>
        </Row>
        <Row className="align-items-end">
          <Col md={12}>
            <Form.Group controlId="taskDesc" className="mb-2">
              <FloatingLabel controlId="floatingTaskDesc" label="Description:">
                <Form.Control as="textarea" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)}  disabled={!isEditingTask}/>
              </FloatingLabel>
            </Form.Group>
          </Col>
        </Row>
        <Row className="align-items-end">
          <Col md={12}>
            <Form.Group controlId="taskNotes" className="mb-2" style={{ position: 'relative' }}>
              <Form.Label 
                style={{position: 'absolute',top: '-0.75rem',left: '1rem',backgroundColor: '#fff',padding: '0 0.25rem',fontSize: '0.85rem',color: '#6c757d',zIndex: 1}}>
                Task Notes
              </Form.Label>
              <Card className="mt-3">
                <Card.Body style={{ maxHeight: '200px', overflowY: 'auto', padding: '0.75rem' }}>
                  {parseTaskNotes(selectedTask?.Task_notes).map((note, index) => (
                    <div key={index} className="mb-3 p-2 border rounded" style={{ backgroundColor: "#f8f9fa" }}>
                      {/* First row: formatted with | separator */}
                      <div className="mb-1">
                        <strong className="text-muted">{note.username}</strong> 
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
        <Row className="align-items-end">
          <Col md={12}>
            <Form.Group controlId="editTaskNotes" className="mb-2">
              <FloatingLabel controlId="floatingEditTaskNotes" label="Task Notes:">
                <Form.Control type="textarea" onChange={(e) => setTaskNotes(e.target.value)} placeholder="Enter note (optional)" disabled={!isEditingTask} />
              </FloatingLabel>
            </Form.Group>
          </Col>
        </Row>
        {Modalerror && <Alert variant="danger" className="mb-2">{Modalerror}</Alert>}
        </Modal.Body>
          <Modal.Footer>
          <div className="w-100 d-flex justify-content-center gap-2">
            {userGroup.includes("") ? (!isEditingTask ? (
              <Button variant="success" onClick={handleEditClick}>Edit</Button>) : (<Button variant="success" onClick={handleUpdateTask}>Update Task</Button>)
            ) : null}
            <Button variant="secondary" onClick={() => {
              setIsEditingTask(false);
              setModalError('');
              setShowTaskDetailsModal();
            }}>
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
  </div>
  );
};
export default TaskSection;
