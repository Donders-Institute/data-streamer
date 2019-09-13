const express = require('express');
const path = require("path");

var router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + './frontend/index.html'));
});

module.exports = router;
