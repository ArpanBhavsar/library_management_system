const express = require("express");
const bodyParser = require("body-parser");
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
    db = client.db(); // Assign database reference to 'db' variable
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process if MongoDB connection fails
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Route to get all books and render on /books
app.get("/books", (req, res) => {
  db.collection("books").find().toArray()
    .then(books => {
      res.render("index", { books }); // Renders the index.ejs template from the views folder
    })
    .catch(err => {
      res.status(500).json({ error: "An error occurred while retrieving books", details: err });
    });
});

// Show form to create a new book
app.get("/books/new", (req, res) => {
  res.render("add_book"); // Renders the new.ejs template from the views folder
});

// Create a new book
app.post("/books", (req, res) => {
  const book = {
    title: req.body.title,
    author: req.body.author,
    publishedDate: new Date(req.body.publishedDate) // Ensure this is a Date object
  };

  db.collection("books").insertOne(book)
    .then(result => res.redirect("/books"))
    .catch(err => res.status(500).json({ error: "An error occurred while creating the book", details: err }));
});

// Show form to edit a book
app.get("/books/:id/edit", (req, res) => {
  const { id } = req.params;
  const objectId = new mongodb.ObjectId(id); // Correct way to create ObjectId

  db.collection("books").findOne({ _id: objectId })
    .then(book => {
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.render("edit_book", { book }); // Renders the edit.ejs template from the views folder
    })
    .catch(err => res.status(500).json({ error: "An error occurred while retrieving the book", details: err }));
});

// Update a book
app.put("/books/:id", (req, res) => {
  const { id } = req.params;
  const objectId = new mongodb.ObjectId(id); // Correct way to create ObjectId
  const updatedBook = {
    title: req.body.title,
    author: req.body.author,
    publishedDate: new Date(req.body.publishedDate) // Ensure this is a Date object
  };

  db.collection("books").updateOne({ _id: objectId }, { $set: updatedBook })
    .then(result => {
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.redirect("/books");
    })
    .catch(err => res.status(500).json({ error: "An error occurred while updating the book", details: err }));
});

// Delete a book
app.delete("/books/:id", (req, res) => {
  const { id } = req.params;
  const objectId = new mongodb.ObjectId(id); // Correct way to create ObjectId

  db.collection("books").deleteOne({ _id: objectId })
    .then(result => {
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.redirect("/books");
    })
    .catch(err => res.status(500).json({ error: "An error occurred while deleting the book", details: err }));
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
