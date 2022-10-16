const Post = require('../model/Post')
const User = require('../model/User')

const createPost = async (req, res) => {
   const newPost = req.body

   if(!newPost.userId) return res.status(401).json({status: false, message: 'You are not allowed to create a post'})
   try{
      const user = await User.findById(newPost.userId).exec()
      if(!user) return res.status(403).json({status: false, message: 'You are not allowed to create a post'})

      const post = await new Post(newPost)
      const savePost = await post.save()
      return res.status(201).json({status: true, savePost })
   }
   catch(error){
      res.sendStatus(500)
   }
}

const updatePost = async (req, res) => {
   const { userId, postId } = req.params
   const post = req.body

   if(!userId) return res.status(401).json({status: false, message: 'You are not allowed to update this post'})
   try{
      const userPost = await User.findById(userId).exec()
      if(!userPost) return res.status(400).json({status: false, message: 'You cannot update this Post'})

      const getPost = await Post.findByIdAndUpdate(postId, { $set: post})
      if(!getPost) return res.status(403).json({status: false, message: 'Post not found'})

      return res.status(201).json({status: true, getPost })
   }
   catch(error){
      res.sendStatus(500)
   }
}

const deletePost = async (req, res) => {

}

const getPost = async (req, res) => {
   const { postId } = req.params
   if(!postId) return res.status(401).json({status: false, message: 'You are not allowed to update this post'})

   try{
      const allPosts = await Post.findById(postId).lean()
      if(!allPosts?.length) return res.status(400).json({status: false, message: 'No post found'})
      res.status(200).json({status: true, allPosts})
   }
   catch(error){
      res.sendStatus(500)
   }
}

const getAllPosts = async (req, res) => {
   const { userId } = req.params
   if(!userId) return res.status(401).json({status: false, message: 'You are not allowed to update this post'})

   try{
      const allPosts = await Post.find().select('-userId').lean()
      if(!allPosts) return res.status(400).json({status: false, message: 'No post found'})
      res.status(200).json({status: true, allPosts})
   }
   catch(error){
      res.sendStatus(500)
   }
}

const getPostTimeline = async(req, res) => {
   const { userId } = req.body
   
   try{
      const currentUser = await User.findById(userId).exec()
      const userPosts = await Post.find({userId: currentUser._id});
      const friendPost = await Promise.all(
         currentUser.following.map(friendId => {
            return Post.find({ userId: friendId })
         })
      )
      res.json(userPosts.concat(...friendPost))
   }
   catch(error){
      res.sendStatus(500)
   }
}

const likePost = async (req, res) => {
   const { postId, userId } = req.params
   if(!postId) return res.status(401).json({status: false, message: 'post not found'})
   try{
      const post = await Post.findById(postId).exec()
     
      if(!post.likes.includes(userId)){
         await post.updateOne({$push:{likes: userId}})
         res.status(200).json({status:true, message: 'post has been liked'})
      }
      else{
         await post.updateOne({$pull:{likes: userId}})
         res.status(200).json({status:true, message: 'post has been disliked'})
      }
   }
   catch(error){
      res.sendStatus(500)
   }
}

module.exports = { getPostTimeline, likePost, getAllPosts, getPost, createPost, updatePost, deletePost, }