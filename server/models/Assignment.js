const mongoose = require('mongoose');
const crypto = require('crypto');

const AssignmentSchema = new mongoose.Schema({
    assignmentId: {
        type: String,
        default: () => crypto.randomUUID(),
        unique: true
    },
    incidentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Incident',
        required: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    officerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedAt: {
        type: Date,
        default: Date.now
    },
    slaDueBy: Date,
    status: {
        type: String,
        enum: ['pending', 'acknowledged', 'in_progress', 'completed', 'escalated'],
        default: 'pending'
    },
    escalationCount: {
        type: Number,
        default: 0
    },
    escalatedAt: Date,
    notes: String,
    assignmentType: {
        type: String,
        enum: ['manual', 'auto'],
        default: 'manual'
    },
    notifyReporter: {
        type: Boolean,
        default: false
    },
    referenceNumber: {
        type: String,
        trim: true,
        maxlength: [100, 'Reference number cannot exceed 100 characters']
    }
});

AssignmentSchema.index({ incidentId: 1 });
AssignmentSchema.index({ departmentId: 1, status: 1 });

module.exports = mongoose.model('Assignment', AssignmentSchema);
