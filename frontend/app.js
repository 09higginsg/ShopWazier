/*This code runs the frontend app.
It lets users pick a store.
It scans items and adds them to cart.
It shows prices and confirms them.
It sends data to the backend.
It updates and displays the cart.*/

// Create app class
class ShopWazierApp {

  // Start the app
  constructor() {

    // Set API base URL
    this.baseUrl = "http://localhost:4000";

    // Store selected store ID
    this.storeId = null;

    // Set user session ID
    const existingId = parseInt(localStorage.getItem("shopwazier_user_id"));

    // Check if session exists
    if (existingId && existingId >= 1 && existingId <= 100) {
      this.sessionId = existingId;
    } else {
      // Create new session ID
      const newId = Math.floor(Math.random() * 100) + 1;
      localStorage.setItem("shopwazier_user_id", newId);
      this.sessionId = newId;
    }

    // Save product names
    this.productNames = {};

    // Save temp prices
    this.tempPrices = {};

    // Get status element
    this.statusMessage = document.getElementById("statusMessage");
    // Get empty cart label
    this.emptyLabel = document.getElementById("emptyLabel");
    // Get cart items container
    this.cartItems = document.getElementById("cartItems");
    // Get cart total display
    this.cartTotal = document.getElementById("cartTotal");

    // Get price confirm box
    this.priceConfirm = document.getElementById("priceConfirm");
    // Get price text
    this.priceText = document.getElementById("priceText");
    // Get yes button
    this.confirmYes = document.getElementById("confirmYes");
    // Get no button
    this.confirmNo = document.getElementById("confirmNo");

    // Bind button events
    this.bindEvents();
  }

  // Link buttons to actions
  bindEvents() {

    // Select Dunnes store
    document.getElementById("store-dunnes").addEventListener("click", () => this.selectStore(1, "Dunnes"));
    // Select Tesco store
    document.getElementById("store-tesco").addEventListener("click", () => this.selectStore(2, "Tesco"));
    // Select Lidl store
    document.getElementById("store-lidl").addEventListener("click", () => this.selectStore(3, "Lidl"));
    // Select Aldi store
    document.getElementById("store-aldi").addEventListener("click", () => this.selectStore(4, "Aldi"));

    // Scan button click
    document.getElementById("scanBtn").addEventListener("click", () => this.scanItem());

    // Search button click
    document.getElementById("searchBtn").addEventListener("click", () => {
      this.setStatus("Search not added yet");
    });
  }

  // Set the store
  async selectStore(storeId, storeName) {
    // Save store ID
    this.storeId = storeId;
    // Start cart
    await this.startCart();
    // Show status
    this.setStatus(storeName + " selected");
  }

  // Start a cart
  async startCart() {
    // Stop if no store
    if (!this.storeId) return;

    try {
      // Call backend to start cart
      await fetch(this.baseUrl + "/cart/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: this.sessionId,
          store_id: this.storeId
        })
      });

      // Load cart data
      await this.loadCart();

    } catch {
      // Show error
      this.setStatus("Could not start cart");
    }
  }

  // Scan a product
  async scanItem() {

    // Check store selected
    if (!this.storeId) {
      this.setStatus("Select a store first");
      return;
    }

    // Ask for barcode
    const barcode = prompt("Enter barcode");
    if (!barcode) return;

    try {

      // Send scan request
      const scanResponse = await fetch(this.baseUrl + "/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode: barcode,
          store_id: this.storeId
        })
      });

      // Get scan data
      const scanData = await scanResponse.json();

      // Save product name
      this.productNames[barcode] = scanData.product.name || barcode;

      // Get database price
      const dbPrice = Number(scanData.product.price || 0);

      // Add item to cart
      await fetch(this.baseUrl + "/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: this.sessionId,
          barcode: barcode,
          qty: 1,
          store_id: this.storeId
        })
      });

      // Show price to user
      this.priceText.textContent = `Price is €${dbPrice.toFixed(2)}`;
      this.priceConfirm.style.display = "block";

      // Wait for user choice
      const choice = await new Promise((resolve) => {
        this.confirmYes.onclick = () => resolve("yes");
        this.confirmNo.onclick = () => resolve("no");
      });

      // Hide confirm box
      this.priceConfirm.style.display = "none";

      // If price is wrong
      if (choice === "no") {

        // Ask for new price
        let newPrice = prompt("Enter correct price (e.g. €1.99)");
        if (!newPrice) return;

        // Clean input
        newPrice = newPrice.replace("€", "").replace(",", ".").trim();

        // Convert to number
        const parsedPrice = parseFloat(newPrice);

        // Check valid number
        if (isNaN(parsedPrice)) {
          alert("Invalid price");
          return;
        }

        try {
          // Send price report
          const res = await fetch(this.baseUrl + "/report-price", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              barcode: barcode,
              store_id: this.storeId,
              reported_price: parsedPrice,
              session_id: this.sessionId
            })
          });

          // Check response
          if (!res.ok) {
            console.error("Report price failed:", await res.text());
            this.setStatus("Price report failed");
          }

        } catch (err) {
          // Handle error
          console.error(err);
          this.setStatus("Error reporting price");
        }
      }

      // Reload cart
      await this.loadCart();
      // Show success
      this.setStatus("Item scanned and added");

    } catch (err) {
      // Handle scan error
      console.error(err);
      this.setStatus("Scan failed");
    }
  }

  // Load cart data
  async loadCart() {
    try {
      // Request cart from backend
      const response = await fetch(this.baseUrl + "/cart/" + this.sessionId + "?store_id=" + this.storeId);
      const cart = await response.json();

      // Check for error
      if (cart.error) {
        this.setStatus(cart.error);
        return;
      }

      // Render cart
      this.renderCart(cart);

    } catch {
      // Show error
      this.setStatus("Could not load cart");
    }
  }

  // Show cart on screen
  renderCart(cart) {

    // Clear cart display
    this.cartItems.innerHTML = "";

    // Check if empty
    if (!cart.items || cart.items.length === 0) {
      this.emptyLabel.style.display = "block";
    } else {
      this.emptyLabel.style.display = "none";
    }

    // Loop items
    cart.items.forEach((item) => {

      // Create row
      const row = document.createElement("div");

      // Get product name
      const productName = this.productNames[item.barcode] || item.barcode;

      // Set price
      let displayPrice = item.price;

      // Use temp price if exists
      if (item.tempPrice && item.tempStoreId === this.storeId) {
        displayPrice = item.tempPrice;
      }

      // Style row
      row.className = "fw-bold mb-2";
      row.textContent = productName + " x" + item.qty + " €" + Number(displayPrice || 0).toFixed(2);

      // Add to cart view
      this.cartItems.appendChild(row);
    });

    // Show total
    this.cartTotal.textContent = "TOTAL: €" + Number(cart.total || 0).toFixed(2);
  }

  // Update status text
  setStatus(message) {
    this.statusMessage.textContent = message;
  }
}

// Run app on load
document.addEventListener("DOMContentLoaded", () => {
  new ShopWazierApp();
});