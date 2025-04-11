import React, { useState } from 'react';
import Layout from '../assets/topnavbar';
import { Button, Alert, Container, Row, Col } from 'react-bootstrap';
import Sidebar from '../assets/sidebar';
import TaskSection from '../assets/tasksection';

const TmsHome = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [tasks, setTasks] = useState([
    { status: 'Open', tasks: ['Task 1', 'Task 2'] },
    { status: 'To Do', tasks: ['Task 3', 'Task 4'] },
    { status: 'Doing', tasks: ['Task 5'] },
    { status: 'Done', tasks: ['Task 6'] },
    { status: 'Closed', tasks: ['Task 7'] },
  ]);

  const [selectedApp, setSelectedApp] = useState(null);
  const handleAppSelect = (app) => {
    setSelectedApp(app);
  };  
  const handleSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <Layout>
      <Container fluid style={{ height: '100vh' }}>
        <Row style={{ height: '100%' }}>
          <Col md={2} className="bg-light p-0">
            <Sidebar onAppCreated={handleSuccess} onPlanCreated={handleSuccess} onAppSelect={handleAppSelect} />
          </Col>

          <Col md={10} className="p-3">
          <Row className="align-items-center">
            <Col md={10}>
            {successMessage && (
              <Alert variant="success">{successMessage}</Alert>
            )}
            </Col>
            <Col md={2} className="text-end">
              <Button variant="outline-dark">Create Task</Button>
            </Col>
          </Row>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>{selectedApp ? selectedApp.App_Acronym : 'No App Selected'}</h4>
          </div>
          <TaskSection tasks={tasks} />
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default TmsHome;
