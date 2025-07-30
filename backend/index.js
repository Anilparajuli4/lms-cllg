const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const authRoutes = require('./routes/authRoute');
const adminRoutes = require('./routes/adminRoute')
const courseRoutes = require('./routes/courseRoute');
const reviewRoutes = require('./routes/reviewRoute')
const { authenticate } = require('./middleware/authMiddleware');
const { default: axios } = require('axios');
require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();
app.use(cookieParser())
app.use(express.json());

app.use(cors(
  { 
   origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true, 
  }
))
 // ✅ important!

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);



app.get('/api/profile', authenticate, (req, res) => {
  res.json({ message: "Welcome!", user: req.user });
});

app.use('/api/courses', courseRoutes) 
app.use('/api/review', reviewRoutes)


app.post('/api/payment/initiate', authenticate, async (req, res) => {
  const { amount, courseId } = req.body;
  const userId = req.user.id;

  try {
    // Generate unique purchase order ID
    const purchaseOrderId = `LMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const payload = {
      return_url: `${process.env.FRONTEND_URL}/payment/callback`,
      website_url: process.env.FRONTEND_URL,
      amount: amount * 100, // Convert to paisa
      purchase_order_id: purchaseOrderId,
      purchase_order_name: `Course Enrollment - ${courseId}`,
      customer_info: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '9800000000' // Default test number
      }
    };

    const response = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/initiate/',
      payload,
      {
        headers: {
          Authorization: `Key c751831329d544e18671b93070216342`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Save payment record in database
    await prisma.payment.create({
      data: {
        pidx: response.data.pidx,
        amount: amount,
        status: 'INITIATED',
        userId: userId,
        courseId: courseId,
        purchaseOrderId: purchaseOrderId
      }
    });

    res.json({
      success: true,
      paymentUrl: response.data.payment_url,
      pidx: response.data.pidx
    });

  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error.message);
    res.status(400).json({
      success: false,
      error: 'Payment initiation failed',
      details: error.response?.data || error.message
    });
  }
});





// POST /api/khalti/verify
// Khalti Payment Callback Verification
app.get('/api/payment/verify', async (req, res) => {
  const { pidx } = req.query;

  try {
    // Verify with Khalti
    const verification = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          Authorization: `Key c751831329d544e18671b93070216342`,
          'Content-Type': 'application/json'
        }
      }
    );

    const paymentData = verification.data;

    // Only proceed if status is 'Completed'
    if (paymentData.status !== 'Completed') {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=${paymentData.status}`);
    }

    // Update payment record
    const payment = await prisma.payment.update({
      where: { pidx },
      data: {
        status: 'COMPLETED',
        transactionId: paymentData.transaction_id,
        verifiedAt: new Date()
      },
      include: {
        user: true,
        course: true
      }
    });

    // Create enrollment (remove 'amount' field — not part of model)
    await prisma.enrollment.create({
      data: {
        studentId: payment.userId,
        courseId: payment.courseId,
        paymentId: paymentData.transaction_id
      }
    });

    // Redirect to success page
    res.redirect(`${process.env.FRONTEND_URL}/payment/success?courseId=${payment.courseId}`);

  } catch (error) {
    console.log(error);
    
    console.error('Payment verification error:', error?.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=verification_error`);
  }
});



// Update your verify endpoint
// app.get('/api/payment/verify', async (req, res) => {
//   const { pidx } = req.query;

//   try {
//     // Verify with Khalti
//     const verification = await axios.post(
//       'https://dev.khalti.com/api/v2/epayment/lookup/',
//       { pidx },
//       {
//         headers: {
//           Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     const paymentData = verification.data;

//     if (paymentData.status !== 'Completed') {
//       return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=${paymentData.status}`);
//     }

//     // Update payment record
//     const payment = await prisma.payment.update({
//       where: { pidx },
//       data: {
//         status: 'COMPLETED',
//         transactionId: paymentData.transaction_id,
//         verifiedAt: new Date()
//       },
//       include: {
//         user: true,
//         course: true
//       }
//     });

//     // Check if enrollment already exists
//     const existingEnrollment = await prisma.enrollment.findFirst({
//       where: {
//         studentId: payment.userId,
//         courseId: payment.courseId
//       }
//     });

//     if (!existingEnrollment) {
//       // Create enrollment only if it doesn't exist
//       await prisma.enrollment.create({
//         data: {
//           studentId: payment.userId,
//           courseId: payment.courseId,
//           paymentId: paymentData.transaction_id,
//           amount: paymentData.total_amount / 100
//         }
//       });
//     }

//     res.redirect(`${process.env.FRONTEND_URL}/payment/success?courseId=${payment.courseId}`);

//   } catch (error) {
//     console.error('Payment verification error:', error);
//     res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=verification_error`);
//   }
// });


// app.get('/api/payment/verify', async (req, res) => {
//   const { pidx } = req.query;

//   try {
//     const verification = await axios.post(
//       'https://dev.khalti.com/api/v2/epayment/lookup/',
//       { pidx },
//       {
//         headers: {
//           Authorization: `Key c751831329d544e18671b93070216342`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     const paymentData = verification.data;

//     if (paymentData.status !== 'Completed') {
//       return res.status(400).json({
//         success: false,
//         message: `Payment not completed: ${paymentData.status}`,
//       });
//     }

//     const payment = await prisma.payment.update({
//       where: { pidx },
//       data: {
//         status: 'COMPLETED',
//         transactionId: paymentData.transaction_id,
//         verifiedAt: new Date(),
//       },
//       include: {
//         user: true,
//         course: true,
//       },
//     });

//     // Check if enrollment exists
//     let enrollment = await prisma.enrollment.findFirst({
//       where: {
//         studentId: payment.userId,
//         courseId: payment.courseId,
//       },
//       include: {
//         course: true,
  
//       },
//     });

//     if (!enrollment) {
//       enrollment = await prisma.enrollment.create({
//         data: {
//           studentId: payment.userId,
//           courseId: payment.courseId,
//           paymentId: paymentData.transaction_id,
//           amount: paymentData.total_amount / 100,
//         },
//         include: {
//           course: true,
    
//         },
//       });
//     }

//     res.json({
//       success: true, 
//       enrollment,
//     });
//   } catch (error) {
//     console.error('Payment verification error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal Server Error during payment verification',
//     });
//   }
// });


app.get('/api/enrollment', async (req, res) => {
  const { studentId, courseId } = req.query;

  if (!studentId || !courseId) {
    return res.status(400).json({ error: 'Missing studentId or courseId' });
  }

  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: studentId,
        courseId: courseId
      },
      include: {
        course: true,
       
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json({ enrollment });

  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({ error: 'Failed to fetch enrollment' });
  }
});



app.get('/api/users/enrolled-courses', authenticate, async (req, res) => {
  try {
   const userId = req.user.id

    const enrolledCourses = await prisma.enrollment.findMany({
      where: { studentId: userId },
   include: { course: true },
      orderBy: { createdAt: 'desc' }
    });

   

    res.json(enrolledCourses);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch enrolled courses' });
  }
});

// Get course progress
app.get('/api/courses/:courseId/progress', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id; // Get from authenticated user

    // Get all videos with basic info
    const videos = await prisma.video.findMany({
      where: { courseId },
      select: { 
        id: true,
        title: true,
        isIntro: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' } // Ensure consistent order
    });

    // Get user's progress
    const progress = await prisma.progress.findMany({
      where: { 
        courseId, 
        studentId: userId 
      },
      select: { 
        videoId: true,
        createdAt: true 
      }
    });

    // Map videos with completion status
    const videosWithProgress = videos.map(video => ({
      ...video,
      isCompleted: progress.some(p => p.videoId === video.id),
      lastWatched: progress.find(p => p.videoId === video.id)?.createdAt || null
    }));

    // Calculate overall progress
    const completedCount = videosWithProgress.filter(v => v.isCompleted).length;
    const totalCount = videos.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Find last watched video (most recent progress)
    const lastWatched = progress.length > 0 
      ? progress.reduce((latest, current) => 
          current.createdAt > latest.createdAt ? current : latest
        ) 
      : null;

    res.json({
      completedCount,
      totalCount,
      percentage,
      lastWatchedVideoId: lastWatched?.videoId || null,
      videos: videosWithProgress, // Send detailed video progress
      nextVideoId: videosWithProgress.find(v => !v.isCompleted)?.id || null
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch progress',
      details: error.message 
    });
  }
});


// [POST] /api/teacher-request - Student requests to become teacher
app.post('/api/teacher-request', async (req, res) => {
  const { userId, message } = req.body;

  try {
    const existing = await prisma.teacherRequest.findUnique({ where: { userId } });
    if (existing) {
      return res.status(400).json({ error: 'Request already submitted.' });
    }

    const request = await prisma.teacherRequest.create({
      data: { userId, message },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// [GET] /api/teacher-request - Admin: view all requests
app.get('/api/get-teacher-request', async (req, res) => {
  try {
    const requests = await prisma.teacherRequest.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
  
// [PUT] /api/teacher-request/:id - Admin approves or declines
// app.put('/api/teacher-request/:id', async (req, res) => {
//   const { id } = req.params; 
//   const { status } = req.body; // 'APPROVED' or 'DECLINED'

//   try {
//     const request = await prisma.teacherRequest.update({
//       where: { id },
//       data: {
//         status,
//         reviewedAt: new Date(),
//         user: status === 'APPROVED'
//           ? {
//               update: {
//                 role: 'TEACHER',
//               },
//             }
//           : undefined,
//       },
//       include: { user: true },
//     });

//     res.json(request);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

app.put('/api/teacher-request/:id', async (req, res) => {
  const { id } = req.params; 
  const { status } = req.body; // 'APPROVED' or 'DECLINED'

  try {
    // First get the current request to check the user's current role
    const currentRequest = await prisma.teacherRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    const request = await prisma.teacherRequest.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        user: {
          update: {
            role: status === 'APPROVED' 
              ? 'TEACHER' 
              : (currentRequest.user.role === 'TEACHER' ? 'STUDENT' : currentRequest.user.role)
          }
        }
      },
      include: { user: true },
    });

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
 