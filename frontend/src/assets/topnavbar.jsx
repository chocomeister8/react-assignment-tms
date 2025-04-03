import React from 'react';
import axios from 'axios';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
          try {
              // Make a request to logout and send the token in cookies
              const response = await axios.post('http://localhost:3000/auth/logout', {}, { 
              });
      
              // Handle successful logout
              console.log("Logout Response:", response);
  
              navigate('/login');
          } catch (error) {
              console.error('Error logging out:', error);
              if (error.response) {
                  alert('Error: ' + (error.response.data ? error.response.data.message : 'Unknown error'));
              } else {
                  alert('Error: ' + error.message);
              }
          }
      };

  return (
    <>
      <Navbar bg="dark" variant="dark" className="fixed-top px-3">
        <Nav className="mr-3">
          <Nav.Link as={Link} to="/tmshome" className="text-light">Task Management</Nav.Link>
        </Nav>

        <Nav className="mr-3">
          <Nav.Link as={Link} to="/userManagement" className="text-light">User Management</Nav.Link>
        </Nav>

        <Button variant="danger" onClick={handleLogout} className="ms-auto">
          Logout
        </Button>
      </Navbar>

      {/* Main content */}
      <div style={{ marginTop: '70px' }}>
        {children}
      </div>
    </>
  );
};

export default Layout;
