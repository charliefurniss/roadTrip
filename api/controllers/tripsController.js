var Trip = require("../models/trip");
var User = require("../models/user");

function tripsIndex(req, res){
  Trip.find({}, function(err, trips) {
    if (err) return res.status(404).send(err);
    res.status(200).send(trips);
  });
}

function tripsCreate(req, res){
  var trip = new Trip(req.body);
  trip.save(function(err){
    if (err) return res.status(500).send(err);
    var id = trip.user;
    User.findById({ _id: id }, function(err, user){
       user.trips.push(trip);
       user.save();
       return res.status(201).send(trip);
    });
  });
}

function tripsShow(req, res){
  var id = req.params.id;
  Trip.findById({ _id: id }, function(err, trip) {
    console.log(trip);
    if (err) return res.status(500).send(err);
    if (!trip) return res.status(404).send(err);
    res.status(200).send(trip);
  });
}

function tripsUpdate(req, res){
  var id = req.params.id;
  Trip.findByIdAndUpdate({ _id: id }, req.body.trip, function(err, trip){
    if (err) return res.status(500).send(err);
    if (!trip) return res.status(404).send(err);
    res.status(200).send(trip);
  });
}

function tripsDelete(req, res){
  var id = req.params.id;

  Trip.remove({ _id: id }, function(err) {
    if (err) return res.status(500).send(err);
    res.status(200).send();
  });
}

module.exports = {
  tripsIndex:  tripsIndex,
  tripsCreate: tripsCreate,
  tripsShow:   tripsShow,
  tripsUpdate: tripsUpdate,
  tripsDelete: tripsDelete
};
