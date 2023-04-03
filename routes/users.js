const express = require('express');
const router = express.Router();
const catchAsync = require('../utility/catchAsync');
const passport = require('passport');
const { checkReturnTo } = require('../middleware');
// USERS CONTROLLER:
const users = require('../controllers/users');

router
  .route('/register')
  .get(users.renderRegister)
  .post(catchAsync(users.register));

router
  .route('/login')
  .get(users.renderLogin)
  .post(
    checkReturnTo,
    passport.authenticate('local', {
      failureFlash: true,
      failureRedirect: '/login',
      keepSessionInfo: true,
    }),
    users.login
  );

router.get('/logout', users.logout);

module.exports = router;
