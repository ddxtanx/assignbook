var Class = require("./models/Class.js"),
UserClasses = require("./models/UserClasses.js"),
ClassStudents = require("./models/ClassStudents.js"),
ClassHomework = require("./models/ClassHomework.js"),
ClassNotes = require("./models/ClassNotes.js"),
Questions = require("./models/Questions.js"),
UserHomework = require("./models/UserHomework.js"),
u = require("underscore"),
async = require("async");
function logData(req){
  if(req.session!==undefined){
    return {userName: req.session.name, email: req.session.email, loggedin: req.session.active, id:req.session.id};
  } else{
    return {userName: false, email: false, loggedin: false, id: false};
  }
}
function getClasses(req, res){
  Class.find({},{
    studentsEnrolled: false,
    _id: false,
    userWhoAdded: false
  }, {
    sort: {
      period: 1
    }
  },function(err, classes){
    if(err) throw err;
    res.render("twig/classes.twig", Object.assign({}, logData(req), {classesArray:classes}));
  })
}
function addClass(req, res){
  var newClass = new Class({
    name: u.escape(req.body.className),
    period: u.escape(req.body.period),
    studentsEnrolled:0,
    teacherName: u.escape(req.body.teacherName),
    userWhoAdded: req.session.id
  });
  newClass.save(function(err, response){
    if(err) throw err;
    getClasses(req, res);
  })
}
function getClassData(req, res){
  var name = req.body.name,
  period = req.body.period,
  teacher = req.body.teacher,
  userId = req.session.id;
  UserClasses.findOne({
    className: name,
    classPeriod: period,
    classTeacher: teacher,
    userID: userId
  }, {}, function(err, foundClass){
    if(err) throw err;
    if(foundClass!==null){
      getData({name: name, period: period, teacher: teacher, hasEnrolled: true}, req, res);
    } else{
      getData({name: name, period: period, teacher: teacher, hasEnrolled: false}, req, res);
    }
  })
}
function getData(classData, req, res){
  var classQuery = {
    className: classData.name,
    classPeriod: classData.period,
    classTeacher: classData.teacher
  }
async.parallel({
  homeworkArray: function(cb){
    ClassHomework.find(classQuery, {_id: false}, {sort: 'dueDate'}, function(err, homework){
      cb(err, homework)
    })
  },
  notesArray: function(cb){
     ClassNotes.find(classQuery, {_id: false}, {sort: 'date'}, function(err, notes){
       cb(err, notes)
     })
   },
  questionsArray: function(cb){
    Questions.find(classQuery, {_id: false}, function(err, questions){
      cb(err, questions)
    })
  }
}, function(err, results){
  if(err) throw err;
  res.render("twig/viewClass.twig", Object.assign({}, logData(req), Object.assign({}, results, classData)));
})
}
function toggleEnroll(req, res){
  var userId = req.session.id,
  userName = req.session.name,
  email = req.session.email;
  req.body.period = parseInt(req.body.period);
  var classQuery = {
    className: req.body.name,
    classPeriod: req.body.period,
    classTeacher: req.body.teacher,
    userID: userId
  };
  UserClasses.findOne(classQuery, function(err, foundClass){
    if(err) throw err;
    if(foundClass!==null){
      console.log("unenrolling");
      //User is already enrolled, unenrolling
      var removeQuery = {
        className: req.body.name,
        classPeriod: req.body.period,
        classTeacher: req.body.teacher
      }
      ClassStudents.remove({
        studentName: userName,
        email: email,
        className: req.body.name,
        classPeriod: req.body.period,
        classTeacher: req.body.teacher
      }, function(err, response){
        if(err) throw err;
        UserClasses.remove(classQuery, function(err, response2){
          if(err) throw err;
          Class.update({
            name: req.body.name,
            period: req.body.period,
            teacherName: req.body.teacher
          }, {
            "$inc": {
              "studentsEnrolled": -1
            }
          }, function(err){
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'null'});
            res.end();
          });
        });
      });
    } else{
      console.log("enrolling");
      //User is not enrolled, enrolling
      var NewClassStudent = new ClassStudents({
        studentName: userName,
        email: email,
        id: userId,
        className: req.body.name,
        classPeriod: req.body.period,
        classTeacher: req.body.teacher
      });
      var NewUserClass = new UserClasses({
        className: req.body.name,
        classPeriod: req.body.period,
        classTeacher: req.body.teacher,
        userID: userId
      });
      NewClassStudent.save(function(err, response){
        if(err) throw err;
        NewUserClass.save(function(err, response){
          if(err) throw err;
          var updateQuery = {
            name: req.body.name,
            period: req.body.period,
            teacherName: req.body.teacher
          };
          console.log(updateQuery);
          Class.update(updateQuery, {
            "$inc": {
              "studentsEnrolled": 1
            }
          }, function(err){
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'null'});
            res.end();
          });
        })
      })
    }
  });
}
function deleteHomework(req, res){
  var homeworkData = {
    assignmentName: req.body.hName,
    description: req.body.hDescription,
    dueDate: req.body.hDueDate,
  }
  var classData = {
    className: req.body.cName,
    classPeriod: parseInt(req.body.cPeriod),
    classTeacher: req.body.cTeacher
  }
  var query = Object.assign({}, homeworkData, classData);
  UserClasses.find(classData, {userID: true}, function(err, ids){
    if(err) throw err;
    if(ids==[]){
      res.writeHead(200, {'Content-Type': 'text/boolean'});
      res.end(JSON.stringify({deleted: false}));
      return;
    }
    console.log(query);
    var userId = req.session.id;
    ClassHomework.find(query, function(err, foundHomework){
      if(err) throw err;
      if(foundHomework!==undefined){
        var homework = JSON.parse(JSON.stringify(foundHomework[0]));
        console.log(homework.userIDWhoAdded);
        if(homework.userIDWhoAdded==userId){
          ClassHomework.remove(query, function(err, response){
            ids.forEach(function(id){
              console.log('in loop');
              UserHomework.remove(Object.assign({}, homeworkData, {userID: id.userID}), function(err, response){
                if(err) throw err;
              });
            });
            res.writeHead(200, {'Content-Type': 'text/boolean'});
            res.end(JSON.stringify({deleted: true}));
          })
        } else{
          res.writeHead(200, {'Content-Type': 'text/boolean'});
          res.end(JSON.stringify({deleted: false}));
        }
      } else{
        res.writeHead(200, {'Content-Type': 'text/boolean'});
        res.end(JSON.stringify({deleted: false}));
      }
    })
  });
}
function addHomework(req, res){
  req.body.period = parseInt(req.body.period);
  var homeworkData = {
    assignmentName: u.escape(req.body.homeworkName),
    description: u.escape(req.body.description),
    dueDate: u.escape(req.body.duedate)
  }
  var classData = {
    className: req.body.name,
    classPeriod: req.body.period,
    classTeacher: req.body.teacher
  }
  var query = Object.assign({}, homeworkData, classData);
  var userID = req.session.id;
  UserClasses.find(classData, {userID: true}, function(err, ids){
    if(ids==undefined){
      res.end();
      return;
    }
    var classHomeworkObj = Object.assign({}, query, {userIDWhoAdded: userID});
    var NewClassHomework = new ClassHomework(classHomeworkObj);
    NewClassHomework.save();
    ids.forEach(function(id){
      var NewUserHomework = new UserHomework(Object.assign({}, homeworkData, {
        className: req.body.name,
        completed: false,
        userID: id.userID
      }));
      NewUserHomework.save();
    });
    res.end();
  });
}
function addNotes(req, res){
  var note = u.escape(req.body.note);
  var classData = {
    className: req.body.name,
    classPeriod: req.body.period,
    classTeacher: req.body.teacher
  };
  var DateObj = new Date();
  var year = DateObj.getFullYear();
  var month = DateObj.getMonth();
  var day = DateObj.getDate();
  var date = `${year}-${month}-${day}`;
  var Note = new ClassNotes(Object.assign({}, classData, {note: note, date: date, userId: req.session.id}));
  Note.save(function(err, resp){
    if(err) throw err;
    res.end();
  })
}
function addQuestion(req, res){
  console.log(req.body);
  var question = u.escape(req.body.question),
  anonymous = req.body.anonymous,
  displayedName = (anonymous)?"Anonymous":req.session.name;
  if(question[question.length-1]!=='?'){
    question = question.concat("?");
  }
  var userId = req.session.id;
  var DateObj = new Date(),
  year = DateObj.getFullYear(),
  month = DateObj.getMonth(),
  day = DateObj.getDate(),
  date = `${year}-${month}-${day}`;
  var questionId = Math.random()*Math.pow(10,18);
  var NewQuestion = new Questions({
    userWhoAsked: req.session.name,
    usernameDisplayed: displayedName,
    question: question,
    dateAsked: date,
    questionId: questionId,
    answers: [],
    className: req.body.name,
    classPeriod: req.body.period,
    classTeacher: req.body.teacher
  });
  NewQuestion.save(function(err, resp){
    if(err) throw err;
    res.end();
  })
}
function addAnswer(req, res){
  var answer = u.escape(req.body.answer);
  var anon = (req.body.anonymous=='true');
  var displayedName = (anon)?"Anonymous":req.session.name;
  var questionId = req.body.questionId;
  var DateObj = new Date(),
  year = DateObj.getFullYear(),
  month = DateObj.getMonth(),
  day = DateObj.getDate(),
  date = `${year}-${month}-${day}`;
  Questions.update({
    questionId: questionId
  }, {
    $push:{
      answers: {
        userWhoAnswered: req.session.name,
        usernameDisplayed: displayedName,
        answer: answer,
        dateAnswered: date
      }
    }
  }, function(err, resp){
    if(err) throw err;
    res.end();
  });
}
module.exports = {
  getClasses: getClasses,
  addClass: addClass,
  getClassData: getClassData,
  toggleEnroll: toggleEnroll,
  deleteHomework: deleteHomework,
  addHomework: addHomework,
  addNotes: addNotes,
  addQuestion: addQuestion,
  addAnswer: addAnswer
}
