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
const pool = require("../../db");

// Create cart service class
class CartService {

  // Constructor
  constructor() {

    // Store carts in memory
    this.carts = {};

  }

  // Start new cart
  startCart(session_id) {

    // Create cart object
    if (!this.carts[session_id]) {
      this.carts[session_id] = { items: [] };
    }

    // Return created cart
    return this.carts[session_id];

  }

  // Get cart by session
  async getCart(session_id, store_id) {

    // Return cart or null
    const cart = this.carts[session_id] || null;
    if (!cart) return null;

    // Clone cart to avoid overwriting stored data
    const updatedCart = { items: [] };

    // Loop through each item
    for (const item of cart.items) {

      // Get product id
      const [products] = await pool.query(
        "SELECT id FROM products WHERE barcode = ?",
        [item.barcode]
      );

      // Set default price
      let price = null;

      // If product found
      if (products.length > 0) {
        const productId = products[0].id;

        // Get price for selected store
        const [prices] = await pool.query(
          "SELECT price FROM prices WHERE product_id = ? AND store_id = ?",
          [productId, store_id]
        );

        // Set price if found
        price = prices.length > 0 ? Number(prices[0].price) : null;
      }

      // USE TEMP PRICE IF SAME STORE
      if (item.tempPrice && item.tempStoreId === store_id) {
        price = item.tempPrice;
      }

      // Add item to updated cart
      updatedCart.items.push({
        barcode: item.barcode,
        qty: item.qty,
        price: price,
        tempPrice: item.tempPrice || null,
        tempStoreId: item.tempStoreId || null
      });
    }

    // Return updated cart
    return updatedCart;

  }

  // Add item to cart
  async addItem(session_id, barcode, qty, store_id) {

    // Get cart
    const cart = this.carts[session_id];

    // If cart not found
    if (!cart) return { status: 404, error: "cart not found. start cart first" };

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

    // Find existing item in cart
    const existing = cart.items.find((i) => i.barcode === barcode);

    // If item already exists
    if (existing) {

      // Increase quantity
      existing.qty += quantity;

    } 

    // If item does not exist
    else {

      // Add new item (no fixed price stored)
      cart.items.push({ 
        barcode, 
        qty: quantity, 
        price: null,
        tempPrice: null,
        tempStoreId: null
      });

    }

    // Return updated cart
    return { status: 200, cart };

  }

  // Get total price
  async getTotal(session_id, store_id) {

    // Get cart
    const cart = await this.getCart(session_id, store_id);

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