const express = require('express')
const router = express.Router()
const postController = require('../controllers/post.controller')
const postControllers = new postController()
const {verifyToken,authorizeRole} = require('../middlewear/authMiddlewear')

router.post('/addPost',verifyToken,postControllers.createPost)
router.patch('/updatePost/:postId',verifyToken,postControllers.updatePosts)
router.get('/getPost',verifyToken,postControllers.getPosts)
router.delete('/deletePost/:postId',verifyToken,postControllers.deletePosts)

module.exports = router