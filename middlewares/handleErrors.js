const ValidationError = require('../errors/ValidationError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const ConflictError = require('../errors/ConflictError');
const {
  BadRequest,
  Unauthorized,
  NotFound,
  Conflict,
  InternalServerError,
  Forbidden,
} = require('../utils/contants');

const handleErrors = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(BadRequest).send({ message: `Некорректные данные: ${err.message}` });
  }
  if (err instanceof NotFoundError) {
    return res.status(NotFound).send({ message: 'Пользователь не найден' });
  }
  if (err instanceof ConflictError) {
    return res.status(Conflict).send({ message: 'Пользователь с таким email уже существует' });
  }
  if (err instanceof ForbiddenError) {
    return res.status(Forbidden).send({ message: 'Доступ запрещен' });
  }
  if (err instanceof UnauthorizedError) {
    return res.status(Unauthorized).send({ message: 'Неавторизованный доступ' });
  }
  if (!res.headersSent) {
    return res.status(InternalServerError).send({ message: 'На сервере произошла ошибка' });
  }
  return next();
};

module.exports = { handleErrors };
