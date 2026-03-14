const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const Incident = require('../models/Incident');
const Assignment = require('../models/Assignment');
const Department = require('../models/Department');
const ResolutionLog = require('../models/ResolutionLog');
const Feedback = require('../models/Feedback');
const RiskForecast = require('../models/RiskForecast');

// @route   POST /api/v1/reports/generate
router.post('/generate', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const { reportType, filters = {} } = req.body;
        const { dateFrom, dateTo, zone, type, deptId } = filters;

        const match = {};
        if (dateFrom || dateTo) {
            match.createdAt = {};
            if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
            if (dateTo) match.createdAt.$lte = new Date(dateTo);
        }
        if (zone && zone !== 'all') match['location.zone'] = zone;
        if (type && type !== 'all') match.type = type;

        let data;
        switch (reportType) {
            case 'active-incidents':
                data = await Incident.find({ ...match, status: { $nin: ['resolved', 'closed', 'rejected'] } }).lean();
                break;
            case 'incident-type-distribution':
                data = await Incident.aggregate([{ $match: match }, { $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
                break;
            case 'severity-priority':
                data = await Incident.find({ ...match, severity: { $in: ['critical', 'high'] } }).sort({ createdAt: -1 }).lean();
                break;
            case 'dept-workload':
                data = await Assignment.aggregate([
                    { $group: { _id: '$departmentId', total: { $sum: 1 }, pending: { $sum: { $cond: [{ $in: ['$status', ['pending', 'acknowledged', 'in_progress']] }, 1, 0] } } } },
                    { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
                    { $unwind: '$dept' },
                    { $project: { name: '$dept.name', total: 1, pending: 1 } }
                ]);
                break;
            case 'response-time':
                data = await ResolutionLog.aggregate([
                    { $group: { _id: null, avgTTA: { $avg: '$tta' }, avgTTR: { $avg: '$ttr' }, count: { $sum: 1 } } }
                ]);
                break;
            case 'hotspot':
                data = await Incident.aggregate([
                    { $match: match },
                    { $group: { _id: '$location.area', count: { $sum: 1 }, lat: { $avg: '$location.lat' }, lng: { $avg: '$location.lng' } } },
                    { $sort: { count: -1 } }, { $limit: 20 }
                ]);
                break;
            case 'trend-pattern':
                data = await Incident.aggregate([
                    { $match: match },
                    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
                    { $sort: { _id: 1 } }
                ]);
                break;
            case 'predictive-risk':
                data = await RiskForecast.find().sort({ generatedAt: -1 }).limit(20).lean();
                break;
            case 'complaint-status':
                data = await Incident.find({ ...match, reportedBy: req.user.id }).sort({ createdAt: -1 }).lean();
                break;
            case 'audit-resolution':
                data = await ResolutionLog.find(match).populate('incidentId', 'title type').populate('officerId', 'name').sort({ timestamp: -1 }).lean();
                break;
            default:
                return res.status(400).json({ success: false, error: 'Invalid report type' });
        }

        res.json({ success: true, data, reportType });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Individual report endpoints
router.get('/active-incidents', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const data = await Incident.find({ status: { $nin: ['resolved', 'closed', 'rejected'] } }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, data, total: data.length });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.get('/incident-type-distribution', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const data = await Incident.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.get('/severity-priority', authenticate, authorize('admin'), async (req, res) => {
    try {
        const data = await Incident.find({ severity: { $in: ['critical', 'high'] }, status: { $ne: 'resolved' } }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, data, total: data.length });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.get('/dept-workload', authenticate, authorize('admin'), async (req, res) => {
    try {
        const data = await Assignment.aggregate([
            { $group: { _id: '$departmentId', total: { $sum: 1 }, active: { $sum: { $cond: [{ $in: ['$status', ['pending', 'acknowledged', 'in_progress']] }, 1, 0] } }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
            { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
            { $unwind: '$dept' },
            { $project: { name: '$dept.name', shortName: '$dept.shortName', total: 1, active: 1, completed: 1 } },
            { $sort: { active: -1 } }
        ]);
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.get('/response-time', authenticate, authorize('admin'), async (req, res) => {
    try {
        const data = await ResolutionLog.aggregate([
            { $group: { _id: null, avgTTA: { $avg: '$tta' }, avgTTR: { $avg: '$ttr' }, count: { $sum: 1 } } }
        ]);
        res.json({ success: true, data: data[0] || { avgTTA: 0, avgTTR: 0, count: 0 } });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.get('/hotspot', authenticate, authorize('admin'), async (req, res) => {
    try {
        const data = await Incident.aggregate([
            { $group: { _id: '$location.area', count: { $sum: 1 }, lat: { $avg: '$location.lat' }, lng: { $avg: '$location.lng' } } },
            { $sort: { count: -1 } }, { $limit: 20 }
        ]);
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.get('/trend-pattern', authenticate, authorize('admin'), async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const data = await Incident.aggregate([
            { $match: { createdAt: { $gte: new Date(Date.now() - days * 86400000) } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.get('/predictive-risk', authenticate, authorize('admin'), async (req, res) => {
    try {
        const data = await RiskForecast.find().sort({ generatedAt: -1 }).limit(20).lean();
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.get('/complaint-status', authenticate, async (req, res) => {
    try {
        const data = await Incident.find({ reportedBy: req.user.id }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, data, total: data.length });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.get('/audit-resolution', authenticate, authorize('admin'), async (req, res) => {
    try {
        const data = await ResolutionLog.find()
            .populate('incidentId', 'title type status')
            .populate('officerId', 'name email')
            .sort({ timestamp: -1 }).lean();
        res.json({ success: true, data, total: data.length });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

module.exports = router;
