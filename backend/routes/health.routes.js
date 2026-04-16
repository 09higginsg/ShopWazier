/*Summary: This code sets up the health routes.
When someone visits the main route, it runs the health function to show the API is working.
When someone visits /db-test, it runs the database test function to check if the database is connected.
It then exports the router so the app can use these routes.*/

// Import express router
const router = require("express").Router();

// Import health controller
const HealthController = require("../controllers/HealthController");

// Get route for api health
router.get("/", (req, res) => HealthController.health(req, res));

// Get route for database test
router.get("/db-test", (req, res) => HealthController.dbTest(req, res));

// Export router
module.exports = router;