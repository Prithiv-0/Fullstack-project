/**
 * ContactMessage.js - Mongoose Schema & Model for Department Contact Messages
 *
 * Allows citizens to send direct messages to specific government departments.
 * Includes priority levels, preferred contact methods, callback requests,
 * and tracks the response lifecycle (pending → read → responded → closed).
 */

const mongoose = require('mongoose');
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Please select a department']
    },
    subject: {
        type: String,
        required: [true, 'Please add a subject'],
        trim: true,
        maxlength: [150, 'Subject cannot exceed 150 characters']
    },
    message: {
        type: String,
        required: [true, 'Please add a message'],
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    preferredContactMethod: {
        type: String,
        enum: ['email', 'phone', 'sms'],
        default: 'email'
    },
    requestCallback: {
        type: Boolean,
        default: false
    },
    urgentRequest: {
        type: Boolean,
        default: false
    },
    attachmentUrls: [String],
    status: {
        type: String,
        enum: ['pending', 'read', 'responded', 'closed'],
        default: 'pending'
    },
    response: {
        message: String,
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ContactMessageSchema.index({ department: 1, status: 1 });
ContactMessageSchema.index({ from: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
