var config = require('config');
var ActiveDirectory = require('activedirectory');
var utility = require('./utility');

// utility function for finding a user profile in the Active Directory.
//
// The argument `name` can be one of the following type of string:
//
// - sAMAccountName = 'username'
// - userPrincipalName = 'username@domain.com'
// - dn = 'CN=Smith\\, John,OU=Users,DC=domain,DC=com'
//
// The callback function `cb` would expect two arguments to be passed on after
// the query is made.  The two arguments are:
//
// - error: the error object, null if the query is successful
// - user: the user profile
//
// The query to Active Directory requires username/password to be set in the configuration.
//
var _findUser = function(name, cb) {
    var ad = new ActiveDirectory(config.get('ActiveDirectory'));
    ad.findUser(name, cb);
};

module.exports.findUser = _findUser;