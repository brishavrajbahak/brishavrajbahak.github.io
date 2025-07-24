// routes/contact.js - Contact form routes
const express = require('express');
const Contact = require('../models/Contact');
const Analytics = require('../models/Analytics');
const auth = require('../middleware/auth');
const router = express.Router();

// Submit contact form
router.post('/submit', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({
                error: 'Missing required fields',
                code: 'MISSING_FIELDS'
            });
        }
        
        // Simple spam detection
        const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'click here'];
        const isSpam = spamKeywords.some(keyword => 
            message.toLowerCase().includes(keyword)
        );
        
        const contact = new Contact({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject?.trim(),
            message: message.trim(),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            isSpam
        });
        
        await contact.save();
        
        // Track analytics
        const analytics = new Analytics({
            type: 'contact_form',
            path: '/contact',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            metadata: { contactId: contact._id }
        });
        
        await analytics.save();
        
        res.status(201).json({
            success: true,
            message: 'Message transmitted successfully',
            id: contact._id
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            error: 'Failed to send message',
            code: 'CONTACT_ERROR'
        });
    }
});

// Get all contacts (admin only)
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        const search = req.query.search;
        
        let query = {};
        
        if (status) {
            query.status = status;
        }
        
        if (search) {
            query.$text = { $search: search };
        }
        
        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Contact.countDocuments(query);
        
        res.json({
            success: true,
            contacts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            error: 'Failed to fetch contacts',
            code: 'CONTACTS_FETCH_ERROR'
        });
    }
});

// Update contact status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        const { status } = req.body;
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!contact) {
            return res.status(404).json({
                error: 'Contact not found',
                code: 'CONTACT_NOT_FOUND'
            });
        }
        
        res.json({
            success: true,
            contact
        });
    } catch (error) {
        console.error('Update contact error:', error);
        res.status(500).json({
            error: 'Failed to update contact',
            code: 'CONTACT_UPDATE_ERROR'
        });
    }
});

module.exports = router;
