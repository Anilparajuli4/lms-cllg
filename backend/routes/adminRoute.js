const express = require('express');
const {  updateCourseStatus, getAllCourses, getAllUsers, getSingleCourse } = require('../controller/adminController');
const router = express.Router();


// router.get('/teachers', getAllTeachers);
// router.get('/students', getAllStudents);
router.get('/allUsers', getAllUsers)
router.get('/allCourses', getAllCourses)
router.get('/courses/:id', getSingleCourse)
router.patch('/courses/:id/status', updateCourseStatus);

module.exports = router;
