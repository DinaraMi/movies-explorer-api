const express = require('express');
const router = express.Router();
const { celebrate, Joi, Segments } = require('celebrate');
const { signin } = require('../controllers/users');

router.post('/signin', celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), signin);

module.exports = router;
