const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Incident = require('../models/Incident');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/departments
// @desc    Get all departments
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true })
            .populate('head', 'name email')
            .populate('officers', 'name email');

        res.json({ success: true, count: departments.length, data: departments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/departments/:id
// @desc    Get single department
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('head', 'name email phone')
            .populate('officers', 'name email phone');

        if (!department) {
            return res.status(404).json({ success: false, error: 'Department not found' });
        }

        res.json({ success: true, data: department });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/departments
// @desc    Create department
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const department = await Department.create(req.body);
        res.status(201).json({ success: true, data: department });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!department) {
            return res.status(404).json({ success: false, error: 'Department not found' });
        }

        res.json({ success: true, data: department });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/departments/:id/workload
// @desc    Get department workload stats
// @access  Private (Official/Admin)
router.get('/:id/workload', protect, authorize('official', 'admin'), async (req, res) => {
    try {
        const departmentId = req.params.id;

        const stats = await Incident.aggregate([
            { $match: { assignedDepartment: require('mongoose').Types.ObjectId(departmentId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const severityStats = await Incident.aggregate([
            { $match: { assignedDepartment: require('mongoose').Types.ObjectId(departmentId) } },
            {
                $group: {
                    _id: '$severity',
                    count: { $sum: 1 }
                }
            }
        ]);

        const avgResponseTime = await Incident.aggregate([
            {
                $match: {
                    assignedDepartment: require('mongoose').Types.ObjectId(departmentId),
                    responseTime: { $exists: true }
                }
            },
            {
                $group: {
                    _id: null,
                    avg: { $avg: '$responseTime' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                byStatus: stats,
                bySeverity: severityStats,
                avgResponseTime: avgResponseTime[0]?.avg || 0
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/departments/:id/incidents
// @desc    Get all incidents for a department
// @access  Private (Official/Admin)
router.get('/:id/incidents', protect, authorize('official', 'admin'), async (req, res) => {
    try {
        const incidents = await Incident.find({ assignedDepartment: req.params.id })
            .populate('reportedBy', 'name email')
            .sort({ priority: -1, createdAt: -1 });

        res.json({ success: true, count: incidents.length, data: incidents });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/departments/contact
// @desc    Send a message to a department
// @access  Private
router.post('/contact', protect, async (req, res) => {
    try {
        const ContactMessage = require('../models/ContactMessage');
        const { department, subject, message, priority } = req.body;

        if (!department || !subject || !message) {
            return res.status(400).json({
                success: false,
                error: 'Department, subject, and message are required'
            });
        }

        const dept = await Department.findById(department);
        if (!dept) {
            return res.status(404).json({ success: false, error: 'Department not found' });
        }

        const contactMessage = await ContactMessage.create({
            from: req.user.id,
            department,
            subject,
            message,
            priority: priority || 'medium'
        });

        await contactMessage.populate('department', 'name code');
        await contactMessage.populate('from', 'name email');

        res.status(201).json({ success: true, data: contactMessage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/departments/contacts
// @desc    Get contact messages (officials see their dept, admins see all)
// @access  Private (Official/Admin)
router.get('/contacts', protect, authorize('official', 'admin'), async (req, res) => {
    try {
        const ContactMessage = require('../models/ContactMessage');
        let query = {};

        if (req.user.role === 'official' && req.user.department) {
            query.department = req.user.department;
        }

        const messages = await ContactMessage.find(query)
            .populate('from', 'name email phone')
            .populate('department', 'name code')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, count: messages.length, data: messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
