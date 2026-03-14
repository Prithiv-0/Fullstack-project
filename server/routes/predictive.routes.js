const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const RiskForecast = require('../models/RiskForecast');
const Incident = require('../models/Incident');

// @route   POST /api/v1/predictive/forecast
// @desc    Trigger risk forecast for zone
router.post('/forecast', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { zone, incidentType = 'all', timeHorizon = '7d' } = req.body;
        if (!zone) return res.status(400).json({ success: false, error: 'Zone is required' });

        const days = parseInt(timeHorizon) || 7;
        const startDate = new Date(Date.now() - 90 * 86400000);

        // Build match filter
        const matchFilter = { 'location.zone': zone, createdAt: { $gte: startDate } };
        if (incidentType !== 'all') matchFilter.type = incidentType;

        const historicalData = await Incident.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, avgSev: {
                        $avg: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$severity', 'critical'] }, then: 4 },
                                    { case: { $eq: ['$severity', 'high'] }, then: 3 },
                                    { case: { $eq: ['$severity', 'medium'] }, then: 2 }
                                ], default: 1
                            }
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totalDays = historicalData.length || 1;
        const totalIncidents = historicalData.reduce((s, d) => s + d.count, 0);
        const avgDaily = totalIncidents / totalDays;

        // Recent trend (last 7 vs overall)
        const recent = historicalData.slice(-7);
        const recentAvg = recent.length ? recent.reduce((s, d) => s + d.count, 0) / recent.length : avgDaily;
        const trendMultiplier = avgDaily > 0 ? recentAvg / avgDaily : 1;

        const riskScore = Math.min(100, Math.round(avgDaily * 10 * trendMultiplier));
        const riskLevel = riskScore > 75 ? 'very_high' : riskScore > 50 ? 'high' : riskScore > 25 ? 'moderate' : 'low';

        const recommendations = [];
        if (riskScore > 75) recommendations.push('Deploy additional field teams to this zone');
        if (riskScore > 50) recommendations.push('Increase monitoring frequency');
        if (riskScore > 25) recommendations.push('Schedule preventive maintenance');
        recommendations.push('Continue regular monitoring');

        const forecast = await RiskForecast.create({
            zone, incidentType, riskScore, riskLevel,
            forecastDate: new Date(Date.now() + days * 86400000),
            timeHorizon, model: 'statistical-mvp',
            confidence: Math.min(0.95, 0.5 + (totalDays / 180)),
            historicalDataPoints: historicalData.slice(-30).map(d => ({
                date: new Date(d._id), incidentCount: d.count, avgSeverity: d.avgSev
            })),
            recommendations
        });

        res.status(201).json({ success: true, data: forecast });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/predictive/forecast/:zone
router.get('/forecast/:zone', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const forecast = await RiskForecast.findOne({ zone: req.params.zone })
            .sort({ generatedAt: -1 }).lean();
        if (!forecast) return res.status(404).json({ success: false, error: 'No forecast found' });
        res.json({ success: true, data: forecast });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/predictive/forecast
router.get('/forecast', authenticate, authorize('admin'), async (req, res) => {
    try {
        const forecasts = await RiskForecast.aggregate([
            { $sort: { generatedAt: -1 } },
            { $group: { _id: '$zone', latest: { $first: '$$ROOT' } } },
            { $replaceRoot: { newRoot: '$latest' } }
        ]);
        res.json({ success: true, data: forecasts });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/predictive/hotspots
router.get('/hotspots', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const { zone, type, window = '30' } = req.query;
        const startDate = new Date(Date.now() - parseInt(window) * 86400000);
        const match = { createdAt: { $gte: startDate } };
        if (zone && zone !== 'all') match['location.zone'] = zone;
        if (type && type !== 'all') match.type = type;

        const hotspots = await Incident.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { area: '$location.area', zone: '$location.zone' },
                    count: { $sum: 1 },
                    lat: { $avg: '$location.lat' },
                    lng: { $avg: '$location.lng' },
                    avgSeverity: {
                        $avg: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$severity', 'critical'] }, then: 4 },
                                    { case: { $eq: ['$severity', 'high'] }, then: 3 },
                                    { case: { $eq: ['$severity', 'medium'] }, then: 2 }
                                ], default: 1
                            }
                        }
                    }
                }
            },
            { $match: { count: { $gte: 2 } } },
            { $sort: { count: -1 } },
            { $limit: 50 }
        ]);

        res.json({ success: true, data: hotspots });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/predictive/trends
router.get('/trends', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date(Date.now() - days * 86400000);

        const trends = await Incident.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                    resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({ success: true, data: trends });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
