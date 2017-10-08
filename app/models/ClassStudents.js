const mongoose = require("./connection");
const schema = mongoose.Schema;
const classStudentsSchema = new schema({
    "studentName": String,
    "email": String,
    "id": String,
    "className": String,
    "classPeriod": Number,
    "classTeacher": String
});
const ClassStudents = mongoose.model("ClassStudents", classStudentsSchema, "classStudents");

module.exports = ClassStudents;
