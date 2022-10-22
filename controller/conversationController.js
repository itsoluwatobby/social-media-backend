const Conversation = require('../model/Conversation')

const postConversation = async(req, res) => {
   const { senderId, receiverId } = req.body
   try{
      const newConversation = new Conversation({
         members:[senderId, receiverId]
      })
      const savedConversation = await newConversation.save()
      res.status(200).json(savedConversation)
   }catch(error){
      res.sendStatus(500)
   }
} 

const getConversation = async(req, res) => {
   const {userId} = req.params
   if(!userId) return res.status(400).json('user Id required')
   try{
      const conversations = await Conversation.find({
         members:{$in:[userId]}
      })
      if(!conversations?.length) return res.status(400).json('no available conversation')
      res.status(200).json(conversations)
   }catch(error){
      res.sendStatus(500)
   }
} 

module.exports = { postConversation, getConversation}