/*This file connects the app to the database. 
It gets the login details from the .env file. 
It lets the app make many database requests at 
the same time. Then it shares the connection 
so other files can use it.*/

// Import mysql2 with promise support
const mysql = require("mysql2/promise");

// Create a connection pool
const pool = mysql.createPool({

  // Database host from .env file
  host: process.env.DB_HOST,

  // Database username from .env
  user: process.env.DB_USER,

  // Database password from .env
  password: process.env.DB_PASSWORD,

  // Database name from .env
  database: process.env.DB_NAME,

  // Wait if connections are busy
  waitForConnections: true,

  // Allow maximum 10 connections
  connectionLimit: 10,

  // No limit for waiting requests
  queueLimit: 0
});

// Export the pool so other files can use it
module.exports = pool;