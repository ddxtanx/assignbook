var mongoose = require('./connection');
var schema = mongoose.Schema;
var classStudentsSchema = new schema({
  studentName: String,
  email: String,
  id: String,
  className: String,
  classPeriod: Number,
  classTeacher: String
});
var ClassStudents = mongoose.model("ClassStudents", classStudentsSchema, "classStudents");
module.exports = ClassStudents;
