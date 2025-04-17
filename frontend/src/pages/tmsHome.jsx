// Import react-based libraries
import React, { useEffect, useState } from 'react';
import { Button, Alert, Container, Row, Col, Modal, Form, FloatingLabel } from 'react-bootstrap';

// Import top nav bar, sidebar and tasksection component
import Layout from '../assets/topnavbar';
import Sidebar from '../assets/sidebar';
import TaskSection from '../assets/tasksection';

// Import backend API calls
import { fetchUsername, fetchPlans, createTask, fetchTaskByAppAcronym, checkcreateTaskPermission } from '../assets/apiCalls';

const TmsHome = () => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const handleShowTaskModal = () => setShowTaskModal(true);
  const handleCloseTaskModal = () => setShowTaskModal(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [username, setUsername] = useState('');
  const [userGroup, setUserGroup] = useState('');
  const [plans, setPlans] = useState([]);

  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskPlan, setTaskPlan] = useState('');

  const [tasks, setTasks] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  const handleAppSelect = async (app) => {
    setSelectedApp(app);
    try {
      const tasksData = await fetchTasks();
      setTasks(tasksData);
    } catch (err) {
      setError("Failed to fetch tasks.");
    }
  };

  const handleSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const fetchTasks = async () => {
    if(!selectedApp) {
      return;
    }
    try {
      const fetchedTasks = await fetchTaskByAppAcronym(selectedApp.App_Acronym);
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect (() => {
    if (selectedApp) {
      fetchTasks();
    }

    const checkPermission = async () => {
      try {
        if (!selectedApp) {
          return;
        } 
  
        const response = await checkcreateTaskPermission(selectedApp.App_Acronym); // your axios call
        if (response.success) {
          setHasPermission(true);
        } else {
          setHasPermission(false);
        }
      } catch (err) {
        console.error("Permission check error:", err.message);
        setHasPermission(false);
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
        fetchPlans();
  
      } catch (err) {
        setError(err.message);
      }
    };

    checkPermission();
    loadData();

    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 2000);
  
      return () => clearTimeout(timer);
    }
  }, [selectedApp])

  const handleCreateTask = async () => {
      setError(null);
      setSuccess(null);

      const task_name = taskName.trim().toLowerCase();
      const task_description = taskDescription.trim();
      const task_notes = taskNotes.trim();
      const task_creator = username;
      const task_plan = taskPlan.trim();
      const task_appAcronym = selectedApp.App_Acronym;

      if(!task_name|| !task_creator || !task_appAcronym){
        setError("Please fill in all fields!");
        return;
      }
      const taskNameRegex = /^[a-zA-Z0-9]{1,50}$/;
      if(!taskNameRegex.test(task_name)) {
        setError("Task Name can only consists of alphanumeric, no special characters and not more than 50 characters!");
        return;
      }
      try{
        const newTask = await createTask(task_name,task_description ,task_notes ,task_plan , task_appAcronym , task_creator);
        if(newTask.error) {
          setError(newTask.error);
        }
        if(newTask.success === false){
          setError(newTask.message);
          return;
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

            fetchTasks();
          }
        }
      }
      catch (err) {
        setError(err.message);
      }
    }

  return (
    <Layout onSuccess={handleSuccess}>
      <Container fluid style={{ height: '100vh' }}>
        <Row style={{ height: '100%' }}>
          <Col md={2} className="bg-light p-0">
            <Sidebar onAppCreated={handleSuccess} onPlanCreated={handleSuccess} onUpdateDone={handleSuccess} onAppSelect={handleAppSelect} />
          </Col>

          <Col md={10} className="p-3">
            <Row className="align-items-center">
              <Col md={12}>
              {success && <Alert style={{width: '100%', transition: 'width 0.3s ease' }} variant="success">{success}</Alert>} 
              </Col>
            </Row>
            <Row>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Col md={10}>
                <h4>App Name: {selectedApp ? selectedApp.App_Acronym : 'No App Selected'}</h4>
              </Col>
              {selectedApp && hasPermission && (
                <Col md={2} className="d-flex justify-content-end">
                  <Button className="success" variant="outline-success" onClick={handleShowTaskModal}>Create Task</Button>
                </Col>
              )}
              </div>
            <TaskSection selectedApp={selectedApp} tasks={tasks}/>
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
                  <Form.Group controlId="formTaskPlan" className="mb-1">
                    <FloatingLabel controlId="floatingTaskPlan" label="Task Plan">
                      <Form.Select required value={taskPlan} onChange={(e) => setTaskPlan(e.target.value)}>
                      <option value="">Select a Plan</option>
                      {plans.filter(plan => plan.Plan_app_Acronym === selectedApp?.App_Acronym).map((plan, index) => (
                        <option key={index} value={plan.Plan_MVP_name}>
                          {plan.Plan_MVP_name}
                        </option>
                      ))}
                      </Form.Select>
                    </FloatingLabel>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group controlId="formTaskDescription" className="mb-1">
                    <FloatingLabel controlId="floatingTaskDescription" label="Task Description">
                      <Form.Control as="textarea" rows={3} placeholder="Enter Task Description" required style={{ height: '100px'}} onChange={(e) => setTaskDescription(e.target.value)}/>
                    </FloatingLabel>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group controlId="formTaskNotes" className='mb-1'>
                    <FloatingLabel controlId="floatingTaskNotes" label="Task Notes">
                      <Form.Control as="textarea" rows={3} placeholder="Enter task notes" required style={{ height: '150px'}} onChange={(e) => setTaskNotes(e.target.value)}/>
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
