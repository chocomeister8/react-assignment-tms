import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/validateAccess", {
          withCredentials: true, // Ensures cookies are sent with the request
        });

        console.log("Auth check response:", response.data);
        if (response.data.success === true) {
          setIsAuthenticated(true);
        }
        else {
          setIsAuthenticated(false);
          navigate("/login"); 
        }
      } catch (error) {
        setIsAuthenticated(false);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  if (isAuthenticated === null) return <p>Loading...</p>; // Show loading while checking

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
