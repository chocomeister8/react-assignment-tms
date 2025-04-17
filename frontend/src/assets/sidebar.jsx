// Import react-based libraries
import React, { useEffect, useState } from 'react';
import { Col, ListGroup, Row, Button, Modal, Form, FloatingLabel, Alert } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Backend API calls
import { createApplication, fetchApplications, fetchGroups, createPlan, fetchPlans, fetchUsername, updateApplication, fetchTasks  } from "../assets/apiCalls";

const Sidebar = ( props ) => {
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetailsModal] = useState(false);
  const handleShowAppModal = () => setShowModal(true);
  const handleCloseAppModal = () => setShowModal(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const handleShowPlanModal = () => setShowPlanModal(true);
  const handleClosePlanModal = () => setShowPlanModal(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); 
  const [applications, setApplications] = useState([]);
  const [allGroups, setGroups] = useState([]);
  const [selectedApp, setSelectedApp] = useState([]);
  const [userGroup, setUserGroup] = useState('');
  

  const [appAcronym, setAppAcronym] = useState('');
  const [appRnumber, setAppRNumber] = useState('');
  const [appStartDate, setAppStartDate] = useState('');
  const [appEndDate, setAppEndDate] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [dropdowns, setDropdowns] = useState({appPermitCreate: '', appPermitOpen: '', appPermitToDo: '', appPermitDoing: '', appPermitDone: '',});

  const [Plan_MVP_name, setMVPName] = useState('');
  const [PlanStartDate, setPlanStartDate] = useState('');
  const [PlanEndDate, setPlanEndDate] = useState('');
  const [PlanAppName, setPlanAppName] = useState('');
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);

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
        const applicationsData = await fetchApplications();
        const groupData = await fetchGroups();
        const plansData = await fetchPlans();
        const group = await fetchUsername();

        setApplications(applicationsData);
        setGroups(groupData);
        setPlans(plansData);
        setUserGroup(group.group);
      } catch (err) {
        setError(err.message);
      }
    };
    loadData();
  }, [])

  const handleShowAppDetails = (app) => {
    setSelectedApp(app);
    setShowDetailsModal(true);
    if (props.onAppSelect) {
      props.onAppSelect(app);
    }
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

  const handleShowAppPlans = (app) => {
    setSelectedApp(app);
    setPlanAppName(app.App_Acronym);
    // const appTasks = tasks.filter(task => task.Task_app_Acronym === app.App_Acronym);
    // setFilteredTasks(appTasks);
    const appPlans = plans.filter(plan => plan.Plan_app_Acronym === app.App_Acronym);
    setFilteredPlans(appPlans);
    if (props.onAppSelect) {
      props.onAppSelect(app);
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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


    
    if(!app_acronym || !app_rnumber ){
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
      const newApplication = await createApplication(app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permit_open, app_permit_todo, app_permit_doing, app_permit_done, app_permit_create);
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
        setDropdowns({appPermitCreate: '',appPermitOpen: '',appPermitToDo: '',appPermitDoing: '',appPermitDone: '',});
      }
    }
    catch (err) {
      setError(err.message);
    }
  }

  const handleUpdateApplication = async () => {
    setError(null);
    setSuccess(null);
  
    const { App_Acronym, App_Rnumber, App_Description, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create} = selectedApp;
  
    if (App_Description.length > 255) {
      setError("App description cannot exceed 255 characters.");
      return;
    }

    const formattedStartDate =  App_startDate && !isNaN(new Date(App_startDate).getTime()) ? new Date(App_startDate).toISOString().split('T')[0] : null;
    const formattedEndDate =  App_endDate && !isNaN(new Date(App_endDate).getTime()) ? new Date(App_endDate).toISOString().split('T')[0] : null;

    console.log("date:",formattedStartDate, formattedEndDate)
  
    try {
      const updateapplication = await updateApplication(App_Acronym, App_Description, App_Rnumber, formattedStartDate, formattedEndDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create);
  
      if (updateapplication.error) {
        setError(updateapplication.error);
      } else {
        handleCloseAppDetails();
        console.log(updateapplication)
        setApplications((prevApps) => prevApps.map((app) => app.App_Acronym === App_Acronym && app.App_Rnumber === App_Rnumber 
        ? { ...app, App_Description, App_startDate: formattedStartDate, App_endDate: formattedEndDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_Create }: app
          )
        );
        props.onUpdateDone?.(updateapplication.success);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  const handleAppChange = (field) => (e) => {
    const value = e.target.value;
    setSelectedApp((prevApp) => ({
      ...prevApp,
      [field]: value,
    }));
  };

  const handleCreatePlan = async () => {
    setError(null);
    setSuccess(null);

    const plan_mvp_name = Plan_MVP_name.trim().toLowerCase();
    const plan_startDate = PlanStartDate;
    const plan_endDate = PlanEndDate;
    const plan_appName = PlanAppName.trim().toLowerCase();

    console.log(plan_mvp_name, plan_startDate, plan_endDate, plan_appName)

    if(!plan_mvp_name || !plan_startDate || !plan_endDate || !plan_appName){
      setError("Please fill in all fields!");
      return;
    }
    const planMVPNameRegex = /^[a-zA-Z0-9]{1,50}$/;
    if(!planMVPNameRegex.test(plan_mvp_name)) {
      setError("MVP Name can only consists of alphanumeric, no special characters and not more than 50 characters!");
      return;
    }
    try{
      const newPlan = await createPlan(plan_mvp_name, plan_startDate, plan_endDate, plan_appName);
      if(newPlan.error) {
        setError(newPlan.error);
      }
      else{
        if (newPlan.success) {
          setSuccess(newPlan.success);
          setPlans((prevPlans) => {
          const updatedPlans = [...prevPlans, newPlan.plan];
          if (selectedApp && newPlan.plan.Plan_app_Acronym === selectedApp.App_Acronym) {
            const appPlans = updatedPlans.filter(
              plan => plan.Plan_app_Acronym === selectedApp.App_Acronym
            );
            setFilteredPlans(appPlans);
          }

          return updatedPlans;
        });
          props.onPlanCreated?.(newPlan.success);
          setShowPlanModal(false);

          // Reset form fields
          setMVPName('');
          setPlanStartDate('');
          setPlanEndDate('');
          setPlanAppName('');
          setError('');
        }
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
            <div> App </div>
          {userGroup.includes(",pl,") && (
            <i className="bi bi-plus" style={{ cursor: 'pointer' }} onClick={handleShowAppModal}></i>
          )}
          </h5>
          <hr/>
          <ListGroup variant="default">
            {applications.map((app, index) => (
              <div key={index} className="rounded d-flex align-items-center justify-content-between mb-1">
              <ListGroup.Item action onClick={() => handleShowAppPlans(app)} style={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', borderRadius: '8px' }}>
              {app.App_Acronym}
              </ListGroup.Item>
              <i className="bi bi-info-circle-fill ms-2" style={{ color: '#000', cursor: 'pointer' }} onClick={() => handleShowAppDetails(app)} />
            </div>
            ))}
          </ListGroup>
        </Col>
      </Row>
      <hr />
      <Row className="align-items-center mb-3">
        <Col>
          <h6 className="mb-3 d-flex justify-content-between align-items-center gap-2">Plan
          {userGroup.includes(",pm,") && selectedApp && Object.keys(selectedApp).length > 0 && (<i className="bi bi-plus" style={{ cursor: 'pointer' }} onClick={handleShowPlanModal}></i>)}</h6>
          {selectedApp && (
          <div>
            {filteredPlans.length > 0 ? (
              <ListGroup>
                {filteredPlans.map((plan, index) => (
                  <ListGroup.Item key={index} style={{ flexGrow: 1, whiteSpace: 'nowrap', overflowX: 'auto', textOverflow: 'ellipsis', borderRadius: '8px' }}>
                    <div className="d-flex flex-column">
                      <span className='mb-2'>{plan.Plan_MVP_name}</span>
                      <small className="text-muted" style={{ fontSize: '0.6rem' }}>Start Date: {formatDate(plan.Plan_startDate)}</small>
                      <small className="text-muted" style={{ fontSize: '0.6rem' }}>End Date: {formatDate(plan.Plan_endDate)}</small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className="d-flex flex-column">
                <small className="text-muted">No plans.</small>
              </div>
            )}
          </div>
        )}
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
          <Modal.Title>Application Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApp ? (
            <div>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="detailsAppName" className='mb-1'>
                    <FloatingLabel controlId="selectedAppName" label="App Name:">
                      <Form.Control type="text" value={selectedApp.App_Acronym || ''} disabled/>
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group controlId="detailsApp_permit_create" className='mb-1'>
                    <FloatingLabel controlId="selectedC" label="App Permit Create">
                    <Form.Select required onChange={handleAppChange('App_permit_Create')} value={selectedApp.App_permit_Create}>
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
                  <Form.Group controlId="detailsApp_permit_Open" className="mb-1">
                    <FloatingLabel controlId="selectedO" label="App Permit Open">
                      <Form.Select required onChange={handleAppChange('App_permit_Open')} value={selectedApp.App_permit_Open}>
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
                  <Form.Group controlId="detailsApp_toDoList" className="mb-1">
                    <FloatingLabel controlId="selectedtoDo" label="App Permit toDoList">
                      <Form.Select required onChange={handleAppChange('App_permit_toDoList')}  value={selectedApp.App_permit_toDoList}>
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
                  <Form.Group controlId="detailsApp_Doing" className="mb-1">
                    <FloatingLabel controlId="selectedDoing" label="App Permit Doing">
                      <Form.Select required onChange={handleAppChange('App_permit_Doing')} value={selectedApp.App_permit_Doing}>
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
                  <Form.Group controlId="detailsApp_Done" className="mb-1">
                    <FloatingLabel controlId="selectedDone" label="App Permit Done">
                    <Form.Select required onChange={handleAppChange('App_permit_Done')} value={selectedApp.App_permit_Done}>
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
                  <Form.Group controlId="app_rnum" className="mb-1">
                    <FloatingLabel controlId="app_Rnum" label="App RNumber">
                      <Form.Control type="text" value={selectedApp.App_Rnumber || ''} disabled/>
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group controlId="StartDate" className="mb-1">
                    <FloatingLabel controlId="selectedStartDate" label="Start Date (YYYY-MM-DD)">
                      <Form.Control type="date" placeholder="Choose start date" required onChange={handleAppChange('App_startDate')} value={selectedApp.App_startDate ? new Date(selectedApp.App_startDate).toISOString().split('T')[0]: ''}/>
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group controlId="EndDate" className="mb-2">
                    <FloatingLabel controlId="selectedEndDate" label="End Date (YYYY-MM-DD)">
                    <Form.Control type="date" placeholder="Choose End date" required onChange={handleAppChange('App_endDate')} value={selectedApp.App_endDate ? new Date(selectedApp.App_endDate).toISOString().split('T')[0]: '' }/>
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group controlId="Description" >
                    <FloatingLabel controlId="selecteddescription" label="Description">
                      <Form.Control as="textarea" rows={6} value={selectedApp.App_Description || '' } onChange={handleAppChange('App_Description')} style={{ height: '180px'}}/>
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
        {userGroup.includes(",pm,") && (
          <Button variant="success" onClick={handleUpdateApplication}>
            Update Application
          </Button>)}
          <Button variant="secondary" onClick={handleCloseAppDetails}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showPlanModal} onHide={handleClosePlanModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create Plan form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {error && <Alert style={{width: '100%', transition: 'width 0.3s ease' }} variant="danger">{error}</Alert>} {/* Show error message */}
          <Form>
            {/* Row 1: App Name and Description */}
            <Row>
              <Col md={12}>
                <Form.Group controlId="formPlanName" className='mb-1'>
                  <FloatingLabel controlId="floatingPlanName" label="MVP Name">
                    <Form.Control type="text" placeholder="Enter app name" required onChange={(e) => setMVPName(e.target.value)}/>
                  </FloatingLabel>
                </Form.Group>
              </Col>
              <Col md={6}>
              <Form.Group controlId="form" className="mb-1">
                <FloatingLabel controlId="floatingAppName" label="Start Date">
                    <Form.Control type="date" placeholder="Choose start date" required onChange={(e) => setPlanStartDate(e.target.value)}/>
                  </FloatingLabel>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formEndDate" className="mb-1">
                  <FloatingLabel controlId="floatingEndDate" label="End Date">
                    <Form.Control type="date" placeholder="Choose end date" required onChange={(e) => setPlanEndDate(e.target.value)}/>
                  </FloatingLabel>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-100 d-flex justify-content-center gap-2">
            <Button variant="success" onClick={handleCreatePlan}>Create Plan</Button>
            <Button variant="secondary" onClick={handleClosePlanModal}>Close</Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Sidebar;
