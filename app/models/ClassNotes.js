var mongoose = require('./connection');
var schema = mongoose.Schema;
var classNotesSchema = new schema({
  note: String,
  date: String,
  userId: String,
  className: String,
  classPeriod: Number,
  classTeacher: String
});
var ClassNotes = mongoose.model("ClassNotes", classNotesSchema, "classNotes");
module.exports = ClassNotes;
