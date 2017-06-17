var mongoose = require('./connection');
var schema = mongoose.Schema;
var answerSchema = new schema({
  userWhoAnswered: String,
  usernameDisplayed: String,
  answer: String,
  dateAnswered: String
});
module.exports = answerSchema;
