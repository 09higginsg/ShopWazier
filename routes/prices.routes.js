/*This code sets up the price route.
When someone sends a request to /report-price, it runs the reportPrice function in the price controller.
It then exports the router so the app can use this route.*/

// Import express router
const router = require("express").Router();

// Import price controller
const PriceController = require("../controllers/PriceController");

// Post route for price report
router.post("/report-price", PriceController.reportPrice);

// Export router
module.exports = router;