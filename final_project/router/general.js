const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Middleware to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Hashing password using bcrypt
const bcrypt = require('bcrypt');
function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
}

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Invalid email address" });
    }

    if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = hashPassword(password);
    users.push({ username, email, password: hashedPassword });
    return res.status(200).json({ message: "User registered successfully" });
});

// List all available books
public_users.get('/', (req, res) => {
    const availableBooks = Array.isArray(books) ? books.filter(book => book.available) : [];
    if (availableBooks.length === 0) {
        return res.status(404).json({ message: "No books available" });
    }
    return res.status(200).json(availableBooks);
});

// Get book details by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const book = books.getBookByISBN(req.params.isbn);
    return book ? res.status(200).json(book) : res.status(404).json({ message: "Book not found" });
});

// Get books by author
public_users.get('/author/:author', (req, res) => {
    const booksByAuthor = books.getBooksByAuthor(req.params.author);
    return booksByAuthor.length > 0
        ? res.status(200).json(booksByAuthor)
        : res.status(404).json({ message: "Books by this author not found" });
});

// Get books by title
public_users.get('/title/:title', (req, res) => {
    const booksWithTitle = books.getBooksByTitle(req.params.title);
    return booksWithTitle.length > 0
        ? res.status(200).json(booksWithTitle)
        : res.status(404).json({ message: "Books with this title not found" });
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
    const review = books.getBookReviewByISBN(req.params.isbn);
    return review ? res.status(200).json({ review }) : res.status(404).json({ message: "Review for this book not found" });
});

module.exports.general = public_users;
