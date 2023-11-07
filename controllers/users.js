const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { Ok } = require('../utils/contants');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const ConflictError = require('../errors/ConflictError');

module.exports.getUserInfo = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((userInfo) => {
      if (!userInfo) {
        throw new NotFoundError('Пользователь с таким id не найден');
      }
      res.status(Ok).send(userInfo);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return next(new ValidationError(`Некорректные данные: ${error.message}`));
      }
      return next(error);
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { email, name } = req.body;
  const userId = req.user._id;
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser && existingUser._id != userId) {
        throw new ConflictError('Пользователь с таким email уже существует');
      } else {
        User.findByIdAndUpdate(
          userId,
          { email, name },
          { new: true, runValidators: true }
        )
          .then((user) => {
            if (!user) {
              throw new NotFoundError('Пользователь с таким id не найден');
            }
            res.status(Ok).send({ email: user.email, name: user.name });
          })
          .catch((error) => {
            if (error.name === 'ValidationError') {
              return next(new ValidationError(`Некорректные данные: ${error.message}`));
            }
            return next(error);
          });
      }
    })
    .catch(next);
};

module.exports.signup = (req, res, next) => {
  const { email, password, name } = req.body;
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return next(new ConflictError('Пользователь с таким email уже существует'));
      }
      return bcrypt.hash(password, 10)
        .then((hash) => {
          return User.create({ email, password: hash, name });
        })
        .then((user) => {
          res.status(Ok).send(user);
        });
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return next(new ValidationError(`Некорректные данные: ${error.message}`));
      }
      return next(error);
    });
};

module.exports.signin = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const secretKey = process.env.JWT_SECRET || 'default_secret_key';
      const token = jwt.sign(
        { _id: user._id },
        secretKey,
        { expiresIn: '7d' }
      );
      res.send({ token });
    })
    .catch(next);
};