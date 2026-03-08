const mongoose = require('mongoose');
const crypto = require('crypto');

const DepartmentSchema = new mongoose.Schema({
    deptId: {
        type: String,
        default: () => crypto.randomUUID(),
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Please add department name'],
        unique: true,
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    shortName: {
        type: String,
        unique: true,
        uppercase: true,
        maxlength: [10, 'Short name cannot exceed 10 characters']
    },
    contactEmail: String,
    contactPhone: String,
    incidentTypes: [{
        type: String,
        enum: [
            'pothole', 'traffic', 'flooding', 'streetlight',
            'garbage', 'accident', 'water_leak', 'road_damage',
            'safety_issue', 'noise', 'illegal_parking', 'sewage', 'other'
        ]
    }],
    zone: String,
    officers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    currentLoad: {
        type: Number,
        default: 0
    },
    slaHours: {
        type: Number,
        default: 24
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Department', DepartmentSchema);
