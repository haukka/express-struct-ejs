var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var async = require('async');
var crypto = require('crypto');
var passportLocalMongoose = require('passport-local-mongoose');

var SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
    username: String,
    firstname: String,
    lastname: String,
    age: Number,
    email: {
	type: String,
	required: true
    },
    password: {
	type: String,
	required: true
    },
    isAdmin: Boolean,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

UserSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
