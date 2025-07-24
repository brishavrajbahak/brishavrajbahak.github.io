// models/Project.js - Project model
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    fullDescription: {
        type: String,
        trim: true,
        maxlength: 2000
    },
    technologies: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        required: true,
        enum: ['web', 'mobile', 'desktop', 'ai', 'blockchain', 'other']
    },
    status: {
        type: String,
        enum: ['planning', 'development', 'completed', 'archived'],
        default: 'development'
    },
    featured: {
        type: Boolean,
        default: false
    },
    images: [{
        url: String,
        alt: String,
        isPrimary: Boolean
    }],
    links: {
        live: String,
        github: String,
        demo: String
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for searching and sorting
projectSchema.index({ title: 'text', description: 'text', technologies: 'text' });
projectSchema.index({ featured: -1, order: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);