/**
 * db.js - MongoDB Database Connection Module
 *
 * Establishes connection to MongoDB using Mongoose ODM.
 * Falls back to a local MongoDB instance if MONGODB_URI is not set in environment.
 * Logs connection host on success, terminates the process on failure.
 */

const mongoose = require('mongoose');

/**
 * connectDB - Async function to initiate the MongoDB connection.
 * Uses the MONGODB_URI environment variable or defaults to localhost.
 * On successful connection, logs the host; on failure, logs the error and exits.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-city-command');
        console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
