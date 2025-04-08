import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children, adminOnly = false}) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const url = adminOnly
          ? "http://localhost:3000/auth/validateAdmin"
          : "http://localhost:3000/auth/validateAccess";

        const res = await axios.get(url, { withCredentials: true });

        if (res.data.success && (!adminOnly || res.data.isAdmin)) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          navigate(adminOnly ? "/tmshome" : "/login");
        }
      } catch (err) {
        setIsAuthenticated(false);
        navigate(adminOnly ? "/tmshome" : "/login");
      }
    };

    checkAuth();
  }, [adminOnly, navigate]);

  if (isAuthenticated === null) return <p>Loading...</p>; // Show loading while checking

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
