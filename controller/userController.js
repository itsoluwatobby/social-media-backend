const User = require('../model/User')
const bcrypt = require('bcrypt')

const updateUser = async(req, res) => {
   const { userId } = req.params
   const userInfo = req.body
   if(!userId) return res.status(400).json({status: false, message: 'User id required'})

   try{
      const user = await User.findById(userId).exec()
      if(!user) return res.sendStatus(403)
      
      if(userInfo.password){
         const hashPassword = await bcrypt.hash(userInfo.password, 10);
         user.password = hashPassword
         await user.save()
         return res.status(200).json('password update successful')
      }
   }
   catch(error){
      res.sendStatus(500)
   }
   try{
      const user = await User.findByIdAndUpdate(userId, { $set: userInfo})
      user && res.status(200).json ('Account updated successfully')
   }catch(error){
      res.sendStatus(500)
   }
}

const deleteUser = async (req, res) => {
   const { userId } = req.body
   if(!userId) return res.status(400).json({status: false, message: 'User id required'})

   try{
      const user = await User.findById(userId).exec()
      if(!user) return res.sendStatus(403).json({ status: false, message: `You only have access to delete your own account`})
   
      const result = await user.deleteOne()
      result && res.status(200).json ('Account deleted successfully')
   }catch(error){
      res.sendStatus(500)
   }
}

const getUsers = async (req, res) => {
   try{
      const allUsers = await User.find().select('-password').lean()
      if(!allUsers?.length) return res.status(400).json('No users found')
      res.status(200).json({status: true, allUsers})
   }catch(error){
      res.sendStatus(500)
   }
}

const getUserByName = async (req, res) => {
   const {email} = req.params
   try{
      const user = await User.findOne(email).select('-password').exec()
      if(!user) return res.status(400).json(`User with email: ${email} not found`)
      res.status(200).json({status: true, user})
   }
   catch(error){
      res.sendStatus(500)
   }
}

const getUserById = async (req, res) => {
   const {userId} = req.params
   try{
      const user = await User.findById(userId).select('-password').exec()
      if(!user) return res.status(400).json(`User with ID: ${userId} not found`)
      const {isAdmin, updatedAt, ...other} = user._doc
      res.status(200).json({status: true, other})
   }
   catch(error){
      res.sendStatus(500)
   }
}

//follow a user
const followUser = async (req, res) => {
   const {userId} = req.params
   if(req.body.id !== userId){
      try{
         const followedUser = await User.findById(userId).exec()
         const followingUser = await User.findById(req.body.id).exec()

         if(!followedUser.followers.includes(followingUser._id)){
            await followedUser.updateOne({$push:{followers: followingUser._id}})
            await followingUser.updateOne({$push:{following: followedUser._id}})
            res.status(200).json('user has been followed')
         }
         else{
            res.status(403).json('You already follow this user')
         }
      }
      catch(error){
         res.sendStatus(500)
      }
   }
   else{
      res.status(403).json("You can't follow yourself")
   }
}

const unFollowUser = async (req, res) => {
   const {userId} = req.params
   if(req.body.id !== userId){
      try{
         const followedUser = await User.findById(userId).exec()
         const followingUser = await User.findById(req.body.id).exec()

         if(followedUser.followers.includes(followingUser._id)){
            await followedUser.updateOne({$pull:{followers: followingUser._id}})
            await followingUser.updateOne({$pull:{following: followedUser._id}})
            res.status(200).json('user has been unfollowed')
         }
         else{
            res.status(403).json('You do not follow this user')
         }
      }
      catch(error){
         res.sendStatus(500)
      }
   }
   else{
      res.status(403).json("You can't unfollow yourself")
   }
}

module.exports = { updateUser, deleteUser, getUsers, getUserById, deleteUser, followUser, unFollowUser }