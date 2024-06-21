const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongodb = require("mongodb");
const methodOverride = require("method-override");
require("dotenv").config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

let db; // MongoDB connection reference

// Connect to MongoDB
mongodb.MongoClient.connect(mongoURI)
  .then((client) => {
    console.log("MongoDB connected");
    db = client.db("library_management_system"); // Assign database reference to 'db' variable
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process if MongoDB connection fails
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/books", (req, res) => {
  db.collection("books").find().toArray()
  .then(books => {
    res.render("index", {books});
  })
  .catch(err => res.status(500).json({error: "An error occurred while retrieving books", detail: err}));
});

app.get("/books/new", (req, res) => {
  res.render("add_book");
});

app.post("/books", (req, res) => {
  const book = {
    title: req.body.title,
    author: req.body.author,
    publishedDate: new Date(req.body.publishedDate)
  };

  db.collection("books").insertOne(book)
  .then(result => res.redirect("/books"))
  .catch(err => res.status(500).json({error: "An error occurred while inserting book", detail: err}));
});

app.get("/books/:id/edit", (req, res) => {
  const { id } = req.params;
  const objectId = new mongodb.ObjectId(id);
  
  db.collection("books").findOne({ _id: objectId })
  .then(book => {
    if(!book){
      return res.status(404).json({error: "Book not found.", detail: err});
    }
    res.render("edit_book", {book});
  })
  .catch(err => res.status(500).json({error: "An error occurred while retrieving books", detail: err}));
});

app.put("/books/:id", (req, res) => {
  const { id } = req.params;
  const objectId = new mongodb.ObjectId(id);

  const updateBook = {
    title: req.body.title,
    author: req.body.author,
    publishedDate: new Date(req.body.publishedDate)
  };

  db.collection("books").updateOne({ _id: objectId }, { $set: updateBook })
  .then(result => {
    if(result.matchedCount === 0) {
      return res.status(404).json({error: "Book not found.", detail: err});
    }
    res.redirect("/books");
  })
  .catch(err => res.status(500).json({error: "An error occurred while updating book", detail: err}));
});

app.delete("/books/:id", (req, res) => {
  const { id } = req.params;
  const objectId = new mongodb.ObjectId(id);

  db.collection("books").deleteOne({ _id: objectId })
  .then(result => {
    if(result.deletedCount === 0) {
      return res.status(404).json({error: "Book not found.", detail: err});
    }
    res.redirect("/books");
  })
  .catch(err => res.status(500).json({error: "An error occurred while deleting book", detail: err}));
});


app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
