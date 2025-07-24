// routes/admin.js - Admin routes
const express = require('express');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Project = require('../models/Project');
const Analytics = require('../models/Analytics');
const auth = require('../middleware/auth');
const router = express.Router();

// Admin dashboard overview
router.get('/dashboard', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        const [
            totalUsers,
            totalContacts,
            totalProjects,
            recentContacts,
            recentAnalytics
        ] = await Promise.all([
            User.countDocuments({ isActive: true }),
            Contact.countDocuments(),
            Project.countDocuments({ status: { $ne: 'archived' } }),
            Contact.find().sort({ createdAt: -1 }).limit(5),
            Analytics.find({ type: 'page_view' })
                .sort({ createdAt: -1 })
                .limit(10)
                .select('path createdAt ipAddress')
        ]);
        
        // Get stats for the last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const weeklyStats = await Analytics.aggregate([
            {
                $match: {
                    createdAt: { $gte: weekAgo }
                }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        res.json({
            success: true,
            dashboard: {
                totals: {
                    users: totalUsers,
                    contacts: totalContacts,
                    projects: totalProjects
                },
                recent: {
                    contacts: recentContacts,
                    analytics: recentAnalytics
                },
                weeklyStats
            }
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            error: 'Failed to fetch dashboard data',
            code: 'DASHBOARD_ERROR'
        });
    }
});

// System health check
router.get('/health', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        const dbStatus = await checkDatabaseHealth();
        const memoryUsage = process.memoryUsage();
        
        res.json({
            success: true,
            health: {
                status: 'operational',
                uptime: process.uptime(),
                database: dbStatus,
                memory: {
                    used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
                    total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
                    rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB'
                },
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            error: 'Health check failed',
            code: 'HEALTH_CHECK_ERROR'
        });
    }
});

// Helper function to check database health
async function checkDatabaseHealth() {
    try {
        const mongoose = require('mongoose');
        const isConnected = mongoose.connection.readyState === 1;
        
        if (isConnected) {
            // Test a simple query
            await User.findOne().limit(1);
            return { status: 'connected', message: 'Database operational' };
        } else {
            return { status: 'disconnected', message: 'Database connection lost' };
        }
    } catch (error) {
        return { status: 'error', message: error.message };
    }
}

// Backup data
router.post('/backup', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        const [users, contacts, projects] = await Promise.all([
            User.find().select('-password'),
            Contact.find(),
            Project.find()
        ]);
        
        const backup = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            data: {
                users,
                contacts,
                projects
            }
        };
        
        res.json({
            success: true,
            backup,
            message: 'Backup created successfully'
        });
    } catch (error) {
        console.error('Backup error:', error);
        res.status(500).json({
            error: 'Backup failed',
            code: 'BACKUP_ERROR'
        });
    }
});

// Clear analytics data older than specified days
router.delete('/analytics/:days', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        const days = parseInt(req.params.days);
        if (isNaN(days) || days < 1) {
            return res.status(400).json({
                error: 'Invalid days parameter',
                code: 'INVALID_PARAMETER'
            });
        }
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const result = await Analytics.deleteMany({
            createdAt: { $lt: cutoffDate }
        });
        
        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} analytics records older than ${days} days`
        });
    } catch (error) {
        console.error('Analytics cleanup error:', error);
        res.status(500).json({
            error: 'Failed to clean analytics data',
            code: 'CLEANUP_ERROR'
        });
    }
});

module.exports = router;