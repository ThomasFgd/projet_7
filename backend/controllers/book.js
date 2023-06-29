const Book = require("../models/Book");
const fs = require("fs");
const sharp = require("sharp");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
  });

  const a = req.file.filename.split(".");
  a.splice(a.length - 1, 1);
  const newName = a.join("") + "_optimized." + "webp";
  sharp("./images/" + req.file.filename)
    .resize({ width: 310, height: 500, fit: sharp.fit.cover })
    .toFormat("webp")
    .toFile("./images/" + newName);
  book.imageUrl = `${req.protocol}://${req.get("host")}/images/${newName}`;

  book
    .save()
    .then(() => res.status(201).json({ message: "Livre enregistré" }))
    .catch((error) => {
      console.log("error creation", error);
      res.status(400).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Livre modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.addRating = (req, res, next) => {
  const { userId, rating } = req.body;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const alreadyNoted = book.ratings.find(
        (rating) => rating.userId === userId
      );
      if (alreadyNoted) {
        return res
          .status(400)
          .json({ message: "Vous avez déjà noté ce livre" });
      }
      book.ratings.push({ userId, rating });
      const totalRatings = book.ratings.length;
      const existingAverageRating = book.averageRating;
      const newAverageRating =
        (existingAverageRating * (totalRatings - 1) + rating) / totalRatings;
      book.averageRating = newAverageRating;
      Book.updateOne({ _id: req.params.id }, book)
        .then(() => res.status(200).json(book))
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.bestRating = (req, res, next) => {
  Book.findOne()
    .sort({ averageRating: -1 })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};
