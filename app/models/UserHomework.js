var mongoose = require('./connection');
var schema = mongoose.Schema;
var userHomeworkSchema = new schema({
  assignmentName: String,
  dueDate: String,
  description: String,
  className: String,
  completed: Boolean,
  userID:String
});
var UserHomework = mongoose.model("UserHomework", userHomeworkSchema, "userHomework");
module.exports = UserHomework;
