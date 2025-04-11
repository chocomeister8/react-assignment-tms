const express = require('express');
const userController = require('../controllers/userController');
const groupController = require('../controllers/groupController');
const appController = require('../controllers/appController');
const planController = require('../controllers/planController');
const taskController = require('../controllers/taskController');
const { isAuthenticatedUser, validateAccess, logout, login } = require('../controllers/authController');

const router = express.Router();

router.get('/users', isAuthenticatedUser, validateAccess("admin"), userController.getAllUsers);
router.get('/users/:username', isAuthenticatedUser, validateAccess("admin"), userController.getUserByUserName);
router.post('/create-user', isAuthenticatedUser, validateAccess("admin"), userController.createUser);
router.put('/users/:username', isAuthenticatedUser, validateAccess("admin"), userController.updateUser);

router.get("/auth/validateAccess", isAuthenticatedUser, validateAccess(), (req, res) => {
    const username = req.decoded.username;
    res.status(200).json({ success: true, username});
});

router.get("/auth/validateAdmin", isAuthenticatedUser, validateAccess("admin"), (req, res) => {
    res.status(200).json({ success: true, isAdmin: true });
});

router.get('/groups', isAuthenticatedUser, validateAccess("admin"), groupController.getAllGroups);
router.post('/create-group', isAuthenticatedUser, validateAccess("admin"), groupController.createGroup);

router.get('/applications', isAuthenticatedUser, validateAccess("admin"), appController.getAllApplications);
router.post('/create-app', isAuthenticatedUser, validateAccess("admin"), appController.createApp);

router.get('/plans', isAuthenticatedUser, validateAccess("admin"), planController.getAllPlan);
router.post('/create-plan', isAuthenticatedUser, validateAccess("admin"), planController.createPlan);

router.get('/tasks', isAuthenticatedUser, validateAccess(), taskController.getAllTasks);
router.post('/create-task', isAuthenticatedUser, validateAccess("pl"), taskController.createTask);

router.post('/auth/login', login);
router.post('/auth/logout', isAuthenticatedUser, logout);

module.exports = router;