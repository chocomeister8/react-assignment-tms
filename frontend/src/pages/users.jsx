import Layout from '../assets/topnavbar'; 
import React, { useState, useEffect } from "react";
import { Badge, Button, Table, Form, Dropdown, Row, Col, Alert } from "react-bootstrap";
import { fetchGroups, fetchUsers, createGroup } from "../assets/apiCalls";
import "bootstrap/dist/css/bootstrap.min.css";

const UserManagement = () => {
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState(null); // State for error messages
  const [success, setSuccess] = useState(null); // State for success message
  const [groups, setGroups] = useState([]); // State for groups
  const [users, setUsers] = useState([]);

  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
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
  }, []);

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
    <div className="container">
      <Layout>
    </Layout>
    {error && <Alert variant="danger">{error}</Alert>} {/* Show error message */}
    {success && <Alert variant="success">{success}</Alert>} {/* Show success message */}
    <div className="border p-3 w-50 ms-auto">
        <Form.Label>Group Name</Form.Label>
        <div className="d-flex gap-2">
        <Form.Control className="w-75" type="text" placeholder="Enter Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)}/>
          <Button variant="light" onClick={handleCreateGroup}>Create Group</Button>
        </div>
    </div>
    <div className="border p-3 w-100 ms-auto">
    <Row className="mb-3 align-items-end g-2">
        <Col xs={12} md={3}>
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" placeholder="Enter Username" />
        </Col>
        <Col xs={12} md={3}>
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="Enter Email" />
        </Col>
        <Col xs={12} md={3}>
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Enter Password" />
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

            <Button variant="light" className="px-4">Add User</Button>
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
              <td>
              <td>{'•'.repeat(user.password.length).substring(0,10)}</td>
              </td>
              <td>{user.email}</td>
              <td>
                <Badge pill bg="warning">
                  {user.user_groupName}
                </Badge>
              </td>
              <td>
                {user.isActive === 1 ? 'Active' : 'Disabled'}
              </td>
              <td>
              <Button variant="secondary">Edit</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserManagement;

