const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const aiService = require('../services/aiService');
const IncidentIntelligence = require('../models/IncidentIntelligence');
const Incident = require('../models/Incident');

// @route   POST /api/v1/ai/classify/:incidentId
// @desc    Trigger LLM classification for incident
// @access  admin
router.post('/classify/:incidentId', authenticate, authorize('admin'), async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.incidentId);
        if (!incident) {
            return res.status(404).json({ success: false, error: 'Incident not found' });
        }

        const classification = await aiService.classifyIncident(incident);

        const intelligence = await IncidentIntelligence.findOneAndUpdate(
            { incidentId: incident._id },
            { incidentId: incident._id, ...classification, processedAt: new Date() },
            { upsert: true, new: true }
        );

        // Update incident
        await Incident.findByIdAndUpdate(incident._id, {
            severity: classification.priorityTag || incident.severity,
            aiProcessed: true
        });

        res.json({ success: true, data: intelligence });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/ai/classify/:incidentId
// @desc    Get classification result
// @access  admin, government_official
router.get('/classify/:incidentId', authenticate, authorize('admin', 'government_official'), async (req, res) => {
    try {
        const intelligence = await IncidentIntelligence.findOne({ incidentId: req.params.incidentId });
        if (!intelligence) {
            return res.status(404).json({ success: false, error: 'No classification found' });
        }
        res.json({ success: true, data: intelligence });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/v1/ai/classify/batch
// @desc    Classify multiple incidents at once
// @access  admin
router.post('/classify/batch', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { incidentIds } = req.body;
        if (!incidentIds || !Array.isArray(incidentIds)) {
            return res.status(400).json({ success: false, error: 'incidentIds array required' });
        }

        const results = [];
        for (const id of incidentIds) {
            try {
                const incident = await Incident.findById(id);
                if (!incident) continue;

                const classification = await aiService.classifyIncident(incident);
                const intelligence = await IncidentIntelligence.findOneAndUpdate(
                    { incidentId: id },
                    { incidentId: id, ...classification, processedAt: new Date() },
                    { upsert: true, new: true }
                );

                await Incident.findByIdAndUpdate(id, { severity: classification.priorityTag || incident.severity, aiProcessed: true });
                results.push({ incidentId: id, success: true, data: intelligence });
            } catch (e) {
                results.push({ incidentId: id, success: false, error: e.message });
            }
        }

        res.json({ success: true, data: results, message: `Processed ${results.length} incidents` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
