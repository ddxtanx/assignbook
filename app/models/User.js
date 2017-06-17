var mongoose = require('./connection');
var schema = mongoose.Schema;
var userSchema = new schema({
  username: String,
  email: String,
  password: String,
  id: String,
  ip: String
});
var User = mongoose.model('User', userSchema, "users");
module.exports = User;
