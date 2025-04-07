import React, { useState } from "react";
import { Container, Form, Button, Navbar, Col, Row} from "react-bootstrap";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Snackbar from "../assets/snackbar";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        // Send login data to the backend
        const response = await axios.post('http://localhost:3000/auth/login', {
          username,
          password,
        });

        if (response.data.success === true) {
          // Navigate to home if login is successful
          navigate('/tmshome');
        } else {
          // If login failed, show the message from the backend (e.g., "Account disabled!")
          setErrorMessage(response.data.message);
          setShowSnackbar(true);
        }
      } catch (error) {
        console.error("Login error:", error);
        if (error.response && error.response.data && error.response.data.message) {
          setErrorMessage(error.response.data.message);  // Set error message from backend
          setShowSnackbar(true);
        } else {
          // Handle other errors
          setErrorMessage('An error occurred. Please try again.');
          setShowSnackbar(true);
        }
      // Show snackbar with error message
      setShowSnackbar(true);
      }
    };

    // This will hide the Snackbar when the user closes it
    const handleSnackbarHide = () => {
      setShowSnackbar(false);
    };

  return (
    <>
      <Navbar bg="dark" variant="dark" className="fixed-top">
        <Navbar.Brand className="ps-3">Task Management System</Navbar.Brand>
      </Navbar>

      <Container className="d-flex justify-content-center align-items-center vh-100">
      <Form onSubmit={handleLogin} className="w-30">
        {/* Username Field */}
        <Form.Group as={Row} controlId="username" className="mb-3 align-items-center">
            <Col sm={3}>
                <Form.Label className="mb-0">Username:</Form.Label>
            </Col>
            <Col sm={9}>
                <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                />
            </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="password" className="mb-3 align-items-center">
            <Col sm={3}>
                <Form.Label className="mb-0">Password:</Form.Label>
            </Col>
            <Col sm={9}>
                <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
            </Col>
        </Form.Group>
        {showSnackbar && <Snackbar message={errorMessage} show={showSnackbar} onHide={handleSnackbarHide} />}
          <Button variant="dark" type="submit" className="mt-3 w-100">
            LOG IN
          </Button>
        </Form>
      </Container>
    </>
  );
}

export default Login;
