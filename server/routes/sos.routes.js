const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const Incident = require('../models/Incident');
const Assignment = require('../models/Assignment');
const Department = require('../models/Department');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @route   POST /api/v1/sos
// @desc    Submit emergency SOS
// @access  citizen, field_officer, admin
router.post('/', authenticate, authorize('citizen', 'field_officer', 'admin'), async (req, res) => {
    try {
        const { emergencyType, description, location } = req.body;

        if (!location || !location.lat || !location.lng) {
            return res.status(400).json({ success: false, error: 'Location with lat/lng required' });
        }

        // Create critical incident
        const incident = await Incident.create({
            title: `SOS: ${emergencyType || 'Emergency'}`,
            description: description || 'Emergency SOS alert',
            type: emergencyType === 'accident' ? 'accident' : 'safety_issue',
            location: {
                lat: location.lat,
                lng: location.lng,
                address: location.address || 'SOS Location',
                area: location.area || '',
                zone: location.zone || ''
            },
            severity: 'critical',
            status: 'reported',
            reportedBy: req.user.id,
            source: 'citizen_app',
            timeline: [{
                status: 'reported',
                comment: 'Emergency SOS alert submitted',
                updatedBy: req.user.id
            }]
        });

        // Auto-assign to City Police
        const policeDept = await Department.findOne({ shortName: 'POLICE' });
        if (policeDept) {
            await Assignment.create({
                incidentId: incident._id,
                departmentId: policeDept._id,
                slaDueBy: new Date(Date.now() + 1 * 3600000), // 1 hour SLA
                notes: 'Emergency SOS - immediate response required'
            });
        }

        // Notify all admins
        const admins = await User.find({ role: 'admin', isActive: true }).select('_id').lean();
        const notifications = admins.map(admin => ({
            recipientId: admin._id,
            incidentId: incident._id,
            channel: 'in_app',
            subject: 'SOS ALERT',
            message: `Emergency SOS: ${emergencyType || 'Emergency'} at ${location.address || 'unknown location'}`,
            status: 'sent',
            sentAt: new Date()
        }));
        if (notifications.length) await Notification.insertMany(notifications);

        res.status(201).json({
            success: true,
            data: incident,
            message: 'SOS alert sent. Emergency services have been notified.'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/sos/active
// @desc    View all active SOS alerts
// @access  admin
router.get('/active', authenticate, authorize('admin'), async (req, res) => {
    try {
        const sosIncidents = await Incident.find({
            severity: 'critical',
            title: { $regex: /^SOS:/i },
            status: { $nin: ['resolved', 'closed'] }
        }).populate('reportedBy', 'name phone email')
            .sort({ createdAt: -1 }).lean();

        res.json({ success: true, data: sosIncidents, total: sosIncidents.length });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
