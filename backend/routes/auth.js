const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport'); // Add this import
const User = require('../models/user');
const router = express.Router();

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sign up with email/password
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (name.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12; // Increased from 10 for better security
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      authMethod: 'email'
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Sign in with email/password
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Find user (case-insensitive email search)
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check if user signed up with Google (no password)
    if (!user.password) {
      return res.status(400).json({ 
        error: 'This account was created with Google. Please sign in with Google.' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Sign in successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// Get current user (protected route)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Google OAuth - Start authentication
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/auth/error`);
    }
  }
);

module.exports = router;