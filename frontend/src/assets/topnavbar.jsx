import React, { useEffect, useState } from 'react';
import './App.css';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { handleLogout, validateAdmin, fetchUsername} from "./apiCalls";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
    
  useEffect(() => {
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
        console.error("Admin validation failed:", error);
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
        {isAuthenticated && isAdmin && (
          <NavLink to="/userManagement" className={({ isActive }) => isActive ? 'nav-link active text-light' : 'nav-link text-light'}>User Management</NavLink>
        )}

      <div className="ms-auto d-flex align-items-center">
          {username && (
            <span className="text-light me-3">Welcome back, <strong>{username}</strong></span>
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
    </>
  );
};

export default Layout;
