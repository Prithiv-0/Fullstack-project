/**
 * ResolutionLog.js - Incident Resolution Tracking Model
 *
 * Records each resolution action taken by field officers. Captures the
 * action description, proof URLs (photos/videos), time spent, materials
 * used, TTA (Time-to-Acknowledge) and TTR (Time-to-Resolve) in minutes,
 * and before/after status transitions.
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
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
