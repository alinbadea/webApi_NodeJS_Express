const settings ={
    smtp:{
        host:process.env.SMTP_HOST || 'in-v3.mailjet.com',
        port:process.env.SMTP_PORT || 587,
        secure:false,
        auth:{
            user:process.env.SMTP_USER || 'd5848dfa084f3217e884394f47ab70fd',
            pass:process.env.SMTP_PASS || 'b8cece650bda8196a246f69ae39d6f7e'
        }
    },
    emailFrom: 'alinbadea@upet.ro',
    secretKey: process.env.NODE_SECRET || 'secret'
};
module.exports = settings;