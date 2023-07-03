const bcrypt = require('bcrypt');
const User = require('../model/User')
const jwt = require('jsonwebtoken');

const handleRegister = async (req, res) => {
   const { username, email, password } = req.body
   if(!username || !email || !password) {
      return res.status(400).json({ status: false, message: 'All fields required'})
   }
   try{
      const duplicateUsername = await User.findOne({username}).exec()
         if(duplicateUsername) {
            return res.status(409).json({status: false, message: 'username taken'})
         }

      const duplicateEmail = await User.findOne({email}).exec()
         if(duplicateEmail) {
            return res.status(409).json({status: false, message: 'email taken'})
         } 

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await new User({
         username,
         email,
         password: hashedPassword
      })
      const result = await user.save() 
      res.status(201).json(result)
   }catch(error){
      res.sendStatus(500)
   }
}

const handleLogin = async (req, res) => {
   const { email, pwd } = req.body
   if(!email || !pwd) return res.status(400).json('All fields required')
   try{
      const user = await User.findOne({email}).exec()
      if(!user) return res.status(403).json('bad credentials')

      const match = await bcrypt.compare(pwd, user.password);
      if(!match) return res.status(403).json('bad credentials')
      
      //create json web token
      const accessToken = await jwt.sign(
         {
            userInfo:{
               userId: user._id,
               username: user.username
            }
         },
         process.env.ACCESS_TOKEN_SECRET,
         { expiresIn: '1h'}
      )

      const refreshToken = await jwt.sign(
         {
            userInfo:{
               userId: user._id,
               username: user.username
            }
         },
         process.env.REFRESH_TOKEN_SECRET,
         { expiresIn: '1d'}
      )

      await user.updateOne({$set: {refreshToken}})
      
      const loggedInUser = await User.findById(user?._id).exec()
      const { password, ...rest } = loggedInUser._doc
      
      res.cookie('jwt', refreshToken, {httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000}) //secure: true
      res.status(200).json({user: rest, accessToken})
   }
   catch(error){
      res.sendStatus(500)
   }
}

const handleLogout = async (req, res) => {
   const cookies = req.cookies
   if(!cookies?.jwt) return res.sendStatus(204)
   const refreshToken = cookies.jwt

   try{
      const user = await User.findOne({refreshToken}).exec()
         if(!user) {
            res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true})
            return res.sendStatus(204)
         }
      await user.updateOne({$set: {refreshToken: ''}})
      res.clearCookie('jwt', {httpOnly: true, secure: true, sameSite: 'None'})
      res.sendStatus(204)
   }catch(error){
      res.clearCookie('jwt', {httpOnly: true, secure: true, sameSite: 'None'})
      res.sendStatus(204)
   }
}

module.exports = { handleRegister, handleLogin, handleLogout }