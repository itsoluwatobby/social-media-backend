const Post = require('../model/Post')
const User = require('../model/User')
const Comment = require('../model/Comments')


const createPost = async (req, res) => {
   const {userId, desc, img} = req.body

   if(!userId) return res.status(401).json({status: false, message: 'You are not allowed to create a post'})
   try{
      const user = await User.findById(userId).exec()
      if(!user) return res.status(403).json({status: false, message: 'You are not allowed to create a post'})

      const post = await new Post({
         userId, desc, img
      })
      const savePost = await post.save()
      return res.status(201).json(savePost)
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

      return res.status(201).json(getPost)
   }
   catch(error){
      res.sendStatus(500)
   }
}

const deletePost = async (req, res) => {
   const {userId, postId} = req.params
   if(!userId || !postId) return res.status(401).json({status: false, message: 'You are not allowed to delete this post'})

   try{
      //get user's posts
      const currentUserPosts = await Post.find({userId}).lean();
      if(!currentUserPosts) return res.status(401).json({status: false, message: 'You are not allowed to delete this post'})

      const targetPost = await Post.findById(postId).exec();
      await targetPost.deleteOne();
      res.sendStatus(204)
   }
   catch(error){
      console.log(error)
   }
}

const getPost = async (req, res) => {
   const { postId } = req.params
   if(!postId) return res.status(401).json({status: false, message: 'You are not allowed to update this post'})

   try{
      const allPosts = await Post.findById(postId).lean()
      if(!allPosts?.length) return res.status(400).json({status: false, message: 'No post found'})
      res.status(200).json(allPosts)
   }
   catch(error){
      res.sendStatus(500)
   }
}

const getAllPosts = async (req, res) => {
   const { userId } = req.params
   if(!userId) return res.status(401).json({status: false, message: 'You are not allowed to update this post'})

   try{
      const allPosts = await Post.find().lean()
      if(!allPosts) return res.status(400).json({status: false, message: 'No post found'})
      res.status(200).json(allPosts)
   }
   catch(error){
      res.sendStatus(500)
   }
}

const getAllPostsByUsername = async (req, res) => {
   const { username } = req.params
   if(!username) return res.status(401).json({status: false, message: 'You are not allowed to view this post'})

   try{
      const userPost = await User.findOne({username}).exec()
      const allPosts = await Post.find({ userId: userPost._id }).lean()
      if(!allPosts) return res.status(400).json({status: false, message: 'No post found'})
      res.status(200).json(allPosts)
   }
   catch(error){
      res.sendStatus(500)
   }
}

const getPostTimeline = async(req, res) => {
   const { userId } = req.params

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

const postComment = async(req, res) => {
   const {postId, email, dateTime, comment} = req.body
   if(!email || !postId) return res.status(400).json({status: false, message: 'email is required'})

   try{
      //get target post
      const targetPost = await Post.findById(postId).exec()
      if(!targetPost) return res.status(400).json({status: false, message: 'invalid'})
      const saveComment = await Comment.create({
         postId, email, dateTime, comment
      })
      res.status(201).json(saveComment) 
   }
   catch(error){
      res.sendStatus(500)
   }
}

const deleteComment = async(req, res) => {
   const { postId, commentId } = req.params
   if(!commentId || !postId) return res.status(400).json({status: false, message: 'all fields required'})

   try{
      //get target comment
      const targetPost = await Post.findById(postId).exec()
      if(!targetPost) return res.status(401).json({status: false, message: 'invalid'})

      const targetComment = await Comment.findById(commentId).exec() 
      await targetComment.deleteOne();
      res.status(204).json('comment deleted') 
   }
   catch(error){
      res.sendStatus(500)
   }
}

const getComments = async(req, res) => {
   const { postId } = req.params
   if(!postId) return res.status(400).json({status: false, message: 'user id required'})

   try{
      const comment = await Comment.find({postId}).lean()
      if(!comment) return res.status(400).json({status: false, message: 'comment not found'})
      
      res.status(200).json(comment)
   }
   catch(error){
      res.sendStatus(500)
   }
}

const getSingleComment = async(req, res) => {
   const {userId} = req.body
   try{

   }
   catch(error){

   }
}

module.exports = { getAllPostsByUsername, getPostTimeline, likePost, getAllPosts, getPost, createPost, updatePost, deletePost, postComment, getComments, getSingleComment, deleteComment }