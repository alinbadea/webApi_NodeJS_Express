const express = require('express');
const jwt = require('jsonwebtoken');
const logger = require('./logger/logger.js');
const bookRoutes = require('./routes/bookRoutes.js');
const clientRoutes = require('./routes/clientRoutes.js');
const authRoutes = require('./routes/authRoutes.js');

const app = express();
app.use(express.json());

app.use((req, res, next)=>{
    logger.info(`${req.method}: in middleware 1`);
    next();
});
app.use((req, res, next)=>{    
    if(req.path.indexOf('/login')>=0 || req.path.indexOf('/register')>=0 ||
        req.path.indexOf('/verifyEmail')>=0 || req.path.indexOf('/forgotPassword')>=0){
        next();
        return;
    }
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).send('Utilizatorul nu este autentificat.');

    const token = authHeader.split(' ')[1];
    if(!token) return res.status(401).send('Utilizatorul nu este autentificat.');

    let validationResult;
    try{
        validationResult = jwt.verify(token, process.env.NODE_SECRET || 'secret');
    }catch(e){
        return res.sendStatus(401);
    }
    req.user = validationResult;
    next();
})
app.get('/', (req,res)=>{
    throw new Error('A aparut o eroare!!');
    res.send('API pentru o biblioteca.');
});

app.use('/api/auth', authRoutes);
app.use('/api/books',bookRoutes);
app.use('/api/clients',clientRoutes);

app.use((err, req, res, next)=>{
    logger.error(err);
    res.status(500).send('A aparut o eroare!!');
})
app.listen(5600, ()=>{
    logger.info(`Aplicatia asculta pe portul 5600...`);
})