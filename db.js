const mysql = require('mysql2');
const env = require('dotenv');
env.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

connection.connect((error) => {
    if (error) {
        console.error('Error while connecting to MySQL Database:', error);
    } else {
        console.log('Connected to MySQL database..!!');
    }
});

module.exports=connection;