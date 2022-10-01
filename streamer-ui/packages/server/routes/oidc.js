var express = require('express');

const auth = require("./auth");

// openid-client
var Issuer = require('openid-client').Issuer;

// setup passport-openidconnect
var passport = require('passport');
var OidcStrategy = require('passport-openidconnect').Strategy;

var authServer = process.env.STREAMER_UI_AUTH_SERVER;

passport.use('oidc', new OidcStrategy({
    issuer: authServer,
    authorizationURL: authServer + '/connect/authorize',
    tokenURL: authServer + '/connect/token',
    userInfoURL: authServer + '/connect/userinfo',
    clientID: process.env.STREAMER_UI_AUTH_CLIENT_ID,
    clientSecret: process.env.STREAMER_UI_AUTH_CLIENT_SECRET,
    callbackURL: '/oidc/callback',
    scope: ["openid", "profile", "urn:dccn:identity:uid", "urn:dccn:pdb:core-api:query"],
}, (_issuer, _profile, _context, idToken, accessToken, _refreshToken, verified) => {
    Issuer.discover(authServer).then((issuer) => {
        new issuer.Client({
            client_id: process.env.STREAMER_UI_AUTH_CLIENT_ID,
        }).userinfo(accessToken).then(profile => {
            // only user with DCCN account is authorized??
            if ( ! profile['urn:dccn:uid'] ) throw new Error("Unauthorized user: " + _profile.id);
            return verified(null, {
                id_token: idToken,
                token: accessToken,
                username: profile['urn:dccn:uid'],
                displayName: profile.name
            });
        }).catch(err => {
            return verified(null, false);
        });
    });
}));

// serialize functions are needed to store user object (returned from the `verified` callback) in session.
passport.serializeUser(function(user, cb) {
    cb(null, user);
});
  
passport.deserializeUser(function(user, cb) {
    return cb(null, user);
});

var router = express.Router();

// endpoint to trigger OIDC login workflow
router.get('/login', passport.authenticate('oidc'));

// callback endpoint after authentication at OIDC provider
router.get('/callback', passport.authenticate('oidc', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/403'
}));

// endpoint to trigger logout workflow
// TODO: should better use DELETE or POST method? (CORS issue)
router.get('/logout',
    auth.isAuthenticated,
    (req, res) => {
        const id_token_hint = req.user.id_token;
        req.logout(err => {
            if (err) {
                console.log("service logout error: ", err);
            }
            // redirect browser to the end_session_endpoint of the OIDC provider
            res.redirect(process.env.STREAMER_UI_AUTH_SERVER + 
                "/connect/endsession?id_token_hint=" + id_token_hint + 
                "&post_logout_redirect_uri=" + req.protocol + '://' + req.get('host'));
        });
});

// endpoint go get user profile fetched from OIDC provider and stored in the session.
router.get("/profile",
    auth.isAuthenticated,
    (req, res) => {
        res.status(200).json({
            data: {
                id: req.user.username,
                name: req.user.displayName
            },
            error: null
        });
    }
);

module.exports = router