/**
 * Feedback.js - Mongoose Schema & Model for Citizen Feedback
 *
 * Captures citizen feedback on resolved incidents. Includes overall rating
 * (1-5), response satisfaction, resolution satisfaction, ease of use scores,
 * communication clarity ratings, and a recommendation flag.
 *
 * Linked to both the incident and the citizen who submitted the feedback.
 * Indexed on incidentId and citizenId for efficient querying.
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
    feedbackId: {
        type: String,
        default: () => crypto.randomUUID(),
        unique: true
    },
    incidentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Incident',
        required: true
    },
    citizenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comments: String,
    responseSatisfaction: {
        type: Number,
        min: 1,
        max: 5
    },
    resolvedSatisfaction: {
        type: Number,
        min: 1,
        max: 5
    },
    easeOfUse: {
        type: Number,
        min: 1,
        max: 5
    },
    resolutionSatisfaction: {
        type: String,
        enum: ['very_unsatisfied', 'unsatisfied', 'neutral', 'satisfied', 'very_satisfied']
    },
    communicationClarity: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent']
    },
    wouldRecommend: Boolean,
    followUpRequested: {
        type: Boolean,
        default: false
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

FeedbackSchema.index({ incidentId: 1 });
FeedbackSchema.index({ citizenId: 1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);
