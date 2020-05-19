import createError from "http-errors";

import { purgeTables } from "./db";

// Purge the database tables (admin user only)
export async function purge(req, res, next) {
    let purgeResult;
    try {
        purgeResult = await purgeTables();
    } catch (err) {
        return next(createError(500, err.message));
    }

    console.log(JSON.stringify(purgeResult));
    res.status(200).json({
        data: purgeResult,
        error: null
    });
}
