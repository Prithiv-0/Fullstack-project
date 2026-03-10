/**
 * AnalyticsAggregate.js - Pre-Aggregated Analytics Data Model
 *
 * Stores pre-computed analytics summaries (daily, weekly, monthly) for
 * fast dashboard rendering. Includes incident counts by type/severity/status,
 * average Time-to-Acknowledge (TTA) and Time-to-Resolve (TTR), department
 * performance metrics, and citizen satisfaction averages.
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
    aggId: {
        type: String,
        default: () => crypto.randomUUID(),
        unique: true
    },
    period: String,
    periodType: {
        type: String,
        enum: ['daily', 'weekly', 'monthly']
    },
    zone: {
        type: String,
        default: 'all'
    },
    incidentCounts: {
        total: Number,
        byType: Object,
        bySeverity: Object,
        byStatus: Object
    },
    avgTTA: Number,
    avgTTR: Number,
    deptPerformance: [{
        deptId: mongoose.Schema.Types.ObjectId,
        name: String,
        assigned: Number,
        resolved: Number,
        avgTTR: Number,
        slaBreaches: Number
    }],
    citizenSatisfactionAvg: Number,
    generatedAt: {
        type: Date,
        default: Date.now
    }
});

AnalyticsAggregateSchema.index({ period: 1, periodType: 1, zone: 1 });

module.exports = mongoose.model('AnalyticsAggregate', AnalyticsAggregateSchema);
