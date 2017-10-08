const mongoose = require("./connection");
const schema = mongoose.Schema;
const classNotesSchema = new schema({
    "note": String,
    "date": String,
    "userId": String,
    "className": String,
    "classPeriod": Number,
    "classTeacher": String,
    "noteId": String
});
const ClassNotes = mongoose.model("ClassNotes", classNotesSchema, "classNotes");

module.exports = ClassNotes;
