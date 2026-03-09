const mongoose = require('mongoose');
const crypto = require('crypto');

const ResolutionLogSchema = new mongoose.Schema({
    logId: {
        type: String,
        default: () => crypto.randomUUID(),
        unique: true
    },
    incidentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Incident',
        required: true
    },
    officerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: String,
    proofUrls: [String],
    resolutionCategory: String,
    timeSpentHours: Number,
    materialsUsed: String,
    requiresFollowUp: {
        type: Boolean,
        default: false
    },
    statusBefore: String,
    statusAfter: String,
    timestamp: {
        type: Date,
        default: Date.now
    },
    notes: String,
    tta: Number,
    ttr: Number,
    isResolved: {
        type: Boolean,
        default: false
    }
});

ResolutionLogSchema.index({ incidentId: 1 });

module.exports = mongoose.model('ResolutionLog', ResolutionLogSchema);
