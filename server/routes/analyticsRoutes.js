const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const Department = require('../models/Department');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/analytics/overview
// @desc    Get overall city analytics
// @access  Private (Official/Admin)
router.get('/overview', protect, authorize('official', 'admin'), async (req, res) => {
    try {
        const totalIncidents = await Incident.countDocuments();
        const activeIncidents = await Incident.countDocuments({
            status: { $in: ['reported', 'acknowledged', 'in-progress'] }
        });
        const resolvedToday = await Incident.countDocuments({
            resolvedAt: { $gte: new Date().setHours(0, 0, 0, 0) }
        });

        const byType = await Incident.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const bySeverity = await Incident.aggregate([
            { $group: { _id: '$severity', count: { $sum: 1 } } }
        ]);

        const byStatus = await Incident.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const criticalIncidents = await Incident.find({ severity: 'critical', status: { $ne: 'resolved' } })
            .populate('assignedDepartment', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                totalIncidents,
                activeIncidents,
                resolvedToday,
                byType,
                bySeverity,
                byStatus,
                criticalIncidents
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/analytics/trends
// @desc    Get incident trends over time
// @access  Private (Official/Admin)
router.get('/trends', protect, authorize('official', 'admin'), async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const dailyTrends = await Incident.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    resolved: {
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                    }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        const typeTrends = await Incident.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        type: '$type',
                        week: { $week: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.week': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                daily: dailyTrends,
                byType: typeTrends
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/analytics/hotspots
// @desc    Get incident hotspots (areas with high concentration)
// @access  Private (Official/Admin)
router.get('/hotspots', protect, authorize('official', 'admin'), async (req, res) => {
    try {
        const hotspots = await Incident.aggregate([
            {
                $group: {
                    _id: '$location.area',
                    count: { $sum: 1 },
                    types: { $push: '$type' },
                    avgSeverity: {
                        $avg: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$severity', 'low'] }, then: 1 },
                                    { case: { $eq: ['$severity', 'medium'] }, then: 2 },
                                    { case: { $eq: ['$severity', 'high'] }, then: 3 },
                                    { case: { $eq: ['$severity', 'critical'] }, then: 4 }
                                ],
                                default: 2
                            }
                        }
                    },
                    location: { $first: '$location.coordinates' }
                }
            },
            { $match: { count: { $gte: 3 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        res.json({ success: true, data: hotspots });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/analytics/department-performance
// @desc    Get department performance metrics
// @access  Private (Admin)
router.get('/department-performance', protect, authorize('admin'), async (req, res) => {
    try {
        const performance = await Incident.aggregate([
            { $match: { assignedDepartment: { $exists: true } } },
            {
                $group: {
                    _id: '$assignedDepartment',
                    total: { $sum: 1 },
                    resolved: {
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                    },
                    avgResponseTime: { $avg: '$responseTime' },
                    avgResolutionTime: { $avg: '$resolutionTime' },
                    avgRating: { $avg: '$feedback.rating' }
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            { $unwind: '$department' },
            {
                $project: {
                    name: '$department.name',
                    code: '$department.code',
                    total: 1,
                    resolved: 1,
                    resolutionRate: { $multiply: [{ $divide: ['$resolved', '$total'] }, 100] },
                    avgResponseTime: 1,
                    avgResolutionTime: 1,
                    avgRating: 1
                }
            },
            { $sort: { resolutionRate: -1 } }
        ]);

        res.json({ success: true, data: performance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/analytics/predictions
// @desc    Get AI predictions for future hotspots (mock)
// @access  Private (Admin)
router.get('/predictions', protect, authorize('admin'), async (req, res) => {
    try {
        // This would typically use ML models - for now returning mock predictions
        const historicalHotspots = await Incident.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: {
                        area: '$location.area',
                        type: '$type'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Mock prediction logic
        const predictions = historicalHotspots.map(h => ({
            area: h._id.area,
            type: h._id.type,
            predictedIncidents: Math.round(h.count * 1.1), // Simple projection
            confidence: 0.7 + Math.random() * 0.25,
            period: 'next 7 days'
        }));

        res.json({ success: true, data: predictions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
