const router = require('express').Router()
const authController = require('../controller/authController')
const {getNewAccessToken} = require('../middleware/verifyJwt')

//Register
router.post('/register', authController.handleRegister)
//login
router.post('/login', authController.handleLogin)
router.get('/logout', authController.handleLogout)

router.get('/refresh', getNewAccessToken)

module.exports = router