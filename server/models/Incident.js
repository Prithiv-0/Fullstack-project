const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add an incident title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    type: {
        type: String,
        required: [true, 'Please specify incident type'],
        enum: [
            'pothole',
            'traffic',
            'flooding',
            'streetlight',
            'garbage',
            'accident',
            'water-leak',
            'road-damage',
            'public-safety',
            'noise',
            'illegal-parking',
            'sewage',
            'other'
        ]
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    priority: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },
    status: {
        type: String,
        enum: ['reported', 'acknowledged', 'in-progress', 'resolved', 'closed', 'rejected'],
        default: 'reported'
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: [true, 'Please provide location coordinates'],
            index: '2dsphere'
        },
        address: {
            type: String,
            required: [true, 'Please provide address']
        },
        area: String,
        city: {
            type: String,
            default: 'Bengaluru'
        }
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    assignedOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    media: [{
        url: String,
        type: {
            type: String,
            enum: ['image', 'video']
        }
    }],
    aiClassification: {
        detectedType: String,
        confidence: Number,
        suggestedSeverity: String,
        keywords: [String]
    },
    verification: {
        isVerified: {
            type: Boolean,
            default: false
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        verifiedAt: Date,
        onSiteInspection: {
            type: Boolean,
            default: false
        },
        inspectionNotes: String,
        confirmedSeverity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical']
        },
        confirmedType: {
            type: String,
            enum: [
                'pothole', 'traffic', 'flooding', 'streetlight', 'garbage',
                'accident', 'water-leak', 'road-damage', 'public-safety',
                'noise', 'illegal-parking', 'sewage', 'other'
            ]
        },
        estimatedCost: Number,
        estimatedResolutionDays: Number,
        resourcesRequired: String,
        actionRecommended: {
            type: String,
            enum: ['immediate', 'scheduled', 'monitoring', 'no-action', 'escalate']
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified-valid', 'verified-invalid', 'duplicate', 'needs-more-info'],
            default: 'pending'
        },
        duplicateOf: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Incident'
        }
    },
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
    responseTime: Number, // in minutes
    resolutionTime: Number, // in minutes
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    resolvedAt: Date
});

// Update the updatedAt field on save
IncidentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for geospatial queries
IncidentSchema.index({ 'location.coordinates': '2dsphere' });

// Index for common queries
IncidentSchema.index({ status: 1, severity: 1, type: 1 });
IncidentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Incident', IncidentSchema);
