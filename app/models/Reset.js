const mongoose = require("./connection");
const schema = mongoose.Schema;
const resetSchema = new schema({
    "siteId": String,
    "userId": String
});
const Reset = mongoose.model("Reset", resetSchema, "reset");

module.exports = Reset;
