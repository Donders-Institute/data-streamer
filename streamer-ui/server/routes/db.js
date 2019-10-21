const { Client } = require('pg');

const STREAMER_UI_DATABASE_HOST = "ui-db"; //process.env.STREAMER_UI_DATABASE_HOST || "localhost";
const STREAMER_UI_DATABASE_PORT = process.env.STREAMER_UI_DATABASE_PORT || 5432;
const STREAMER_UI_DATABASE_USER = process.env.STREAMER_UI_DATABASE_USER || "postgres";
const STREAMER_UI_DATABASE_PASSWORD = process.env.STREAMER_UI_DATABASE_PASSWORD || "postgres";
const STREAMER_UI_DATABASE_NAME = process.env.STREAMER_UI_DATABASE_NAME || "postgres";

function connect() {
    const client = new Client({
        user: STREAMER_UI_DATABASE_USER,
        host: STREAMER_UI_DATABASE_HOST,
        database: STREAMER_UI_DATABASE_NAME,
        password: STREAMER_UI_DATABASE_PASSWORD,
        port: STREAMER_UI_DATABASE_PORT,
    })
    client.connect()
    return client;
}

async function _insert_login_event(username, ip_address, user_agent, error) {
    try {
        const client = await connect()
        const now = new Date();
        await client.query(`INSERT INTO session(username, ip_address, user_agent, time, error, event_type) VALUES($1, $2, $3, $4, $5, 'login');`, [username, ip_address, user_agent, now, error]);
        await client.end();
    } catch (error) {
        console.error(error);
    }
}

async function _insert_logout_event(username, ip_address, user_agent, error) {
    try {
        const client = await connect()
        const now = new Date();
        await client.query(`INSERT INTO session(username, ip_address, user_agent, time, error, event_type) VALUES($1, $2, $3, $4, $5, 'logout');`, [username, ip_address, user_agent, now, error]);
        await client.end();
    } catch (error) {
        console.error(error);
    }
}

async function _insert_upload_event(username, ip_address, user_agent, start_time, end_time, filesize_bytes, error) {
    try {
        const client = await connect()
        await client.query(`INSERT INTO upload(username, ip_address, user_agent, start_time, end_time, filesize_bytes, error) VALUES($1, $2, $3, $4, $5, $6, $7);`, [username, ip_address, user_agent, start_time, end_time, filesize_bytes, error]);
        await client.end();
    } catch (error) {
        console.error(error);
    }
}

module.exports.insert_login_event = _insert_login_event;
module.exports.insert_logout_event = _insert_logout_event;
module.exports.insert_upload_event = _insert_upload_event;
