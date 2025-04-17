// Import react-based libraries
import React , { useState } from 'react';
import { Row, Col, Card, ListGroup, Modal, Button, Form, FloatingLabel  } from 'react-bootstrap';

const TaskSection = ({ selectedApp, tasks }) => {
  const [error, setError] = useState(null);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const statusList = ['Open', 'To Do', 'Doing', 'Done', 'Closed'];
  const taskArray = Array.isArray(tasks) ? tasks : tasks?.tasks || [];


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
                <Form.Control type="text" value={selectedTask?.Task_Name || ""} disabled />
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
                <Form.Control type="text" value={selectedTask?.Task_state || ""} disabled />
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
              <FloatingLabel controlId="floatingTaskState" label="Task Plan:">
                <Form.Control type="text" value={selectedTask?.Task_plan || ""} disabled />
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
                <Form.Control type="textarea" value={selectedTask?.Task_description || ""} disabled />
              </FloatingLabel>
            </Form.Group>
          </Col>
        </Row>
        <Row className="align-items-end">
          <Col md={12}>
            <Form.Group controlId="taskNotes" className="mb-2">
              <FloatingLabel controlId="floatingTaskNotes" label="Task Notes:">
                <Form.Control type="textarea" value={selectedTask?.Task_notes || ""} disabled />
              </FloatingLabel>
            </Form.Group>
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
