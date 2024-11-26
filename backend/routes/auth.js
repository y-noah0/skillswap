const express = require('express')
const userController = require('../controllers/userControllers')
const router = express.Router()

router.post('/signup', userController.post_signup)
router.post('/signin', userController.post_signin)
router.get('/logout',userController.logout)


module.exports = router