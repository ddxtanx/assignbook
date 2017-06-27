var mongoose = require('./connection');
var schema = mongoose.Schema;
var answerSchema = new schema({
  userId: String,
  answerId: String,
  userWhoAnswered: String,
  usernameDisplayed: String,
  answer: String,
  dateAnswered: String
});
module.exports = answerSchema;
