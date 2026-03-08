const mongoose = require('mongoose');
const crypto = require('crypto');

const RiskForecastSchema = new mongoose.Schema({
    forecastId: {
        type: String,
        default: () => crypto.randomUUID(),
        unique: true
    },
    zone: {
        type: String,
        required: true
    },
    incidentType: {
        type: String,
        default: 'all'
    },
    riskScore: {
        type: Number,
        min: 0,
        max: 100
    },
    riskLevel: {
        type: String,
        enum: ['very_high', 'high', 'moderate', 'low']
    },
    forecastDate: Date,
    timeHorizon: String,
    model: String,
    confidence: {
        type: Number,
        min: 0,
        max: 1
    },
    historicalDataPoints: [{
        date: Date,
        incidentCount: Number,
        avgSeverity: Number
    }],
    recommendations: [String],
    generatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('RiskForecast', RiskForecastSchema);
