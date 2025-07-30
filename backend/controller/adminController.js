const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 📚 Get all courses with teacher info
const getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        teacher: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// 🛠️ Update course status (APPROVED or REJECTED)
const updateCourseStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminMessage } = req.body;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        status,
        adminMessage: adminMessage || null
      }
    });
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ error: "Failed to update course status" });
  }
};

// 👤 Get all teachers and students
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["TEACHER", "STUDENT"]
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: {
        name: "asc"
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};


const getSingleCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        videos: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
};



module.exports = {
  getAllCourses,
  updateCourseStatus,
  getSingleCourse,
  getAllUsers // 👈 make sure to export this function too
};
