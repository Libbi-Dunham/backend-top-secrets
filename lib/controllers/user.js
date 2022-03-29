const { Router } = require('express');
const UserService = require('../services/UserService');
const authenticate = require('../middleware/authenticate');
const ONLY_DAY_IN_MS = 1000 * 60 * 60 * 24;

module.exports = Router()
  .post('/signup', async (req, res, next) => {
    try {
      const user = await UserService.create(req.body);
      res.send(user);
    } catch (error) {
      next(error);
    }
  })

  .post('/session', async (req, res, next) => {
    try {
      const user = await UserService.signIn(req.body);

      res
        .cookie(process.env.COOKIE_NAME, user.authToken(), {
          httpOnly: true,
          maxAge: ONLY_DAY_IN_MS,
        })
        .send({ message: 'Successfully signed in', user });
    } catch (error) {
      next(error);
    }
  })

  .get('/private', authenticate, (req, res, next) => {
    try {
      res.send({
        message: 'You can only see this if you are logged in',
      });
    } catch (error) {
      next(error);
    }
  });
