import multer from "multer";
// import path from "path";  // (Optional) if you want to modify file extensions

/**
 *  Multer Middleware Setup
 * ---------------------------
 * Multer is used here to handle multipart/form-data requests (file uploads).
 * By default, Node/Express cannot understand file uploads directly,
 * so we use multer as a middleware to process incoming files.
 *
 * In this setup:
 *   - Files will be temporarily stored in `./public/temp` directory
 *   - The file will be saved with its original name (as sent from client)
 */

// Configure storage engine for multer
const storage = multer.diskStorage({

    // Destination (where to store uploaded files temporarily)
    // `cb` (callback) -> cb(error, destinationPath)
    destination: function (req, file, cb) {
        cb(null, "./public/temp"); // save files in ./public/temp folder
    },

    // Filename (how to name the file when saving)
    // `file.originalname` is the name of the file as uploaded by the client
    filename: function (req, file, cb) {
        cb(null, file.originalname); // keep original file name
        // Example: "profile.jpg" will be saved as "profile.jpg"
        // Better practice: add Date.now() for uniqueness
        // e.g., cb(null, Date.now() + "-" + file.originalname);
    }
});

// Export multer instance as middleware
// This will be used in routes like:
// router.post("/upload", upload.single("fieldName"), controllerFn);
export const upload = multer({ storage });