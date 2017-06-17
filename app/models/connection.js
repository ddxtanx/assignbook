var mongoose = require('mongoose');
var user = process.env.USER;
var password = process.env.PASS;
var uri = `mongodb://${user}:${password}@localhost:27017/classes`;
if(mongoose.connection.readyState!==1||mongoose.connection.readyState!==2){
mongoose.connect(uri);
}
var db = mongoose.connection;
db.on('error', console.error.bind(console, "Database error: "));
module.exports = mongoose;
