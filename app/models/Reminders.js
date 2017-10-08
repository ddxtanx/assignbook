const mongoose = require("./connection");
const schema = mongoose.Schema;
const reminderSchema = new schema({
    "reminderText": String,
    "dateCreated": String,
    "userId": String,
    "reminderID": String
});
const Reminder = mongoose.model("Reminders", reminderSchema, "reminders");

module.exports = Reminder;
