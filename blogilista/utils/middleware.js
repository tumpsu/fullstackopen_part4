const logger = require('./logger');

const requestLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.path} ${JSON.stringify(req.body)}`);
  next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, req, res, next) => {
  logger.error(error.message);
  next(error);
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
};