const router = require('express').Router()
const authController = require('../controller/authController')

//Register
router.post('/register', authController.handleRegister)
//login
router.post('/login', authController.handleLogin)
router.get('/logout', authController.handleLogout)

module.exports = router