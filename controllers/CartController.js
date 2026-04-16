/*Summary: This code controls the shopping cart.
The start part creates a new cart using a session ID and store ID. 
If they are missing, it sends an error.
The add part adds a product to the cart. It checks the session ID and barcode. 
If something is wrong, it sends an error. If it works, it sends back the updated cart.
The view part shows the cart. If the cart does not exist, it sends an error. If it exists, 
it sends the cart and the total price.*/

// Import the CartService which contains the cart logic
const CartService = require("../services/CartService");

// Create CartController class
class CartController {

  // Start a new cart
  start(req, res) {

    // Get session_id and store_id from request body
    const { session_id, store_id } = req.body || {};

    // Check if required values are missing
    if (!session_id || !store_id) {
      
      // Send error if missing
      return res.status(400).json({ error: "session_id and store_id required" });
    }

    // Call service to create cart
    const cart = CartService.startCart(session_id, store_id);

    // Send success response
    return res.json({ message: "cart started", session_id, store_id, cart });
  }

  // Add item to cart
  async add(req, res) {

    // Get session_id, barcode and qty from request body
    const { session_id, barcode, qty } = req.body || {};

    // Check if required values are missing
    if (!session_id || !barcode) {
      // Send error if missing
      return res.status(400).json({ error: "session_id and barcode required" });
    }

    // Call service to add item
    const result = await CartService.addItem(session_id, barcode, qty);

    // If service returned an error
    if (result.error) {
      // Send error with correct status
      return res.status(result.status).json({ error: result.error });
    }

    // Send success response with updated cart
    return res.json({ message: "item added", cart: result.cart });
  }

  // View cart
  view(req, res) {

    // Get session_id from URL params
    const { session_id } = req.params;

    // Get cart from service
    const cart = CartService.getCart(session_id);

    // If cart does not exist
    if (!cart) return res.status(404).json({ error: "cart not found" });

    // Get total price from service
    const total = CartService.getTotal(session_id);

    // Send cart and total as response
    return res.json({ ...cart, total });
  }
}

// Export controller
module.exports = new CartController();