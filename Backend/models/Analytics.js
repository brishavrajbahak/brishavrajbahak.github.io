// models/Analytics.js - Analytics model
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['page_view', 'project_view', 'contact_form', 'download', 'click']
    },
    path: {
        type: String,
        required: true
    },
    userAgent: String,
    ipAddress: String,
    referrer: String,
    country: String,
    city: String,
    device: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet']
    },
    browser: String,
    sessionId: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Index for querying
analyticsSchema.index({ type: 1, createdAt: -1 });
analyticsSchema.index({ path: 1, createdAt: -1 });
analyticsSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);