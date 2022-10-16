const router = require('express').Router()
const postController = require('../controller/postController')

router.post('/', postController.createPost)

router.route('/:userId/:postId')
      .put(postController.updatePost)
      .delete(postController.deletePost)

router.get('/:userId', postController.getAllPosts)
router.get('/:postId', postController.getPost)

router.get('/timeline', postController.getPostTimeline )

router.put('/:postId/:userId/like', postController.likePost)

module.exports = router
