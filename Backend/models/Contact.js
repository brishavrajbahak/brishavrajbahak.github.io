// models/Contact.js - Contact form model
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    subject: {
        type: String,
        trim: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    status: {
        type: String,
        enum: ['new', 'read', 'replied', 'archived'],
        default: 'new'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    isSpam: {
        type: Boolean,
        default: false
    },
    reply: {
        message: String,
        sentAt: Date,
        sentBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
}, {
    timestamps: true
});

// Index for searching
contactSchema.index({ name: 'text', email: 'text', message: 'text' });

module.exports = mongoose.model('Contact', contactSchema);
