const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongodb = require("mongodb");
require("dotenv").config();

const app = express();

app.use(bodyParser.json());

const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

let db; // MongoDB connection reference

// Connect to MongoDB
mongodb.MongoClient.connect(mongoURI)
  .then((client) => {
    console.log("MongoDB connected");
    db = client.db(); // Assign database reference to 'db' variable
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process if MongoDB connection fails
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
