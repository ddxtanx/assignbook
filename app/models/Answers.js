const mongoose = require('./connection');
const schema = mongoose.Schema;
const answerSchema = new schema({
    userId: String,
    answerId: String,
    userWhoAnswered: String,
    usernameDisplayed: String,
    answer: String,
    dateAnswered: String
});
module.exports = answerSchema;
