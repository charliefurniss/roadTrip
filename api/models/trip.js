var mongoose = require("mongoose");

var tripSchema = mongoose.Schema({
  name: { type: String, required: true },
  startPoint: String,
  endPoint: String,
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  stops: [{ type: mongoose.Schema.ObjectId, ref: 'Stop' }]
});

module.exports = mongoose.model('Trip', tripSchema);