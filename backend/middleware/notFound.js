/*This code runs when someone tries to use a route that does not exist.
It sends back a 404 error.
It also shows the path that the user tried to access.*/


// Export function
module.exports = (req, res) => {

  // Send 404 status
  res.status(404).json({

    // Error message
    error: "Route not found",

    // Send requested path
    path: req.path

  });

};