import React, { useState } from 'react';
import { Col, ListGroup, Row, Button, Modal, Form, FloatingLabel } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar = () => {
  const [showModal, setShowModal] = useState(false); // To manage modal visibility

  // Toggle modal visibility
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="sidebar" style={{ padding: '1rem', borderRight: '1px solid #ddd', height: '100vh' }}>
      <Row className="align-items-center mb-3">
        <Col>
          <h5 className="mb-0 d-flex justify-content-between align-items-center gap-2">
            App <i className="bi bi-plus" style={{ cursor: 'pointer' }} onClick={handleShowModal}></i>
          </h5>
        </Col>
      </Row>
      <hr />
      <Row className="align-items-center mb-3">
        <Col>
          <h6 className="mb-3 d-flex justify-content-between align-items-center gap-2">
            Plan <i className="bi bi-plus" style={{ cursor: 'pointer' }}></i>
          </h6>
          <ListGroup>
            <ListGroup.Item>Sprint 1</ListGroup.Item>
            <ListGroup.Item>Sprint 2</ListGroup.Item>
            <ListGroup.Item>Sprint 3</ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create App form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Row 1: App Name and Description */}
            <Row>
              <Col md={6}>
                <Form.Group controlId="formAppName" className='mb-1'>
                  <FloatingLabel controlId="floatingAppName" label="App Name">
                    <Form.Control type="text" placeholder="Enter app name"required/>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group controlId="formGroupDropdown" className="mb-1">
                  <FloatingLabel controlId="floatingDropdown" label="App_permit_Create">
                    <Form.Select required>
                    <option value="">-- Select an option --</option>
                    </Form.Select>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group controlId="formGroupDropdown" className="mb-1">
                  <FloatingLabel controlId="floatingDropdown" label="App_permit_Open">
                    <Form.Select required>
                    <option value="">-- Select an option --</option>
                    </Form.Select>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group controlId="formGroupDropdown" className="mb-1">
                  <FloatingLabel controlId="floatingDropdown" label="App_permit_toDoList">
                    <Form.Select required>
                    <option value="">-- Select an option --</option>
                    </Form.Select>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group controlId="formGroupDropdown" className="mb-1">
                  <FloatingLabel controlId="floatingDropdown" label="App_permit_Doing">
                    <Form.Select required>
                    <option value="">-- Select an option --</option>
                    </Form.Select>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group controlId="formGroupDropdown">
                  <FloatingLabel controlId="floatingDropdown" label="App_permit_Done">
                    <Form.Select required>
                    <option value="">-- Select an option --</option>
                    </Form.Select>
                  </FloatingLabel>
                </Form.Group>
              </Col>
              <Col md={6}>
              <Form.Group controlId="formStartDate" className="mb-1">
                  <FloatingLabel controlId="floatingStartDate" label="Start Date">
                    <Form.Control type="date" placeholder="Choose start date"required/>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group controlId="formEndDate" className="mb-2">
                  <FloatingLabel controlId="floatingEndDate" label="End Date">
                    <Form.Control type="date" placeholder="Choose end date"required/>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group controlId="formDescription" >
                  <FloatingLabel controlId="floatingdescription" label="Description">
                    <Form.Control as="textarea" rows={6} placeholder="App Description" required style={{ height: '240px'}}/>
                  </FloatingLabel>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-100 d-flex justify-content-center gap-2">
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="success" onClick={handleCloseModal}>
              Save Changes
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Sidebar;
