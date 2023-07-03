const jwt = require('jsonwebtoken')
const User = require('../model/User')

exports.getNewAccessToken = async(req, res) => {
   const cookies = req.cookies
   if(!cookies?.jwt) return res.sendStatus(401)
   const token = cookies.jwt

   //check token has been tampered with
   const refresh = await User.findOne({refreshToken: token})
   if(!refresh){
      //clear refreshtoken from the database of the hacked user
      await refresh.updateOne({refreshToken: ''})
      res.status(403).json('bad credentials')
   }
      //verify jwt
   await jwt.verify(
      refresh,
      process.env.REFRESH_TOKEN_SECRET,
      async(err, decoded) => {
         if(err?.name === 'TokenExpiredError') return res.status(403).json('Expired token')
         if(err?.name === 'JsonWebTokenError') return res.status(401).json('Unauthorized')
         
         const accessToken = await jwt.sign(
            {
               "userInfo":{
                  userId: decoded?.userInfo.userId,
                  username: decoded?.userInfo.username
               }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '2h' }
         )
         res.status(200).json(accessToken)
      }
   )
}

exports.verifyToken = async(req, res, next) => {
   const auth = req.headers['authorization'] || req.headers['AUTHORIZATION']
   if(!auth || !auth?.startsWith('Bearer ')) return res.sendStatus(401)
   const token = auth.split(' ')[1]

   await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      (err, decoded) => {
         if(err?.name === 'TokenExpiredError') return res.status(403).json('expired token')
         if(err?.name === 'JsonWebTokenError') return res.status(401).json('unauthorised')
         req.userId = decoded?.userInfo.userId
         req.username = decoded?.userInfo.username
      }
   )
   next()
}