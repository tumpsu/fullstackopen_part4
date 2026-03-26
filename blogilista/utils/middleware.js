const jwt = require('jsonwebtoken');
const User = require('../models/user');
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

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.startsWith('Bearer '))
  {
    req.token = authorization.replace('Bearer ', '');
  }
  else
  {
    req.token = null;
  }
  next();
};

const userExtractor = async (request, response, next) => {
  const token = request.token;

  if (!token)
  {
    request.user = null;
    return next();
  }

  let decodedToken;
  try
  {
    decodedToken = jwt.verify(token, process.env.SECRET);
  }
  catch
  {
    request.user = null;
    return response.status(401).json({ error: 'token invalid' });
  }

  if (!decodedToken.id)
  {
    request.user = null;
    return response.status(401).json({ error: 'token; invalid' });
  }

  const user = await User.findById(decodedToken.id);
  request.user = user;

  next();
};
module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
};