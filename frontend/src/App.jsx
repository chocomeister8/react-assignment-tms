import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import React from "react";
import Login from './pages/Login';
import TmsHome from './pages/tmsHome'; // Import the homepage
import UserManagment from './pages/users';
import Axios from 'axios';
import ProtectedRoute from "../ProtectedRoute";

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
