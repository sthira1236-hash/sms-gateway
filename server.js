const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/status", (req, res) => {
res.send("Server is running");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
console.log("Server running on port " + PORT);
});
