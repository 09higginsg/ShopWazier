/*Summary: This code sets up the product route.
When someone sends a request to /scan, it runs the scan function in the product controller.
It then exports the router so the app can use this route.*/

// Import express router
const router = require("express").Router();

// Import product controller
const ProductController = require("../controllers/ProductController");

// Post route for scan
router.post("/scan", (req, res) => ProductController.scan(req, res));

// Export router
module.exports = router;