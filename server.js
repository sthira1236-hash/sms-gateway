const express = require("express");

const app = express();

/* Root route */
app.get("/", (req, res) => {
  res.send("SMS Gateway Running");
});

/* Health check route */
app.get("/status", (req, res) => {
  res.json({ status: "online" });
});

/* Railway port */
const PORT = process.env.PORT || 3000;

/* IMPORTANT: bind to 0.0.0.0 */
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
