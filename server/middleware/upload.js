/**
 * upload.js - File Upload Middleware (Multer Configuration)
 *
 * Configures Multer for handling multipart/form-data file uploads.
 * Files are saved to the 'uploads/' directory with unique timestamped filenames.
 *
 * Allowed file types: JPEG, JPG, PNG, GIF (images) and MP4, WebM, MOV (videos).
 * Constraints: Max 10MB per file, max 5 files per request.
 *
 * Used by incident reporting routes to accept photo/video evidence.
 */

const multer = require('multer');
const path = require('path');

// Configure disk storage — files go to 'uploads/' with unique names
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generate a unique filename using timestamp + random number + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter — only allow image and video MIME types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only image and video files are allowed'));
};

// Create the Multer instance with storage, filter, and size/count limits
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 5 // max 5 files per upload
    }
});

module.exports = upload;
