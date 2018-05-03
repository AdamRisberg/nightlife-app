var Strategy = require("passport-local").Strategy;
var User = require("../models/user");
var bcrypt = require("bcrypt");

module.exports = function(passport) {
  passport.use("local-login", new Strategy(function(username, password, done) {
    User.findOne({username})
      .then(function(user) {
        if(!user) {
          return done(null, false);
        }
        if(!bcrypt.compareSync(password, user.password)){
          return done(null, false);
        }
        return done(null, user);
      })
      .catch(function(err) {
        return done(err);
      });
  }));

  passport.use("local-signup", new Strategy(function (username, password, done) {
    User.findOne({username})
      .then(function(found) {
        if(found) {
          return done(null, false);
        }
        if(!username || !password) {
          return done(null, false);
        }

        var user = new User({ 
          username: username,
          password: bcrypt.hashSync(password, 10) 
        });
        user.save()
          .then(function(user) {
            return done(null, user);
          })
          .catch(function(err) {
            return done(err, false);
          });
      })
      .catch(function(err) {
        return done(err, false);
      });
  }));

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id)
      .then(function(user) {
        return done(null, user);
      })
      .catch(function(err) {
        return done(err);
      });
  });
};