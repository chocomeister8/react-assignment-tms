const express = require('express');
const userController = require('../controllers/userController');
const groupController = require('../controllers/groupController');
const appController = require('../controllers/appController');
const planController = require('../controllers/planController');
const taskController = require('../controllers/taskController');
const { isAuthenticatedUser, validateAccess, logout, login, getCreateTaskPermission, getUpdateTaskPermission } = require('../controllers/authController');

const router = express.Router();

// Routes for Admin
// View all users
router.get('/users', isAuthenticatedUser, validateAccess("admin"), userController.getAllUsers);
router.get('/users/:username', isAuthenticatedUser, validateAccess("admin"), userController.getUserByUserName);
// Create user
router.post('/create-user', isAuthenticatedUser, validateAccess("admin"), userController.createUser);
// Update user
router.put('/users/:username', isAuthenticatedUser, validateAccess("admin"), userController.updateUser);
// Group routes
router.get('/groups', isAuthenticatedUser, validateAccess(), groupController.getAllGroups);
router.post('/create-group', isAuthenticatedUser, validateAccess("admin"), groupController.createGroup);

// Application routes
router.get('/applications', isAuthenticatedUser, validateAccess(), appController.getAllApplications);
router.post('/create-app', isAuthenticatedUser, validateAccess("pl"), appController.createApp);
router.put('/applications/:application', isAuthenticatedUser, validateAccess("pl"), appController.updateApp);


// Plan routes
router.get('/plans', isAuthenticatedUser, validateAccess(), planController.getAllPlan);
router.post('/create-plan', isAuthenticatedUser, validateAccess("pm"), planController.createPlan);
router.put('/plan/:plan', isAuthenticatedUser, validateAccess("pm"), planController.updatePlan);

// Task routes
router.get('/tasks', isAuthenticatedUser, validateAccess(), taskController.getAllTasks);
router.get('/task/:Task_app_Acronym', isAuthenticatedUser, validateAccess(), taskController.getTaskByAppAcronym);
router.get('/taskid/:Task_id', isAuthenticatedUser, validateAccess(), taskController.getTaskByTaskID);
router.post('/create-task', isAuthenticatedUser, getCreateTaskPermission, taskController.createTask);
// Check Create task permissions
router.post('/check-create-task-permission', isAuthenticatedUser, getCreateTaskPermission, (req, res) => {res.status(200).json({ success: true });});

router.put('/task/:task', isAuthenticatedUser, getUpdateTaskPermission, taskController.updateTask);
// Check Update task permissions
router.post('/check-update-task-permission', isAuthenticatedUser, getUpdateTaskPermission, (req, res) => {res.status(200).json({ success: true });});

router.put('/approvetask/:task', isAuthenticatedUser, getUpdateTaskPermission, taskController.approveTask)
router.put('/rejecttask/:task', isAuthenticatedUser, getUpdateTaskPermission, taskController.rejectTask)

// Authentication routes
router.get("/auth/validateAccess", isAuthenticatedUser, validateAccess(), (req, res) => { const username = req.decoded.username;
    res.status(200).json({ success: true, username, group: req.userGroup});
});
router.get("/auth/validateAdmin", isAuthenticatedUser, validateAccess("admin"), (req, res) => {
    res.status(200).json({ success: true, isAdmin: true });
});
router.post('/auth/login', login);
router.post('/auth/logout', isAuthenticatedUser, logout);

// User update details routes
router.put("/user/updateEmail", isAuthenticatedUser, validateAccess(), userController.userUpdateEmail);
router.put("/user/updatePw", isAuthenticatedUser, validateAccess(), userController.userUpdatePassword);

module.exports = router;