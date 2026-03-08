const mongoose = require('mongoose');
const crypto = require('crypto');

const FeedbackSchema = new mongoose.Schema({
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
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

FeedbackSchema.index({ incidentId: 1 });
FeedbackSchema.index({ citizenId: 1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);
