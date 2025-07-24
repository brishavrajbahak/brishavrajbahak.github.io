// routes/analytics.js - Analytics routes
const express = require('express');
const Analytics = require('../models/Analytics');
const auth = require('../middleware/auth');
const router = express.Router();

// Track page view
router.post('/track', async (req, res) => {
    try {
        const { type, path, metadata } = req.body;
        
        const analytics = new Analytics({
            type: type || 'page_view',
            path,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            referrer: req.get('Referer'),
            sessionId: req.get('X-Session-ID'),
            metadata
        });
        
        await analytics.save();
        
        res.json({
            success: true,
            message: 'Event tracked'
        });
    } catch (error) {
        console.error('Analytics tracking error:', error);
        res.status(500).json({
            error: 'Failed to track event',
            code: 'ANALYTICS_ERROR'
        });
    }
});

// Get analytics dashboard data (admin only)
router.get('/dashboard', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Page views over time
        const pageViews = await Analytics.aggregate([
            {
                $match: {
                    type: 'page_view',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    views: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        // Top pages
        const topPages = await Analytics.aggregate([
            {
                $match: {
                    type: 'page_view',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$path',
                    views: { $sum: 1 }
                }
            },
            { $sort: { views: -1 } },
            { $limit: 10 }
        ]);
        
        // Contact form submissions
        const contactSubmissions = await Analytics.aggregate([
            {
                $match: {
                    type: 'contact_form',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    submissions: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        // Project views
        const projectViews = await Analytics.aggregate([
            {
                $match: {
                    type: 'project_view',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$metadata.projectTitle',
                    views: { $sum: 1 }
                }
            },
            { $sort: { views: -1 } },
            { $limit: 10 }
        ]);
        
        // Total stats
        const totalViews = await Analytics.countDocuments({
            type: 'page_view',
            createdAt: { $gte: startDate }
        });
        
        const totalContacts = await Analytics.countDocuments({
            type: 'contact_form',
            createdAt: { $gte: startDate }
        });
        
        const uniqueVisitors = await Analytics.distinct('ipAddress', {
            createdAt: { $gte: startDate }
        });
        
        res.json({
            success: true,
            dashboard: {
                overview: {
                    totalViews,
                    totalContacts,
                    uniqueVisitors: uniqueVisitors.length,
                    period: `${days} days`
                },
                pageViews,
                topPages,
                contactSubmissions,
                projectViews
            }
        });
    } catch (error) {
        console.error('Analytics dashboard error:', error);
        res.status(500).json({
            error: 'Failed to fetch analytics',
            code: 'ANALYTICS_FETCH_ERROR'
        });
    }
});

// Get real-time stats
router.get('/realtime', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        const now = new Date();
        const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        const realtimeStats = await Analytics.aggregate([
            {
                $facet: {
                    lastHour: [
                        { $match: { createdAt: { $gte: lastHour } } },
                        { $group: { _id: '$type', count: { $sum: 1 } } }
                    ],
                    last24Hours: [
                        { $match: { createdAt: { $gte: last24Hours } } },
                        { $group: { _id: '$type', count: { $sum: 1 } } }
                    ],
                    activePages: [
                        { $match: { 
                            type: 'page_view',
                            createdAt: { $gte: lastHour } 
                        }},
                        { $group: { 
                            _id: '$path', 
                            count: { $sum: 1 },
                            lastVisit: { $max: '$createdAt' }
                        }},
                        { $sort: { count: -1 } },
                        { $limit: 5 }
                    ]
                }
            }
        ]);
        
        res.json({
            success: true,
            realtime: realtimeStats[0]
        });
    } catch (error) {
        console.error('Realtime analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch realtime stats',
            code: 'REALTIME_ERROR'
        });
    }
});

module.exports = router;
