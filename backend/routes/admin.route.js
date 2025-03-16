const express = require('express')
const router = express.Router()
const AdminController = require('../controllers/admin.controller')
const {verifyToken,authorizeRole} = require('../middlewear/authMiddlewear')

router.post('/getOnlineUserCount',authorizeRole(['admin']),verifyToken,AdminController.getOnlineUserCount)
router.post('/getTotalCommentCount',authorizeRole(['admin']),verifyToken,AdminController.getTotalCommentCount)
router.post('/getTotalPostCount',authorizeRole(['admin']),verifyToken,AdminController.getTotalPostCount)
router.post('/getTotalUserCount',authorizeRole(['admin']),verifyToken,AdminController.getTotalUserCount)
router.post('/getUserTotalActiveHours',authorizeRole(['admin']),verifyToken,AdminController.getUserTotalActiveHours)


module.exports = router