// middleware/enrollmentMiddleware.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkEnrollment(req, res, next) {
  const { id } = req.params; // course ID
  const userId = req.user.id;

  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: userId,
        courseId: id
      }
    });

    if (!enrollment) {
      return res.status(403).json({ error: "You must enroll in this course first" });
    }

    req.enrollment = enrollment;
    next();
  } catch (error) {
    console.error('Enrollment check error:', error);
    res.status(500).json({ error: "Error checking enrollment status" });
  }
}

module.exports = checkEnrollment;