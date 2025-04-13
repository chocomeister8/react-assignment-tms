import React , { useEffect, useState } from 'react';
import { Row, Col, Card, ListGroup } from 'react-bootstrap';
import { fetchTasks } from '../assets/apiCalls';


const TaskSection = ({ selectedApp }) => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tasks, setTasks] = useState([]);
  const statusList = ['Open', 'To Do', 'Doing', 'Done', 'Closed'];

  useEffect(() => {
    const loadData = async () => {
      try {
        const tasksData = await fetchTasks();
        setTasks(tasksData);
      } catch (err) {
        setError(err.message);
      }
    };

    loadData();
  }, [selectedApp]);

  const getTasksByStatus = (status) => {
    if (!selectedApp) return [];
    return tasks.filter((task) => {
      return task.Task_state === status && task.Task_app_Acronym === selectedApp.App_Acronym;
    });
  };

  return (
    <div>
    {error && <div className="alert alert-danger">{error}</div>}

    <Row className="mt-3" style={{ rowGap: '1rem' }}>
      {statusList.map((status, idx) => {
        const filteredTasks = getTasksByStatus(status);
        return (
          <Col key={idx} style={{ flex: '0 0 20%', maxWidth: '20%' }}>
            <Card style={{ minHeight: '425px' }}>
              <Card.Header>
                <strong>{status}</strong>
              </Card.Header>
              <ListGroup variant="flush">
                {filteredTasks.length > 0 ? (filteredTasks.map((task, itemIdx) => (
                <ListGroup.Item key={itemIdx} className="px-1 py-1">
                  <Card className="mb-2 shadow-sm">
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
  </div>
  );
};
export default TaskSection;
