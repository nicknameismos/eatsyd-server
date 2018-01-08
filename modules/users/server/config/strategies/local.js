'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('mongoose').model('User'),
    _ = require('lodash'),
    jwt = require('jsonwebtoken');

var config = {
    secret: 'ngEurope rocks!',
    audience: 'nodejs-jwt-auth',
    issuer: 'https://gonto.com'
};

module.exports = function () {

    function createIdToken(user) {
        return jwt.sign(_.omit(user, 'password'), config.secret, { expiresIn: 2 * 60 * 60 * 1000 });
    }


    // Use local strategy
    passport.use('local', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
        function (username, password, done) {
            User.findOne({
                $or: [{
                    username: username
                }, {
                    mobile: username
                }]
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown user'
                    });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }

                // add token and exp date to user object
                user.loginToken = "";
                user.loginToken = createIdToken(user);
                user.loginExpires = Date.now() + (2 * 60 * 60 * 1000); // 2 hours
                // save user object to update database
                user.save(function (err) {
                    if (err) {
                        done(err);
                    } else {
                        done(null, user);
                    }
                });

            });
        }
    ));
};
