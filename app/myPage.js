var UserClasses = require("./models/UserClasses.js"),
UserHomework = require("./models/UserHomework.js"),
Reminders = require("./models/Reminders.js"),
u = require("underscore");
function logData(req){
  if(req.session!==undefined){
    return {userName: req.session.name, email: req.session.email, loggedin: req.session.active, id:req.session.id};
  } else{
    return {userName: false, email: false, loggedin: false, id: false};
  }
}
function pageData(req, res){
  var userID = req.session.id;
  UserClasses.find({userID: userID}, {_id: false}, {sort: 'classPeriod'}, function(err, classes){
    if(err) throw err;
    UserHomework.find({userID: userID}, {_id: false}, {sort: 'dueDate'}, function(err, homework){
      if(err) throw err;
      Reminders.find({userID: userID}, {_id: false}, function(err, reminders){
        res.render("twig/myClasses.twig", Object.assign({}, {classesArray: classes, homeworkArray: homework, remindersArray: reminders}, logData(req)));
      })
    })
  })
}
function addReminder(req, res){
  var reminderText = u.escape(req.body.reminder);
  var userID = req.session.id;
  var reminderID = Math.random()*Math.pow(10,18);
  var d = new Date();
  var date = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  var NewReminder = new Reminders({
    reminderText: reminderText,
    dateCreated: date,
    reminderID: reminderID,
    userID: userID
  });
  NewReminder.save();
  res.end();
}
function completeReminder(req, res){
  var reminderID = req.body.reminderID;
  var userID = req.session.id;
  Reminders.remove({
    reminderID: reminderID,
    userID: userID
  }, function(err, resp){
    if(err) throw err;
    res.end();
  })
}
function deleteCompleted(req, res){
  var userID = req.session.id;
  UserHomework.remove({
    completed: true,
    userID: userID
  }, function(err, resp){
    if(err) throw err;
    res.end();
  })
}
function completeHomework(req, res){
  var assignmentName = req.body.name;
  var description = req.body.description;
  var action = (req.body.action=="complete");
  var userID = req.session.id;
  UserHomework.update({
    assignmentName: assignmentName,
    description: description,
    userID: userID
  }, {
    $set: {
      completed: action
    }
  }, function(err, resp){
    if(err) throw err;
    res.end();
  })
}
module.exports = {
  pageData: pageData,
  addReminder: addReminder,
  completeReminder: completeReminder,
  deleteCompleted: deleteCompleted,
  completeHomework: completeHomework
}
