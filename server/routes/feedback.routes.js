const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const Feedback = require('../models/Feedback');
const Incident = require('../models/Incident');

// @route   POST /api/v1/feedback
// @desc    Submit post-resolution feedback
// @access  citizen
router.post('/', authenticate, authorize('citizen'), async (req, res) => {
    try {
        const {
            incidentId,
            rating,
            comments,
            responseSatisfaction,
            resolvedSatisfaction,
            easeOfUse,
            resolutionSatisfaction,
            communicationClarity,
            wouldRecommend,
            followUpRequested
        } = req.body;

        if (!incidentId || !rating) {
            return res.status(400).json({ success: false, error: 'incidentId and rating are required' });
        }

        const incident = await Incident.findById(incidentId);
        if (!incident) return res.status(404).json({ success: false, error: 'Incident not found' });
        if (incident.reportedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'You can only rate your own incidents' });
        }

        const existing = await Feedback.findOne({ incidentId, citizenId: req.user.id });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Feedback already submitted for this incident' });
        }

        const feedback = await Feedback.create({
            incidentId, citizenId: req.user.id,
            rating,
            comments,
            responseSatisfaction,
            resolvedSatisfaction,
            easeOfUse,
            resolutionSatisfaction,
            communicationClarity,
            wouldRecommend,
            followUpRequested: Boolean(followUpRequested)
        });

        res.status(201).json({ success: true, data: feedback, message: 'Feedback submitted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/feedback/my
// @desc    Get my submitted feedback
// @access  citizen
router.get('/my', authenticate, authorize('citizen'), async (req, res) => {
    try {
        const feedback = await Feedback.find({ citizenId: req.user.id })
            .populate('incidentId', 'title type status updatedAt')
            .sort({ submittedAt: -1 })
            .lean();
        res.json({ success: true, data: feedback });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/feedback/incident/:id
// @desc    Get feedback for incident
router.get('/incident/:id', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const feedback = await Feedback.find({ incidentId: req.params.id })
            .populate('citizenId', 'name').lean();
        res.json({ success: true, data: feedback });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/feedback/summary
// @desc    Aggregate feedback analytics
router.get('/summary', authenticate, authorize('admin'), async (req, res) => {
    try {
        const summary = await Feedback.aggregate([
            {
                $group: {
                    _id: null,
                    totalFeedback: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                    avgResponseSatisfaction: { $avg: '$responseSatisfaction' },
                    avgResolvedSatisfaction: { $avg: '$resolvedSatisfaction' },
                    avgEaseOfUse: { $avg: '$easeOfUse' }
                }
            }
        ]);

        const distribution = await Feedback.aggregate([
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                summary: summary[0] || { totalFeedback: 0, avgRating: 0 },
                distribution
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
