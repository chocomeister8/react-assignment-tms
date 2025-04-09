import React, { useEffect, useState } from 'react';
import Layout from '../assets/topnavbar';
import axios from 'axios';

const TmsHome = () => {

  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/validateAccess', { withCredentials: true });

        if (response.data.success) {
          setUsername(response.data.username);
        } else {
          console.log("User authentication failed:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUsername();
  }, []);

  return (
    <Layout>
    <div className="ms-3 mr-3">
        <h2>Welcome back to work {username}!</h2>
    </div>
    </Layout>
  );
};

export default TmsHome;