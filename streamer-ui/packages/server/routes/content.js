import createError from "http-errors";

// Middleware to verify Content-Type 'application/json' in header
export function hasJson(req, res, next) {
    if (!req.is('application/json')) {
        return next(createError(400, "Invalid Content-Type"));
    }

    next();
}
