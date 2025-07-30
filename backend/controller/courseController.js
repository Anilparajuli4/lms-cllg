const { PrismaClient } = require('@prisma/client');
const cloudinary = require('../service/cloudinary');




const prisma = new PrismaClient();
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, price } = req.body;
    const teacherId = '2d1c2683-d0ef-46de-9be0-8f63c0cba7a6';

    const thumbnailPath = req.files.thumbnail[0].path;
    const thumbnailUpload = await cloudinary.uploader.upload(thumbnailPath, {
      folder: 'thumbnails',
    });

    const videoUploads = await Promise.all(
      req.files.videos.map((video, index) =>
        cloudinary.uploader.upload(video.path, {
          resource_type: 'video',
          folder: 'videos',
        }).then(upload => ({
          title: `Video ${index + 1}`,
          url: upload.secure_url,
          isIntro: index === 0,
        }))
      )
    );

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        price: parseFloat(price),
        thumbnailUrl: thumbnailUpload.secure_url,
        teacherId,
        videos: {
          create: videoUploads,
        },
      },
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error });
    console.log(error.message);
    
  }
};

exports.getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    console.log('hello');
    
    const courses = await prisma.course.findMany({
      where: { teacherId },
      // include: {
      //   adminReview: true,
      //   videos: true,
      // },
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // First delete all related videos
    await prisma.video.deleteMany({
      where: {
        courseId: courseId,
      },
    });

    // Now delete the course
    await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    res.status(200).json({ message: 'Course and related videos deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};


// exports.getAllCourse = async (req, res) => {
//   const { search } = req.query;
//   const courses = await prisma.course.findMany({
//     where: {
//       status: 'APPROVED',
//       ...(search && {
//         title: { contains: search, mode: 'insensitive' },
//       }),
//     },
//     include: {
//       teacher: true,
//     },
//   });
//   res.json(courses);
// };


exports.getAllCourse = async (req, res) => {
  const { search } = req.query;
  try {
    const courses = await prisma.course.findMany({
      where: {
        status: 'APPROVED',
        ...(search && {
          title: { contains: search, mode: 'insensitive' },
        }),
      },
      include: {
        teacher: true,
        videos: true,
        reviews: {
          include: {
            user: true,  // to include user info for each review
          },
        },
        enrollments: {
          include: {
            student: true,  // to include student info for each enrollment
          },
        },
      },
    });
    res.json(courses);
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};





// 2. Get single course with videos
exports.getCourse= async (req, res) => {
  const { id } = req.params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      videos: true,
      teacher: true,
    },
  });
  res.json(course);
};

// 3. Enroll in a course (simulate payment)
 exports.entollCourse = async (req, res) => {
  const { id: courseId } = req.params;
  const { studentId, paymentId } = req.body;

  const enrollment = await prisma.enrollment.create({
    data: { courseId, studentId, paymentId },
  });

  res.status(201).json(enrollment);
};

exports.getCourseDetail = async (req, res) => {
  const courseId = req.params.id;

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        videos: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true } }
          },
        },
      },
    });

    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.status(200).json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};



exports.markProgress = async (req, res) => {
  const { courseId, videoId } = req.params;
  const userId = req.user?.id;

  try {
    // Check if already marked
    const existing = await prisma.progress.findFirst({
      where: { studentId: userId, courseId, videoId },
    });

    if (existing) {
      return res.status(200).json({ message: 'Video already marked as watched.' });
    }

    const progress = await prisma.progress.create({
      data: { studentId: userId, courseId, videoId },
    });

    res.status(201).json({ message: 'Progress marked.', progress });
  } catch (error) {
    console.error('Error marking progress:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get progress for a course
exports.getProgress = async (req, res) => {
  const courseId = req.params.courseId;
  const userId = req.user?.id;

  try {
    const totalVideos = await prisma.video.count({
      where: { courseId },
    });

    const watchedVideos = await prisma.progress.findMany({
      where: {
        courseId,
        studentId: userId,
      },
      select: {
        videoId: true,
      },
    });

    const progressPercent = totalVideos > 0
      ? (watchedVideos.length / totalVideos) * 100
      : 0;

    res.status(200).json({
      watchedVideoIds: watchedVideos.map(v => v.videoId),
      totalVideos,
      watchedCount: watchedVideos.length,
      progressPercent: Math.round(progressPercent),
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};



exports.createOrUpdateReview = async (req, res) => {
  const courseId = req.params.courseId;
  const userId = req.user?.id;
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ message: 'Rating and comment are required.' });
  }

  try {
    // Check enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId: userId, courseId },
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Only enrolled users can leave a review.' });
    }

    const existingReview = await prisma.review.findFirst({
      where: { userId, courseId },
    });

    let review;
    if (existingReview) {
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, comment },
      });
    } else {
      review = await prisma.review.create({
        data: { rating, comment, userId, courseId },
      });
    }

    res.status(200).json({ message: 'Review saved.', review });
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};



// Get all reviews for a course
exports.getCourseReviews = async (req, res) => {
  const courseId = req.params.courseId;

  try {
    const reviews = await prisma.review.findMany({
      where: { courseId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const average = await prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: true,
    });

    res.status(200).json({
      averageRating: average._avg.rating ?? 0,
      totalReviews: average._count,
      reviews,
    });
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  const courseId = req.params.courseId;
  const userId = req.user?.id;

  try {
    const review = await prisma.review.findFirst({
      where: { courseId, userId },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    await prisma.review.delete({ where: { id: review.id } });
    res.status(200).json({ message: 'Review deleted.' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};



exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if course exists and is approved
    const course = await Course.findOne({
      _id: courseId,
      status: 'APPROVED' // Only allow enrollment in approved courses
    });

    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found or not approved for enrollment'
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: userId,
      courseId: courseId
    });

    if (existingEnrollment) {
      return res.status(200).json({ 
        success: true,
        message: 'You are already enrolled in this course',
        enrollment: existingEnrollment
      });
    }

    // Create new enrollment without payment details
    const enrollment = new Enrollment({
      studentId: userId,
      courseId: courseId,
      // No paymentId for manual enrollment
      enrolledAt: new Date()
    });

    await enrollment.save();

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      enrollment
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error enrolling in course',
      error: error.message 
    });
  }
};

exports.checkEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({
      studentId: userId,
      courseId: courseId
    });

    res.json({
      success: true,
      isEnrolled: !!enrollment,
      enrollment: enrollment || null
    });

  } catch (error) {
    console.error('Enrollment check error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error checking enrollment status',
      error: error.message 
    });
  }
};

// exports.editCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const { title, description, category } = req.body;
//     const teacherId = req.user.id; // Assuming teacher ID comes from authenticated user

//     // First, verify the course exists and belongs to the teacher
//     const existingCourse = await prisma.course.findFirst({
//       where: {
//         id: courseId,
//         teacherId: teacherId
//       },
//       include: {
//         videos: true
//       }
//     });

//     if (!existingCourse) {
//       return res.status(404).json({ error: 'Course not found or unauthorized' });
//     }

//     // Prepare update data
//     const updateData = {
//       title,
//       description,
//       category
//     };

//     // Handle thumbnail update if provided
//     if (req.files?.thumbnail) {
//       // First delete old thumbnail from Cloudinary if it exists
//       if (existingCourse.thumbnailUrl) {
//         const publicId = existingCourse.thumbnailUrl.split('/').pop().split('.')[0];
//         await cloudinary.uploader.destroy(`thumbnails/${publicId}`);
//       }

//       // Upload new thumbnail
//       const thumbnailPath = req.files.thumbnail[0].path;
//       const thumbnailUpload = await cloudinary.uploader.upload(thumbnailPath, {
//         folder: 'thumbnails',
//       });
//       updateData.thumbnailUrl = thumbnailUpload.secure_url;
//     }

//     // Handle video updates if provided
//     if (req.files?.videos) {
//       // First delete all existing videos from Cloudinary and database
//       await Promise.all(
//         existingCourse.videos.map(async (video) => {
//           const publicId = video.url.split('/').pop().split('.')[0];
//           await cloudinary.uploader.destroy(`videos/${publicId}`, {
//             resource_type: 'video'
//           });
//         })
//       );

//       await prisma.video.deleteMany({
//         where: {
//           courseId: courseId
//         }
//       });

//       // Upload new videos
//       const videoUploads = await Promise.all(
//         req.files.videos.map((video, index) =>
//           cloudinary.uploader.upload(video.path, {
//             resource_type: 'video',
//             folder: 'videos',
//           }).then(upload => ({
//             title: `Video ${index + 1}`,
//             url: upload.secure_url,
//             isIntro: index === 0,
//           }))
//         )
//       );

//       updateData.videos = {
//         create: videoUploads
//       };
//     }

//     // Update the course
//     const updatedCourse = await prisma.course.update({
//       where: {
//         id: courseId
//       },
//       data: updateData,
//       include: {
//         videos: true
//       }
//     });

//     res.status(200).json(updatedCourse);
//   } catch (error) {
//     console.error('Error editing course:', error);
//     res.status(500).json({ error: 'Failed to edit course' });
//   }
// };


exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, category, price } = req.body;
    const teacherId = req.user.id;

    // Validate required parameters
    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Validate request body
    if (!title && !description && !category && !req.files?.thumbnail && !req.files?.videos) {
      return res.status(400).json({ error: 'No update data provided' });
    }

    // Verify course exists and belongs to teacher
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: { videos: true }
    });

    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (existingCourse.teacherId !== teacherId) {
      return res.status(403).json({ error: 'Unauthorized to edit this course' });
    }

    // Prepare update data
    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(category && { category }),
      ...(price !== undefined && { price: parseFloat(price) }),
      updatedAt: new Date()
    };

    // Handle thumbnail update
    if (req.files?.thumbnail) {
      try {
        // Delete old thumbnail if exists
        if (existingCourse.thumbnailUrl) {
          const publicId = existingCourse.thumbnailUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`thumbnails/${publicId}`);
        }

        // Upload new thumbnail
        const thumbnailPath = req.files.thumbnail[0].path;
        const thumbnailUpload = await cloudinary.uploader.upload(thumbnailPath, {
          folder: 'thumbnails',
        });
        updateData.thumbnailUrl = thumbnailUpload.secure_url;
      } catch (error) {
        console.error('Thumbnail update error:', error);
        return res.status(500).json({ error: 'Failed to update thumbnail' });
      }
    }

    // Handle video updates
    if (req.files?.videos) {
      try {
        // Delete existing videos
        await Promise.all(
          existingCourse.videos.map(async (video) => {
            try {
              const publicId = video.url.split('/').pop().split('.')[0];
              await cloudinary.uploader.destroy(`videos/${publicId}`, {
                resource_type: 'video'
              });
            } catch (error) {
              console.error(`Error deleting video ${video.id}:`, error);
            }
          })
        );

        await prisma.video.deleteMany({
          where: { courseId }
        });

        // Upload new videos
        const videoUploads = await Promise.all(
          req.files.videos.map(async (video, index) => {
            try {
              const upload = await cloudinary.uploader.upload(video.path, {
                resource_type: 'video',
                folder: 'videos',
              });
              return {
                title: `Video ${index + 1}`,
                url: upload.secure_url,
                isIntro: index === 0,
                duration: 0 // You might want to calculate actual duration
              };
            } catch (error) {
              console.error(`Error uploading video ${index}:`, error);
              throw error;
            }
          })
        );

        updateData.videos = {
          create: videoUploads
        };
      } catch (error) {
        console.error('Video update error:', error);
        return res.status(500).json({ error: 'Failed to update videos' });
      }
    }

    // Update the course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: { videos: true }
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse
    });

  } catch (error) {
    console.error('Error editing course:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};