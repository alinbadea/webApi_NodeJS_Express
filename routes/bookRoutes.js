const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController.js');


router.get('/', booksController.getBooks);

router.get('/:id', booksController.getBookDetails);

router.post('/', booksController.createBook);

router.put('/:id', booksController.updateBook);

router.patch('/:id', booksController.partiallyUpdateBook);

router.delete('/:id', booksController.deleteBook);

module.exports = router;