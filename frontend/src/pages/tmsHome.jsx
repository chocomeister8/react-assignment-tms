import React, { useState } from 'react';
import Layout from '../assets/topnavbar';
import { Button, Alert, Container, Row, Col, Modal, Form, FloatingLabel } from 'react-bootstrap';
import Sidebar from '../assets/sidebar';
import TaskSection from '../assets/tasksection';
import { fetchUsername } from '../assets/apiCalls';

const TmsHome = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const handleShowTaskModal = () => setShowTaskModal(true);
  const handleCloseTaskModal = () => setShowTaskModal(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [username, setUsername] = useState('');
  const [userGroup, setUserGroup] = useState('');


  const [taskID, setTaskID] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskState, setTaskState] = useState('');
  const [taskCreateDate, setTaskCreateDate] = useState('');
  const [taskCreator, setTaskCreator] = useState('');
  const [taskPlan, setTaskPlan] = useState('');
  const [taskAppAcronym, setTaskAppAcronym] = useState('');
  const [taskOwner, setTaskOwner] = useState('');

  const [selectedApp, setSelectedApp] = useState(null);
  const handleAppSelect = (app) => {
    setSelectedApp(app);
  };  
  const handleSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const loadData = async () => {
    try {
      const { username, group } = await fetchUsername();

      setUsername(username);
      setUserGroup(group);

    } catch (err) {
      setError(err.message);
    }
  };
  loadData();

  const handleCreateTask = async () => {
      setError(null);
      setSuccess(null);
  
      const task_id = Number(taskID); //use AppRNumber
      const task_name = taskName.trim().toLowerCase();
      const task_description = taskDescription.trim();
      const task_notes = taskNotes.trim();
      const task_state = "Open";
      const task_createDate = new Date().toISOString();
      const task_creator = username.username.toString();
      const task_plan = taskPlan.trim();
      const task_appAcronym = selectedApp.App_Acronym.toString();
      const task_owner = username.username.toString();

      console.log(task_id ,task_name,task_description ,task_notes ,task_state ,task_createDate ,task_creator ,task_plan ,task_appAcronym ,task_owner)

  
      if(!task_id || !task_name|| !task_description || !task_notes || !task_state || !task_createDate || !task_creator || !task_plan || !task_appAcronym || !task_owner){
        setError("Please fill in all fields!");
        return;
      }
      const taskNameRegex = /^[a-zA-Z0-9]{1,50}$/;
      if(!taskNameRegex.test(task_name)) {
        setError("Task Name can only consists of alphanumeric, no special characters and not more than 50 characters!");
        return;
      }
      try{
        const newTask = await createTask(task_id, task_name, task_description, task_notes, task_state, task_createDate, task_creator, task_plan, task_appAcronym, task_owner);
        if(newTask.error) {
          setError(newPlan.error);
        }
        else{
          if (newTask.success) {
            setSuccess(newTask.success);
            setShowTaskModal(false);
  
            // Reset form fields
            setTaskName('');
            setTaskDescription('');
            setTaskNotes('');
            setTaskPlan('');
            setError('');
          }
        }
      }
      catch (err) {
        setError(err.message);
      }
    }

  return (
    <Layout>
      <Container fluid style={{ height: '100vh' }}>
        <Row style={{ height: '100%' }}>
          <Col md={2} className="bg-light p-0">
            <Sidebar onAppCreated={handleSuccess} onPlanCreated={handleSuccess} onAppSelect={handleAppSelect} />
          </Col>

          <Col md={10} className="p-3">
            <Row className="align-items-center">
              <Col md={12}>
              {successMessage && (
                <Alert variant="success">{successMessage}</Alert>
              )}
              </Col>
            </Row>
            <Row>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Col md={10}>
                <h4>App Name: {selectedApp ? selectedApp.App_Acronym : 'No App Selected'}</h4>
              </Col>
              {userGroup.includes(",pl,") && (
                <Col md={2}>
                  <Button variant="outline-dark" onClick={handleShowTaskModal}>Create Task</Button>
                </Col>
              )}
              </div>
            <TaskSection/>
            </Row>
          </Col>
        </Row>
        <Modal show={showTaskModal} onHide={handleCloseTaskModal}>
          <Modal.Header closeButton>
            <Modal.Title>Create Task form</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          {error && <Alert style={{width: '100%', transition: 'width 0.3s ease' }} variant="danger">{error}</Alert>} {/* Show error message */}
            <Form>
              {/* Row 1: App Name and Description */}
              <Row>
                <Col md={6}>
                  <Form.Group controlId="formTaskName" className='mb-1'>
                    <FloatingLabel controlId="floatingTaskName" label="Task Name">
                      <Form.Control type="text" placeholder="Enter task name" required onChange={(e) => setTaskName(e.target.value)}/>
                    </FloatingLabel>
                  </Form.Group>
                  </Col>
                  <Col md={6}>
                  <Form.Group controlId="formTaskNotes" className='mb-1'>
                    <FloatingLabel controlId="floatingTaskNotes" label="Task Notes">
                      <Form.Control type="text" placeholder="Enter task notes" required onChange={(e) => setTaskNotes(e.target.value)}/>
                    </FloatingLabel>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formTaskDescription" className="mb-1">
                    <FloatingLabel controlId="floatingTaskDescription" label="Task Description">
                      <Form.Control type="text" placeholder="Enter Task Description" required onChange={(e) => setTaskDescription(e.target.value)}/>
                    </FloatingLabel>
                  </Form.Group>
                </Col>
                <Col md={6}>
                <Form.Group controlId="formTaskPlan" className="mb-1">
                  <FloatingLabel controlId="floatingTaskPlan" label="Task Plan">
                      <Form.Control type="text" placeholder="Enter Task Plan" required onChange={(e) => setTaskNotes(e.target.value)}/>
                    </FloatingLabel>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <div className="w-100 d-flex justify-content-center gap-2">
              <Button variant="success" onClick={handleCreateTask}>Create Task</Button>
              <Button variant="secondary" onClick={handleCloseTaskModal}>Close</Button>
            </div>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  );
};

export default TmsHome;
