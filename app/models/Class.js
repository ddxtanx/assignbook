const mongoose = require('./connection');
const schema = mongoose.Schema;
const classSchema = new schema({
    name: String,
    period: Number,
    studentsEnrolled: Number,
    teacherName: String,
    userWhoAdded: String
});
const Class = mongoose.model('Class', classSchema, "classes");
module.exports = Class;
