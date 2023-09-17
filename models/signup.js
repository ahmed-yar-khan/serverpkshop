const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  signupName: String,
  signupEmail: String,
  signupPassword: String, 
  type: String,
});


module.exports = mongoose.model('User', userSchema);