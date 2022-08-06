const express = require('express');
const router = express.Router();

router.get('/', (req, res, next)=>{
    res.send('Lista de clienti');
});

module.exports = router;