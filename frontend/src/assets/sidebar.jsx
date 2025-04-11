import React, { useEffect, useState } from 'react';
import { Col, ListGroup, Row, Button, Modal, Form, FloatingLabel, Alert } from 'react-bootstrap';
import { createApplication, fetchApplications, fetchGroups } from "../assets/apiCalls";
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar = ( props ) => {
  const [showModal, setShowModal] = useState(false); // To manage modal visibility
  const [showDetails, setShowDetailsModal] = useState(false);
  // Toggle modal visibility
  const handleShowAppModal = () => setShowModal(true);
  const handleCloseAppModal = () => setShowModal(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); 
  const [applications, setApplications] = useState([]);
  const [allGroups, setGroups] = useState([]);
  const [selectedApp, setSelectedApp] = useState([]);

  const [appAcronym, setAppAcronym] = useState('');
  const [appRnumber, setAppRNumber] = useState('');
  const [appStartDate, setAppStartDate] = useState('');
  const [appEndDate, setAppEndDate] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [dropdowns, setDropdowns] = useState({
    appPermitCreate: '',
    appPermitOpen: '',
    appPermitToDo: '',
    appPermitDoing: '',
    appPermitDone: '',
  });

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 2000);
  
      return () => clearTimeout(timer);
    }

    const loadApplications = async () => {
      try {
        const applicationsData = await fetchApplications();
        const groupData = await fetchGroups();
        setApplications(applicationsData);
        setGroups(groupData);
      } catch (err) {
        setError(err.message);
      }
    };
    loadApplications();
  }, [])

  const handleShowAppDetails = (app) => {
    setSelectedApp(app);
    setShowDetailsModal(true);
  };
  const handleCloseAppDetails = () => {
    setShowDetailsModal(false);
    setSelectedApp({
      App_permit_Create: "",
      App_permit_Open: "",
      App_permit_toDoList: "",
      App_permit_Doing: "",
      App_permit_Done: "",
      App_startDate: "",
      App_endDate: "",
      App_Description: ""
    });
  };

  const handleDropdownChange = (dropdownName) => (e) => {
    setDropdowns((prevState) => ({
      ...prevState,
      [dropdownName]: e.target.value,  // Update the specific dropdown value
    }));
  };

  const handleCreateApplication = async () => {
    setError(null);
    setSuccess(null);

    const app_acronym = appAcronym.trim().toLowerCase();
    const app_rnumber = Number(appRnumber);
    const app_description = appDescription.trim();
    const app_startdate = appStartDate;
    const app_enddate = appEndDate;
    const app_permit_create = dropdowns.appPermitCreate.trim();
    const app_permit_open = dropdowns.appPermitOpen.trim(); 
    const app_permit_todo = dropdowns.appPermitToDo.trim(); 
    const app_permit_doing = dropdowns.appPermitDoing.trim(); 
    const app_permit_done = dropdowns.appPermitDone.trim(); 
    
    if(!app_acronym || !app_rnumber || !app_description || !app_permit_create || !app_permit_open || !app_permit_todo || !app_permit_doing || !app_permit_done ){
      setError("Please fill in all fields!");
      return;
    }
    const appAcronymRegex = /^[a-zA-Z0-9]{1,50}$/;
    if(!appAcronymRegex.test(app_acronym)) {
      setError("App Acronym can only consists of alphanumeric, no special characters and not more than 50 characters!");
      return;
    }

    const appRNumberRegex = /^[1-9][0-9]{0,3}$/;
    if (!appRNumberRegex.test(app_rnumber)){
      setError("App Rnumber must be a whole number between 1 and 9999 and cannot start with 0.");
      return;
    }

    if(app_description.length > 255){
      setError("App description cannot exceed 255 characters!");
      return;
    }

    try{
      const newApplication = await createApplication(app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permit_create, app_permit_open, app_permit_todo, app_permit_doing, app_permit_done);
      if(newApplication.error) {
        setError(newApplication.error);
      }
      else{
        setSuccess(newApplication.success);
        setApplications((prevApps) => [...prevApps, newApplication.application]);
        props.onAppCreated?.(newApplication.success);
        setShowModal(false);

        // Reset form fields
        setAppAcronym('');
        setAppRNumber('');
        setAppStartDate('');
        setAppEndDate('');
        setAppDescription('');
        setDropdowns({
          appPermitCreate: '',
          appPermitOpen: '',
          appPermitToDo: '',
          appPermitDoing: '',
          appPermitDone: '',
        });
      }
    }
    catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="sidebar" style={{ padding: '1rem', borderRight: '2px solid #ddd', height: '100vh' }}>
      <Row className="align-items-center mb-3">
        <Col>
          <h5 className="mb-0 d-flex justify-content-between align-items-center gap-2">
            App <i className="bi bi-plus" style={{ cursor: 'pointer' }} onClick={handleShowAppModal}></i>
          </h5>
          <hr/>
          <ListGroup variant="default">
            {applications.map((app, index) => (
              <ListGroup.Item key={index} action onClick={() => handleShowAppDetails(app)} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {app.App_Acronym}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
      <hr />
      <Row className="align-items-center mb-3">
        <Col>
          <h6 className="mb-3 d-flex justify-content-between align-items-center gap-2">
            Plan <i className="bi bi-plus" style={{ cursor: 'pointer' }}></i>
          </h6>
          <ListGroup>
            
          </ListGroup>
        </Col>
      </Row>
      <Modal show={showModal} onHide={handleCloseAppModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create App form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {error && <Alert style={{width: '100%', transition: 'width 0.3s ease' }} variant="danger">{error}</Alert>} {/* Show error message */}
          <Form>
            {/* Row 1: App Name and Description */}
            <Row>
              <Col md={6}>
                <Form.Group controlId="formAppName" className='mb-1'>
                  <FloatingLabel controlId="floatingAppName" label="App Name">
                    <Form.Control type="text" placeholder="Enter app name" required onChange={(e) => setAppAcronym(e.target.value)}/>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group controlId="formGroupDropdown" className="mb-1">
                <FloatingLabel controlId="floatingDropdownCreate" label="App_permit_Create">
                <Form.Select required onChange={handleDropdownChange('appPermitCreate')} value={dropdowns.appPermitCreate}>
                  <option value="">-- Select an option --</option>
                  {Array.isArray(allGroups) && allGroups.length > 0 ? (
                    allGroups.map((group, index) => (
                      <option key={index} value={group.groupName}> 
                        {group.groupName}
                      </option>
                    ))
                  ) : (
                    <option disabled>No groups available</option> // Show a fallback if no groups are available
                  )}
                </Form.Select>
                </FloatingLabel>
                </Form.Group>
                <Form.Group controlId="formGroupDropdown" className="mb-1">
                  <FloatingLabel controlId="floatingDropdownOpen" label="App_permit_Open">
                    <Form.Select required onChange={handleDropdownChange('appPermitOpen')} value={dropdowns.appPermitOpen}>
                    <option value="">-- Select an option --</option>
                      {Array.isArray(allGroups) && allGroups.length > 0 ? (
                        allGroups.map((group, index) => (
                          <option key={index} value={group.groupName}>
                            {group.groupName} 
                          </option>
                        ))
                      ) : (
                        <option disabled>No groups available</option>
                      )}
                    </Form.Select>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group controlId="formGroupDropdown" className="mb-1">
                  <FloatingLabel controlId="floatingDropdownToDo" label="App_permit_toDoList">
                    <Form.Select required onChange={handleDropdownChange('appPermitToDo')}>
                    <option value="">-- Select an option --</option>
                      {Array.isArray(allGroups) && allGroups.length > 0 ? (
                        allGroups.map((group, index) => (
                          <option key={index} value={group.groupName}>
                            {group.groupName} 
                          </option>
                        ))
                      ) : (
                        <option disabled>No groups available</option> 
                      )}
                    </Form.Select>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group controlId="formGroupDropdown" className="mb-1">
                  <FloatingLabel controlId="floatingDropdownDoing" label="App_permit_Doing">
                    <Form.Select required onChange={handleDropdownChange('appPermitDoing')}>
                    <option value="">-- Select an option --</option>
                      {Array.isArray(allGroups) && allGroups.length > 0 ? (
                        allGroups.map((group, index) => (
                          <option key={index} value={group.groupName}> 
                            {group.groupName}  
                          </option>
                        ))
                      ) : (
                        <option disabled>No groups available</option> // Show a fallback if no groups are available
                      )}
                    </Form.Select>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group controlId="formGroupDropdown">
                  <FloatingLabel controlId="floatingDropdownDone" label="App_permit_Done">
                    <Form.Select required onChange={handleDropdownChange('appPermitDone')}>
                    <option value="">-- Select an option --</option>
                      {Array.isArray(allGroups) && allGroups.length > 0 ? (
                        allGroups.map((group, index) => (
                          <option key={index} value={group.groupName}> 
                            {group.groupName}  
                          </option>
                        ))
                      ) : (
                        <option disabled>No groups available</option> // Show a fallback if no groups are available
                      )}
                    </Form.Select>
                  </FloatingLabel>
                </Form.Group>
              </Col>
              <Col md={6}>
              <Form.Group controlId="formRnumber" className='mb-1'>
                <FloatingLabel controlId="floatingRNumber" label="RNumber">
                  <Form.Control type="number" placeholder="Enter R Number" required min= "1" max="9999" value={appRnumber} onChange={(e) => setAppRNumber(Number(e.target.value))}/>
                </FloatingLabel>
              </Form.Group>
              <Form.Group controlId="formStartDate" className="mb-1">
                  <FloatingLabel controlId="floatingStartDate" label="Start Date">
                    <Form.Control type="date" placeholder="Choose start date" required onChange={(e) => setAppStartDate(e.target.value)}/>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group controlId="formEndDate" className="mb-2">
                  <FloatingLabel controlId="floatingEndDate" label="End Date">
                    <Form.Control type="date" placeholder="Choose end date" required onChange={(e) => setAppEndDate(e.target.value)}/>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group controlId="formDescription" >
                  <FloatingLabel controlId="floatingdescription" label="Description">
                    <Form.Control as="textarea" rows={6} placeholder="App Description" required style={{ height: '180px'}} onChange={(e) => setAppDescription(e.target.value)}/>
                  </FloatingLabel>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-100 d-flex justify-content-center gap-2">
            <Button variant="success" onClick={handleCreateApplication}>Create App</Button>
            <Button variant="secondary" onClick={handleCloseAppModal}>Close</Button>
          </div>
        </Modal.Footer>
      </Modal>
      <Modal show={showDetails} onHide={handleCloseAppDetails}>
        <Modal.Header closeButton>
          <Modal.Title>Application Information (Read-Only)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApp ? (
            <div>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="detailsAppName" className='mb-1'>
                    <FloatingLabel controlId="selectedAppName" label="App Name:">
                      <Form.Control type="text" value={selectedApp.App_Acronym || ''} readOnly/>
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group controlId="detailsApp_permit_create" className='mb-1'>
                    <FloatingLabel controlId="selectedC" label="App Permit Create">
                      <Form.Control type="text" value={selectedApp.App_permit_Create || '-- Not Set --'} readOnly />
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group controlId="detailsApp_permit_Open" className="mb-1">
                    <FloatingLabel controlId="selectedO" label="App Permit Open">
                      <Form.Control type="text" value={selectedApp.App_permit_Open || '-- Not Set --'} readOnly />
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group controlId="detailsApp_toDoList" className="mb-1">
                    <FloatingLabel controlId="selectedtoDo" label="App Permit toDoList">
                      <Form.Control type="text" value={selectedApp.App_permit_toDoList || '-- Not Set --'} readOnly />
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group controlId="detailsApp_Doing" className="mb-1">
                    <FloatingLabel controlId="selectedDoing" label="App Permit Doing">
                      <Form.Control type="text" value={selectedApp.App_permit_Doing || '-- Not Set --'} readOnly />
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group controlId="detailsApp_Done" className="mb-1">
                    <FloatingLabel controlId="selectedDone" label="App Permit Done">
                      <Form.Control type="text" value={selectedApp.App_permit_Done || '-- Not Set --'} readOnly />
                    </FloatingLabel>
                  </Form.Group>
                </Col>
                <Col md={6}>
                <Form.Group controlId="StartDate" className="mb-1">
                    <FloatingLabel controlId="selectedStartDate" label="Start Date (YYYY-MM-DD)">
                      <Form.Control type="text" value={selectedApp.App_startDate ? new Date(selectedApp.App_startDate).toISOString().split('T')[0]: ''} readOnly/>
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group controlId="EndDate" className="mb-2">
                    <FloatingLabel controlId="selectedEndDate" label="End Date (YYYY-MM-DD)">
                      <Form.Control type="text" value={selectedApp.App_endDate ? new Date(selectedApp.App_endDate).toISOString().split('T')[0]: ''  } readOnly/>
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group controlId="Description" >
                    <FloatingLabel controlId="selecteddescription" label="Description">
                      <Form.Control as="textarea" rows={6} value={selectedApp.App_Description } style={{ height: '240px'}} readOnly/>
                    </FloatingLabel>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          ) : (
            <p>No application selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAppDetails}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Sidebar;
