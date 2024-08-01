const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Get book details based on ISBN using async-await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const book = await getBookByISBN(isbn);
        res.status(200).json(book);
    } catch (error) {
        res.status(404).json({ message: "Book not found" });
    }
});

const getBookByISBN = async (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject("Book not found");
        }
    });
};

// Get book details based on author using async-await with Axios
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const booksByAuthor = await getBooksByAuthor(author);
        res.status(200).json(booksByAuthor);
    } catch (error) {
        res.status(404).json({ message: "No books found by this author" });
    }
});

const getBooksByAuthor = async (author) => {
    return new Promise((resolve, reject) => {
        const booksByAuthor = Object.entries(books).filter(([isbn, book]) => book.author === author).map(([isbn, book]) => ({ isbn, ...book }));
        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject("No books found by this author");
        }
    });
};

// Get all books based on title using async-await with Axios
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const booksByTitle = await getBooksByTitle(title);
        res.status(200).json(booksByTitle);
    } catch (error) {
        res.status(404).json({ message: "No books found with this title" });
    }
});

const getBooksByTitle = async (title) => {
    return new Promise((resolve, reject) => {
        const booksByTitle = Object.entries(books).filter(([isbn, book]) => book.title === title).map(([isbn, book]) => ({ isbn, ...book }));
        if (booksByTitle.length > 0) {
            resolve(booksByTitle);
        } else {
            reject("No books found with this title");
        }
    });
};

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.status(200).send(JSON.stringify(books, null, 4));
});

// Register a new user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    res.status(201).json({ message: "User successfully registered" });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book && book.reviews) {
        res.status(200).json(book.reviews);
    } else {
        res.status(404).json({ message: "No reviews found for this book" });
    }
});

module.exports.general = public_users;
