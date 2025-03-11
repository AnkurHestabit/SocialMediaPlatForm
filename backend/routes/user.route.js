const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const {verifyToken,authorizeRole} = require('../middlewear/authMiddlewear')


router.post('/addUser',verifyToken,authorizeRole(['user']),userController.createUser)
router.patch('/updateUser/:userId',verifyToken,userController.updateUsers)
router.post('/login',userController.loginUser)
router.post('/register',userController.registerUser)
router.get('/getUserProfile/:userId',userController.getUsers)


module.exports = router
