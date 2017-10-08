const mongoose = require("./connection");
const schema = mongoose.Schema;
const userHomeworkSchema = new schema({
    "assignmentName": String,
    "dueDate": String,
    "description": String,
    "className": String,
    "classPeriod": Number,
    "completed": Boolean,
    "userId": String,
    "homeworkId": String
});
const UserHomework = mongoose.model("UserHomework", userHomeworkSchema, "userHomework");

module.exports = UserHomework;
