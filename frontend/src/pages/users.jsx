import Layout from '../assets/topnavbar'; 
import React, { useState, useEffect } from "react";
import { Badge, Button, Table, Form, Dropdown, Row, Col, Alert } from "react-bootstrap";
import { fetchGroups, fetchUsers, createGroup , createUser} from "../assets/apiCalls";
import "bootstrap/dist/css/bootstrap.min.css";

const UserManagement = () => {
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState(null); // State for error messages
  const [success, setSuccess] = useState(null); // State for success message
  const [groups, setGroups] = useState([]); // State for groups
  const [users, setUsers] = useState([]);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {

    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 2000);
  
      return () => clearTimeout(timer);
    }
    const loadData = async () => {
        try {
            const groupsData = await fetchGroups();
            setGroups(groupsData);
            const usersData = await fetchUsers();
            setUsers(usersData);
        } catch (err) {
            setError(err.message);
        }
    };
    loadData();
  }, [error,success]);

  const handleCreateGroup = async () => {
    setError(null);
    setSuccess(null);

    try {
        const newGroup = await createGroup(groupName);
        setSuccess("Group created successfully!");
        setGroupName(""); // Clear input field
        const updatedGroups = await fetchGroups(); // Fetch updated groups list
        setGroups(updatedGroups);
    } catch (err) {
        setError(err.message);
    }
  };

  const handleCreateUser = async () => {
    setError(null);
    setSuccess(null);

    if (selectedGroups.length === 0) {
      setError("Please select at least one group!");
      return;
    }

    const user_groupName = selectedGroups.join(',');

    console.log("Sending request with user details:", {
      username,
      email,
      password,
      user_groupName,
    });
    try {
        const newUser = await createUser(username, email, password, user_groupName);
        setSuccess("User created successfully!");

        setUsername('');
        setEmail('');
        setPassword('');
        setSelectedGroups([]); 
        
        const updatedUser = await fetchUsers(); // Fetch updated groups list
        setUsers(updatedUser);
    } catch (err) {
        setError(err.message);
    }
  };

  const handleSelect = (groupName) => {
    setSelectedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName) // Remove if already selected
        : [...prev, groupName] // Add if not selected
      );
  };
  
  const handleDropdownToggle = () => {
    setIsOpen((prev) => !prev); // Toggle dropdown visibility
  };

  return (
    <div className="p-5 pt-0 ms-auto w-100">
      <Layout>
    </Layout>
    <div className="d-flex align-items-start gap-1">
    {error && <Alert style={{width: '45%', transition: 'width 0.3s ease' }} variant="danger">{error}</Alert>} {/* Show error message */}
    {success && <Alert style={{width: '45%', transition: 'width 0.3s ease' }} variant="success">{success}</Alert>} {/* Show success message */}
    <div className="border p-3 w-50 ms-auto">
        <Form.Label>Group Name</Form.Label>
        <div className="d-flex gap-3">
        <Form.Control className="w-75" type="text" placeholder="Enter Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)}/>
          <Button variant="light" className="w-25" onClick={handleCreateGroup}>Create Group</Button>
        </div>
    </div>
    </div>
    <div className="border p-3 w-100 ms-auto">
    <Row className="mb-3 align-items-end g-2">
        <Col xs={12} md={3}>
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </Col>
        <Col xs={12} md={3}>
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Col>
        <Col xs={12} md={3}>
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Col>
        <Col xs={12} md={3}>
        <Form.Label>Groups</Form.Label>
        <div className="d-flex align-items-center gap-2">
            <Dropdown variant= "secondary" className="w-50" show={isOpen} onClick={handleDropdownToggle}>
              <Dropdown.Toggle variant="light" className="w-100">
                {selectedGroups.length === 0
                  ? "Select Group"
                  : selectedGroups.join(",")} 
              </Dropdown.Toggle>
                <Dropdown.Menu>
                    {groups.length > 0 ? (
                        groups.map((group, index) => (
                          <Dropdown.Item key={index} as="div">
                              <Form.Check
                                  type="checkbox"
                                  label={group.groupName}
                                  checked={selectedGroups.includes(group.groupName)}
                                  onChange={(e) => handleSelect(group.groupName, e)}
                              />
                          </Dropdown.Item>
                      ))
                    ) : (
                        <Dropdown.Item disabled>No groups available</Dropdown.Item>
                    )}
                </Dropdown.Menu>
            </Dropdown>
            <Button variant="light" className="px-4 w-50" onClick={handleCreateUser}>Add User</Button>
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
          {users.map((user, index) => (
            <tr key={index}>
              <td>{user.username}</td>
              <td>{'*'.repeat(user.password.length).substring(0,10)}</td>
              <td>{user.email}</td>
              <td>{user.user_groupName.split(',').map((group, index) => (
                <Badge key={index} pill bg={group.trim() === 'admin' ? 'secondary' : 'success'}
                className="me-2">{group}</Badge>))}
              </td>
              <td>{user.isActive === 1 ? 'Active' : 'Disabled'}</td>
              <td><Button variant="secondary">Edit</Button></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserManagement;