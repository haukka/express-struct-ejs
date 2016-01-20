var express = require('express');
var controller = require('../controllers/userController');
var router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  else
      res.redirect('/login');
}

router.get('/users', ensureAuthenticated, controller.findAll);
router.post('/user', controller.create);
router.get('/user/:id', ensureAuthenticated, controller.findOne);
router.put('/user/:id', ensureAuthenticated, controller.Update);
router.delete('/user/:id', ensureAuthenticated, controller.Delete);

module.exports = router;
