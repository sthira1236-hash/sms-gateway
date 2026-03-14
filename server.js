const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

/* FIREBASE KEY */
const serviceAccount = require("./sms-gateway-ccf82-firebase-adminsdk.json");

/* FIREBASE INIT */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sms-gateway-ccf82-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

/* EXPRESS SERVER */
const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* HOME PAGE */
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

/* SEND SINGLE SMS */
app.post("/send-sms", async (req, res) => {

  const number = req.body.number;
  const message = req.body.message;

  if (!number || !message) {
    return res.send("Number or message missing");
  }

  const smsData = {
    number: number,
    message: message,
    status: "pending",
    time: Date.now()
  };

  try {

    const ref = db.ref("sms_queue");

    await ref.push(smsData);

    console.log("Single SMS queued");
    console.log("Number:", number);
    console.log("Message:", message);

    res.send("SMS added to queue");

  } catch (error) {

    console.log("Firebase Error:", error);
    res.send("Error saving SMS");

  }

});

/* SEND BULK SMS */
app.post("/send-bulk", async (req, res) => {

  const numbers = req.body.numbers;
  const message = req.body.message;

  if (!numbers || !message) {
    return res.send("Numbers or message missing");
  }

  const numberList = numbers.split("\n");

  const ref = db.ref("sms_queue");

  try {

    for (let num of numberList) {

      num = num.trim();

      if (num.length > 5) {

        const smsData = {
          number: num,
          message: message,
          status: "pending",
          time: Date.now()
        };

        await ref.push(smsData);

        console.log("Bulk SMS queued:", num);
      }

    }

    res.send("Bulk SMS queued successfully");

  } catch (err) {

    console.log("Bulk Error:", err);
    res.send("Bulk SMS failed");

  }

});

/* CLEAR SMS QUEUE */
app.post("/clear-queue", async (req, res) => {

  try {

    await db.ref("sms_queue").remove();

    console.log("SMS queue cleared");

    res.send("SMS queue cleared");

  } catch (err) {

    console.log("Error clearing queue:", err);

    res.send("Failed to clear queue");

  }

});

/* FIREBASE LISTENER (LOG ONLY) */
const queueRef = db.ref("sms_queue");

queueRef.on("child_added", (snapshot) => {

  const sms = snapshot.val();

  console.log("New SMS in Firebase");
  console.log("Number:", sms.number);
  console.log("Message:", sms.message);

});

/* START SERVER */
const PORT = 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});