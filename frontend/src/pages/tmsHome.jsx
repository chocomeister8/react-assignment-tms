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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // refresh when there is a click on app
  const handleAppSelect = async (app) => {
    setSelectedApp(app); // Step 1: update app
    setRefreshTrigger(prev => prev + 1); // 🔁 causes TaskSection to refetch

    try {
      const tasksData = await fetchTasks(app.App_Acronym); // Pass app acronym if needed
      setTasks(tasksData); // Step 2: update tasks
    } catch (err) {
      setError("Failed to fetch tasks.");
    }
  };

  // success message
  const handleSuccess = async (message) => {
    setSuccess(message);
    setRefreshTrigger(prev => prev + 1); // 🔁 causes TaskSection to refetch
    setTimeout(() => setSuccess(''), 3000);
  };

  // fetch task by app acronym only if there is a selected app
  const fetchTasks = async () => {
    if(!selectedApp) {
      console.log("No selected app, skipping task fetch.");
      return;
    }
    try {
      // fetch task by app acronym
      const fetchedTasks = await fetchTaskByAppAcronym(selectedApp.App_Acronym);
      setTasks(fetchedTasks); // set tasks data to the use state
      return fetchedTasks;
    } catch (err) {
      setError(err.message);
      console.log("Error fetching tasks:", err.message);
      return [];
    }
  };

  // show task modal
  const handleShowTaskModal = async () => {
    try {
      // fetch plans
      const plansData = await fetchPlans();
      setPlans(Array.isArray(plansData) ? plansData : []); // set plan results to the use state
      setShowTaskModal(true);
    } catch (err) {
      console.error('Failed to fetch plans:', err.message);
      setError(err.message);
    }
  };

  // success and error message duration
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
  
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Fetch data
  useEffect (() => {
    if (selectedApp) {
      fetchTasks(); // fetch tasks when there is a selected app
    }

    // check permission of current user for create task
    const checkPermission = async () => {
      try {
        if (!selectedApp) {
          return;
        }
        console.log("Selected", selectedApp.App_Acronym);
        const response = await checkcreateTaskPermission(selectedApp.App_Acronym); // check create task permissions
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
        const { username, group } = await fetchUsername(); // fetch username and group
        await fetchPlans().then(data => {
          setPlans(Array.isArray(data) ? data : []); // set the fetched plan data to the use state
        });
        setUsername(username); // to set as the task creator
        setUserGroup(group);
  
      } catch (err) {
        setError(err.message);
      }
    };

    checkPermission();
    loadData();

  }, [selectedApp, refreshTrigger])

  // Create task method
  const handleCreateTask = async () => {
      setError(null);
      setSuccess(null);

      const task_name = taskName.trim().toLowerCase();
      const task_description = taskDescription.trim();
      const task_notes = taskNotes.trim();
      const task_plan = taskPlan.trim();
      const task_appAcronym = selectedApp.App_Acronym;

      // Field validation
      if(!task_name || !task_appAcronym){
        setError("Please fill in all fields!");
        return;
      }
      if (task_name.length > 300) {
        setError("Task Name must not exceed 300 characters!");
        return;
      }

      try{
        const newTask = await createTask(task_name,task_description ,task_notes ,task_plan , task_appAcronym);
        if(newTask.error) {
          setError(newTask.error);
          return;
        }
        if(newTask.success === false){
          setError(newTask.message);
          return;
        }
        else{
          if (newTask.success === true) {
            setSuccess(newTask.message);
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
            {/* Sidebar component with props */}
            <Sidebar onAppSelect={handleAppSelect} onAppCreated={handleSuccess} onUpdateDone={handleSuccess} onPlanCreated={handleSuccess} setPlans={setPlans} setTasks={setTasks}/>
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
                <h5>App Name: {selectedApp ? selectedApp.App_Acronym : 'No App Selected'}</h5>
              </Col>
              {selectedApp && hasPermission && (
                <Col md={2} className="d-flex justify-content-end">
                  <Button className="success" variant="outline-success" onClick={handleShowTaskModal} hidden={!hasPermission}>Create Task</Button>
                </Col>
              )}
              </div>
            <TaskSection selectedApp={selectedApp} tasks={tasks} allplans={plans} refreshTrigger={refreshTrigger} refetchTasks={fetchTasks} onUpdateSuccess={handleSuccess}/>
            </Row>
          </Col>
        </Row>
        <Modal show={showTaskModal} onHide={handleCloseTaskModal} centered backdrop="static">
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
