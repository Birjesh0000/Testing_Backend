// utils/ApiError.js

/**
 * ApiError (Standardized Error Response Format)
 * ---------------------------------------------
 * Why we need this?
 * -----------------
 * Just like `ApiResponse` makes success responses consistent,
 * `ApiError` ensures ALL errors follow a common structure.
 * Instead of sending random error objects (or Express default error stack),
 * this class helps us send clear, predictable, and frontend-friendly error responses.
 *
 * Standard error structure returned to client:
 * {
 *    statusCode: <number>,   // HTTP status code (400, 401, 500, etc.)
 *    data: null,             // no data for errors (kept consistent with ApiResponse)
 *    message: <string>,      // user-friendly error message
 *    success: false,         // always false for errors
 *    error: <array|string>,  // extra error details (validation errors, etc.)
 *    stack: <string>         // error stack trace (only in development, optional)
 * }
 *
 * Benefits:
 * ---------
 * ✅ Consistency between success (ApiResponse) and failure (ApiError)
 * ✅ Easier debugging (stack trace preserved when needed)
 * ✅ More control over which error details you expose
 * ✅ Cleaner controller code (throw new ApiError(...) instead of manual res.json)
 *
 * Example Usage:
 * --------------
 * // Inside a controller
 * import { ApiError } from "../utils/ApiError.js";
 *
 * if (!user) {
 *    throw new ApiError(404, "User not found");
 * }
 *
 * // Output:
 * {
 *   "statusCode": 404,
 *   "data": null,
 *   "message": "User not found",
 *   "success": false,
 *   "error": [],
 *   "stack": "Error stack trace here..." (optional)
 * }
 */

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        error = [],
        stack = ""
    ) {
        super(message); // Call parent (Error) constructor with message
        this.statusCode = statusCode;
        this.data = null; // keep same structure as ApiResponse
        this.message = message;
        this.success = false; // always false for errors
        this.error = error;

        // Preserve stack trace (useful for debugging)
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
