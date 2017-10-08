const mongoose = require("./connection");
const schema = mongoose.Schema;
const userClassSchema = new schema({
    "className": String,
    "classPeriod": Number,
    "classTeacher": String,
    "userId": String
});
const UserClass = mongoose.model("UserClasses", userClassSchema, "userClasses");

module.exports = UserClass;
