import React , {useState}from 'react';
import { Row, Col, Card, ListGroup } from 'react-bootstrap';

const TaskSection = () => {
  const [tasks, setTasks] = useState([
      { status: 'Open', tasks: ['Task 1', 'Task 2'] },
      { status: 'To Do', tasks: ['Task 3', 'Task 4'] },
      { status: 'Doing', tasks: ['Task 5'] },
      { status: 'Done', tasks: ['Task 6'] },
      { status: 'Closed', tasks: ['Task 7'] },
    ]);
  return (
    <Row className="mt-3" style={{ rowGap: '1rem' }}>
      {tasks.map((task, idx) => (
        <Col key={idx} style={{ flex: '0 0 20%', maxWidth: '20%',}}>
          <Card style={{ minHeight: '400px' }}>
            <Card.Header><strong>{task.status}</strong></Card.Header>
            {/* <ListGroup variant="flush">
              {task.tasks.map((item, itemIdx) => (
                <ListGroup.Item key={itemIdx}>{item}</ListGroup.Item>
              ))}
            </ListGroup> */}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default TaskSection;
