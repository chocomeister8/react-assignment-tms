// Import react-based libraries
import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Button , Modal, Row, Col, Form, Alert} from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';

// Styling component
import './App.css';

// Backend API calls
import { handleLogout, validateAdmin, fetchUsername, updatePassword, updateEmail} from "./apiCalls";

const Layout = ({ children, onSuccess }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPassword, setEditedPassword] = useState('');

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 2000);
  
      return () => clearTimeout(timer);
    }
    const loadData = async () => {
      try {
        const checkIsAdmin = await validateAdmin();
        if (checkIsAdmin.success === true) {
          setIsAuthenticated(true);
          setIsAdmin(checkIsAdmin.isAdmin);
        }
        else{
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
    } catch (error) {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };
    const loadUsername = async () => {
      try {
        const usernameData = await fetchUsername();
        if( usernameData.success === true){
          setUsername(usernameData.username);
        }
        else {
          console.log("User authentication failed:", usernameData.message);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    loadUsername();
    loadData();
    
  }, []);
  
    const logout = async () => {
      try {
        await handleLogout();
        navigate('/login');
    } catch (error) {
        console.error("Logout failed:", error);
        alert("Logout failed. Please try again.");
      }
    }

    const handleEmailUpdate = async () => {
      const email = editedEmail.trim().toLowerCase();

      if(!email) {
        setError('Please fill in Email.');
        return;
      }

      try {
        const UpdatedEmail = await updateEmail(email);
        if(UpdatedEmail.error){
          setError(UpdatedEmail.error);
        }
        else {
          setSuccess(UpdatedEmail.success);
          setEditedEmail('');
          if (onSuccess) onSuccess(UpdatedEmail.success);
          setError('');
          setShowModal(false);
        }
      } catch (err) {
        setError("Failed to update email.");
      }
    };
    
    // Password update handler
    const handlePasswordUpdate = async () => {
      
      const password = editedPassword.trim().toLowerCase();
      console.log(password);
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,10}$/;
      if (!passwordRegex.test(password)) {
        setError("Password must be 8–10 characters long, contain at least one letter, one number, and one special character.");
        return;
      }
      try {
        const updatePw = await updatePassword(password);

        if(updatePw.error){
          setError(updatePw.error);
        }
        else {
          setSuccess(updatePw.success);
          setEditedPassword('');
          if (onSuccess) onSuccess(updatePw.success);
          setError('');
          setShowModal(false);
        }
      } catch (err) {
        setError("Failed to update password.");
      }
    };

  return (
    <>
      <Navbar bg="dark" variant="dark" className="fixed-top px-3">
        <Nav className="mr-3">
          <NavLink to="/tmshome" className={({ isActive }) => isActive ? 'nav-link active text-light' : 'nav-link text-light'}>Task Management</NavLink>
        </Nav>
        {isAuthenticated && isAdmin && (
          <NavLink to="/userManagement" className={({ isActive }) => isActive ? 'nav-link active text-light' : 'nav-link text-light'}>User Management</NavLink>
        )}

      <div className="ms-auto d-flex align-items-center">
          {username && (
            <span className="text-light me-3" style={{ cursor: 'pointer' }} ><i className="bi bi-person-circle" onClick={() => setShowModal(true)}><strong> {username}</strong></i></span>
          )}
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </div>
      </Navbar>
      {/* Main content */}
      <div style={{ marginTop: '50px' }}>
        {children}
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {error && <Alert style={{width: '100%', transition: 'width 0.3s ease' }} variant="danger">{error}</Alert>} {/* Show error message */}
          <Form>
            {/* Row 1: App Name and Description */}
            <Row className="align-items-end">
              <Col md={9}>
                <Form.Group controlId="formEmail" className="mb-1">
                  <Form.Label>Email:</Form.Label>
                  <Form.Control type="text" placeholder="Enter email" required onChange={(e) => setEditedEmail(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="formUpdateBtn" className="mb-1">
                  <Form.Label className="invisible">Update Email</Form.Label> {/* Keeps spacing consistent */}
                  <Button variant="success" className="w-100" onClick={handleEmailUpdate}>
                    Update
                  </Button>
                </Form.Group>
              </Col>
            </Row>
            <Row className="align-items-end">
              <Col md={9}>
                <Form.Group controlId="formPassword" className="mb-1">
                  <Form.Label>Password:</Form.Label>
                  <Form.Control type="password" placeholder="Enter Password:" required onChange={(e) => setEditedPassword(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="formUpdateBtn" className="mb-1">
                  <Form.Label className="invisible">Update Password</Form.Label> {/* Keeps spacing consistent */}
                  <Button variant="success" className="w-100" onClick={handlePasswordUpdate}>
                    Update
                  </Button>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Layout;
