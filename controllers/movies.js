const ForbiddenError = require('../errors/ForbiddenError');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const Movie = require('../models/movie');
const { Ok, Created } = require('../utils/contants');

module.exports.getMovies = (req, res, next) => {
  const userId = req.user._id;
  Movie.find({ owner: userId })
    .then((movies) => {
      return res.status(Ok).send(movies);
    })
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const userId = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner: userId,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => {
      return res.status(Created).send(movie);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new ValidationError(`Некорректные данные: ${error.message}`));
      } else {
        next(error);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const userId = req.user._id;
  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) {
        return next(new NotFoundError('Фильм не найден'));
      }
      if (movie.owner.toString() !== userId) {
        return next(new ForbiddenError('У вас нет прав на удаление этого фильма'));
      }
      return Movie.findByIdAndDelete(movieId)
        .then((deletedMovie) => {
          if (!deletedMovie) {
            return next(new NotFoundError('Фильм не найден'));
          }
          res.send(deletedMovie);
        });
    })
    .catch(next);
};
