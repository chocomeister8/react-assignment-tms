const express = require('express');
const userController = require('../controllers/userController');
const groupController = require('../controllers/groupController');
const { isAuthenticatedUser, validateAccess, logout, login } = require('../controllers/authController');

const router = express.Router();

router.get('/users', isAuthenticatedUser, validateAccess("admin"), userController.getAllUsers);
router.get('/users/:username', isAuthenticatedUser, validateAccess("admin"), userController.getUserByUserName);
router.post('/create-user', isAuthenticatedUser, validateAccess("admin"), userController.createUser);
router.put('/users/:username', isAuthenticatedUser, validateAccess("admin"), userController.updateUser);

router.get("/auth/validateAccess", isAuthenticatedUser, validateAccess(), (req, res) => {
    res.status(200).json({ success: true});
});

router.get("/auth/validateAdmin", isAuthenticatedUser, validateAccess("admin"), (req, res) => {
    res.status(200).json({ success: true, isAdmin: true });
});

router.get('/groups', isAuthenticatedUser, validateAccess("admin"), groupController.getAllGroups);
router.post('/create-group', isAuthenticatedUser, validateAccess("admin"), groupController.createGroup);

router.post('/auth/login', login);
router.post('/auth/logout', isAuthenticatedUser, logout);

module.exports = router;