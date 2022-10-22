const router = require('express').Router()
const messageController = require('../controller/messageController')

router.post('/', messageController.postMessage)
//get message of user
router.get('/:conversationId', messageController.getMessage)

module.exports = router