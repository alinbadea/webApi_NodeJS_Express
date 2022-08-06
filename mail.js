const {smtp, emailFrom} = require('./settings.js');
const nodemailer = require('nodemailer');

const sendEmail = async(to, subject, content)=>{
    const transport = nodemailer.createTransport(smtp);
    await transport.sendMail({
        from:emailFrom,
        to:to,
        subject:subject,
        html:content
    });
};

module.exports ={
    sendEmail
};