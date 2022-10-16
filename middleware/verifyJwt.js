const jwt = require('jsonwebtoken')

const verifyJwt = (req, res, next) => {
   const auth = req.headers.authorization || req.headers.Authorization 
   if(!auth?.startsWith('Bearer ')){
      return res.sendStatus(401)
   }
   const token = auth.split(' ')[1]
      //verify jwt
   jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      (err, decoded) => {
         if(err) return res.status(403).json({status: false, message: 'invalid token'})
         console.log(decoded)
         req.username = decoded.userInfo.username
         next()
      }
   )
}

module.exports = verifyJwt