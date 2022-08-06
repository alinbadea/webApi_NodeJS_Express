const Joi = require('joi');
const pool = require('../db/dbConnection.js');

const getBooks = async (req, res, next)=>{
    const sortBy = req.query.sortBy;
    let query = 'select * from books';
    if(sortBy){
        query+=` order by ${sortBy}`;
    }
    try{
        const result = await pool.query(query);
        res.send(result.rows);
    }catch(e){
        next(e);
    }
};
const getBookDetails = async (req, res, next)=>{
    const id = parseInt(req.params.id);
    const query = 'select * from books where id=$1';
    try{
        const result = await pool.query(query, [id]);
        if(result.rowCount==0){
            return res.status(404).send('Cartea nu exista');
        }else{
            res.send(result.rows[0]);
        }
    }catch(e){
        next(e);
    }
};
const createBook = async (req, res, next)=>{
    const validationResult = valideazaCarte(req.body);
    if(validationResult.error){
        return res.status(400).send(validationResult.error.details[0].message);
    }
    const query = 'insert into books(title, author) values($1, $2) returning *;';
    try{
        const {title, author} = req.body;
        const result = await pool.query(query, [title, author]);
        if(result.rowCount==1){
            const carte = result.rows[0];
            let location = `${req.protocol}://${req.get('Host')}${req.originalUrl}/${carte.id}`;
            res.header('Location', location);
            res.status(201).send(carte);
        }
    }catch(e){
        next(e);
    }
};

const updateBook = async (req, res, next)=>{
    const validationResult = valideazaCarte(req.body);
    if(validationResult.error){
        return res.status(400).send(validationResult.error.details[0].message);
    }
    
    const id = parseInt(req.params.id);
    const check = 'select * from books where id=$1';
    try{
        let result = await pool.query(check, [id]);
        if(result.rowCount==0){
            return res.status(404).send('Cartea nu exista');
        }
        const {title, author} = req.body;
        const query = 'update books set title=$1, author=$2 where id=$3';
        result = await pool.query(query, [title, author, id]);
        res.status(204).send();
    }catch(e){
        next(e);
    }
};

const partiallyUpdateBook = (req, res)=>{
    const toUpdate = books.find(x=>x.id == parseInt(req.params.id));
    if(!toUpdate){
        return res.status(404).send('Cartea nu exista');
    }
    const copy ={};
    Object.assign(copy, toUpdate);

    const operatii = req.body;
    for(let o of operatii){
        switch(o.op){
            case 'replace':
            case 'add':
                copy[o.path] = o.value;
                break;
        }
    }
    
    const validationResult = valideazaCarte(copy);
    if(validationResult.error){
        return res.status(400).send(validationResult.error.details[0].message);
    }
    Object.assign(toUpdate, copy);
    res.status(204).send();
};
const deleteBook = async (req, res, next)=>{        
    const id = parseInt(req.params.id);
    const check = 'select * from books where id=$1';
    try{
        let result = await pool.query(check, [id]);
        if(result.rowCount==0){
            return res.status(404).send('Cartea nu exista');
        }
        
        const query = 'delete from books where id=$1';
        result = await pool.query(query, [id]);
        res.status(204).send();
    }catch(e){
        next(e);
    }
};

function valideazaCarte(carte){
    const schema = Joi.object({
        title:Joi.string().min(5).required(),
        author:Joi.string().required()
    });
    return schema.validate(carte);
}

module.exports = {
    getBooks,getBookDetails, createBook, updateBook,
    partiallyUpdateBook, deleteBook
}