var mongoose = require("mongoose");

var stopSchema = mongoose.Schema({
  title: { type: String, required: true },
  type: String,
  googleObject: Object,
  name: String,
  location: String,
  url: String,
  image: String,
  trip: { type: mongoose.Schema.ObjectId, ref: 'Trip' }
});

module.exports = mongoose.model('Stop', stopSchema);