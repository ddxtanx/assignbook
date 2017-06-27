var mongoose = require('./connection');
var schema = mongoose.Schema;
var classHomeworkSchema = new schema({
  assignmentName: String,
  dueDate: String,
  description: String,
  className: String,
  classPeriod: Number,
  classTeacher: String,
  userId: String,
  homeworkId: String
});
var ClassHomework = mongoose.model("ClassHomework", classHomeworkSchema, "classHomework");
module.exports = ClassHomework;
