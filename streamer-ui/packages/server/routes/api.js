var express = require('express');
const content = require("./content");
const pdb = require("./pdb");
const auth = require("./auth");
const formData = require("./formData");
const upload = require("./upload");
const admin = require("./admin");
const stager = require("./stager");

var router = express.Router();

// GET Obtain list of projects for regular user
router.get('/projects',
    auth.isAuthenticated,
    pdb.getProjects);

// GET Obtain the destinating DAC namespace in the Repository through the Stager's API: /rdm/DAC/project/{projectId}.
router.get('/stager/dac/:projectId',
    auth.isAuthenticated,
    stager.getDac);

// POST Begin upload session for regular user, obtain an upload session id
router.post('/upload/begin',
    auth.isAuthenticated,
    content.hasJson,
    upload.verifyStructure,
    upload.begin);

// POST Validate file for upload session for regular user
router.post('/upload/validatefile',
    auth.isAuthenticated,
    formData.processValidateFile,
    upload.verifyUploadSessionId,
    upload.verifyStructure,
    upload.verifyFile,
    upload.validateFile);

// POST Add file to upload session for regular user
router.post('/upload/addfile',
    auth.isAuthenticated,
    formData.processAddFile,
    upload.verifyUploadSessionId,
    upload.verifyStructure,
    upload.verifyFile,
    upload.addFile);

// POST Finalize upload session for regular user
router.post('/upload/finalize',
    auth.isAuthenticated,
    content.hasJson,
    upload.verifyUploadSessionId,
    upload.finalize);

// POST Submit a streamer job for regular user
router.post('/upload/submit',
    auth.isAuthenticated,
    content.hasJson,
    upload.verifyUploadSessionId,
    upload.verifyStructure,
    upload.submit);

// POST Purge old data in the database tables for admin user
router.post('/purge',
    auth.verifyAdminCredentials,
    content.hasJson,
    admin.purgeOld);

// POST Purge all data in the database tables for admin user
router.post('/purge/all',
    auth.verifyAdminCredentials,
    content.hasJson,
    admin.purgeAll);

module.exports = router;