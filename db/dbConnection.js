const pg = require('pg');
const pool = new pg.Pool({
    host:'localhost',
    username:'alin',
    password:'alin123$%^',
    database:'BooksDb',
    port:5432
});

module.exports = pool;