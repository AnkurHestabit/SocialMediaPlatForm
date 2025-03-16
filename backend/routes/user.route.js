const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const {verifyToken,authorizeRole,isAuthenticated} = require('../middlewear/authMiddlewear')


router.post('/addUser',authorizeRole(['user']),verifyToken,userController.createUser)
router.patch('/updateUser/:userId',authorizeRole(['user']),verifyToken,userController.updateUsers)
router.post('/login',userController.loginUser)
router.post('/refresh-token',userController.refreshToken)
router.post('/register',userController.registerUser)
router.get('/getUserProfile/',isAuthenticated,userController.getUserProfile)
router.post('/logout/',userController.logoutUser)


module.exports = router
