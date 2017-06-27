var UserClasses = require("./models/UserClasses.js"),
UserHomework = require("./models/UserHomework.js"),
Reminders = require("./models/Reminders.js"),
async = require("async");
function logData(req){
  if(req.session!==undefined){
    return {userName: req.session.name, email: req.session.email, loggedin: req.session.active, id:req.session.id};
  } else{
    return {userName: false, email: false, loggedin: false, id: false};
  }
}
//Same logData as before
function createDate(){
  var DateObj = new Date();
  var year = DateObj.getFullYear();
  var month = DateObj.getMonth();
  var day = DateObj.getDate();
  var date = `${year}-${month}-${day}`;
  return date;
}
function pageData(req, res){
  var userId = req.session.id;
  async.parallel({
    classes: function(cb){
      UserClasses.find({userId: userId}, {_id: false}, {sort: 'classPeriod'}, function(err, classes){
        cb(err, classes)
      });
    },
    homework: function(cb){
        UserHomework.find({userId: userId}, {_id: false}, {sort: 'dueDate'}, function(err, homework){
          cb(err, homework);
        });
    },
    reminders: function(cb){
      Reminders.find({userId: userId}, {_id: false}, function(err, reminders){
        cb(err, reminders);
      });
    }
  }, function(err, results){
    //Get all the data specific to the user, their classess, homework and reminders
    if(err) throw err;
    res.render("twig/myClasses.twig", Object.assign({}, {token: req.csrfToken(), classesArray: results.classes, homeworkArray: results.homework, remindersArray: results.reminders}, logData(req)));
  });
}
function addReminder(req, res){
  var reminderText = req.body.reminder;
  var userId = req.session.id;
  var reminderID = Math.random()*Math.pow(10,18);
  var date = createDate();
  var NewReminder = new Reminders({
    reminderText: reminderText,
    dateCreated: date,
    reminderID: reminderID,
    userId: userId
  });
  NewReminder.save();
  //Create reminder
  res.end();
}
function completeReminder(req, res){
  var reminderID = req.body.reminderID;
  var userId = req.session.id;
  Reminders.remove({
    reminderID: reminderID,
    userId: userId
  }, function(err, resp){
    if(err) throw err;
    res.end();
  })
}
function deleteCompleted(req, res){
  var userId = req.session.id;
  UserHomework.remove({
    completed: true,
    userId: userId
  }, function(err, resp){
    //This deletes all the user's completed homework
    if(err) throw err;
    res.end();
  })
}
function completeHomework(req, res){
  var homeworkId = req.body.homeworkId;
  var action = (req.body.action=="complete");
  var userId = req.session.id;
  UserHomework.update({
    homeworkId: homeworkId,
    userId: userId
  }, {
    $set: {
      completed: action
      //Action is either true of false, if the user is completing the homework it is true, otherwise it is false
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
