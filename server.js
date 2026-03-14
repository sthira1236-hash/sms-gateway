const express = require("express");
const admin = require("firebase-admin");
const path = require("path");

// Firebase service account
const serviceAccount = require("./sms-gateway-ccf82-firebase-adminsdk.json");

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sms-gateway-ccf82-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

const app = express();
app.use(express.json());

// Serve dashboard
app.use(express.static(path.join(__dirname, "public")));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/*
=================================
Send SMS API
=================================
POST /send-sms
Body:
{
  "number": "9876543210",
  "message": "Hello"
}
*/
app.post("/send-sms", async (req, res) => {
  try {
    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).json({
        success: false,
        error: "Number and message required"
      });
    }

    const sms = {
      number: number,
      message: message,
      status: "pending",
      time: Date.now()
    };

    await db.ref("sms").push(sms);

    console.log("SMS queued:", sms);

    res.json({
      success: true,
      message: "SMS added to queue"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/*
=================================
Bulk SMS API
=================================
POST /send-bulk
Body:
{
  "numbers": ["9876543210","9123456789"],
  "message": "Hello"
}
*/
app.post("/send-bulk", async (req, res) => {
  try {
    const { numbers, message } = req.body;

    if (!numbers || !message) {
      return res.status(400).json({
        success: false,
        error: "Numbers and message required"
      });
    }

    for (const number of numbers) {
      await db.ref("sms").push({
        number,
        message,
        status: "pending",
        time: Date.now()
      });
    }

    res.json({
      success: true,
      message: "Bulk SMS queued"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/*
=================================
Get SMS logs
=================================
*/
app.get("/logs", async (req, res) => {
  const snapshot = await db.ref("sms").once("value");
  res.json(snapshot.val());
});

/*
=================================
Clear SMS queue
=================================
*/
app.post("/clear", async (req, res) => {
  await db.ref("sms").remove();
  res.json({ success: true, message: "Queue cleared" });
});

/*
=================================
Start server (Railway compatible)
=================================
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("SMS Gateway server running on port " + PORT);
});
