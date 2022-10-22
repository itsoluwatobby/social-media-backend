const Message = require('../model/Message')

const postMessage = async(req, res) => {
   const messageBody = req.body
   try{
      const newMessage = new Message(messageBody)
      const savedMessage = await newMessage.save()
      res.status(200).json(savedMessage)
   }
   catch(error){
      res.sendStatus(500)
   }
} 

const getMessage = async(req, res) => {
   const {conversationId} = req.params
   if(!conversationId) return res.status(400).json('user Id required')
   try{
      const messages = await Message.find({ conversationId })
      if(!messages?.length) return res.status(400).json('no available message')
      res.status(200).json(messages)
   }
   catch(error){
      res.sendStatus(500)
   }
} 

module.exports = { postMessage, getMessage}