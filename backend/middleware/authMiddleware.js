const jwt = require('jsonwebtoken');
require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const authenticate = async(req, res, next) => {
  const token = req.cookies.token; // get token from cookies



  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
       const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
      },
    });
     if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // Attach full user object to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = { authenticate, authorizeRoles };
