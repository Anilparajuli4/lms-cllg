const express = require('express');
const { login, logout, register, updateProfile  } = require('../controller/authController');
const multer = require('multer');
const { authenticate } = require('../middleware/authMiddleware');


const router = express.Router();
const upload = multer({ dest: 'uploads/' });


router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout); // 👈
router.patch(
  '/updateProfile',
  authenticate,
  upload.single('profilePicture'), 
  updateProfile
);


module.exports = router;
