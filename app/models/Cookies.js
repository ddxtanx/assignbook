const mongoose = require("./connection");
const schema = mongoose.Schema;
const cookiesSchema = new schema({
    "cookieID": String,
    "userID": String,
    "username": String,
    "dateCreated": String
});
const Cookies = mongoose.model("Cookies", cookiesSchema, "cookies");
