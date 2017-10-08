/* eslint-disable node/no-unsupported-features */
const mongoose = require("./connection");
const schema = mongoose.Schema;
const classHomeworkSchema = new schema({
    "assignmentName": String,
    "dueDate": String,
    "description": String,
    "className": String,
    "classPeriod": Number,
    "classTeacher": String,
    "userId": String,
    "homeworkId": String
});
const ClassHomework = mongoose.model("ClassHomework", classHomeworkSchema, "classHomework");

module.exports = ClassHomework;
