var mongoose = require('./connection');
var schema = mongoose.Schema;
var resetSchema = new schema({
  siteId: String,
  userId: String
});
var Reset = mongoose.model("Reset", resetSchema, "reset");
module.exports = Reset;
