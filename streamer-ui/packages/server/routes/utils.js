import { join } from "path";
import { accessSync, F_OK } from "fs";
import fetch from 'node-fetch';

const STREAMER_UI_PROJECT_DIR = process.env.STREAMER_UI_PROJECT_DIR || __dirname + '/uploads';
const STREAMER_UI_BUFFER_DIR = process.env.STREAMER_UI_BUFFER_DIR || __dirname + '/uploads';
const STREAMER_URL_PREFIX = process.env.STREAMER_URL_PREFIX || "http://streamer:3001";

// Get the streamer UI buffer directory name
export function getStreamerUIBufferDirname(projectNumber, subjectLabel, sessionLabel, dataType) {
    let streamerUIBufferDirname;
    if (projectNumber && subjectLabel && sessionLabel && dataType) {
        var sub = 'sub-' + subjectLabel;
        var ses = 'ses-' + sessionLabel;
        streamerUIBufferDirname = join(STREAMER_UI_BUFFER_DIR, projectNumber, sub, ses, dataType);
    }
    return streamerUIBufferDirname;
}

// Get the project storage directory name
export function getProjectStorageDirname(projectNumber, subjectLabel, sessionLabel, dataType) {
    let projectStorageDirname;
    if (projectNumber && subjectLabel && sessionLabel && dataType) {
        var sub = 'sub-' + subjectLabel;
        var ses = 'ses-' + sessionLabel;
        projectStorageDirname = join(STREAMER_UI_PROJECT_DIR, projectNumber, 'raw', sub, ses, dataType);
    }
    return projectStorageDirname;
}

// Check if the file already exists
export function fileExists(filename, dirname) {
    const targetPath = join(dirname, filename);
    console.log("Check dirname:" + dirname);
    console.log("Check filename:" + filename);
    console.log("Check if targetPath exists:");
    console.log(targetPath);
    let fileExists = true;
    try {
        accessSync(targetPath, F_OK);
    } catch (err) {
        fileExists = false;
    }
    return fileExists;
}

// Get the streamer URL
export function getStreamerUrl(projectNumber, subjectLabel, sessionLabel, dataType) {
    let url;
    if (projectNumber && subjectLabel && sessionLabel && dataType) {
        url = `${STREAMER_URL_PREFIX}/user/${projectNumber}/${subjectLabel}/${sessionLabel}/${dataType}`;
    }
    return url;
}

// Fetch once with timeout in milliseconds
export async function fetchOnce(url, options, timeout) {
    return Promise.race([
        // Fetch route
        fetch(url, options).then((response) => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response;
        }).then((response) => {
            return response.json();
        }).catch((err) => {
            throw err;
        }),
        // Timer route
        new Promise((resolve, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        ).catch((err) => {
            throw err;
        })
    ]);
}

// Retry fetch with number of retries and timeout in milliseconds
export async function fetchRetry(url, options, numRetries, timeout) {
    try {
        return await fetchOnce(url, options, timeout);
    } catch (error) {
        if (numRetries === 1) throw error;
        const newNumRetries = numRetries - 1;
        return await fetchRetry(url, options, newNumRetries, timeout);
    }
}

// Get basic auth string for "Authorization" key in headers
export function basicAuthString(username, password) {
    const credentials = `${username}:${password}`;
    const b64encoded = Buffer.from(credentials, 'binary').toString('base64');
    return `Basic ${b64encoded}`;
}
