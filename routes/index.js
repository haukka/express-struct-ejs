var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var async = require('async');
var router = express.Router();

var smtpTransport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
	user: 'gmail user',
	pass: 'gmail password'
    }
});

passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, function(username, password, done) {
    User.findOne({ email: username }, function(err, user) {
	if (err) return done(err);
	if (!user)
	    return done(null, false, { message: 'Incorrect username.' });
	user.comparePassword(password, function(err, isMatch) {
	    if (isMatch) {
		return done(null, user);
	    }
	    return done(null, false, { message: 'Incorrect password.' });
	});
    });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', {});
});


router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'),function(req, res) {
    res.redirect('/users');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/forgot', function(res, res){
    res.render('forgot', {});
});

router.post('/forgot', function(req, res, next) {
    async.waterfall([
	function(done) {
	    crypto.randomBytes(20, function(err, buf) {
		var token = buf.toString('hex');
		done(err, token);
	    });
	},
	function(token, done) {
	    User.findOne({ email: req.body.email }, function(err, user) {
		if (err) {
		    return res.redirect('/forgot');
		}
		user.resetPasswordToken = token;
		user.resetPasswordExpires = Date.now() + 3600000;
		user.save(function(err) {
		    done(err, token, user);
		});
	    });
	},
	function(token, user, done) {
	    var mailOptions = {
		to: user.email,
		from: "reset@gmail.com",
		subject: 'Password Reset',
		text: 'Vous recevez ce mail car vous avez demander à réinitialiser votre mot de passe.\n\n' +
		    'Cliquez sur le lien ci-dessous ou collez le dans votre navigateur pour completer le processus.\n\n' +
		    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
		    'Si vous n\'avez pas fait cette demande, ignorer ce mail et le mot de passe restera inchangé.\n'
	    };
	    smtpTransport.sendMail(mailOptions, function(err) {
		console.log("mail envoyé");
		done(err, 'done', user.email);
	    });
	    
	}
    ], function(err) {
	smtpTransport.close();
	if (err) return next(err);
	res.redirect('/forgot');
    });
});

router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
	if (!user) {
	    console.log("Le token est invalide ou a expité.");
	    return res.redirect('/forgot');
	}
	res.render('reset', {
	    user: req.user
	});
    });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
              console.log("Le token est invalide ou a expiré.");
              return res.redirect('back');
          } 
          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          user.save(function(err) {
              req.logIn(user, function(err) {
		  done(err, user);
              });
          });
      });
    },
      function(user, done) {
	  var mailOptions = {
              to: user.email,
              from: 'reset@gmail.com',
              subject: 'Mot de pagge changé',
              text: 'Bonjour,\n\n' +
		  'Le mot de passe pour votre compte ' + user.email + ' vient d\'etre changé.\n'
	  };
	  smtpTransport.sendMail(mailOptions, function(err) {
              done(err);
	  });
      }
  ], function(err) {
      res.redirect('/');
  });
});

module.exports = router;
