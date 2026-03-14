const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Assignment = require('../models/Assignment');
const Incident = require('../models/Incident');
const User = require('../models/User');
const ContactMessage = require('../models/ContactMessage');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const routingService = require('../services/routingService');

// @route   GET /api/v1/departments
// @desc    List all departments
router.get('/', authenticate, async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true })
            .select('-officers')
            .lean();
        res.json({ success: true, data: departments });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/departments/:id
// @desc    Get single department with workload
router.get('/:id', authenticate, async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('officers', 'name email phone role');
        if (!department) {
            return res.status(404).json({ success: false, error: 'Department not found' });
        }

        // Get workload stats
        const [activeAssignments, totalAssignments, completedAssignments] = await Promise.all([
            Assignment.countDocuments({ departmentId: req.params.id, status: { $in: ['pending', 'acknowledged', 'in_progress'] } }),
            Assignment.countDocuments({ departmentId: req.params.id }),
            Assignment.countDocuments({ departmentId: req.params.id, status: 'completed' })
        ]);

        res.json({
            success: true,
            data: {
                ...department.toObject(),
                workload: {
                    active: activeAssignments,
                    total: totalAssignments,
                    completed: completedAssignments,
                    resolutionRate: totalAssignments > 0 ? +((completedAssignments / totalAssignments) * 100).toFixed(1) : 0
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/v1/departments
// @desc    Create department
// @access  admin
router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const department = await Department.create(req.body);
        res.status(201).json({ success: true, data: department });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   PUT /api/v1/departments/:id
// @desc    Update department
// @access  admin
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true
        });
        if (!department) {
            return res.status(404).json({ success: false, error: 'Department not found' });
        }
        res.json({ success: true, data: department });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/departments/:id/officers
// @desc    Get department officers
router.get('/:id/officers', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('officers', 'name email phone role zone');
        if (!department) {
            return res.status(404).json({ success: false, error: 'Department not found' });
        }
        res.json({ success: true, data: department.officers });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/v1/departments/:id/officers
// @desc    Add officer to department
// @access  admin
router.post('/:id/officers', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { officerId } = req.body;
        if (!officerId) return res.status(400).json({ success: false, error: 'officerId required' });

        const user = await User.findById(officerId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        if (!['field_officer', 'government_official'].includes(user.role)) {
            return res.status(400).json({ success: false, error: 'User must be an officer' });
        }

        const department = await Department.findById(req.params.id);
        if (!department) return res.status(404).json({ success: false, error: 'Department not found' });

        if (!department.officers.includes(officerId)) {
            department.officers.push(officerId);
            await department.save();
        }

        // Link user to department
        await User.findByIdAndUpdate(officerId, { department: department._id });

        res.json({ success: true, data: department, message: 'Officer added' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/departments/workload/all
// @desc    Get all department workloads
router.get('/workload/all', authenticate, authorize('admin'), async (req, res) => {
    try {
        const workloads = await routingService.getDepartmentWorkloads();
        res.json({ success: true, data: workloads });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/departments/:id/incidents
// @desc    Get incidents assigned to department
router.get('/:id/incidents', authenticate, authorize('admin', 'government_official', 'field_officer'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const assignments = await Assignment.find({ departmentId: req.params.id })
            .populate({
                path: 'incidentId',
                populate: { path: 'reportedBy', select: 'name email' }
            })
            .sort({ assignedAt: -1 })
            .skip((page - 1) * limit).limit(limit).lean();

        const incidents = assignments.map(a => ({
            ...a.incidentId,
            assignmentStatus: a.status,
            slaDueBy: a.slaDueBy,
            assignedAt: a.assignedAt
        }));

        const total = await Assignment.countDocuments({ departmentId: req.params.id });

        res.json({ success: true, data: incidents, total, page, limit });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/v1/departments/:id/contact
// @desc    Send message to department
router.post('/:id/contact', authenticate, async (req, res) => {
    try {
        const {
            subject,
            message,
            priority,
            preferredContactMethod,
            requestCallback,
            urgentRequest,
            attachmentUrls
        } = req.body;
        if (!subject || !message) {
            return res.status(400).json({ success: false, error: 'Subject and message required' });
        }

        const msg = await ContactMessage.create({
            from: req.user.id,
            department: req.params.id,
            subject,
            message,
            priority: priority || 'medium',
            preferredContactMethod: preferredContactMethod || 'email',
            requestCallback: Boolean(requestCallback),
            urgentRequest: Boolean(urgentRequest),
            attachmentUrls: Array.isArray(attachmentUrls) ? attachmentUrls.filter(Boolean) : []
        });

        res.status(201).json({ success: true, data: msg });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
