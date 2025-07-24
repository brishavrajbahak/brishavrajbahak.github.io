// routes/auth.js - Authentication routes
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists in the system',
                code: 'USER_EXISTS'
            });
        }
        
        // Create new user
        const user = new User({ username, email, password });
        await user.save();
        
        const token = user.generateToken();
        
        res.status(201).json({
            success: true,
            message: 'Welcome to the NeonCity network',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            code: 'REGISTRATION_ERROR'
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = await User.findOne({
            $or: [{ email: username }, { username }],
            isActive: true
        });
        
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }
        
        const token = user.generateToken();
        
        res.json({
            success: true,
            message: 'Neural link established',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        if (error.message === 'Account temporarily locked') {
            return res.status(423).json({
                error: 'Account locked. Try again later.',
                code: 'ACCOUNT_LOCKED'
            });
        }
        
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            code: 'LOGIN_ERROR'
        });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'Failed to get user data',
            code: 'USER_FETCH_ERROR'
        });
    }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', auth, (req, res) => {
    res.json({
        success: true,
        message: 'Neural link disconnected'
    });
});

module.exports = router;