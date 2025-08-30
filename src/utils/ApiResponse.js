// utils/ApiResponse.js

/**
 * ApiResponse (Standardized API Response Format)
 * ----------------------------------------------
 * Why we need this?
 * -----------------
 * When building APIs, consistency is important.
 * If every route returns data in a different shape, 
 * the frontend developer will get confused (sometimes data, sometimes error, sometimes just message).
 *
 * To avoid this, we define a reusable `ApiResponse` class.
 * Every successful or controlled response will follow the same format:
 *
 * {
 *    statusCode: <number>,   // HTTP status code (200, 201, 400, etc.)
 *    data: <any>,            // the actual response data (object, array, string, etc.)
 *    message: <string>,      // human-readable message (default = "Success")
 *    success: <boolean>      // automatically true for 2xx and 3xx, false otherwise
 * }
 *
 * Benefits:
 * ---------
 * Consistency across all routes
 * Frontend always knows the response structure
 * Easier debugging & logging
 * Clear separation between success/failure
 *
 * Example Usage:
 * --------------
 * // Inside a controller
 * import { ApiResponse } from "../utils/ApiResponse.js";
 *
 * res.status(200).json(
 *     new ApiResponse(200, { user }, "User fetched successfully")
 * );
 *
 * // Output:
 * {
 *   "statusCode": 200,
 *   "data": { "user": {...} },
 *   "message": "User fetched successfully",
 *   "success": true
 * }
 */

class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        // Automatically mark success if status is in 2xx or 3xx range
        this.success = statusCode >= 200 && statusCode < 400;
    }
}

export { ApiResponse };
