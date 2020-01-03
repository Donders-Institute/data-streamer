const createError = require("http-errors");
const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fileUpload = require("express-fileupload");

const routes = require('./routes/index');
const modAuthentication = require('./routes/mod_authentication');
const modBegin = require('./routes/mod_begin');
const modValidateFile = require('./routes/mod_validateFile');
const modAddFile = require('./routes/mod_addFile');
const modFinalize = require('./routes/mod_finalize');
const modSubmit = require('./routes/mod_submit');
const modListProjects = require('./routes/mod_listProjects');
const modClean = require('./routes/mod_clean');

var app = express();

app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

const STREAMER_UI_HOST = process.env.STREAMER_UI_HOST || "localhost";
const STREAMER_UI_PORT = process.env.STREAMER_UI_PORT || 9000;

/* session property
   - rolling expiration upon access
   - save newly initiated session right into the store
   - delete session from story when unset
   - cookie age: 4 hours (w/ rolling expiration)
   - session data store: memory on the server
*/
app.use(session({
    secret: 'somesecret',
    resave: true,
    rolling: true,
    saveUninitialized: true,
    unset: 'destroy',
    name: 'streamer-ui.sid',
    cookie: {
        httpOnly: false,
        maxAge: 4 * 3600 * 1000
    }
}));

// Serve static frontend files
app.use('/', routes);

// POST Authentication
app.post('/login', modAuthentication.authenticateUser);
app.post('/logout', modAuthentication.logoutUser);

// POST Begin upload session
app.post('/begin', modAuthentication.isAuthenticated, modBegin.begin);

// POST Validate file for upload session
app.post('/validateFile', modAuthentication.isAuthenticated, modValidateFile.validateFile);

// POST Add file to upload session
app.post('/addFile', modAuthentication.isAuthenticated, modAddFile.addFile);

// POST Finalize upload session
app.post('/finalize', modAuthentication.isAuthenticated, modFinalize.finalize);

// POST Submit a streamer job
app.post('/submit', modAuthentication.isAuthenticated, modSubmit.submit);

// GET Obtain list of projects for user
app.get('/projects', modAuthentication.isAuthenticated, modListProjects.getListProjects);

// POST Clean database tables
app.get('/clean', modClean.clean);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handlers

// Development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(STREAMER_UI_PORT, STREAMER_UI_HOST);
console.log(`Running on http://${STREAMER_UI_HOST}:${STREAMER_UI_PORT}`);

module.exports = app;
