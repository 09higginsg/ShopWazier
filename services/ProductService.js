/* 
This code handles all the product logic in the database.

The findByBarcode part checks if a product already exists 
by searching the products table using the barcode.

The createByBarcode part creates a new product 
if the barcode does not exist yet in the database.

The getConfirmedPrice part checks the prices table 
to see if there is already a confirmed price 
for that product in a specific store.*/

// Import database pool
const pool = require("../db");

// Create product service class
class ProductService {

  // Find product by barcode
  async findByBarcode(barcode) {

    // Query products table
    const [products] = await pool.query(
      "SELECT id, barcode, name FROM products WHERE barcode = ?",
      [barcode]
    );

    // Return products
    return products;

  }

  // Create product with barcode
  async createByBarcode(barcode) {

    // Insert new product
    const [result] = await pool.query(
      "INSERT INTO products (barcode) VALUES (?)",
      [barcode]
    );

    // Return created product
    return { id: result.insertId, barcode, name: null };

  }

  // Get confirmed price
  async getConfirmedPrice(product_id, store_id) {

    // Query prices table
    const [prices] = await pool.query(
      "SELECT price, confirmations FROM prices WHERE product_id = ? AND store_id = ?",
      [product_id, store_id]
    );

    // Return prices
    return prices;

  }

}

// Export service
module.exports = new ProductService();