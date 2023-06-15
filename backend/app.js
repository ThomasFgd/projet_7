const express = require("express");
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

const Book = require('./models/Book')

mongoose.connect('mongodb+srv://thomasfigard:toMPsjJSnSSIHJOR@cluster0.4ncdqys.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
})

app.post('/api/books', (req, res, next) => {
    delete req.body._id;
    const book = new Book({
        ...req.body
    });
    book.save()
        .then(() => res.status(201).json({message: 'Livre enregistré'}))
        .catch(error => res.status(400).json({ error }));
})

app.get('/api/books', (req, res, next) => {
    Book.find()
        .then(things => res.status(200).json(things))
        .catch(things => res.status(400).json({error}))
  });

module.exports =app;