/**
 * @module routes/analyticsRoutes
 * @description Analytics and dashboard routes for incident data aggregation.
 *   Provides statistics, distributions, trends, and department performance metrics
 *   for admin and government official dashboards.
 *
 * @routes
 *   GET /dashboard             - Dashboard summary (totals, SLA breaches, avg response time)
 *   GET /incidents-by-type     - Incident count grouped by type
 *   GET /severity-distribution - Incident count grouped by severity
 *   GET /status-distribution   - Incident count grouped by status
 *   GET /response-times        - Average time-to-acknowledge and time-to-resolve per department
 *   GET /dept-performance      - Department resolution rates and escalation counts
 *   GET /critical-feed         - Recent critical/high-severity unresolved incidents
 *   GET /overview              - (Legacy) Combined overview statistics
 *   GET /trends                - Daily incident counts over a configurable window
 *   GET /hotspots              - Geographic hotspots by incident density
 *   GET /department-performance - (Legacy) Department resolution rates
 */
const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const Department = require('../models/Department');
const Assignment = require('../models/Assignment');
const ResolutionLog = require('../models/ResolutionLog');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/v1/analytics/dashboard
router.get('/dashboard', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const [totalIncidents, activeIncidents, resolvedToday, criticalActive, pendingAction] = await Promise.all([
            Incident.countDocuments(),
            Incident.countDocuments({ status: { $in: ['reported', 'acknowledged', 'assigned', 'in_progress'] } }),
            Incident.countDocuments({ status: 'resolved', updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
            Incident.countDocuments({ severity: 'critical', status: { $nin: ['resolved', 'closed', 'rejected'] } }),
            Incident.countDocuments({ status: { $in: ['reported', 'acknowledged'] } })
        ]);

        const avgResponse = await ResolutionLog.aggregate([
            { $match: { ttr: { $exists: true, $ne: null } } },
            { $group: { _id: null, avg: { $avg: '$ttr' } } }
        ]);

        const slaBreachCount = await Assignment.countDocuments({
            status: { $in: ['pending', 'acknowledged', 'in_progress'] },
            slaDueBy: { $lt: new Date() }
        });

        res.json({
            success: true,
            data: {
                totalIncidents, activeIncidents, resolvedToday, criticalActive,
                pendingAction,
                avgResponseTimeHours: avgResponse[0] ? +(avgResponse[0].avg / 60).toFixed(1) : 0,
                slaBreachCount
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/analytics/incidents-by-type
router.get('/incidents-by-type', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const data = await Incident.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

// @route   GET /api/v1/analytics/severity-distribution
router.get('/severity-distribution', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const data = await Incident.aggregate([
            { $group: { _id: '$severity', count: { $sum: 1 } } }
        ]);
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

// @route   GET /api/v1/analytics/status-distribution
router.get('/status-distribution', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const data = await Incident.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

// @route   GET /api/v1/analytics/response-times
router.get('/response-times', authenticate, authorize('admin'), async (req, res) => {
    try {
        const data = await ResolutionLog.aggregate([
            { $lookup: { from: 'incidents', localField: 'incidentId', foreignField: '_id', as: 'incident' } },
            { $unwind: '$incident' },
            { $lookup: { from: 'assignments', localField: 'incidentId', foreignField: 'incidentId', as: 'assignment' } },
            { $unwind: { path: '$assignment', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'departments', localField: 'assignment.departmentId', foreignField: '_id', as: 'dept' } },
            { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
            { $group: { _id: '$dept.name', avgTTA: { $avg: '$tta' }, avgTTR: { $avg: '$ttr' }, count: { $sum: 1 } } }
        ]);
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

// @route   GET /api/v1/analytics/dept-performance
router.get('/dept-performance', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const performance = await Assignment.aggregate([
            { $group: { _id: '$departmentId', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }, escalated: { $sum: { $cond: [{ $eq: ['$status', 'escalated'] }, 1, 0] } } } },
            { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
            { $unwind: '$dept' },
            { $project: { name: '$dept.name', shortName: '$dept.shortName', total: 1, completed: 1, escalated: 1, resolutionRate: { $cond: [{ $gt: ['$total', 0] }, { $multiply: [{ $divide: ['$completed', '$total'] }, 100] }, 0] } } },
            { $sort: { resolutionRate: -1 } }
        ]);
        res.json({ success: true, data: performance });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

// @route   GET /api/v1/analytics/critical-feed
router.get('/critical-feed', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const incidents = await Incident.find({
            severity: { $in: ['critical', 'high'] },
            status: { $nin: ['resolved', 'closed'] }
        }).sort({ createdAt: -1 }).limit(10).lean();
        res.json({ success: true, data: incidents });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

// Backward-compat endpoints
router.get('/overview', authenticate, authorize('government_official', 'admin'), async (req, res) => {
    try {
        const totalIncidents = await Incident.countDocuments();
        const activeIncidents = await Incident.countDocuments({ status: { $in: ['reported', 'acknowledged', 'assigned', 'in_progress'] } });
        const resolvedToday = await Incident.countDocuments({ status: 'resolved', updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } });
        const byType = await Incident.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
        const bySeverity = await Incident.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]);
        const byStatus = await Incident.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
        const criticalIncidents = await Incident.find({ severity: 'critical', status: { $ne: 'resolved' } }).sort({ createdAt: -1 }).limit(5).lean();
        res.json({ success: true, data: { totalIncidents, activeIncidents, resolvedToday, byType, bySeverity, byStatus, criticalIncidents } });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.get('/trends', authenticate, authorize('government_official', 'admin'), async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date(Date.now() - days * 86400000);
        const daily = await Incident.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } } } },
            { $sort: { _id: 1 } }
        ]);
        res.json({ success: true, data: { daily } });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.get('/hotspots', authenticate, authorize('government_official', 'admin'), async (req, res) => {
    try {
        const hotspots = await Incident.aggregate([
            { $group: { _id: '$location.area', count: { $sum: 1 }, lat: { $avg: '$location.lat' }, lng: { $avg: '$location.lng' } } },
            { $match: { count: { $gte: 2 } } },
            { $sort: { count: -1 } }, { $limit: 20 }
        ]);
        res.json({ success: true, data: hotspots });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.get('/department-performance', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const data = await Assignment.aggregate([
            { $group: { _id: '$departmentId', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
            { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
            { $unwind: '$dept' },
            { $project: { name: '$dept.name', total: 1, completed: 1, resolutionRate: { $cond: [{ $gt: ['$total', 0] }, { $multiply: [{ $divide: ['$completed', '$total'] }, 100] }, 0] } } }
        ]);
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, error: 'Server error' }); }
});

module.exports = router;
