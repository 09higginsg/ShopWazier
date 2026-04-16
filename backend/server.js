/*
This file starts the backend server.
It sets up Express, loads required packages,
and starts the server so it can receive requests.
It also connects route files like the Health route.
Product route has now been added.
*/

// Import express
const express = require("express");

// Import cors
const cors = require("cors");

// Load environment variables from .env
require("dotenv").config();

console.log("DB USER:", process.env.DB_USER);

// Import Health route file
const healthRoutes = require("./routes/health.routes");

// Import Product route file
// This is for product requests
const productRoutes = require("./routes/products.routes");

// Import cart routes
const cartRoutes = require("./routes/cart.routes");

// Import price routes
const priceRoutes = require("./routes/prices.routes");

// Create express app
const app = express();

// Allow requests from other apps (frontend)
app.use(cors());

// Allow JSON in requests
app.use(express.json());

// Show message in console when server reloads
console.log("Backend Server is now loaded");

// Use Health routes
app.use("/", healthRoutes);

// Use Product routes
app.use("/", productRoutes);

// Use cart routes
app.use("/", cartRoutes);

// Use price routes
app.use("/", priceRoutes);

// Confirm the backend server is running
app.get("/", (req, res) => {
  res.send("ShopWazier backend is running");
});

// Set port number from .env or use 4000
const PORT = process.env.PORT || 4000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});