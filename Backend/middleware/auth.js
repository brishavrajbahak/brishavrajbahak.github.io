// middleware/auth.js - Authentication middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                error: 'Access token required',
                code: 'NO_TOKEN'
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'neon_city_secret_key');
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                error: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            error: 'Token verification failed',
            code: 'TOKEN_VERIFICATION_FAILED'
        });
    }
};

module.exports = auth;
