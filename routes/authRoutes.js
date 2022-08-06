const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController.js');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/verifyEmail', authController.verifyEmail);

router.post('/forgotPassword', authController.sendResetPasswordLink);
router.post('/forgotPassword/reset/:token', authController.resetPassword);


module.exports = router;