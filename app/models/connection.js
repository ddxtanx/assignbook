const mongoose = require('mongoose');
const user = process.env.USER;
const password = process.env.PASS;
const database = process.env.Database;
const uri = `mongodb://${user}:${password}@${database}`;
if(mongoose.connection.readyState!==1||mongoose.connection.readyState!==2){
mongoose.connect(uri);
}
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Database error: "));
module.exports = mongoose;
