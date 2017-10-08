const mongoose = require("./connection");
const schema = mongoose.Schema;
const userSchema = new schema({
    "username": String,
    "email": String,
    "password": String,
    "id": String,
    "ip": String
});
const User = mongoose.model("User", userSchema, "users");

module.exports = User;
