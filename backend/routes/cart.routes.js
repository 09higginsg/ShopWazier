/* This code sets up the cart routes.
It connects website links (routes) to the cart controller.
When someone starts a cart, it runs the start function.
When someone adds an item, it runs the add function.
When someone views a cart, it runs the view function.
It then exports the router so the app can use these routes*/


// Import express router
const router = require("express").Router();

// Import cart controller
const CartController = require("../controllers/CartController");

// Post route to start cart
router.post("/cart/start", (req, res) => CartController.start(req, res));

// Post route to add item
router.post("/cart/add", (req, res) => CartController.add(req, res));

// Get route to view cart
router.get("/cart/:session_id", (req, res) => CartController.view(req, res));

// Export router
module.exports = router;