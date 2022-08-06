const getEmailValidationTemplate = (username, userHash)=>{
    return `
    <html>
      <head>
        <style>
          a{background-color:'green';color:'white';display:'block'}
        </style>
      </head>
      <body>
        <p>Salut ${username}, pentru validarea adresei de email apasa pe acest buton</p>
        <a href="http://localhost:5600/api/auth/verifyEmail?data=${userHash}">Valideaza Email</a>
      </body>
    </html>
    `;
};

const getPasswordResetTemplate = (token)=>{
    return `
        <p>Salut! Pentru resetarea parolei apasa pe acest buton</p>
        <div>
            <a href="http://localhost:5600/resetPassword.html?data=${token}">Reseteaza parola</a>
        </div>
        <p>Password reset token: ${token}</p>
    `;
}

module.exports = {
    getEmailValidationTemplate, getPasswordResetTemplate
}