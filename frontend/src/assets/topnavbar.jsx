import React from 'react';
import './App.css';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { handleLogout} from "./apiCalls";


const Layout = ({ children }) => {
  const navigate = useNavigate();
  const logout = async () => {
    try {
      await handleLogout();  // Call the logout function
      navigate('/login');    // Redirect after successful logout
  } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  }

  return (
    <>
      <Navbar bg="dark" variant="dark" className="fixed-top px-3">
        <Nav className="mr-3">
          <NavLink to="/tmshome"  className={({ isActive }) => isActive ? 'nav-link active text-light' : 'nav-link text-light'}>Task Management</NavLink>
        </Nav>

        <Nav className="mr-3">
          <NavLink to="/userManagement" className={({ isActive }) => isActive ? 'nav-link active text-light' : 'nav-link text-light'}>User Management</NavLink>
        </Nav>

        <Button variant="danger" onClick={logout} className="ms-auto">
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
