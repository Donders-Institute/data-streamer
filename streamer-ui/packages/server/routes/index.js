const express = require('express');
const path = require("path");
const modAuthentication = require('./mod_authentication');

var router = express.Router();

// GET single page application web page
router.get('/', modAuthentication.isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname + '/./frontend/index.html'));
});

// GET login page
router.get('/login', (req, res) => {
    // Comment out for testing
    // req.session.user = 'testuser';
    // req.session.authenticated = true;
    res.sendFile(path.join(__dirname + '/../frontend/index.html'));
});

// GET logout page
router.get('/logout', (req, res) => {
    modAuthentication.logoutUser(req, res);
});

module.exports = router;
