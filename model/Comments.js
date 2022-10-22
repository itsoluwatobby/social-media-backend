const mongoose = require('mongoose')

const commentsSchema = new mongoose.Schema(
   {
      postId: {
         type: mongoose.Schema.Types.ObjectId, 
         required: true, ref: 'posts'
      },
      email:{
         type: String, required: true, ref: 'users'
      },
      dateTime:{
         type: String, default: ''
      },
      comment:{
         type: String, default: ''
      }
   },
   { timestamps: true}
)

module.exports = mongoose.model('comments', commentsSchema)