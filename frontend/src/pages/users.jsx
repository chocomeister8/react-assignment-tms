// Import react-based libraries
import React, { useState, useEffect } from "react";
import { Badge, Button, Table, Form, Dropdown, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

//Import the topnavbar
import Layout from '../assets/topnavbar'; 

// Backend component calls
import { fetchGroups, fetchUsers, createGroup , createUser, updateUser, fetchUsername} from "../assets/apiCalls";
import "bootstrap/dist/css/bootstrap.min.css";

const UserManagement = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); 
  const [groups, setGroups] = useState([]); 
  const [users, setUsers] = useState([]);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const [editUser, setEditUser] = useState(null); 
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPassword, setEditedPassword] = useState('');
  const [editedGroups, setEditedGroups] = useState([]); 
  const [editedIsActive, setEditedIsActive] = useState(true);

  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');

  useEffect(() => {
    const loadData = async () => {
        try {
            const groupsData = await fetchGroups();
            const usersData = await fetchUsers();

            if (!groupsData.success || !usersData.success) {
              navigate("/login");
              return;
            }
            setUsers(usersData.results);
            setGroups(groupsData.results);

        } catch (err) {
            setError(err.message);
        }
    };
    const loadUsername = async () => {
      try {
        const usernameData = await fetchUsername();
        if( usernameData.success === true){
          setCurrentUsername(usernameData.username);
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

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 2000);
  
      return () => clearTimeout(timer);
    }
   
  }, [error,success]);

  const handleCreateGroup = async () => {
    setError(null);
    setSuccess(null);
  
    const GroupName = groupName.trim().toLowerCase();
  
    try {
      // 🔐 Step 1: Check permission first (still calling createGroup)
      const response = await createGroup(GroupName);
  
      // If unauthorized, redirect right away
      if (response.message === "Unauthorized User.") {
        navigate('/login');
        return;
      }
  
      if (response.message === "Access denied: User is not in the required group") {
        console.log("Access denied: User is not in the required group");
        navigate('/login');
        return;
      }
  
      if (!GroupName) {
        setError("Group name cannot be empty.");
        return;
      }
  
      const groupRegex = /^[a-z0-9_/]{1,50}$/;
      if (!groupRegex.test(GroupName)) {
        setError("Group name must be lowercase, 50 characters or fewer, and only contain letters, numbers, '_' and '/'.");
        return;
      }
  
      const groupExists = groups.some(
        (group) => group.groupName.toLowerCase() === GroupName
      );
      if (groupExists) {
        setError("Group name already exists!");
        return;
      }
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess(response.message);
        setGroupName("");
        const updatedGroups = await fetchGroups();
        setGroups(updatedGroups.results);
      }
  
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleCreateUser = async () => {
    setError(null);
    setSuccess(null);
  
    const Username = username.trim().toLowerCase();
    const Email = email.trim();
    const Password = password.trim();
    const cleanedGroups = selectedGroups.map(group => group.trim().toLowerCase());
    const user_groupName = cleanedGroups.join(',');

    try {
      // 🔐 Step 1: Try to create the user immediately — this also checks permissions
      const newUser = await createUser(Username, Email, Password, user_groupName);
  
      // 🔒 Step 2: Permission check before any validation
      if (newUser.message === "Unauthorized User.") {
        navigate("/login");
        return;
      }
  
      if (newUser.message === "Access denied: User is not in the required group") {
        alert("Access denied: User is not in the required group");
        navigate("/login");
        return;
      }
  
      // ✅ Step 3: Proceed with field validation only if authorized
  
      if (!Username || !Password) {
        setError("Please fill in all fields!");
        return;
      }
  
      const usernameRegex = /^[a-z0-9_\-/]{1,50}$/;
      if (!usernameRegex.test(Username)) {
        setError("Username must be lowercase, 50 characters or fewer, and only contain letters, numbers, '_', '-', and '/'.");
        return;
      }
  
      const userExists = users.some(
        (user) => user.username.toLowerCase() === Username
      );
      if (userExists) {
        setError("Username already exists!");
        return;
      }
  
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,10}$/;
      if (!passwordRegex.test(Password)) {
        setError("Password must be 8–10 characters long, contain at least one letter, one number, and one special character.");
        return;
      }
  
      const groupRegex = /^[a-z0-9_/]{1,50}$/;
      for (let group of cleanedGroups) {
        if (!groupRegex.test(group)) {
          setError("Each group must be lowercase, 50 characters or fewer, and only contain letters, numbers, '_' and '/'.");
          return;
        }
      }
  
      // ✅ Step 4: If we reach here, show success and refresh
      if (newUser.error) {
        setError(newUser.error);
      } else {
        setSuccess(newUser.success);
        setUsername('');
        setEmail('');
        setPassword('');
        setSelectedGroups([]);
      }
  
      const updatedUser = await fetchUsers();
      setUsers(updatedUser.results);
  
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleSelect = (groupName) => {
    setSelectedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName) 
        : [...prev, groupName]
      );
  };
  
  const handleDropdownToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const editGroupDropDownToggle = () => {
    setIsGroupOpen((prev) => !prev);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setEditedEmail(user.email);
    setEditedPassword(''); // Empty the password field for editing
    const cleanedGroups = user.user_groupName.split(',').map(group => group.trim()).filter(group => group !== "");
    setEditedGroups(cleanedGroups);
    setEditedIsActive(user.isActive === 1); // Set the current status
  };

  const handleSelectEdit = (groupName) => {
    setEditedGroups(prevGroups => {
      const cleanGroups = prevGroups.filter(g => g.trim() !== "");

      if (cleanGroups.includes(groupName)) {
        // Uncheck: remove the group
        return cleanGroups.filter(g => g !== groupName);
      } else {
        // Check: add the group
        return [...cleanGroups, groupName];
      }
    });
  };

  const update = async () => {
    setError(null);
    setSuccess(null);
    const user_groupName = editedGroups.join(',');
    
    try {
      const update = await updateUser(editUser.username, editedEmail, editedPassword, user_groupName, editedIsActive);
      console.log(update);

      if (!update.success) {
          navigate("/login");
          setError(update.error);
          return;
      } else {
          if (update.message === "Unauthorized User.") {
              navigate('/login');
              return;
          }
          if (update.message === "Access denied: User is not in the required group") {
              alert("Access denied: User is not in the required group");
              navigate('/login');
              return;
          }

          // ✅ Check if the currently logged-in user just lost admin rights
          if (editUser.username === currentUsername && !editedGroups.includes('admin')) {
              alert("You have removed your own admin rights. Redirecting to home.");
              navigate('/login'); // or navigate('/login')
              return; // ⚠ Stop here: do not call fetchUsers()
          }

          setSuccess(update.success);
          setEditUser(null); // exit edit mode
      }

      const updatedUser = await fetchUsers();
      setUsers(updatedUser.results);

    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };

  return (
    <div className="p-5 pt-3 ms-auto w-100">
      <Layout>
    </Layout>
    <div className="d-flex align-items-start gap-1">
    {error && <Alert style={{width: '45%', transition: 'width 0.3s ease' }} variant="danger">{error}</Alert>} {/* Show error message */}
    {success && <Alert style={{width: '45%', transition: 'width 0.3s ease' }} variant="success">{success}</Alert>} {/* Show success message */}
    <div className="border p-3 w-50 ms-auto">
        <Form.Label>Group Name</Form.Label>
        <div className="d-flex gap-3">
        <Form.Control className="w-75 border border-dark" type="text" placeholder="Enter Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)}/>
          <Button variant="light" className="w-25 border border-dark" onClick={handleCreateGroup}>Create Group</Button>
        </div>
    </div>
    </div>
    <div className="border p-3 w-100 ms-auto">
    <Row className="mb-3 align-items-end gy-2 gx-3">
      <Col xs={12} md={3}>
          <Form.Label>Username</Form.Label>
          <Form.Control type="text" className='border-dark' placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      </Col>
      <Col xs={12} md={3}>
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" className='border-dark' placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Col>
      <Col xs={12} md={2}>
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" className='border-dark' placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Col>
      <Col xs={12} md={2}>
      <Form.Label>Groups</Form.Label>
        <div className="d-flex flex-column flex-md-row gap-2">
          <div className="w-100">
            <Dropdown variant= "secondary" className="w-100" show={isOpen} onClick={handleDropdownToggle}>
              <Dropdown.Toggle variant="light" className="w-100 border-dark">
                {selectedGroups.length === 0 ? "Select" : selectedGroups.filter(g => g.trim() !== "").join(",")} 
              </Dropdown.Toggle>
                <Dropdown.Menu>{groups.length > 0 ? (groups.map((group, index) => (
                  <Dropdown.Item key={index} as="div">
                    <Form.Check type="checkbox" label={group.groupName} checked={selectedGroups.includes(group.groupName)} onChange={(e) => handleSelect(group.groupName, e)} onClick={(e) => e.stopPropagation()}/>
                  </Dropdown.Item>
                  ))
                  ) : (
                  <Dropdown.Item disabled>No groups available</Dropdown.Item>
                  )}
                </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </Col>
      <Col xs={12} md={2}>
            <div className='w-100'>
              <Button variant="light" className="w-100 border-dark" onClick={handleCreateUser}>Add User</Button>
            </div>
          </Col>
    </Row>
    </div>
      {/* User Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Username</th>
            <th>Password</th>
            <th>Email</th>
            <th>Group</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user, index) => (
            <tr key={index}>
              <td>{user.username}</td>
              <td>
                {editUser && editUser.username === user.username ? (
                  <Form.Control type="password" className='border-dark' value={editedPassword} onChange={(e) => setEditedPassword(e.target.value)} placeholder="Enter new password"/>
                ) : (
                  // Mask password: show up to the first 10 characters as asterisks
                  '*'.repeat(Math.min(user.password.length, 10))
                )}
              </td>
              <td>{editUser && editUser.username === user.username ? (
                <Form.Control type="email" className='border-dark' value={editedEmail} onChange={(e) => setEditedEmail(e.target.value)} placeholder="Enter new email"/>
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editUser && editUser.username === user.username ? (
                  <Dropdown variant="secondary" show={isGroupOpen} onClick={editGroupDropDownToggle}>
                    <Dropdown.Toggle variant="light" className="w-100 border-dark">
                      {editedGroups.length === 0 ? "--Select--" : editedGroups.filter(g => g.trim() !== "").join(",")}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>{groups.length > 0 ? (groups.map((group, index) => (
                      <Dropdown.Item key={index} as="div">
                        <Form.Check type="checkbox" label={group.groupName} checked={editedGroups.includes(group.groupName)} onChange={() => handleSelectEdit(group.groupName)} onClick={(e) => e.stopPropagation()} disabled={user.username === "admin" && group.groupName === "admin"}/>
                      </Dropdown.Item>
                      ))
                      ) : (
                        <Dropdown.Item disabled>No groups available</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  user.user_groupName.split(',').map((group, idx) => {
                    const badgeColor = group.trim() === 'admin' ? 'secondary' : 'success';
                    return (
                      <Badge key={idx} pill bg={badgeColor} className="me-2">
                        {group}
                      </Badge>
                    );
                  })
                )}
              </td>
              <td>
                {editUser && editUser.username === user.username ? (
                  <Dropdown>
                    <Dropdown.Toggle variant="light" className="w-100 border-dark" disabled={user.username === "admin"}>
                      {editedIsActive ? "Active" : "Disabled"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setEditedIsActive(true)}>Active</Dropdown.Item>
                      <Dropdown.Item onClick={() => setEditedIsActive(false)}>Disabled</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  user.isActive === 1 ? 'Active' : 'Disabled'
                )}
              </td>
              <td>
            {editUser && editUser.username === user.username ? (
              <div className="d-flex justify-content-between w-100">
                <Button variant="success" className="flex-grow-1 me-2" onClick={update}>
                  Update
                </Button>
                <Button variant="secondary" className="flex-grow-1 ms-2" onClick={() => setEditUser(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="light" className="border border-dark w-100" onClick={() => handleEdit(user)}>
                Edit
              </Button>
            )}
          </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserManagement;