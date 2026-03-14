const mongoose = require('mongoose');
const crypto = require('crypto');

const NotificationSchema = new mongoose.Schema({
    notifId: {
        type: String,
        default: () => crypto.randomUUID(),
        unique: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    incidentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Incident'
    },
    channel: {
        type: String,
        enum: ['email', 'sms', 'whatsapp', 'push', 'in_app']
    },
    subject: String,
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
        default: 'pending'
    },
    sentAt: Date,
    deliveredAt: Date,
    failureReason: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

NotificationSchema.index({ recipientId: 1, status: 1 });
NotificationSchema.index({ incidentId: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
