/**
 * incidentRoutes.js - Incident Management API Routes
 *
 * Core CRUD and lifecycle management for urban incidents.
 *
 * Endpoints:
 *  POST   /                  - Submit a new incident (citizen, officer, admin)
 *  GET    /                  - List incidents with filters and pagination
 *  GET    /my                - Get incidents reported by the current user
 *  GET    /nearby            - Find incidents near a lat/lng coordinate
 *  GET    /:id               - Get single incident with assignment details
 *  PUT    /:id/verify        - Verify or reject an incident (admin, official)
 *  PUT    /:id/assign        - Assign incident to department/officer
 *  PUT    /:id/acknowledge   - Mark incident as in_progress (officer)
 *  PUT    /:id/resolve       - Submit resolution with proof (field_officer)
 *  PUT    /:id/close         - Close a resolved incident (admin only)
 *  DELETE /:id               - Soft-delete an incident (admin only)
 *  POST   /:id/feedback      - Submit citizen feedback on resolution
 *
 * After creation, incidents are asynchronously processed by the AI classification
 * service and auto-routed to the appropriate department via postIncidentCreation().
 */

const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const Assignment = require('../models/Assignment');
const ResolutionLog = require('../models/ResolutionLog');
const Department = require('../models/Department');
const { body, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const aiService = require('../services/aiService');
const routingService = require('../services/routingService');

// @route   POST /api/v1/incidents
// @desc    Submit new incident
// @access  citizen, field_officer, admin
router.post('/', authenticate, authorize('citizen', 'field_officer', 'admin'), [
    body('title').notEmpty().isLength({ min: 10 }).withMessage('Title required (min 10 chars)'),
    body('type').isIn([
        'pothole', 'traffic', 'flooding', 'streetlight', 'garbage',
        'accident', 'water_leak', 'road_damage', 'safety_issue',
        'noise', 'illegal_parking', 'sewage', 'other'
    ]).withMessage('Invalid incident type'),
    body('location.lat').isNumeric().withMessage('Latitude required'),
    body('location.lng').isNumeric().withMessage('Longitude required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg, details: errors.array() });
    }

    try {
        const { title, description, type, location, mediaUrls, severity, isEmergency } = req.body;

        const incident = await Incident.create({
            title, description, type, location, mediaUrls, severity, isEmergency,
            reportedBy: req.user.id,
            timeline: [{
                status: 'reported',
                comment: 'Incident reported by citizen',
                updatedBy: req.user.id
            }]
        });

        // Async: AI classification + department routing
        postIncidentCreation(incident._id).catch(err => console.error('Post-creation error:', err));

        await incident.populate('reportedBy', 'name email');

        res.status(201).json({ success: true, data: incident, message: 'Incident reported successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/incidents
// @desc    List all incidents with filters (admin, government_official)
router.get('/', authenticate, async (req, res) => {
    try {
        let filter = {};

        // Role-based filtering
        if (req.user.role === 'citizen') {
            filter.reportedBy = req.user.id;
        }

        // Query filters
        if (req.query.status) filter.status = req.query.status;
        if (req.query.type) filter.type = req.query.type;
        if (req.query.severity) filter.severity = req.query.severity;
        if (req.query.zone) filter['location.zone'] = req.query.zone;
        if (req.query.dateFrom || req.query.dateTo) {
            filter.createdAt = {};
            if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom);
            if (req.query.dateTo) filter.createdAt.$lte = new Date(req.query.dateTo);
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        const [incidents, total] = await Promise.all([
            Incident.find(filter)
                .populate('reportedBy', 'name email')
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)
                .lean(),
            Incident.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: incidents,
            total, page, limit,
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/incidents/my
// @desc    Get my reported incidents (citizen)
router.get('/my', authenticate, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [incidents, total] = await Promise.all([
            Incident.find({ reportedBy: req.user.id })
                .sort({ createdAt: -1 })
                .skip(skip).limit(limit).lean(),
            Incident.countDocuments({ reportedBy: req.user.id })
        ]);

        res.json({ success: true, data: incidents, total, page, limit });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/incidents/nearby
// @desc    Get incidents near lat/lng
router.get('/nearby', authenticate, async (req, res) => {
    try {
        const { lat, lng, radius = 5 } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ success: false, error: 'lat and lng query params required' });
        }

        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        const radiusKm = parseFloat(radius);
        const degreeRadius = radiusKm / 111.12;

        const incidents = await Incident.find({
            'location.lat': { $gte: latNum - degreeRadius, $lte: latNum + degreeRadius },
            'location.lng': { $gte: lngNum - degreeRadius, $lte: lngNum + degreeRadius }
        }).limit(50).lean();

        res.json({ success: true, count: incidents.length, data: incidents });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/incidents/:id
// @desc    Get single incident
router.get('/:id', authenticate, async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)
            .populate('reportedBy', 'name email phone')
            .populate('timeline.updatedBy', 'name role');

        if (!incident) {
            return res.status(404).json({ success: false, error: 'Incident not found' });
        }

        // Get assignment info
        const assignment = await Assignment.findOne({ incidentId: incident._id })
            .populate('departmentId', 'name shortName')
            .populate('officerId', 'name email phone')
            .lean();

        res.json({ success: true, data: { ...incident.toObject(), assignment } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   PUT /api/v1/incidents/:id/verify
// @desc    Verify / reject incident (admin, government_official)
router.put('/:id/verify', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            return res.status(404).json({ success: false, error: 'Incident not found' });
        }

        const { verificationStatus, severityOverride, notes } = req.body;

        if (verificationStatus === 'valid') {
            incident.isVerified = true;
            incident.isFalse = false;
            if (severityOverride) incident.severity = severityOverride;
            incident.status = 'acknowledged';
            incident.timeline.push({
                status: 'acknowledged',
                comment: notes || 'Incident verified as valid by admin',
                updatedBy: req.user.id
            });
        } else if (verificationStatus === 'false' || verificationStatus === 'duplicate') {
            incident.isFalse = true;
            incident.status = 'rejected';
            incident.timeline.push({
                status: 'rejected',
                comment: notes || `Incident marked as ${verificationStatus}`,
                updatedBy: req.user.id
            });
        }

        await incident.save();
        res.json({ success: true, data: incident, message: 'Incident verification updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   PUT /api/v1/incidents/:id/assign
// @desc    Assign to department and officer (admin, government_official)
router.put('/:id/assign', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            return res.status(404).json({ success: false, error: 'Incident not found' });
        }

        const {
            departmentId,
            officerId,
            priority,
            slaDeadline,
            notes,
            assignmentType,
            notifyReporter,
            referenceNumber
        } = req.body;

        const dept = await Department.findById(departmentId);
        if (!dept) {
            return res.status(404).json({ success: false, error: 'Department not found' });
        }

        // Create or update assignment
        let assignment = await Assignment.findOne({ incidentId: incident._id });
        const previousDepartmentId = assignment ? String(assignment.departmentId) : null;
        if (assignment) {
            assignment.departmentId = departmentId;
            assignment.officerId = officerId;
            assignment.assignedBy = req.user.id;
            assignment.slaDueBy = slaDeadline || new Date(Date.now() + dept.slaHours * 3600000);
            assignment.notes = notes;
            assignment.assignmentType = assignmentType || assignment.assignmentType;
            assignment.notifyReporter = typeof notifyReporter === 'boolean' ? notifyReporter : assignment.notifyReporter;
            assignment.referenceNumber = referenceNumber ?? assignment.referenceNumber;
            await assignment.save();
        } else {
            assignment = await Assignment.create({
                incidentId: incident._id,
                departmentId,
                officerId,
                assignedBy: req.user.id,
                slaDueBy: slaDeadline || new Date(Date.now() + dept.slaHours * 3600000),
                notes,
                assignmentType: assignmentType || 'manual',
                notifyReporter: Boolean(notifyReporter),
                referenceNumber: referenceNumber || ''
            });
        }

        if (priority) incident.severity = priority;
        incident.status = 'assigned';
        incident.timeline.push({
            status: 'assigned',
            comment: notes || `Assigned to ${dept.name}`,
            updatedBy: req.user.id
        });
        await incident.save();

        // Update department current load
        const departmentIdsToRefresh = new Set([String(departmentId)]);
        if (previousDepartmentId) {
            departmentIdsToRefresh.add(previousDepartmentId);
        }

        await Promise.all([...departmentIdsToRefresh].map(async (deptIdToRefresh) => {
            const activeCount = await Assignment.countDocuments({
                departmentId: deptIdToRefresh,
                status: { $in: ['pending', 'acknowledged', 'in_progress'] }
            });
            await Department.findByIdAndUpdate(deptIdToRefresh, { currentLoad: activeCount });
        }));

        res.json({ success: true, data: { incident, assignment }, message: 'Incident assigned successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   PUT /api/v1/incidents/:id/acknowledge
// @desc    Acknowledge receipt (field_officer, government_official)
router.put('/:id/acknowledge', authenticate, authorize('field_officer', 'government_official', 'admin'), async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            return res.status(404).json({ success: false, error: 'Incident not found' });
        }

        incident.status = 'in_progress';
        incident.timeline.push({
            status: 'in_progress',
            comment: req.body.notes || 'Incident acknowledged and work in progress',
            updatedBy: req.user.id
        });
        await incident.save();

        // Update assignment status
        await Assignment.findOneAndUpdate(
            { incidentId: incident._id },
            { status: 'in_progress' }
        );

        res.json({ success: true, data: incident, message: 'Incident acknowledged' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   PUT /api/v1/incidents/:id/resolve
// @desc    Update status, upload proof (field_officer)
router.put('/:id/resolve', authenticate, authorize('field_officer', 'admin'), async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            return res.status(404).json({ success: false, error: 'Incident not found' });
        }

        const {
            action,
            proofUrls,
            notes,
            resolutionStatus,
            category,
            timeSpentHours,
            requiresFollowUp,
            materialsUsed
        } = req.body;

        const statusBefore = incident.status;
        incident.status = resolutionStatus === 'cannot_resolve' ? 'in_progress' : 'resolved';
        incident.timeline.push({
            status: incident.status,
            comment: action || 'Resolution update',
            updatedBy: req.user.id
        });
        await incident.save();

        // Create resolution log
        const tta = incident.timeline.find(t => t.status === 'in_progress');
        const ttr = incident.status === 'resolved' ? Math.round((Date.now() - incident.createdAt) / 60000) : null;

        await ResolutionLog.create({
            incidentId: incident._id,
            officerId: req.user.id,
            action,
            proofUrls,
            notes,
            resolutionCategory: category,
            timeSpentHours,
            requiresFollowUp: Boolean(requiresFollowUp),
            materialsUsed,
            statusBefore,
            statusAfter: incident.status,
            tta: tta ? Math.round((new Date(tta.updatedAt) - incident.createdAt) / 60000) : null,
            ttr,
            isResolved: incident.status === 'resolved'
        });

        // Update assignment
        if (incident.status === 'resolved') {
            await Assignment.findOneAndUpdate(
                { incidentId: incident._id },
                { status: 'completed' }
            );
        } else {
            await Assignment.findOneAndUpdate(
                { incidentId: incident._id },
                {
                    status: 'escalated',
                    escalatedAt: new Date(),
                    $inc: { escalationCount: 1 }
                }
            );
        }

        res.json({ success: true, data: incident, message: 'Resolution update recorded' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   PUT /api/v1/incidents/:id/close
// @desc    Close resolved incident (admin only)
router.put('/:id/close', authenticate, authorize('admin'), async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            return res.status(404).json({ success: false, error: 'Incident not found' });
        }

        incident.status = 'closed';
        incident.timeline.push({
            status: 'closed',
            comment: req.body.notes || 'Incident closed by admin',
            updatedBy: req.user.id
        });
        await incident.save();

        res.json({ success: true, data: incident, message: 'Incident closed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   DELETE /api/v1/incidents/:id
// @desc    Soft-delete (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            return res.status(404).json({ success: false, error: 'Incident not found' });
        }

        incident.status = 'rejected';
        incident.isFalse = true;
        await incident.save();

        res.json({ success: true, data: {}, message: 'Incident soft-deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/v1/incidents/:id/feedback (backward compat)
router.post('/:id/feedback', authenticate, async (req, res) => {
    try {
        const Feedback = require('../models/Feedback');
        const incident = await Incident.findById(req.params.id);
        if (!incident) return res.status(404).json({ success: false, error: 'Incident not found' });
        if (incident.reportedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const feedback = await Feedback.create({
            incidentId: incident._id,
            citizenId: req.user.id,
            rating: req.body.rating,
            comments: req.body.comments || req.body.comment,
            responseSatisfaction: req.body.responseSatisfaction,
            resolvedSatisfaction: req.body.resolvedSatisfaction,
            easeOfUse: req.body.easeOfUse,
            resolutionSatisfaction: req.body.resolutionSatisfaction,
            communicationClarity: req.body.communicationClarity,
            wouldRecommend: req.body.wouldRecommend,
            followUpRequested: req.body.followUpRequested
        });

        res.status(201).json({ success: true, data: feedback });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Async post-creation trigger (AI classify + dept routing)
async function postIncidentCreation(incidentId) {
    try {
        const incident = await Incident.findById(incidentId);
        if (!incident) return;

        // AI classification
        const classification = await aiService.classifyIncident(incident);

        // Store intelligence
        const IncidentIntelligence = require('../models/IncidentIntelligence');
        await IncidentIntelligence.findOneAndUpdate(
            { incidentId },
            { incidentId, ...classification, processedAt: new Date() },
            { upsert: true, new: true }
        );

        // Update incident with AI results
        await Incident.findByIdAndUpdate(incidentId, {
            severity: classification.priorityTag || classification.suggestedSeverity || incident.severity,
            aiProcessed: true
        });

        // Auto-route to department
        const dept = await routingService.assignDepartment(incident.type);
        if (dept) {
            await routingService.createAssignment(incidentId, dept._id);
        }
    } catch (err) {
        console.error('Post-incident creation error:', err);
    }
}

module.exports = router;
