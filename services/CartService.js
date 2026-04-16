/*This code controls how the cart works behind the scenes.
It stores carts in memory using a session ID.
The startCart part creates a new cart for a session and store.
The getCart part returns the cart if it exists.
The addItem part adds a product to the cart. It checks that the cart exists. 
It looks up the product in the database. It then checks the price for that store. 
If the item is already in the cart, it increases the quantity. If not, it adds it. It then returns the updated cart.
The getTotal part calculates the total price of all items in the cart by multiplying 
price by quantity and adding them together.*/

// Import database pool
const pool = require("../db");

// Create cart service class
class CartService {

  // Constructor
  constructor() {

    // Store carts in memory
    this.carts = {};

  }

  // Start new cart
  startCart(session_id, store_id) {

    // Create cart object
    this.carts[session_id] = { store_id, items: [] };

    // Return created cart
    return this.carts[session_id];

  }

  // Get cart by session
  getCart(session_id) {

    // Return cart or null
    return this.carts[session_id] || null;

  }

  // Add item to cart
  async addItem(session_id, barcode, qty) {

    // Get cart
    const cart = this.getCart(session_id);

    // If cart not found
    if (!cart) return { status: 404, error: "cart not found, start cart first" };

    // Get store id
    const store_id = cart.store_id;

    // Set quantity
    const quantity = qty ? Number(qty) : 1;

    // Find product in database
    const [products] = await pool.query(
      "SELECT id, barcode, name FROM products WHERE barcode = ?",
      [barcode]
    );

    // If product not found
    if (products.length === 0) {

      // Return error
      return { status: 404, error: "product not found, scan first" };

    }

    // Get first product
    const product = products[0];

    // Get confirmed price
    const [prices] = await pool.query(
      "SELECT price FROM prices WHERE product_id = ? AND store_id = ?",
      [product.id, store_id]
    );

    // Set price or null
    const price = prices.length > 0 ? Number(prices[0].price) : null;

    // Find existing item in cart
    const existing = cart.items.find((i) => i.barcode === barcode);

    // If item already exists
    if (existing) {

      // Increase quantity
      existing.qty += quantity;

      // Update price
      existing.price = price;

    } 

    // If item does not exist
    else {

      // Add new item
      cart.items.push({ barcode, qty: quantity, price });

    }

    // Return updated cart
    return { status: 200, cart };

  }

  // Get total price
  getTotal(session_id) {

    // Get cart
    const cart = this.getCart(session_id);

    // If no cart
    if (!cart) return null;

    // Calculate total
    return cart.items.reduce((sum, item) => {

      // Skip if no price
      if (item.price === null) return sum;

      // Add item total
      return sum + item.price * item.qty;

    }, 0);

  }

}

// Export service
module.exports = new CartService();