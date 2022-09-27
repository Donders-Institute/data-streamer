const ApolloClient = require('@apollo/client/core').ApolloClient
const InMemoryCache = require('@apollo/client/core').InMemoryCache;
const HttpLink = require('@apollo/client/core').HttpLink;
const ApolloLink = require('@apollo/client/core').ApolloLink;
const gql = require('@apollo/client/core').gql;
const onError = require("@apollo/client/link/error").onError;
const setContext = require('@apollo/client/link/context').setContext;
const Issuer = require("openid-client").Issuer;

const mysql = require('mysql');
const path = require("path");
const createError = require("http-errors");
const config = require(path.join(__dirname + '/../config/streamer-ui-config.json'));

const fetch = require("node-fetch");

// Obtain list of user projects from PDB2 core-api
var _getProjectsV2 = function(req, res, next) {

    // load configurations for PDBv2 connection
    if ( ! config.projectDatabase.v2 ) {
        throw next(createError(500, "missing PDBv2 configuration"));
    }

    const AUTH_SERVER_URL    = config.projectDatabase.v2.authServerUrl;
    const AUTH_CLIENT_ID     = config.projectDatabase.v2.authClientId;
    const AUTH_CLIENT_SECRET = config.projectDatabase.v2.authClientSecret;
    const CORE_API_URL       = config.projectDatabase.v2.coreApiUrl;
    
    // Obtain username
    const username = req.session.user;

    // GraphQL query to get user's projects
    const query = gql`
    query GetUser($username: ID!) {
        user(username: $username) {
            username
            projects {
                role
                project {
                    number
                    title
                    status
                }
            }
        }
    }`;

    Issuer.discover(AUTH_SERVER_URL).then(issuer => {
        const authClient = new issuer.Client({
            client_id: AUTH_CLIENT_ID,
            client_secret: AUTH_CLIENT_SECRET,
            scope: "urn:dccn:pdb:core-api:query",
            response_types: ["id_token token"],
            token_endpoint_auth_method: "client_secret_basic"
        });

        authClient.grant({
            grant_type: "client_credentials"
        }).then(token => {
            const client = configureCoreApiClient(CORE_API_URL, token.access_token);
            client.query({
                query: query,
                variables: { username },
            }).then(result => {

                // construct returning data with structure compatible with `_getProjectsV1`
                const data = result.data.user.projects.filter(p => {
                    return ["Manager", "Contributor"].includes(p.role) && p.project.status === "Active";
                }).map(p => {
                    return {
                        projectNumber: p.project.number,
                        title: p.project.title
                    };
                });

                // Success
                return res.status(200).json({
                    data: data,
                    error: null
                });
            }).catch(err => {
                console.log(err);
                throw next(createError(500, "cannot query core api: " + err.message));
            });
        }).catch(err => {
            throw next(createError(500, "cannot retrieve access token: " + err.message));
        });
    }).catch(err => {
        throw next(createError(500, "cannot discover auth server: " + err.message));
    });
}

// Obtain list of user projects from PDB1 SQL database
var _getProjectsV1 = function(req, res, next) {

    // load configurations for PDBv1 connection
    if ( ! config.projectDatabase.v1 ) {
        throw next(createError(500, "missing PDBv1 configuration"));
    }

    const PDB_HOST = config.projectDatabase.v1.host;
    const PDB_PORT = config.projectDatabase.v1.port;
    const PDB_USERNAME = config.projectDatabase.v1.username;
    const PDB_PASSWORD = config.projectDatabase.v1.password;
    const PDB_DATABASE_NAME = config.projectDatabase.v1.databaseName;

    // Obtain username
    const username = req.session.user;

    // Create SQL statement
    const sql = `SELECT id AS projectNumber, projectName AS title FROM projects WHERE id in (SELECT project FROM acls WHERE user = "${username}" AND projectRole IN ("contributor", "manager"));`;
    var con = mysql.createConnection({
        host: PDB_HOST,
        port: PDB_PORT,
        user: PDB_USERNAME,
        password: PDB_PASSWORD,
        database: PDB_DATABASE_NAME
    });

    con.connect(function (err) {
        if (err) {
            return next(createError(500, err.message));
        }
        con.query(sql, function (err, results) {
            if (err) {
                con.end();
                return next(createError(500, err.messsage));
            } else {
                con.end();
                // Success
                return res.status(200).json({
                    data: results,
                    error: null
                });
            }
        });
    });
}

// Configure Core API connection
const configureCoreApiClient = (coreApiServerUrl, accessToken) => {
    
    const httpLink = new HttpLink({
        uri: coreApiServerUrl,
        fetch: fetch
    });

    const authLink = setContext((_, {headers}) => {
        return {
            headers: {
                ...headers,
                authorization: accessToken ? `Bearer ${accessToken}` : null
            }
        };
    });

    const errorLink = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            graphQLErrors.forEach(({ message, locations, path }) => {
                console.error(`[CoreApiClient][GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
            });
        }
        if (networkError) {
            console.error(`[CoreApiClient][Network error]: ${networkError}`);
        }
    });

    const client = new ApolloClient({
        link: ApolloLink.from([
            authLink,
            errorLink,
            httpLink
        ]),
        cache: new InMemoryCache()
    });

    return client;
};


module.exports.getProjects = process.env.STREAMER_UI_PDB_VERSION === "2" ? _getProjectsV2:_getProjectsV1;
