const router = require('express').Router()
const conversationController = require('../controller/conversationController')

//new conversation
router.post('/', conversationController.postConversation)
//get conversation of user
router.get('/:userId', conversationController.getConversation)

module.exports = router