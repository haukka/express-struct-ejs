var superagent = require('superagent');
var expect = require('expect.js');
var request = require('supertest');

var server = require('../app');
var user = request.agent(server);

describe('Test the registration part', function() {
    this.timeout(15000);

    it('respond to /', function test(done) {
	request(server)
	    .get('/')
	    .expect(200, done);
    });

    it('respond to /register', function test(done) {
	request(server)
	    .get('/register')
	    .expect(200, done);
    });

    it('respond to /user', function test(done) {
	request(server)
	    .post('/user')
	    .set('Accept','application/json')
	    .send({"email": "totoro@toto.com", "password": "totoro"})
	    .expect(302, done);
    });

});

describe('Test the controllers', function() {
    it('respond to /users', function test(done) {
	request(server)
	    .get('/users')
	    .expect('Content-Type', /json/)
	    .expect(200)
	    .end(function(err, res) {
		console.log(res);
		done();
	    });
    });

});

describe('Test the authentication part', function() {
    it('respond to /logout', function test(done) {
	request(server)
	    .get('/logout')
	    .expect(302, done);
    });

    it('respond to /login', function test(done) {
	request(server)
	    .post('/login')
	    .set('Accept','application/json')
	    .send({"email": "totoro@toto.com", "password": "totoro"})
	    .expect(302)
	    .end(function(err, res) {
		done();
	    });
    });
});
