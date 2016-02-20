var mongoose = require("mongoose");
var bcrypt   = require('bcrypt-nodejs');

// define the user schema, including reference to many trips
var userSchema = mongoose.Schema({
  local: {
    username: { type: String },
    fullname: { type: String },
    image: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
  },
  trips: [{ type: mongoose.Schema.ObjectId, ref: 'Trip' }]
});

//function to encrypt password, used as part of passport registration function defined in authentications controller
userSchema.statics.encrypt = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//function to encrypt password submitted with login and compare with the encrypted password stored in the user model. Used as part of passport login function defined in authentications controller
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
}

module.exports = mongoose.model("User", userSchema);