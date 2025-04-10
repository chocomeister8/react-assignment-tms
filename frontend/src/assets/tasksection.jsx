import React from 'react';
import { Row, Col, Card, ListGroup } from 'react-bootstrap';

const TaskSection = ({ tasks }) => {
  return (
    <Row className="mt-3" style={{ rowGap: '1rem' }}>
      {tasks.map((task, idx) => (
        <Col key={idx} style={{ flex: '0 0 20%', maxWidth: '20%',}}>
          <Card style={{ minHeight: '300px' }}>
            <Card.Header><strong>{task.status}</strong></Card.Header>
            <ListGroup variant="flush">
              {task.tasks.map((item, itemIdx) => (
                <ListGroup.Item key={itemIdx}>{item}</ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default TaskSection;
