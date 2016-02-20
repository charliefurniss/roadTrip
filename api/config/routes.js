// set up routes associated with the functions defined in authentications, users and trips controllers
var express = require('express'),
    router  = express.Router();

var usersController = require('../controllers/usersController');
var tripsController = require('../controllers/tripsController');
var authenticationsController = require('../controllers/authenticationsController');

router.post('/login', authenticationsController.login);
router.post('/register', authenticationsController.register);

router.route('/')
  .get(usersController.usersIndex)
 
router.route('/users')
  .get(usersController.usersIndex)
//   .post(usersController.usersCreate)

router.route('/users/:id') 
  .get(usersController.usersShow)
  .patch(usersController.usersUpdate)
  .delete(usersController.usersDelete)

router.route('/trips')
  .get(tripsController.tripsIndex)
  .post(tripsController.tripsCreate)

router.route('/trips/:id') 
  .get(tripsController.tripsShow)
  .patch(tripsController.tripsUpdate)
  .delete(tripsController.tripsDelete)

module.exports = router;