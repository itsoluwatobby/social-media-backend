const mongoose = require('mongoose')

const postsSchema = new mongoose.Schema({
      userId: {
         type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users'
      },
      desc: {
         type:String, max: 500
      },
      img: {
         type: String, default: ""
      },
      likes: {
         type: Array, default: []
      },
   },
   { timestamps: true}
)

module.exports = mongoose.model('posts', postsSchema)