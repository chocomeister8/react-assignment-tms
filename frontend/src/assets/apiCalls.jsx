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

export const updateUser = async (username, email, password, user_groupName, isActive) => {
    const response = await axios.put(`${API_BASE_URL}/users/${username}`,
        {email, password, user_groupName,isActive,
        },
        {withCredentials: true,
            headers: {'Content-Type': 'application/json',},
        }
    );
    return response.data;
};

export const fetchApplications = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/applications`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching applications:", error);
        throw new Error("Failed to load applications.");
    }
  };

export const createApplication = async (App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/create-app`,{ App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create }, { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating application", error);
        throw new Error(error.response?.data?.error || "Failed to create application.");
    }
};

export const fetchPlans = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/plans`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Error fetching plans:", error);
        throw new Error("Failed to load plans.");
    }
  };

export const createPlan = async (Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/create-plan`,{ Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym }, { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating plan", error);
        throw new Error(error.response?.data?.error || "Failed to create plan.");
    }
};

export const fetchUsername = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/validateAccess`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error("Failed to load Username.");
    }
}

export const validateAdmin = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/validateAdmin`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error("Failed to load admin.");
    }
}

export const createTask = async (Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/create-task`, {Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate}, { headers: { "Content-Type": "application/json" }, withCredentials: true});
        return response.data;
    } catch (error) {
        console.error("Error creating task", error);
        throw new Error(error.response?.data?.error || "Failed to create task.");
    }
}