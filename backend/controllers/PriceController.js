/*Summary: This code runs when someone reports a price.
It checks that all details are given. If anything is missing it sends an error.
It checks that the product exists. If not it sends an error.
It saves the reported price and counts how many people reported the same price.
If 3 people report the same price, it updates the official price.
If less than 3, it just records the report and waits for more.
If something fails, it sends an error.*/

// Import price service
const PriceService = require("../services/PriceService");

// Import cart service
const CartService = require("../services/CartService");

// Create controller class
class PriceController {

  // Price report function
  async reportPrice(req, res) {

    // DEBUG LOG
    console.log("BODY RECEIVED:", req.body);

    // Get data from body
    const { barcode, store_id, reported_price, session_id } = req.body || {};

    // Use session_id instead of user_id (no authentication)
    const user_id = session_id;

    // Check missing data
    if (!barcode || !store_id || !reported_price || !session_id) {

      // Send 400 error
      return res.status(400).json({

        // Error message
        error: "barcode, store_id, reported_price, session_id are required"

      });

    }

    // Try block
    try {

      // Find product by barcode
      const products = await PriceService.findProductIdByBarcode(barcode);

      // If no product
      if (products.length === 0) {

        // Send 404 error
        return res.status(404).json({ error: "Product not found" });

      }

      // Get product id
      const product_id = products[0].id;

      // Save price report
      await PriceService.insertOrUpdateReport(user_id, product_id, store_id, reported_price);

      // If session exists update cart item price straight away
      if (session_id) {

        // Get cart
        const cart = CartService.carts[session_id];

        // If cart exists
        if (cart) {

          // Safe check items
          if (cart.items && Array.isArray(cart.items)) {

            // Find item in cart
            const item = cart.items.find((i) => i.barcode === barcode);

            // If item exists update price temporily in cart
            if (item) {
              item.tempPrice = Number(reported_price);
              item.tempStoreId = store_id; 
            }

          }

        }

      }

      // Count same price reports
      const total = await PriceService.countMatchingReports(
        product_id,
        store_id,
        reported_price
      );

      // If 3 or more reports
      if (total >= 3) {

        // Update confirmed price
        await PriceService.upsertConfirmedPrice(product_id, store_id, reported_price, total);

        // Delete used reports
        await PriceService.deleteUsedReports(product_id, store_id, reported_price);

        // Send confirmed response
        return res.json({

          // Conformation message
          message: "Price confirmed and updated",

          // Send total confirmations
          confirmations: total

        });

      }

      // Send normal response
      return res.json({

        // Submitted text
        message: "Price report submitted",

        // Send current total
        confirmations: total

      });

    }

    // Catch errors
    catch (err) {

      console.log("ERROR IN REPORT PRICE:", err);

      // Send 500 error
      return res.status(500).json({

        // Error text
        error: err.message

      });

    }

  }

}

// Export controller
module.exports = new PriceController();