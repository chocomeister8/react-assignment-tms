const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config({path: './config/.env'});

const connectDB = mysql.createConnection({
    host     : process.env.HOST,
    user     : process.env.USER,
    password : process.env.PASSWORD,
    database : process.env.DATABASE
}); 

connectDB.connect((err) => {
    if(err) {
        console.error('Error connecting to MYSQL:', err);
        return;
    }
    console.log('Connected to MYSQL database');
})


module.exports = connectDB;