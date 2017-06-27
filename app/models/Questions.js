var mongoose = require('./connection');
var Answer = require("./Answers.js");
var schema = mongoose.Schema;
var questionSchema = new schema({
  userId: String,
  userWhoAsked: String,
  usernameDisplayed: String,
  question: String,
  dateAsked: String,
  questionId: String,
  className: String,
  classPeriod: Number,
  classTeacher: String,
  answers: [Answer]
});
var Question = mongoose.model("Questions", questionSchema, "questions");
module.exports = Question;
