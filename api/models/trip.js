var mongoose = require("mongoose");

var tripSchema = mongoose.Schema({
  name: String,
  startpoint: String,
  endpoint: String,
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  stops: [{ type: mongoose.Schema.ObjectId, ref: 'Stop' }]
});

module.exports = mongoose.model('Trip', tripSchema);