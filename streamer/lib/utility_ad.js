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
// The query to Active Directory requires username/password to be set in the configuration.
//
var _findUser = function(name) {
    var ad = new ActiveDirectory(config.get('ActiveDirectory'));
    ad.findUser(name, function(err, user) {
        if (err) {
            utility.printErr('AD', "cannot find user: " + name + ", reason: " + err);
            return None;
        }
        return user;
    });
};

module.exports.findUser = _findUser;