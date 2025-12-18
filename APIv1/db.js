const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  //host: //'bdwftrtn9yvpl8tjjerf-mysql.services.clever-cloud.com',
  //user: //'ueqi5zw1ldw0uyfv',
  //password: //'Mz604aCWn3ZQvk6Zkzwo', // tu contraseña
  //database: //'bdwftrtn9yvpl8tjjerf', // el nombre de tu base
  //port:3306,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
