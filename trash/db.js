const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'exemple',
  database: process.env.DB_NAME || 'exemple'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connectat a MariaDB');
});

module.exports = connection;
