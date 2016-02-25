var mongoose = require("mongoose");

var stopSchema = mongoose.Schema({
  googleObject: String
  // trip: { type: mongoose.Schema.ObjectId, ref: 'Trip' }
});

module.exports = mongoose.model('Stop', stopSchema);