
/**
 * AsyncHandler (Higher Order Function)
 * ------------------------------------
 * Why we need this?
 * -----------------
 * In Express, route handlers (controllers) often perform async operations 
 * like DB queries, file I/O, or API calls.
 * If an error occurs inside an async function and we don’t catch it,
 * Express won’t handle it automatically → the server may crash.
 *
 * Normally, we would need to wrap every async route in try/catch:
 *
 *   app.get("/users", async (req, res) => {
 *       try {
 *           const users = await User.find();
 *           res.json(users);
 *       } catch (err) {
 *           res.status(500).json({ error: err.message });
 *       }
 *   });
 *
 * This becomes repetitive and messy when we have many routes.
 *
 * What does AsyncHandler do?
 * --------------------------
 * - It’s a wrapper function (higher order function).
 * - It takes an async function `fn` (our route handler/controller).
 * - It runs the function inside a try/catch automatically.
 * - If error occurs, it sends the error response (or can forward to global error middleware).
 *
 * Benefits:
 * ---------
 * No need to repeat try/catch in every route.
 * Keeps routes clean and readable.
 * Ensures all async errors are handled consistently.
 *
 * Usage Example:
 * --------------
 * router.get("/users", AsyncHandler(async (req, res) => {
 *     const users = await User.find();
 *     res.json(users);
 * }));
 */

const AsyncHandler = (fn) => async (req, res, next) => {
    try {
        // Run the passed async function (controller)
        await fn(req, res, next);
    } catch (error) {
        // If error occurs → send response (basic handling)
        // In advanced setups, we might call `next(error)` instead 
        // so that centralized error middleware can handle it.
        res.send({ error: error.message });
    }
};

export { AsyncHandler };
