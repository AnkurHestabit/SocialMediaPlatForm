const express = require('express')
const router = express.Router()
const AdminController = require('../controllers/admin.controller')
const {verifyToken,authorizeRole} = require('../middlewear/authMiddlewear')

router.post('/getOnlineUserCount',verifyToken,AdminController.getOnlineUserCount)
router.post('/getTotalCommentCount',verifyToken,AdminController.getTotalCommentCount)
router.post('/getTotalPostCount',verifyToken,AdminController.getTotalPostCount)
router.post('/getTotalUserCount',verifyToken,AdminController.getTotalUserCount)
router.post('/getUserTotalActiveHours',verifyToken,AdminController.getUserTotalActiveHours)


module.exports = router