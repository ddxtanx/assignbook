const mongoose = require("./connection");
const Answer = require("./Answers.js");
const schema = mongoose.Schema;
const questionSchema = new schema({
    "userId": String,
    "userWhoAsked": String,
    "usernameDisplayed": String,
    "question": String,
    "dateAsked": String,
    "questionId": String,
    "className": String,
    "classPeriod": Number,
    "classTeacher": String,
    "answers": [ Answer ]
});
const Question = mongoose.model("Questions", questionSchema, "questions");

module.exports = Question;
