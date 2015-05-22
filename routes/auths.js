var express = require('express');
var request = require('request');
var mongoose = require('mongoose');
var models = require('../models/models');

var router = express.Router();
var User = models.user;
// inspired by https://github.com/EvanDorsky/riot-woko/blob/master/routes/olinauth.js

router.get('/login', function(req, res) {
  // req.session.user = null; // For clarity, the login page logs out current user.
  res.sendfile('./views/login.html');
});

router.get('/login/olin', function(req, res) {
  var callbackurl = process.env.OAREDIR || 'http://localhost:3000/auth/login/olin/cb';
  res.redirect('http://www.olinapps.com/external?callback=' + callbackurl);
});

router.get('/logout', function(req, res) {
  req.session.user = null;
  res.redirect('/');
});

router.post('/login/olin/cb', function(req, res) {
  req.session.user = {};
  request('http://www.olinapps.com/api/me?sessionid=' + req.body.sessionid, function(err, response, body) {
    body = JSON.parse(body);
    var userid = body.user.id;
    // var username = tools.capitalizeName(userid.replace(".", " "));
    var olinsesid = req.body.sessionid; //olinapps session id
    User.findOrCreate({
      name: username,
      guest: false
    }, {}, 'name guest', function(err, data) {
      if (err) {
        console.log('authentication error');
        req.session.user = null; // Auth has gone wrong, clear user.
        res.redirect('/login'); // Back to the login poge.
      } else {
        console.log('AUTHDATA', data);
        req.session.user = data;
        res.redirect('/');
      }
    });
  });
});

router.post('/login/guest', function(req, res) {
  var new_user = new User({
    name: req.body.name,
    guest: true,
  });
  new_user.save(function(err, users) {
    if (err) {
      console.error('Error adding guest user', err);
      res.status(500).send("Error adding guest user");
    }
  });
  req.session.user = new_user;

  res.send({
    redirect: '/'
  });
});

module.exports = router;

module.exports.isAuth_pg = function(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.redirect('/auth/login'); // If not authenticated, redirect to /login.
    // This could potentially be /home, if we want one.
  }
};

module.exports.isAuth_api = function(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.send('redir'); // send blank JSON (or add your behavior here)
  }
};
