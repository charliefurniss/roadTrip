var mongoose = require("mongoose");

var tripSchema = mongoose.Schema({
  name: String,
  startpoint: Object,
  endpoint: Object,
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  stopovers: [{ type: mongoose.Schema.ObjectId, ref: 'Stop' }]
});

module.exports = mongoose.model('Trip', tripSchema);