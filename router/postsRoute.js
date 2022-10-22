const router = require('express').Router()
const postController = require('../controller/postController')

router.post('/', postController.createPost)

router.route('/:userId/:postId')
      .put(postController.updatePost)
      .delete(postController.deletePost)

router.get('/:userId', postController.getAllPosts)
router.get('/:postId', postController.getPost)
router.get('/profile/:username', postController.getAllPostsByUsername)

router.get('/timeline/:userId', postController.getPostTimeline )

router.put('/:postId/:userId/like', postController.likePost)

//comments
router.post('/comments', postController.postComment)
router.get('/comments/:postId', postController.getComments)
router.delete('/comments/:postId/:commentId', postController.deleteComment)

module.exports = router
