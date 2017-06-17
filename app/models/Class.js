var mongoose = require('./connection');
var schema = mongoose.Schema;
var classSchema = new schema({
  name: String,
  period: Number,
  studentsEnrolled: Number,
  teacherName: String,
  userWhoAdded: String
});
var Class = mongoose.model('Class', classSchema, "classes");
module.exports = Class;
