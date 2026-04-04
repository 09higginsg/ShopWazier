/*This code handles all the price logic in the database.
The findProductIdByBarcode part looks up a product in the database using its barcode.
The insertOrUpdateReport part saves a user’s price report. 
If the same user already reported a price, it updates it instead of creating a new one.
The countMatchingReports part counts how many people reported the same price for the same product and store.
The upsertConfirmedPrice part updates the official price once enough people agree on it. 
If a price already exists, it updates it.
The deleteUsedReports part deletes the reports that were used to confirm the price.
Overall, this service manages saving reports, counting confirmations, updating official prices, 
and cleaning up old reports.*/

// Import database pool
const pool = require("../../db");

// Create price service class
class PriceService {

  // Find product id by barcode
  async findProductIdByBarcode(barcode) {

    // Query products table
    const [products] = await pool.query(
      "SELECT id FROM products WHERE barcode = ?",
      [barcode]
    );

    // Return products
    return products;

  }

  // Insert or update price report
  async insertOrUpdateReport(user_id, product_id, store_id, reported_price) {

    // 🔥 DEBUG LOG (ADD THIS)
    console.log("INSERT REPORT CALLED:", { user_id, product_id, store_id, reported_price });

    // Insert or update report
    const [result] = await pool.query(
      `INSERT INTO price_reports (user_id, product_id, store_id, reported_price)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         reported_price = VALUES(reported_price)`,
      [user_id, product_id, store_id, reported_price]
    );

    // Log debug info
    console.log("insertOrUpdateReport result", {
      affectedRows: result.affectedRows,
      insertId: result.insertId,
      warningStatus: result.warningStatus
    });

  }

  // Count matching reports
  async countMatchingReports(product_id, store_id, reported_price) {

    // Query matching reports
    const [matches] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM price_reports
       WHERE product_id = ? AND store_id = ? AND reported_price = ?`,
      [product_id, store_id, reported_price]
    );

    // Return total count
    return matches[0].total;

  }

  // Insert or update confirmed price
  async upsertConfirmedPrice(product_id, store_id, reported_price, confirmations) {

    // Insert or update price table
    await pool.query(
      `INSERT INTO prices (product_id, store_id, price, confirmations)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         price = VALUES(price),
         confirmations = VALUES(confirmations)`,
      [product_id, store_id, reported_price, confirmations]
    );

  }

  // Delete used reports
  async deleteUsedReports(product_id, store_id, reported_price) {

    // Delete matching reports
    await pool.query(
      `DELETE FROM price_reports
       WHERE product_id = ? AND store_id = ? AND reported_price = ?`,
      [product_id, store_id, reported_price]
    );

  }

}

// Export service
module.exports = new PriceService();