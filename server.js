const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

/* Serve dashboard */
app.use(express.static(path.join(__dirname, "public")));

/* Home route */
app.get("/", (req, res) => {
  res.send("SMS Gateway Server Running");
});

/* Health check route for Railway */
app.get("/status", (req, res) => {
  res.json({
    status: "online",
    message: "SMS Gateway working"
  });
});

/* Example SMS API */
app.post("/send-sms", (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({
      success: false,
      error: "Number and message required"
    });
  }

  console.log("SMS request received:", number, message);

  res.json({
    success: true,
    message: "SMS request received by gateway"
  });
});

/* PORT for Railway */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
