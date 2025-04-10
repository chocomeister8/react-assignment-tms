import React, { useState } from 'react';
import Layout from '../assets/topnavbar';
import { Button, Alert, Container, Row, Col } from 'react-bootstrap';
import Sidebar from '../assets/sidebar';
import TaskSection from '../assets/tasksection';

const TmsHome = () => {
  const [tasks, setTasks] = useState([
    { status: 'Open', tasks: ['Task 1', 'Task 2'] },
    { status: 'To Do', tasks: ['Task 3', 'Task 4'] },
    { status: 'Doing', tasks: ['Task 5'] },
    { status: 'Done', tasks: ['Task 6'] },
    { status: 'Closed', tasks: ['Task 7'] },
  ]);

  return (
    <Layout>
      <Container fluid style={{ height: '100vh' }}>
        <Row style={{ height: '100%' }}>
          <Col md={2} className="bg-light p-0">
            <Sidebar />
          </Col>

          <Col md={10} className="p-3">
          <Row className="align-items-center mb-3">
            <Col md={6}>
              <Alert className="mb-0" variant="success">App has been created successfully.</Alert>
            </Col>
            <Col md={6} className="text-end">
              <Button variant="outline-dark">Create Task</Button>
            </Col>
          </Row>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>App1</h4>
          </div>
          <TaskSection tasks={tasks} />
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default TmsHome;
