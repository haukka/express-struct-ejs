var User = require("../models/user");
var passport = require('passport');
var async = require('async');

exports.findAll = function(req, res ) {
    User.find({}, function(err, users) {
	if (err) {
	    response = {"message": "Error updating data!"};
	    res.json(response);
	} else {
	    res.json(users);
	}
    });
}

exports.create = function(req, res) {
    return async.waterfall([
	function(callback) {
	    return User.count({ email: req.body.email }, callback);
	},
	function(isEmailExist, callback) {
	    if (isEmailExist) {
		return res.status(409).json({
		    errors: { email: ['Cette adresse email est déjà associée à un compte'] }
		});
	    }
	    return User.create({
		email: req.body.email,
		password: req.body.password
	    }, callback);
	}
    ], function(err, result) {
	if (err) {
	    return next(err);
	}
	User.findById(result._id, function(err, user) {
	    if (err) throw err;
	    req.login(user, function(err) {
		if (err) return next(err);
		return res.redirect('/users');
	    });
	});
    });
}

exports.findOne = function(req, res ) {
    User.findById(req.param('id'), function(err, user) {
	if (err) {
	    response = {"message": "Error retrieving data!"};
	    res.json(response);
	} else {
	    res.json(user);
	}
    });
}

exports.Update = function(req, res ) {
    User.findById(req.user.id, function(err, user) {
	if (err) throw err;
	user.firstname = user.firstname;
	user.save(function(err) {
	    if (err) {
		response = {"message": "Error updating data!"};
	    } else {
		response = {"message": "User successfully updated!"};
	    }
	    res.json(response);
	});
    });
}

exports.Delete = function(req, res ) {
    User.findByIdAndRemove(req.user.id, function(err) {
	if (err) {
	    response = {"message": "Error, impossible to delete this user!"};
	} else {
	    response = {"message": "User deleted!"};
	}
	res.json(response);
    });   
}
