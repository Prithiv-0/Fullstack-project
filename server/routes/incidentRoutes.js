const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const Department = require('../models/Department');
const { body, validationResult, query } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const aiService = require('../services/aiService');
const routingService = require('../services/routingService');

// @route   GET /api/incidents
// @desc    Get all incidents (with filters)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query = {};

        // Filtering
        if (req.query.status) query.status = req.query.status;
        if (req.query.type) query.type = req.query.type;
        if (req.query.severity) query.severity = req.query.severity;

        // For citizens, only show their own incidents
        if (req.user.role === 'citizen') {
            query.reportedBy = req.user.id;
        }

        // For officials, show their department's incidents
        if (req.user.role === 'official' && req.user.department) {
            query.assignedDepartment = req.user.department;
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const incidents = await Incident.find(query)
            .populate('reportedBy', 'name email')
            .populate('assignedDepartment', 'name code')
            .populate('assignedOfficer', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Incident.countDocuments(query);

        res.json({
            success: true,
            count: incidents.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: incidents
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/incidents/:id
// @desc    Get single incident
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)
            .populate('reportedBy', 'name email phone')
            .populate('assignedDepartment', 'name code contact')
            .populate('assignedOfficer', 'name email phone')
            .populate('timeline.updatedBy', 'name role');

        if (!incident) {
            return res.status(404).json({ success: false, error: 'Incident not found' });
        }

        res.json({ success: true, data: incident });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/incidents
// @desc    Create new incident (report)
// @access  Private
router.post('/', protect, [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('type').isIn([
        'pothole', 'traffic', 'flooding', 'streetlight', 'garbage',
        'accident', 'water-leak', 'road-damage', 'public-safety',
        'noise', 'illegal-parking', 'sewage', 'other'
    ]).withMessage('Invalid incident type'),
    body('location.coordinates').isArray().withMessage('Location coordinates required'),
    body('location.address').notEmpty().withMessage('Address is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { title, description, type, location, media } = req.body;

        // AI Classification
        const aiClassification = aiService.classifyIncident({ title, description, type });

        // Auto-assign department
        const assignedDepartment = await routingService.assignDepartment(type);

        const incident = await Incident.create({
            title,
            description,
            type,
            location,
            media,
            reportedBy: req.user.id,
            severity: aiClassification.suggestedSeverity,
            priority: aiClassification.priority,
            aiClassification,
            assignedDepartment: assignedDepartment?._id,
            timeline: [{
                status: 'reported',
                comment: 'Incident reported by citizen',
                updatedBy: req.user.id
            }]
        });

        await incident.populate('assignedDepartment', 'name code');

        res.status(201).json({ success: true, data: incident });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   PUT /api/incidents/:id
// @desc    Update incident status/details/verification
// @access  Private (Official/Admin)
router.put('/:id', protect, authorize('official', 'admin'), async (req, res) => {
    try {
        let incident = await Incident.findById(req.params.id);

        if (!incident) {
            return res.status(404).json({ success: false, error: 'Incident not found' });
        }

        const { status, severity, priority, comment, assignedOfficer, verification } = req.body;

        // Update fields
        if (status) {
            incident.status = status;
            incident.timeline.push({
                status,
                comment: comment || `Status updated to ${status}`,
                updatedBy: req.user.id
            });

            // Calculate response/resolution time
            if (status === 'acknowledged' && !incident.responseTime) {
                incident.responseTime = Math.round((Date.now() - incident.createdAt) / 60000);
            }
            if (status === 'resolved') {
                incident.resolvedAt = Date.now();
                incident.resolutionTime = Math.round((Date.now() - incident.createdAt) / 60000);
            }
        }

        if (severity) incident.severity = severity;
        if (priority) incident.priority = priority;
        if (assignedOfficer) incident.assignedOfficer = assignedOfficer;

        // Handle verification data
        if (verification) {
            incident.verification = {
                ...incident.verification?.toObject?.() || {},
                ...verification,
                verifiedBy: req.user.id,
                verifiedAt: Date.now(),
                isVerified: true
            };

            // Update severity/type if confirmed during verification
            if (verification.confirmedSeverity) {
                incident.severity = verification.confirmedSeverity;
            }
            if (verification.confirmedType) {
                incident.type = verification.confirmedType;
            }

            // If verification is valid and status hasn't been manually set, auto-acknowledge
            if (verification.verificationStatus === 'verified-valid' && !status) {
                if (incident.status === 'reported') {
                    incident.status = 'acknowledged';
                    if (!incident.responseTime) {
                        incident.responseTime = Math.round((Date.now() - incident.createdAt) / 60000);
                    }
                }
            }

            // If invalid or duplicate, auto-reject
            if (['verified-invalid', 'duplicate'].includes(verification.verificationStatus) && !status) {
                incident.status = 'rejected';
            }

            incident.timeline.push({
                status: `verification-${verification.verificationStatus}`,
                comment: comment || `Incident verified as ${verification.verificationStatus}${verification.inspectionNotes ? ': ' + verification.inspectionNotes.substring(0, 100) : ''}`,
                updatedBy: req.user.id
            });
        }

        await incident.save();
        await incident.populate('assignedDepartment', 'name code');
        await incident.populate('assignedOfficer', 'name email');

        res.json({ success: true, data: incident });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   DELETE /api/incidents/:id
// @desc    Delete incident
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);

        if (!incident) {
            return res.status(404).json({ success: false, error: 'Incident not found' });
        }

        await incident.deleteOne();
        res.json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/incidents/:id/feedback
// @desc    Add feedback to resolved incident
// @access  Private (Citizen who reported)
router.post('/:id/feedback', protect, async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);

        if (!incident) {
            return res.status(404).json({ success: false, error: 'Incident not found' });
        }

        if (incident.reportedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        if (incident.status !== 'resolved' && incident.status !== 'closed') {
            return res.status(400).json({ success: false, error: 'Incident must be resolved first' });
        }

        incident.feedback = {
            rating: req.body.rating,
            comment: req.body.comment
        };

        await incident.save();
        res.json({ success: true, data: incident });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/incidents/nearby/:lat/:lng
// @desc    Get incidents near a location
// @access  Private
router.get('/nearby/:lat/:lng', protect, async (req, res) => {
    try {
        const { lat, lng } = req.params;
        const radius = req.query.radius || 5; // km

        const incidents = await Incident.find({
            'location.coordinates': {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radius * 1000 // convert to meters
                }
            }
        }).limit(50);

        res.json({ success: true, count: incidents.length, data: incidents });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
