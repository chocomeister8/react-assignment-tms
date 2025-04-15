// Import react-based libraries
import React , { useState } from 'react';
import { Row, Col, Card, ListGroup, Modal, Button, Form,  } from 'react-bootstrap';

const TaskSection = ({ selectedApp, tasks }) => {
  const [error, setError] = useState(null);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const statusList = ['Open', 'To Do', 'Doing', 'Done', 'Closed'];
  const taskArray = Array.isArray(tasks) ? tasks : tasks?.tasks || [];
  

  const getTasksByStatus = (status) => {
    if (!selectedApp || !Array.isArray(taskArray)) {
      console.log('Early return: selectedApp or taskArray invalid');
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
                  <Card className="shadow-sm">
                    <Card.Body className="p-2">
                      <Card.Title as="h6" className="mb-2" style={{ fontSize: '1rem' }}>
                        {task.Task_Name}
                      </Card.Title>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted" style={{ fontSize: '0.6rem' }}>
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
          <Col md={3}>
            <Form.Group controlId="taskName" className="mb-1">
              <Form.Label>Task Name:</Form.Label>
            </Form.Group>
          </Col>
          <Col md={9}>
          <Form.Control type="text" value={selectedTask?.Task_Name} disabled />
          </Col>
        </Row>
        <Row className="align-items-end">
          <Col md={3}>
            <Form.Group controlId="taskDesc" className="mb-1">
              <Form.Label>Task Description:</Form.Label>
            </Form.Group>
          </Col>
          <Col md={9}>
          <Form.Control type="text" value={selectedTask?.Task_description} disabled />
          </Col>
        </Row>
        <Row className="align-items-end">
          <Col md={3}>
            <Form.Group controlId="taskId" className="mb-1">
              <Form.Label>Task ID:</Form.Label>
            </Form.Group>
          </Col>
          <Col md={9}>
          <Form.Control type="text" disabled />
          </Col>
        </Row>
        <Row className="align-items-end">
          <Col md={3}>
            <Form.Group controlId="taskPlan" className="mb-1">
              <Form.Label>Task Plan:</Form.Label>
            </Form.Group>
          </Col>
          <Col md={9}>
            <Form.Control type="text" value={selectedTask?.Task_plan} disabled />
          </Col>
        </Row>
        <Row className="align-items-end">
          <Col md={3}>
            <Form.Group controlId="taskAppAcronym" className="mb-1">
              <Form.Label>Task App Acronym:</Form.Label>
            </Form.Group>
          </Col>
          <Col md={9}>
            <Form.Control type="text" value={selectedTask?.Task_app_Acronym} disabled />
          </Col>
        </Row>
        <Row className="align-items-end">
          <Col md={3}>
            <Form.Group controlId="taskState" className="mb-1">
              <Form.Label>Task State:</Form.Label>
            </Form.Group>
          </Col>
          <Col md={9}>
            <Form.Control type="text" value={selectedTask?.Task_state} disabled />
          </Col>
        </Row>
        <Row className="align-items-end">
          <Col md={3}>
            <Form.Group controlId="taskcreator" className="mb-1">
              <Form.Label>Task Creator:</Form.Label>
            </Form.Group>
          </Col>
          <Col md={9}>
            <Form.Control type="text" value={selectedTask?.Task_creator} disabled />
          </Col>
        </Row>
        <Row className="align-items-end">
          <Col md={3}>
            <Form.Group controlId="taskOwner" className="mb-1">
              <Form.Label>Task Owner:</Form.Label>
            </Form.Group>
          </Col>
          <Col md={9}>
            <Form.Control type="text" value={selectedTask?.Task_owner} disabled />
          </Col>
        </Row>
        <Row className="align-items-end">
          <Col md={3}>
            <Form.Group controlId="taskCreateDate" className="mb-1">
              <Form.Label>Task Create Date:</Form.Label>
            </Form.Group>
          </Col>
          <Col md={9}>
            <Form.Control type="text" value={selectedTask?.Task_createDate} disabled />
          </Col>
        </Row>
        <Row className="align-items-end">
          <Col md={3}>
            <Form.Group controlId="taskNotes" className="mb-1">
              <Form.Label>Task Notes:</Form.Label>
            </Form.Group>
          </Col>
          <Col md={9}>
            <Form.Control type="text" value={selectedTask?.Task_notes} disabled />
          </Col>
        </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
  </div>
  );
};
export default TaskSection;
