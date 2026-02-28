/*
This file starts the backend server.
It sets up Express, connects to the database,
and starts the server so it can receive requests.
*/

// Import express
const express = require("express");

// Import cors
const cors = require("cors");

// Load environment variables
require("dotenv").config();

// Connect to database
require("./db");

// Create express app
const app = express();

// Allow requests from other apps
app.use(cors());

// Allow JSON in requests
app.use(express.json());

// Log when server reloads
console.log("SERVER RELOADED");

// Set port
const PORT = process.env.PORT || 4000;

// Start server
app.listen(PORT, () => {
console.log(Server running on http://localhost:${PORT});
});