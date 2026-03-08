const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
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
