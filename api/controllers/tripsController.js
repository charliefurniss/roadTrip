var Trip = require("../models/trip");
var User = require("../models/user");

function tripsIndex(req, res){
  Project.find({}, function(err, projects) {
    if (err) return res.status(404).send(err);
    res.status(200).send(projects);
  });
}

function tripsCreate(req, res){
  var trip = new Trip(req.body);
  trip.save(function(err){
    if (err) return res.status(500).send(err);
    var id = trip.user;
    console.log(trip.user);
    User.findById({ _id: id }, function(err, user){
       user.trips.push(trip);
       console.log(user);
       user.save();
       return res.status(201).send(trip);
    });
  });
}

function tripsShow(req, res){
  var id = req.params.id;

  Project.findById({ _id: id }, function(err, project) {
    if (err) return res.status(500).send(err);
    if (!project) return res.status(404).send(err);
    res.status(200).send(project);
  });
}

function tripsUpdate(req, res){
  var id = req.params.id;

  Project.findByIdAndUpdate({ _id: id }, req.body.project, function(err, project){
    if (err) return res.status(500).send(err);
    if (!project) return res.status(404).send(err);
    res.status(200).send(project);
  });
}

function tripsDelete(req, res){
  var id = req.params.id;

  Project.remove({ _id: id }, function(err) {
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
