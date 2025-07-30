const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new review
const createReview = async (req, res) => {
  const { courseId, rating, comment } = req.body;
  console.log(req.user);
  
  const userId = req.user.id; // From authentication middleware

  try {
    // Check if user is enrolled in the course
    // const enrollment = await prisma.enrollment.findFirst({
    //   where: {
    //     studentId: userId,
    //     courseId: courseId,
    //   },
    // });

    // if (!enrollment) {
    //   return res.status(403).json({ error: 'You must be enrolled in the course to leave a review' });
    // }

    // Check if user already reviewed this course
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: userId,
        courseId: courseId,
      },
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this course' });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        courseId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Get all reviews for a course
const getCourseReviews = async (req, res) => {
  const { courseId } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: {
        courseId: courseId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get a single review by ID
const getReviewById = async (req, res) => {
  const { id } = req.params;

  try {
    const review = await prisma.review.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
};

// Update a review
const updateReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  try {
    // Check if review exists and belongs to the user
    const existingReview = await prisma.review.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (existingReview.userId !== userId) {
      return res.status(403).json({ error: 'You can only update your own reviews' });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const updatedReview = await prisma.review.update({
      where: {
        id: id,
      },
      data: {
        rating: rating !== undefined ? rating : existingReview.rating,
        comment: comment || existingReview.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if review exists and belongs to the user
    const existingReview = await prisma.review.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (existingReview.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    await prisma.review.delete({
      where: {
        id: id,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// Get average rating for a course
const getCourseAverageRating = async (req, res) => {
  const { courseId } = req.params;

  try {
    const result = await prisma.review.aggregate({
      where: {
        courseId: courseId,
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    res.json({
      averageRating: result._avg.rating || 0,
      });
  } catch (error) {
    console.error('Error calculating average rating:', error);
    res.status(500).json({ error: 'Failed to calculate average rating' });
  }
};

module.exports = {
  createReview,
  getCourseReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getCourseAverageRating,
};