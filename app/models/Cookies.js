var mongoose = require('./connection');
var schema = mongoose.Schema;
var cookiesSchema = new schema({
  cookieID: String,
  userID: String,
  username: String,
  dateCreated: String
});
var Cookies = mongoose.model("Cookies", cookiesSchema, "cookies");
