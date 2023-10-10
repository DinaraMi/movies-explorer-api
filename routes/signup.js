const express = require('express');
const router = express.Router();
const { celebrate, Joi, Segments } = require('celebrate');
const { signup } = require('../controllers/users');

router.post('/signup', celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30).required(),
  }),
}), signup);

module.exports = router;