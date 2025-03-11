const express = require('express')
const router = express.Router()
const commentController = require('../controllers/comment.controller')
const commentControllers = new commentController()
const {verifyToken,authorizeRole} = require('../middlewear/authMiddlewear')


router.post('/addComment',verifyToken,commentControllers.createComment)
router.patch('/updateComment/:commentId',verifyToken,commentControllers.updateComments)
router.get('/getComment/:postId',commentControllers.getComments)
router.delete('/deleteComment/:commentId',verifyToken,commentControllers.deleteComments)


module.exports = router