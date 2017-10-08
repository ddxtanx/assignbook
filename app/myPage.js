const UserClasses = require("./models/UserClasses.js"),
    UserHomework = require("./models/UserHomework.js"),
    Reminders = require("./models/Reminders.js"),
    async = require("async");

function logData(req){
    if(req.session!==undefined){
        return { "userName": req.session.name, "email": req.session.email, "loggedin": req.session.active, "id": req.session.id };
    }
    return { "userName": false, "email": false, "loggedin": false, "id": false };
  
}
// Same logData as before
function createDate(){
    const DateObj = new Date();
    const year = DateObj.getFullYear();
    const month = DateObj.getMonth();
    const day = DateObj.getDate();
    const date = `${year}-${month}-${day}`;

    return date;
}
function pageData(req, res){
    const userId = req.session.id;

    async.parallel({
        "classes": function(cb){
            UserClasses.find({ "userId": userId }, { "_id": false }, { "sort": "classPeriod" }, (err, classes) => {
                cb(err, classes);
            });
        },
        "homework": function(cb){
            UserHomework.find({ "userId": userId }, { "_id": false }, { "sort": {
                "dueDate": 1,
                "classPeriod": 1
            } }, (err, homework) => {
                cb(err, homework);
            });
        },
        "reminders": function(cb){
            Reminders.find({ "userId": userId }, { "_id": false }, (err, reminders) => {
                cb(err, reminders);
            });
        }
    }, (err, results) => {
    // Get all the data specific to the user, their classess, homework and reminders
        if(err) {
            throw err;
        }
        res.render("twig/myClasses.twig", Object.assign({}, { "token": req.csrfToken(), "classesArray": results.classes, "homeworkArray": results.homework, "remindersArray": results.reminders }, logData(req)));
    });
}
function addReminder(req, res){
    const reminderText = req.body.reminder;
    const userId = req.session.id;
    const reminderID = Math.random() * Math.pow(10, 18);
    const date = createDate();
    const NewReminder = new Reminders({
        "reminderText": reminderText,
        "dateCreated": date,
        "reminderID": reminderID,
        "userId": userId
    });

    NewReminder.save();
    // Create reminder
    res.end();
}
function completeReminder(req, res){
    const reminderID = req.body.reminderID;
    const userId = req.session.id;

    Reminders.remove({
        "reminderID": reminderID,
        "userId": userId
    }, (err, resp) => {
        if(err) {
            throw err;
        }
        res.end();
    });
}
function deleteCompleted(req, res){
    const userId = req.session.id;

    UserHomework.remove({
        "completed": true,
        "userId": userId
    }, (err, resp) => {
    // This deletes all the user's completed homework
        if(err) {
            throw err;
        }
        res.end();
    });
}
function completeHomework(req, res){
    const homeworkId = req.body.homeworkId;
    const action = (req.body.action === "complete");
    const userId = req.session.id;

    UserHomework.update({
        "homeworkId": homeworkId,
        "userId": userId
    }, {
        "$set": {
            "completed": action
            // Action is either true of false, if the user is completing the homework it is true, otherwise it is false
        }
    }, (err, resp) => {
        if(err) {
            throw err;
        }
        res.end();
    });
}
module.exports = {
    "pageData": pageData,
    "addReminder": addReminder,
    "completeReminder": completeReminder,
    "deleteCompleted": deleteCompleted,
    "completeHomework": completeHomework
};
