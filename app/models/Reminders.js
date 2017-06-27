var mongoose = require('./connection');
var schema = mongoose.Schema;
var reminderSchema = new schema({
  reminderText: String,
  dateCreated: String,
  userId: String,
  reminderID: String
});
var Reminder = mongoose.model("Reminders", reminderSchema, "reminders");
module.exports = Reminder;
