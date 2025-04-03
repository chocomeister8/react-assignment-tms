const express = require('express');
const userController = require('../controllers/userController');
const groupController = require('../controllers/groupController');
const { isAuthenticatedUser, isAuthorized, logout, login, checkLogin } = require('../controllers/authController');


const router = express.Router();


router.get('/users', isAuthenticatedUser, isAuthorized(["admin"]),  userController.getAllUsers);
router.get('/users/:username', isAuthenticatedUser, isAuthorized(["admin"]), userController.getUserByUserName);
router.post('/create-user', isAuthenticatedUser, isAuthorized(["admin"]), userController.createUser);
router.put('/users/:username', isAuthenticatedUser, isAuthorized(["admin"]), userController.updateUser);

router.get("/auth/checkLogin", isAuthenticatedUser, checkLogin);

router.get('/groups', isAuthenticatedUser, isAuthorized(["admin"]), groupController.getAllGroups);
router.post('/create-group', isAuthenticatedUser, isAuthorized(["admin"]), groupController.createGroup);

router.post('/auth/login', login);
router.post('/auth/logout', isAuthenticatedUser, logout);

module.exports = router;