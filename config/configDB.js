const mongoose = require('mongoose');

const configDB = async () => {
   try{
      await mongoose.connect(process.env.MONGO_URL, {
         useUnifiedTopology: true,
         useNewUrlParser: true
      })
   }catch(error){
      console.log(error)
   }
}

module.exports = configDB