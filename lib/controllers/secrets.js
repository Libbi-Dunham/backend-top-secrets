const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const Secret = require('../models/Secrets');

module.exports = Router()
  .post('/', async (req, res, next) => {
    try {
      const secrets = await Secret.insert(req.body);
      res.send(secrets);
    } catch (error) {
      next(error);
    }
  })
  .get('/', authenticate, async (req, res, next) => {
    try {
      const secrets = await Secret.getSecrets();
      res.send(secrets);
    } catch (error) {
      next(error);
    }
  });
