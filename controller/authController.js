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
      res.status(201).json({status: true, result})
   }catch(error){
      console.log(error)
      res.sendStatus(500)
   }
}

const handleLogin = async (req, res) => {
   const { username, password } = req.body
   if(!username || !password) {
      return res.status(400).json({ status: false, message: 'All fields required'})
   }
   try{
      const user = await User.findOne({username}).exec()
         if(!user) {
            return res.status(403).json({status: false, message: 'bad credentials'})
         }

      const match = await bcrypt.compare(password, user.password);
      if(!match) {
         return res.status(403).json({status: false, message: 'bad credentials'})
      }
      //create json web token
      const accessToken = await jwt.sign(
         {
            userInfo:{
               username: user.username,
            }
         },
         process.env.ACCESS_TOKEN_SECRET,
         { expiresIn: '3600s'}
      )
      const refreshToken = await jwt.sign(
         {
            userInfo:{
               username: user.username,
            }
         },
         process.env.REFRESH_TOKEN_SECRET,
         { expiresIn: '2d'}
      )
      user.refreshToken = refreshToken
      await user.save()

      res.cookie('jwt', accessToken, { httpOnly: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000}) //secure: true
      res.status(200).json({status: true, message: accessToken})
   }
   catch(error){
      console.log(error)
      res.sendStatus(500)
   }
}

const handleLogout = async (req, res) => {
   const cookie = req.cookie
   if(!cookie?.jwt) return res.sendStatus(204)
   const refreshToken = cookie
   console.log(refreshToken)
   try{
      const user = await User.findOne({refreshToken}).exec()
         if(!user) {
            res.clearCookie('jwt', {httpOnly: true, sameSite: 'None'})
            return res.sendStatus(204)
         }
      user.refreshToken = ''
      await user.save() 
      res.clearCookie('jwt', {httpOnly: true, sameSite: 'None'})
      res.sendStatus(204)
   }catch(error){
      res.sendStatus(500)
   }
}

module.exports = { handleRegister, handleLogin, handleLogout }