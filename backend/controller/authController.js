// authController.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('../service/cloudinary');

const prisma = new PrismaClient();
require('dotenv').config();

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role }
    });

    res.status(201).json({ message: "User registered", user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
      })
      .json({ message: "Login successful", user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const logout = (req, res) => {
  res.clearCookie('token').json({ message: "Logged out successfully" });
};




const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let profilePicture = req.user.profilePicture;

    // Check if file exists before accessing
    let profileUpload;
  if (req.file) {
  const filePath = req.file.path;

  // Upload to Cloudinary
  profileUpload = await cloudinary.uploader.upload(filePath, {
    folder: 'profiles',
  });

  profilePicture = profileUpload.secure_url;
}
    // Prepare update data
    const updateData = {
      name: name || req.user.name,
      email: email || req.user.email,
      profilePicture,
    };

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Check if email is being changed to one that already exists
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        role: true
      }
    });

    // Generate new token if email was changed
    let token;
    if (email && email !== req.user.email) {
      token = jwt.sign({ id: updatedUser.id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });

      // Optionally set the new token as an HttpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
    }

    res.json({ user: updatedUser, token });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// const profile = (req, res) => {
//   res.json({
//     message: 'User fetched successfully',// this will come from JWT payload
//   });
// }


module.exports = { register, login, logout, updateProfile }; 
