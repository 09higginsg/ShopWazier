/* Summary: This code runs when a product is scanned. 
It checks the barcode and store ID. If they are missing, it sends an error. 
It looks for the product. If it does not exist, it creates it. 
Then it checks the price for that store and sends the product and price back. 
If there is a problem, it sends an error.*/

// Import product service
const ProductService = require("../services/ProductService");

// Create controller class
class ProductController {

  // Scan product function
  async scan(req, res) {

    // Get barcode and store id
    const { barcode, store_id } = req.body;

    // Check missing values
    if (!barcode || !store_id) {

      // Send 400 error
      return res.status(400).json({ error: "barcode and store_id required" });

    }

    // Start try block
    try {

      // Find product by barcode
      const products = await ProductService.findByBarcode(barcode);

      // Declare product variable
      let product;

      // If product not found
      if (products.length === 0) {

        // Create new product
        product = await ProductService.createByBarcode(barcode);

      } 

      // If product exists
      else {

        // Use existing product
        product = products[0];

      }

      // Get confirmed price
      const prices = await ProductService.getConfirmedPrice(product.id, store_id);

      // Send response
      return res.json({

        // Send product data
        product,

        // Send price or null
        price: prices.length > 0 ? prices[0] : null

      });

    } 

    // Catch errors
    catch (err) {

      // Send 500 error
      return res.status(500).json({ error: err.message });

    }

  }

}

// Export controller
module.exports = new ProductController();
