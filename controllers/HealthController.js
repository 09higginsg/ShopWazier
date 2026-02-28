/*This code checks if the system is working.
The health part sends back a message to show the API is running.
The dbTest part checks if the database is connected. It runs a small test query. 
If it works, it sends back a success message. If it fails, it sends an error. */

// Import database connection pool
const pool = require("../db");

// Create HealthController class
class HealthController {

  // Basic health check route
  async health(req, res) {

    // Send message to confirm API is running
    return res.send("ShopWazier API running");
  }

  // Database connection test route
  async dbTest(req, res) {

    try {

      // Run simple test query on database
      const [rows] = await pool.query("SELECT 1 AS ok");

      // Send success response if database works
      return res.json({ db: "connected", result: rows[0] });

    } catch (err) {

      // Send error response if database fails
      return res.status(500).json({ db: "error", message: err.message });
    }
  }
}

// Export controller
module.exports = new HealthController();