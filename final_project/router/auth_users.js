const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.hasOwnProperty(username);
}

const authenticatedUser = (username, password) => {
    if (users[username] && password === users[username].password) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    let usuario = req.body.username
    let contra = req.body.password
    try {
        if (authenticatedUser(usuario, contra)) {
            let token = jwt.sign({ username: usuario }, "access", { expiresIn: '1h' });
            req.session.authorization = { accessToken: token };
            req.session.username = usuario;
            return res.status(200).json({ message: "Successfully logged in" });
        } else {
            return res.status(401).json({ message: "Invalid username or password" });
        }
    } catch (error) {
        return res.status(500).json({ message: "An error occurred while trying to log in" });
    }
});
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let book = books[isbn];
    if (book) {
        let review = req.body.review;
        let username = req.session.username;

        if (review) {
            book.reviews[username] = review;
        }

        books[isbn] = book;
        res.send(`Review for book with ISBN ${isbn} updated.`);
    } else {
        res.send("Unable to find book!");
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let book = books[isbn];
    if (book) {
    let username = req.session.username;
    delete book.reviews[username];
    books[isbn] = book;
    res.send(`Review for book with ISBN ${isbn} deleted.`);
    } else {
    res.send("Unable to find book!");
    }
   });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
