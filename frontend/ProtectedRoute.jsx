// Import react-based libraries
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Import axios component for backend communication
import axios from "axios";

const ProtectedRoute = ({ children, adminOnly = false}) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [hasRedirected, setHasRedirected] = useState(false);


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = adminOnly
          ? "http://localhost:3000/auth/validateAdmin"
          : "http://localhost:3000/auth/validateAccess";

        const res = await axios.get(response, { withCredentials: true });

        if (res.data.success) {
          // Check if user is admin (if adminOnly flag is set)
          if (res.data.isAdmin === 0 || adminOnly && !res.data.isAdmin) {
            // If user is not an admin anymore, redirect
            setIsAuthenticated(false);
            alert("You no longer have admin rights. Redirecting to login.");
            navigate("/login");
            return;
          }
          // If authenticated and admin (if adminOnly), allow access
          setIsAuthenticated(true);
        } else {
          // If the user is not authenticated or unauthorized
          setIsAuthenticated(false);
          alert(res.data.message || "Access denied.");
          navigate("/login");
        }
      } catch (err) {
        // If there is an error (e.g., token expired or invalid)
        setIsAuthenticated(false);
        alert("An error occurred. You will be redirected.");
        navigate("/login");
      }
    };

    checkAuth();
  }, [adminOnly, navigate]);

  if (isAuthenticated === null) return <p>Loading...</p>; // Show loading while checking

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
