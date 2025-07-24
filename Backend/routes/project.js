// routes/projects.js - Projects routes
const express = require('express');
const Project = require('../models/Project');
const Analytics = require('../models/Analytics');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all projects (public)
router.get('/', async (req, res) => {
    try {
        const featured = req.query.featured === 'true';
        const category = req.query.category;
        const limit = parseInt(req.query.limit) || 10;
        
        let query = { status: { $ne: 'archived' } };
        
        if (featured) {
            query.featured = true;
        }
        
        if (category) {
            query.category = category;
        }
        
        const projects = await Project.find(query)
            .sort({ featured: -1, order: 1, createdAt: -1 })
            .limit(limit)
            .select('-fullDescription');
        
        res.json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({
            error: 'Failed to fetch projects',
            code: 'PROJECTS_FETCH_ERROR'
        });
    }
});

// Get single project
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project || project.status === 'archived') {
            return res.status(404).json({
                error: 'Project not found',
                code: 'PROJECT_NOT_FOUND'
            });
        }
        
        // Increment view count
        project.views += 1;
        await project.save();
        
        // Track analytics
        const analytics = new Analytics({
            type: 'project_view',
            path: `/projects/${project._id}`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            metadata: { projectId: project._id, projectTitle: project.title }
        });
        
        await analytics.save();
        
        res.json({
            success: true,
            project
        });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({
            error: 'Failed to fetch project',
            code: 'PROJECT_FETCH_ERROR'
        });
    }
});

// Create project (admin only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        const project = new Project(req.body);
        await project.save();
        
        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            error: 'Failed to create project',
            code: 'PROJECT_CREATE_ERROR'
        });
    }
});

// Update project (admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!project) {
            return res.status(404).json({
                error: 'Project not found',
                code: 'PROJECT_NOT_FOUND'
            });
        }
        
        res.json({
            success: true,
            message: 'Project updated successfully',
            project
        });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({
            error: 'Failed to update project',
            code: 'PROJECT_UPDATE_ERROR'
        });
    }
});

// Delete project (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        const project = await Project.findByIdAndDelete(req.params.id);
        
        if (!project) {
            return res.status(404).json({
                error: 'Project not found',
                code: 'PROJECT_NOT_FOUND'
            });
        }
        
        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            error: 'Failed to delete project',
            code: 'PROJECT_DELETE_ERROR'
        });
    }
});

module.exports = router;
