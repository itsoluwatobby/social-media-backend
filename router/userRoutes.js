const router = require('express').Router()
const userController = require('../controller/userController')

router.put('/:userId', userController.updateUser)
router.get('/', userController.getUsers)
router.get('/query', userController.getUser)
router.get('/friends/:userId', userController.getFriends)

//get user by name or email
router.delete('/', userController.deleteUser)

//follow a user
router.put('/:userId/follow', userController.followUser)
router.put('/:userId/unfollow', userController.unFollowUser)

module.exports = router