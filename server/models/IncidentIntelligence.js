/**
 * IncidentIntelligence.js - AI Classification Results Model
 *
 * Stores the output of the AI classification pipeline for each incident.
 * Contains NLP category, priority score (0-100), confidence level,
 * sentiment score (-1 to 1), suggested department, and the LLM model used
 * (either 'gemini-pro' or 'rule-based' fallback).
 */

const mongoose = require('mongoose');
    incidentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Incident',
        unique: true,
        required: true
    },
    nlpCategory: String,
    priorityScore: {
        type: Number,
        min: 0,
        max: 100
    },
    priorityTag: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low']
    },
    aiSummary: String,
    suggestedDepartment: String,
    classificationConfidence: {
        type: Number,
        min: 0,
        max: 1
    },
    sentimentScore: {
        type: Number,
        min: -1,
        max: 1
    },
    llmModel: String,
    rawResponse: Object,
    processedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('IncidentIntelligence', IncidentIntelligenceSchema);
