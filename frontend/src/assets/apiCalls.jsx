import axios from "axios";
const API_BASE_URL = "http://localhost:3000";

export const fetchGroups = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/groups`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching groups:", error);
        throw new Error("Failed to load groups.");
    }
  };

export const fetchUsers = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to load users.");
    }
};

export const createGroup = async (groupName) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/create-group`,{ groupName: groupName.trim().toLowerCase() }, { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating group:", error);
        throw new Error(error.response?.data?.error || "Failed to create group.");
    }
};

export const createUser = async (username, email, password, user_groupName) => {
    
    try {
        const response = await axios.post(`${API_BASE_URL}/create-user`,{ username, email, password, user_groupName }, {headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error(error.response?.data?.error || 'Failed to create user.');
    }
};

export const handleLogout = async () => {
    try {
        // Make a request to logout and send the token in cookies
        const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {});

        // Handle successful logout
        console.log("Logout Response:", response);
        return response; 
    } catch (error) {
        console.error('Error logging out:', error);
        if (error.response) {
            alert('Error: ' + (error.response.data ? error.response.data.message : 'Unknown error'));
        } else {
            alert('Error: ' + error.message);
        }
    }
};

// export const updateUser = async (username, email, password, user_groupName, isActive) => {
//     try {
//       const response = await axios.put(`${API_BASE_URL}/users/:${username}`,
//         {email, password, user_groupName,isActive,
//         },
//         {withCredentials: true, // include cookies for auth
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       return response.data;
//     } catch (err) {
//       throw new Error(err.response?.data?.error || 'Failed to update user');
//     }
//   };