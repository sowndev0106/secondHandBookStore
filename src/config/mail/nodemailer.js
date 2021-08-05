var nodemailer = require('nodemailer');
require('dotenv').config()
// const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN 
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_MAIN,
        pass: process.env.EMAIL_PASSWORD
    }
});
module.exports = {
    sendEmail: function sendEmail(emailReceive, subject, message) {
        var mailOptions = {
            from: process.env.EMAIL_MAIN,
            to: emailReceive,
            subject: subject,
            html: message
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
}