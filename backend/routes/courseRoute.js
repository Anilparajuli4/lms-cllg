const express = require('express');
const { createCourse, getTeacherCourses, getCourse, getAllCourse, editCourse, deleteCourse,  } = require('../controller/courseController');
const multer = require('multer');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const checkEnrollment = require('../middleware/enrollmentMiddleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/create',  authenticate,  upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'videos' }]) , createCourse)
router.get('/getTeacherCourse',  authenticate,  getTeacherCourses)
router.get('/getCourse/:id',    getCourse)
router.get('/getAllCourse', getAllCourse)
router.put('/edit/:courseId', authenticate,  upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'videos' }]), editCourse)
// router.get('/trackProgress', trackProgress)
// router.get('/userProgress/:id', userProgress)
router.delete('/delete/:courseId', authenticate, deleteCourse)

module.exports = router;
