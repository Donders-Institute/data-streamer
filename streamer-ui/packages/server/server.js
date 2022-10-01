const createError = require("http-errors");
const express = require("express");
const session = require('express-session');
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("morgan");
const path = require("path");
require('log-timestamp');
require('dotenv').config();
var passport = require('passport');

var authRouter = require('./routes/oidc');
var apiRouter = require('./routes/api');

var app = express();

// Streamer UI server configuration
app.locals.ENV = process.env.NODE_ENV;
app.locals.HOST = "0.0.0.0";
app.locals.PORT = 9000;

app.locals.STREAMER_URL_PREFIX = process.env.STREAMER_URL_PREFIX || "http://service:3001";
app.locals.STREAMER_UI_BUFFER_DIR = process.env.STREAMER_UI_BUFFER_DIR || __dirname + '/uploads';
app.locals.STREAMER_UI_PROJECT_DIR = "/project";

// Streamer UI database configuration
app.locals.STREAMER_UI_DB_HOST = process.env.STREAMER_UI_DB_HOST || "ui-db";
app.locals.STREAMER_UI_DB_PORT = process.env.STREAMER_UI_DB_PORT || 5432;
app.locals.STREAMER_UI_DB_USER = process.env.STREAMER_UI_DB_USER || "postgres";
app.locals.STREAMER_UI_DB_PASSWORD = process.env.STREAMER_UI_DB_PASSWORD || "postgres";
app.locals.STREAMER_UI_DB_NAME = process.env.STREAMER_UI_DB_NAME || "postgres";

// debug option
app.locals.STREAMER_UI_DEBUG = process.env.STREAMER_UI_DEBUG ? (process.env.STREAMER_UI_DEBUG === 'true') : false;

app.use(logger('[:date[iso]] :method :url'));

// CORS configuration 
let whitelist = [];
if (app.locals.ENV === "development") {
    whitelist = [
        `http://${app.locals.STREAMER_URL_PREFIX}`,
        `http://${app.locals.HOST}:${app.locals.PORT}`, // streamer ui server
        `http://localhost:${app.locals.PORT}`,
        `http://${app.locals.HOST}:3000`, // streamer ui client
        "http://localhost:3000"
    ];
}
else {
    whitelist = [
        `http://${app.locals.STREAMER_URL_PREFIX}`,
        `http://ui:${app.locals.PORT}`,
        `https://ui:${app.locals.PORT}`,
        `http://${app.locals.HOST}:${app.locals.PORT}`,
        `https://${app.locals.HOST}:${app.locals.PORT}`,
        "https://streamer-acc.dccn.nl",
        "https://uploader-acc.dccn.nl",
        "https://uploader.dccn.nl"
    ];
}
const corsOptions = {
    origin: whitelist,
    credentials: true
};
app.use(cors(corsOptions));

// session property
//  - rolling expiration upon access
//  - save newly initiated session right into the store
//  - delete session from store when unset
//  - cookie age: 4 hours (w/ rolling expiration)
//  - session data store: postgresql database
app.use(session({
    store: new pgSession({
        pool: new pg.Pool({
            host: app.locals.STREAMER_UI_DB_HOST,
            port: app.locals.STREAMER_UI_DB_PORT,
            user: app.locals.STREAMER_UI_DB_USER,
            password: app.locals.STREAMER_UI_DB_PASSWORD,
            database: app.locals.STREAMER_UI_DB_NAME,
            keepAlive: true,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000
        }),
        tableName: 'usersession'
    }),
    secret: 'somesecret',
    resave: false,
    rolling: true,
    saveUninitialized: true,
    unset: 'destroy',
    name: 'streamer-ui.sid',
    cookie: {
        httpOnly: false,
        maxAge: 4 * 3600 * 1000  // 4 hours
    }
}));

app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

// OIDC auth router
app.use('/oidc', authRouter);

// API interface router
app.use('/api', apiRouter);

// Serve static files
if ( ! (app.locals.ENV === "development") ) {
    app.use(express.static(path.join(__dirname, 'frontend')));
}

// Serve frontend SPA for all other endpoints
app.get('*',
    (_, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
    }
);

// Error handler
// No stacktraces leaked to user
app.use(function (err, req, res, next) {
    console.log(err.message);
    res.status(err.status || 500).json({
        data: null,
        error: err.message
    });
});

app.listen(app.locals.PORT, app.locals.HOST);
console.log(`Server is running in ${app.locals.ENV} mode.`);
console.log(`Running on http://${app.locals.HOST}:${app.locals.PORT}`);

module.exports = app;
