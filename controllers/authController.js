const jwt = require('jsonwebtoken');
const pool = require('../db/dbConnection.js');
const Joi = require('joi');
const crypto = require('crypto');
const mail = require('../mail.js');
const mailTemplates = require('../mailTemplates.js');
const {secretKey} = require('../settings.js');

const login = async (req, res, next)=>{
    const username = req.body.username;
    const pass = req.body.password;

    const hash = hashPassword(pass);
    
    //1. autentificare
    const check = 'select * from users where username= $1 and password=$2';
    try{
      let result = await pool.query(check,[username, hash]);
      if(result.rowCount==0){
        return res.status(401).send('Cannot authenticate user.');
      }
      const user = result.rows[0];
      if(!user.isEmailVerified){
        return res.status(401).send('Email not verified');
      }
       //utilizatorul exista. creaza token-ul
        //1. cheia secreta
        
        //2. datele utilizatorului
        const data={
            sub:user.id,
            name:user.username,
            email:user.email,
        };
        //3. durata de valabilitate
        const durata = 3600;
        //4. genereaza token-ul
        const token = jwt.sign(data, secretKey, {expiresIn:durata});
        res.send({
            token:token,
            name:'alin badea',
            role:'admin'
        });
    }catch(e){
      next(e);
    }
};
const register = async (req, res, next)=>{
  const {username, email, password, retypePassword} = req.body;
  const validationResult = validateCredentials({username, email, password, retypePassword});
  if(validationResult.error){
    return res.status(400).send(validationResult.error.details[0].message);
  }
  //1. verificam daca utilizatorul exista deja
  const check = 'select * from users where username = $1';
  try {
    let result = await pool.query(check, [username]);
    if (result.rowCount != 0) {
      return res.status(400).send('Username already exists.');
    }
     //2. hash password
    const passwordHash = hashPassword(password);

    //3. create and save user account
    const query = 'insert into users(username, email, password) values($1, $2, $3)';
    result = await pool.query(query, [username, email, passwordHash]);
    //3.5 send email
    await sendEmailValidation({username, email});
    //4. send response
    res.send('Account created');
  }catch (e) {
    next(e);
  } 
};
const verifyEmail = async (req, res, next)=>{
  const hashData = req.query.data;
  if(!hashData){
    return res.status(403).send('Cannot verify email');
  }
  const username = Buffer.from(hashData,'base64').toString('ascii');
  const check = 'select * from users where username = $1 and "isEmailVerified"=false';
  try{
    let result = await pool.query(check, [username]);
    if(result.rowCount==0){
      return res.status(403).send('Cannot verify email');
    }
    const query = 'update users set "isEmailVerified"=true where username=$1';
    result = await pool.query(query, [username]);
    res.send('Email was verified successfuly.');
  }catch(e){
    next(e);
  }
};
const sendResetPasswordLink = async (req, res, next)=>{
  //1. valideaza email
  const schema = Joi.object({email:Joi.string().email().required()});
  let validationResult = schema.validate(req.body);
  if(validationResult.error){
    return res.status(400).send(validationResult.error.details[0].message);
  }
  //2. verifica daca email-ul exista
  const check = 'select * from users where email=$1';
  try {
    let result = await pool.query(check,[req.body.email]);
    if(result.rowCount==0){
      return res.status(400).send('Cannot reset password for this email');
    }
    let user = result.rows[0];
    //3. creaza token-ul
    let token = jwt.sign({id:user.id}, secretKey, {expiresIn:300});
    await mail.sendEmail(user.email, 'Password reset', mailTemplates.getPasswordResetTemplate(token));
    res.send('A password reset link was send to the specified email');
  } catch (e) {
    next(e);
  }
};
const resetPassword = async (req, res, next)=>{
  const {token} = req.params;
  let tokenData;
  try{
    tokenData = jwt.verify(token, secretKey);
  }catch(e){
    return res.sendStatus(400);
  }
  const schema = Joi.object({
    password: Joi.string().alphanum().required(),
    retypePassword: Joi.string().required().valid(Joi.ref('password'))
  });
  validationResult = schema.validate(req.body);
  if(validationResult.error){
    return res.status(400).send(validationResult.error.details[0].message);
  }
  const query = 'update users set password=$1 where id=$2';
  try {
    let result = await pool.query(query, [hashPassword(req.body.password), tokenData.id]);
    if(result.rowCount==0){
      return res.sendStatus(400);
    }
    return res.send('Password reset successful!');
  } catch (e) {
    next(e);
  }
}
async function sendEmailValidation(data){
  const userHash = Buffer.from(data.username).toString('base64');
  const content = mailTemplates.getEmailValidationTemplate(data.username, userHash);
  mail.sendEmail(data.email, 'Email validation', content);
}
function validateCredentials(credentials){
  const schema = Joi.object({
    username:Joi.string().min(5).required(),
    email: Joi.string().email().required(),
    password: Joi.string().alphanum().required(),
    retypePassword: Joi.string().required().valid(Joi.ref('password'))
  });
  return schema.validate(credentials);
}
function hashPassword(password){
  const salt = 'secretSalt';
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash;
}
module.exports = {
    login, register, verifyEmail, sendResetPasswordLink, resetPassword
};