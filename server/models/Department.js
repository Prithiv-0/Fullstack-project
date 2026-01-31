const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add department name'],
        unique: true,
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    code: {
        type: String,
        required: [true, 'Please add department code'],
        unique: true,
        uppercase: true,
        maxlength: [10, 'Code cannot exceed 10 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    handlesIncidentTypes: [{
        type: String,
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
    }],
    contact: {
        email: String,
        phone: String,
        address: String
    },
    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    officers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    stats: {
        totalAssigned: {
            type: Number,
            default: 0
        },
        resolved: {
            type: Number,
            default: 0
        },
        pending: {
            type: Number,
            default: 0
        },
        avgResponseTime: {
            type: Number,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Department', DepartmentSchema);
