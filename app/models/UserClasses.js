var mongoose = require('./connection');
var schema = mongoose.Schema;
var userClassSchema = new schema({
  className: String,
  classPeriod: Number,
  classTeacher: String,
  userID: String
});
var UserClass = mongoose.model("UserClasses", userClassSchema, "userClasses");
module.exports = UserClass;
