import { v2 as cloudinary } from 'cloudinary'; 
import fs from 'fs';

// Configure cloudinary with credentials from .env (never hardcode API keys!)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file from local server to Cloudinary
 * => param {string} localFilePath - The full path of file stored temporarily on local server
 * => returns {object|null} - Returns Cloudinary response object (with URL, public_id, etc.) if success, otherwise null
 * 
 * Flow:
 * 1. Take local file path (uploaded using multer)
 * 2. Upload it to Cloudinary
 * 3. On success → return Cloudinary response & delete local file to free storage & return null
 * 4. On failure → delete local file to free storage & return null
 */
const uploadToCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) throw new Error("File path is required and must be valid");

        // Upload file to cloudinary (auto-detect resource type: image, video, pdf, etc.)
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // Delete local file after successful upload
        fs.unlinkSync(localFilePath);

        // If upload success
        console.log("File uploaded to Cloudinary:", response.url);
        return response;
    } catch (error) {
        // If upload fails → delete local file to avoid storage bloat
        fs.unlinkSync(localFilePath);
        console.error("Cloudinary upload failed:", error.message);
        return null;
    }
}

export { uploadToCloudinary };
