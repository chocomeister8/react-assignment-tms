// Import React-based libraries
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

// Default component
import Login from './pages/Login';
import TmsHome from './pages/tmsHome'; // Import the homepage

// Admin Control page
import UserManagment from './pages/users';
// Protected Routes
import ProtectedRoute from "../ProtectedRoute";

import Axios from 'axios';

Axios.defaults.withCredentials = true;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/tmshome" element={
          <ProtectedRoute>
            <TmsHome />
          </ProtectedRoute>
          }
        />
        <Route path="/userManagement" element={
          <ProtectedRoute adminOnly={true}>
            <UserManagment />
          </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
