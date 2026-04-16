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
// load database connection
const pool = require("../../db");

// Create price service class
class PriceService {

  // Find product id by barcode
  async findProductIdByBarcode(barcode) {

    // run select query
    const [products] = await pool.query(
      // SQL query
      "SELECT id FROM products WHERE barcode = ?",
      // pass barcode value
      [barcode]
    );

    // Return products
    // return query result
    return products;

  }

  // Insert or update price report
  async insertOrUpdateReport(user_id, product_id, store_id, reported_price) {

    // DEBUG LOG (
    // log input data
    console.log("INSERT REPORT CALLED:", { user_id, product_id, store_id, reported_price });

    // run insert query
    const [result] = await pool.query(
      // insert and update query
      `INSERT INTO price_reports (user_id, product_id, store_id, reported_price)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         reported_price = VALUES(reported_price)`,
      // pass values
      [user_id, product_id, store_id, reported_price]
    );

    // Log debug info
    // log result info
    console.log("insertOrUpdateReport result", {
      // rows affected
      affectedRows: result.affectedRows,
      // inserted id
      insertId: result.insertId,
      // warning flag
      warningStatus: result.warningStatus
    });

  }

  // Count matching reports
  async countMatchingReports(product_id, store_id, reported_price) {

    // run count query
    const [matches] = await pool.query(
      // count matching rows
      `SELECT COUNT(*) AS total
       FROM price_reports
       WHERE product_id = ? AND store_id = ? AND reported_price = ?`,
      // pass values
      [product_id, store_id, reported_price]
    );

    // return count value
    return matches[0].total;

  }

  // Insert or update confirmed price
  async upsertConfirmedPrice(product_id, store_id, reported_price, confirmations) {

    // run insert/update query
    await pool.query(
      // insert or update confirmed price
      `INSERT INTO prices (product_id, store_id, price, confirmations)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         price = VALUES(price),
         confirmations = VALUES(confirmations)`,
      // pass values
      [product_id, store_id, reported_price, confirmations]
    );

  }

  // Delete used reports
  async deleteUsedReports(product_id, store_id, reported_price) {

    // run delete query
    await pool.query(
      // delete matching reports
      `DELETE FROM price_reports
       WHERE product_id = ? AND store_id = ? AND reported_price = ?`,
      // pass values
      [product_id, store_id, reported_price]
    );

  }

}

// Export service
// export instance
module.exports = new PriceService();