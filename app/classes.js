var Class = require("./models/Class.js"),
UserClasses = require("./models/UserClasses.js"),
ClassStudents = require("./models/ClassStudents.js"),
ClassHomework = require("./models/ClassHomework.js"),
ClassNotes = require("./models/ClassNotes.js"),
Questions = require("./models/Questions.js"),
UserHomework = require("./models/UserHomework.js"),
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
    _id: false
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
  if((!isNaN(req.body.period))&&(req.body.className!=="")&&(req.body.teacherName!=="")){
    var newClass = new Class({
      name: req.body.className,
      period: req.body.period,
      studentsEnrolled:0,
      teacherName: req.body.teacherName,
      userWhoAdded: req.session.id
    });
    newClass.save(function(err, response){
      if(err) throw err;
      getClasses(req, res);
    })
  } else{
    getClasses(req,res);
  }
}
function getClassData(req, res){
  var name = req.body.name,
  period = req.body.period,
  teacher = req.body.teacher,
  userId = req.session.id;
  if(!isNaN(req.body.period)){
    Class.findOne({
      name: name,
      period: period,
      teacherName: teacher
    }, function(err, cl){
      if(cl!==null){
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
      } else{
        res.redirect("/classes");
      }
    })
  } else{
    res.redirect("/classes");
  }
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
      async.parallel([
        function(callback){
          ClassStudents.remove({
            studentName: userName,
            email: email,
            className: req.body.name,
            classPeriod: req.body.period,
            classTeacher: req.body.teacher
          }, function(err, data){callback(err, data)});
        },
        function(callback){
          UserClasses.remove(classQuery, function(err, response2){callback(err, response2)})
        },
        function(callback){
          Class.update({
            name: req.body.name,
            period: req.body.period,
            teacherName: req.body.teacher
          }, {
            "$inc": {
              "studentsEnrolled": -1
            }
          }, function(err, resp){
            callback(err, resp)
          }
        )},
        function(callback){
          var homeworkObj = {
            userID: userId,
            className: req.body.name
          }
          console.log(homeworkObj);
          UserHomework.remove(homeworkObj, function(err, resp){
            callback(err, resp)
          })
        }
      ], function(err, responses){
        if(err) throw err;
      })
      res.writeHead(200, {'Content-Type': 'null'});
      res.end();
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
      var updateQuery = {
        name: req.body.name,
        period: req.body.period,
        teacherName: req.body.teacher
      };
      async.parallel([
        function(callback){
          NewClassStudent.save(function(err, resp){
            callback(err, resp)
          });
        },
        function(callback){
          NewUserClass.save(function(err, resp){
            callback(err, resp)
          });
        },
        function(callback){
          Class.update(updateQuery, {
            "$inc": {
              "studentsEnrolled": 1
            }
          }, function(err, resp){
            callback(err, resp);
          })
        },
        function(callback){
          ClassHomework.find({
            className: req.body.name,
            classPeriod: req.body.period,
            classTeacher: req.body.teacher,
          }, function(err, homework){
            async.each(homework, function(home, cb){
              var NewUserHomework = new UserHomework({
                assignmentName: home.assignmentName,
                dueDate: home.dueDate,
                description: home.description,
                className: req.body.name,
                completed: false,
                userID: userId
              });
              NewUserHomework.save(function(err, resp){
                cb(err, resp)
              })
            }, function(err, resp){
              callback(err, resp)
            })
          })
        }
      ], function(err, results){
        if(err) throw err;
        res.writeHead(200, {'Content-Type': 'null'});
        res.end();
      });
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
    assignmentName: req.body.homeworkName,
    description: req.body.description,
    dueDate: req.body.duedate
  }
  var classData = {
    className: req.body.name,
    classPeriod: req.body.period,
    classTeacher: req.body.teacher
  }
  var query = Object.assign({}, homeworkData, classData);
  var userID = req.session.id;
  UserClasses.find(classData, function(err, ids){
    if(ids==undefined){
      res.end();
      return;
    }
    var classHomeworkObj = Object.assign({}, query, {userIDWhoAdded: userID});
    var NewClassHomework = new ClassHomework(classHomeworkObj);
    NewClassHomework.save();
    async.each(ids, function(id, callback){
      var NewUserHomework = new UserHomework(Object.assign({}, homeworkData, {
        className: req.body.name,
        completed: false,
        userID: id.userID
      }));
      NewUserHomework.save();
    }, function(err){
      if(err) throw err;
    });
    res.end();
  });
}
function addNotes(req, res){
  var note = req.body.note;
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
  var question = req.body.question,
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
  var answer = req.body.answer;
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
function deleteClass(req, res){
  var name = req.body.name;
  var period = req.body.period;
  var teacherName = req.body.teacherName;
  var userId = req.session.id;
  var delData = {
    className: name,
    classPeriod: period,
    classTeacher: teacherName
  };
  Class.findOne({
    name: name,
    period: period,
    teacherName: teacherName
  }, function(err, delClass){
    if(err) throw err;
    if(delClass!==null){
      var classUserId = delClass.userWhoAdded;
      if(userId==classUserId&&(delClass.studentsEnrolled<=1)){
        async.parallel([
          function(cb){
            Class.remove({
              name: name,
              period: period,
              teacherName: teacherName,
              userWhoAdded: userId
            }, function(err, resp){
              cb(err, resp);
            })
          },
          function(cb){
            ClassHomework.remove(delData, function(err, resp){
              cb(err, resp)
            })
          },
          function(cb){
            ClassNotes.remove(delData, function(err, resp){
              cb(err, resp);
            });
          },
          function(cb){
            ClassStudents.remove(delData, function(err, resp){
              cb(err, resp);
            });
          },
          function(cb){
            Questions.remove(delData, function(err, resp){
              cb(err, resp);
            })
          },
          function(cb){
            UserClasses.remove(delData, function(err, resp){
              cb(err, resp);
            });
          },
          function(cb){
            UserHomework.remove({className: name}, function(err, resp){
              cb(err, resp)
            })
          }
        ], function(err, resps){
          if(err) throw err;
          res.end("good");
        })
      } else{
        res.end("error");
      }
    } else{
      res.end("error");
    }
  })
}
function deleteNote(req, res){
  var note  = req.body.note;
  var userId = req.session.id;
  ClassNotes.remove({
    note: note,
    userId: userId,
    className: req.body.name,
    classPeriod: req.body.period,
    classTeacher: req.body.teacher
  }, function(err, resp){
    if(err) throw err;
    res.end();
  })
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
  addAnswer: addAnswer,
  deleteClass: deleteClass,
  deleteNote: deleteNote
}
