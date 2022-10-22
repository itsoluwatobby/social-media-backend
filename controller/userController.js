const User = require('../model/User')
const Post = require('../model/Post')
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
      const allPosts = await Post.find().lean()
      if(!allUsers?.length) return res.status(400).json('No users found')
      res.status(200).json(allUsers)
   }catch(error){
      res.sendStatus(500)
   }
}

const getUser = async (req, res) => {
   const userId = req.query.userId
   const username = req.query.username
   
   try{
      const user = username ? await User.findOne({username}).select('-password').exec() : await User.findById(userId).select('-password').exec() 
      if(!user) return res.status(400).json(`User with email: ${email} not found`)
      res.status(200).json(user)
   }
   catch(error){
      res.sendStatus(500)
   }
}

const getFriends = async(req, res) => {
   const {userId} = req.params;
   if(!userId) return res.status(400).json({status: false, message: 'User id required'})
   try{
      const currentUser = await User.findOne({_id: userId}).exec();
      const friends = await Promise.all(
         currentUser.following.map(friendId => {
            return User.findById(friendId).lean()
         })
      );
      if(!friends?.length) return res.status(400).json({status: false, message: 'You are not following anybody yet'})
      let friendList = [];
      friends.map(friend => {
         const {_id, username, profilePicture} = friend;
         friendList.push({_id, username, profilePicture})
      })
      res.status(200).json(friendList);
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

         if(!followedUser.following.includes(followingUser._id)){
            await followedUser.updateOne({$push:{following: followingUser._id}})
            await followingUser.updateOne({$push:{followers: followedUser._id}})
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

         if(followedUser.following.includes(followingUser._id)){
            await followedUser.updateOne({$pull:{following: followingUser._id}})
            await followingUser.updateOne({$pull:{followers: followedUser._id}})
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

module.exports = { getFriends, getUser, updateUser, deleteUser, getUsers, deleteUser, followUser, unFollowUser }