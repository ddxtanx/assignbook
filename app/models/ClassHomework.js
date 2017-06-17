var mongoose = require('./connection');
var schema = mongoose.Schema;
var classHomeworkSchema = new schema({
  assignmentName: String,
  dueDate: String,
  description: String,
  className: String,
  classPeriod: Number,
  classTeacher: String,
  userIDWhoAdded: String
});
var ClassHomework = mongoose.model("ClassHomework", classHomeworkSchema, "classHomework");
module.exports = ClassHomework;
