const _mailer  = require('nodemailer');
const _utility = require('./utility');

var _sendToAdmin = function(subject, bodyText, bodyHtml, attachments) {
    _sendToAddresses(null, true, subject, bodyText, bodyHtml, attachments);
}

var _sendToAddresses = function(addresses, includeAdmin, subject, bodyText, bodyHtml, attachments) {

    // load the up-to-date configuration
    var mailerCfg = require('../config/mailer.json');
    delete require.cache[require.resolve('../config/mailer.json')];

    // configure the transporter
    var transporter = _mailer.createTransport(mailerCfg['SMTP']);

    // compose the toAddress
    var toAddress = '';
    if ( addresses ) {
        toAddress += addresses;
    }
    if ( includeAdmin ) {
        toAddress = ((toAddress == '')?'':toAddress+', ') + mailerCfg['adminEmails'];
    }
    if (toAddress) {
        var mailOptions = {
            from: mailerCfg['fromAddress'],
            to: toAddress,
            subject: subject
        };

        if ( bodyText ) mailOptions.text = bodyText;
        if ( bodyHtml ) mailOptions.html = bodyHtml;
        if ( attachments ) mailOptions.attachments = attachments;

        // sending the mail
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                _utility.printErr('mailer:sendToAddresses', error);
            }
        });
    }
}

module.exports.sendToAdmin = _sendToAdmin;
module.exports.sendToAddresses = _sendToAddresses;
