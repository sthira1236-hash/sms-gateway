const express = require("express");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/status", (req, res) => {
res.json({ status: "online" });
});

app.post("/clear-queue", (req, res) => {
res.send("Queue cleared");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
console.log("Server running on port " + PORT);
});
