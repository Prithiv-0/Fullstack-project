const mongoose = require('mongoose');
const crypto = require('crypto');

const INCIDENT_TYPES = [
    'pothole', 'traffic', 'flooding', 'streetlight',
    'garbage', 'accident', 'water_leak', 'road_damage',
    'safety_issue', 'noise', 'illegal_parking', 'sewage', 'other'
];

const IncidentSchema = new mongoose.Schema({
    incidentId: {
        type: String,
        default: () => crypto.randomUUID(),
        unique: true
    },
    type: {
        type: String,
        required: [true, 'Please specify incident type'],
        enum: INCIDENT_TYPES
    },
    title: {
        type: String,
        required: [true, 'Please add an incident title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    location: {
        lat: { type: Number, required: [true, 'Latitude is required'] },
        lng: { type: Number, required: [true, 'Longitude is required'] },
        address: String,
        area: String,
        zone: String
    },
    severity: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['reported', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
        default: 'reported'
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mediaUrls: [String],
    isVerified: {
        type: Boolean,
        default: false
    },
    isFalse: {
        type: Boolean,
        default: false
    },
    source: {
        type: String,
        enum: ['citizen_app', 'social_media', 'iot_sensor', 'traffic_api', 'manual'],
        default: 'citizen_app'
    },
    aiProcessed: {
        type: Boolean,
        default: false
    },
    // Keep timeline for status history tracking
    timeline: [{
        status: String,
        comment: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field on save
IncidentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes per spec
IncidentSchema.index({ 'location.zone': 1 });
IncidentSchema.index({ status: 1 });
IncidentSchema.index({ type: 1 });
IncidentSchema.index({ severity: 1 });
IncidentSchema.index({ reportedBy: 1 });
IncidentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Incident', IncidentSchema);
module.exports.INCIDENT_TYPES = INCIDENT_TYPES;
