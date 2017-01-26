const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide an email and a password' });
  }

  // Check if user with given email exists
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); }

    // If user exists, return error
    if (existingUser) {
      return res.status(422).send({ error: 'Email is in use' });
    }

    // If user does not exist, create and save user record
    const user = new User({
      email: email,
      password: password
    });

    user.save(function(err) {
      if (err) { return next(err); }

      // Respond to request indicating user was created
      res.json({ token: tokenForUser(user) });
    });
  });
}

exports.signin = function(req, res, next) {
  // User has been auth'd
  // Provide a token
  res.send({ token: tokenForUser(req.user) });
};
