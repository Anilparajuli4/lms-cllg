 const express = require('express');
const router = express.Router();


const { createReview, getCourseReviews, getCourseAverageRating } = require('../controller/review.controller');
const { authenticate } = require('../middleware/authMiddleware');


// Create a review (authenticated users only)
router.post('/create', authenticate,   createReview);

// Get all reviews for a course
router.get('/course/:courseId', getCourseReviews);
router.get('/average/:courseId', getCourseAverageRating)

// Get average rating for a course
// router.get('/course/:courseId/average', getCourseAverageRating);

// // Get a single review
// router.get('/:id', getReviewById);

// // Update a review (only review owner or admin)
// router.put('/:id', authenticate, updateReview);

// // Delete a review (only review owner or admin)
// router.delete('/:id', authenticate, deleteReview);

module.exports = router;