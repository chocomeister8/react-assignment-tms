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

export const updateApplication = async (App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/applications/${App_Acronym}`,{ App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create }, { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating application", error);
        throw new Error(error.response?.data?.error || "Failed to update application.");
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

export const updatePlan = async (Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/plan/${Plan_MVP_name}`,{ Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym }, { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating plan", error);
        throw new Error(error.response?.data?.error || "Failed to update plan.");
    }
};

export const fetchUsername = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/validateAccess`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error("Failed to load Username.");
    }
};

export const validateAdmin = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/validateAdmin`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error("Failed to load admin.");
    }
};

export const createTask = async (Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_creator) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/create-task`, {Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_creator}, { headers: { "Content-Type": "application/json" }, withCredentials: true});
        return response.data;
    } catch (error) {
        console.error("Error creating task", error);
        throw new Error(error.response?.data?.error || "Failed to create task.");
    }
};

export const checkcreateTaskPermission = async (Task_app_Acronym) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/check-create-task-permission`, { Task_app_Acronym }, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Permission check failed");
    }
};

export const fetchTasks = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/tasks`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error("Failed to load tasks.");
    }
};

export const fetchTaskByAppAcronym = async (Task_app_Acronym) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/task/${Task_app_Acronym}`,
        {headers: { "Content-Type": "application/json" }, withCredentials: true });
        return response.data; 
    } catch (error) {
        throw new Error("Failed to fetch tasks.");
    }
};

export const updateTask = async (Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_owner) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/task/${Task_id}`,{Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_owner}, { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating task", error);
        throw new Error(error.response?.data?.message || "Failed to update task.");
    }
}

export const checkUpdateTaskPermission = async (Task_id) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/check-update-task-permission`, { Task_id }, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Update permission check failed");
    }
};

export const updateEmail = async (email) => {
    const response = await axios.put(`${API_BASE_URL}/user/updateEmail`,
        {email},{withCredentials: true,
            headers: {'Content-Type': 'application/json',},
        }
    );
    return response.data;
};

export const updatePassword = async (password) => {
    const response = await axios.put(`${API_BASE_URL}/user/updatePw`,
        {password},{withCredentials: true,
            headers: {'Content-Type': 'application/json',},
        }
    );
    return response.data;
};

export const approveTask = async (Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_owner) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/approvetask/${Task_id}`,{Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_owner}, { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error approving task", error);
        throw new Error(error.response?.data?.message || "Failed to approve task.");
    }
}

export const rejectTask = async (Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_owner) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/rejecttask/${Task_id}`,{Task_id, Task_Name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_owner}, { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Error rejecting task", error);
        throw new Error(error.response?.data?.message || "Failed to reject task.");
    }
}