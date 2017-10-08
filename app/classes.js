const Class = require("./models/Class.js"),
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
function createDate(){
    const DateObj = new Date();
    const year = DateObj.getFullYear();
    const month = DateObj.getMonth() + 1;
    const day = DateObj.getDate();
    const date = `${year}-${month}-${day}`;
    return date;
}
//Same logdata as before
function getClasses(req, res){
  Class.find({},{
    _id: false
  }, {
    sort: {
      period: 1
    }
  },function(err, classes){
    if(err) throw err;
    res.render("twig/classes.twig", Object.assign({}, logData(req), {classesArray:classes, token: req.csrfToken()}));
  })
}
//This get's all classes and renders them onto classes.twig, csrf token is anti-csrf
function addClass(req, res){
  if((!isNaN(req.body.period))&&(req.body.className!=="")&&(req.body.teacherName!=="")){
    //Verify all fields are filled in
      const newClass = new Class({
          name: req.body.className,
          period: req.body.period,
          studentsEnrolled: 0,
          teacherName: req.body.teacherName,
          userWhoAdded: req.session.id
      });
      newClass.save(function(err, response){
      if(err) throw err;
      //Save new class document and re-render page
      getClasses(req, res);
    })
  } else{
    //If not, just re-render page
    getClasses(req,res);
  }
}
function getClassData(req, res){
    const name = req.body.name,
        period = req.body.period,
        teacher = req.body.teacher,
        userId = req.session.id;
    if(!isNaN(req.body.period)){
    //Verify period is a number
    Class.findOne({
      name: name,
      period: period,
      teacherName: teacher
    }, function(err, cl){
      if(cl!==null){
        //Make sure the class exists
        UserClasses.findOne({
          className: name,
          classPeriod: period,
          classTeacher: teacher,
          userId: userId
        }, {}, function(err, foundClass){
          if(err) throw err;
          if(foundClass!==null){
            //If found class exists, then the user has enrolled in the class
            getData({name: name, period: period, teacher: teacher, hasEnrolled: true}, req, res);
          } else{
            //If it doesnt exist, the user hasn't enrolled in the class
            getData({name: name, period: period, teacher: teacher, hasEnrolled: false}, req, res);
          }
        })
      } else{
        //If the class is null, redirect to classes
        res.redirect("/classes");
      }
    })
  } else{
    //If period isn't a number, redirect to classes
    res.redirect("/classes");
  }
}
function getData(classData, req, res){
  //This get's all the class data, like homework, notes, and questions
    const classQuery = {
        className: classData.name,
        classPeriod: classData.period,
        classTeacher: classData.teacher
    };
    async.parallel({
    //Asyncing to be fast
    homeworkArray: function(cb){
      ClassHomework.find(classQuery, {_id: false}, {sort: 'dueDate'}, function(err, homework){
        cb(err, homework)
      })
    },
    notesArray: function(cb){
      ClassNotes.find(classQuery, {_id: false}, {sort: 'date'}, function(err, notes){
        notes = notes.map(function(note){
            const newNote = note;
            newNote.note = newNote.note.replace(/\n/g, "<br />").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
          return newNote;
        });
        cb(err, notes);
      })
    },
    questionsArray: function(cb){
      Questions.find(classQuery, {_id: false}, function(err, questions){
        cb(err, questions)
      })
    }
  }, function(err, results){
    if(err) throw err;
    res.render("twig/viewClass.twig", Object.assign({token: req.csrfToken()}, logData(req), Object.assign({}, results, classData)));
  })
}
function toggleEnroll(req, res){
    const userId = req.session.id,
        userName = req.session.name,
        email = req.session.email;
    req.body.period = parseInt(req.body.period);
    const classQuery = {
        className: req.body.name,
        classPeriod: req.body.period,
        classTeacher: req.body.teacher,
        userId: userId
    };
    UserClasses.findOne(classQuery, function(err, foundClass){
    if(err) throw err;
    if(foundClass!==null){
      //If the class exists in UserClasses, the user has already enrolled, so we're unenrolling them
        const removeQuery = {
            className: req.body.name,
            classPeriod: req.body.period,
            classTeacher: req.body.teacher
        };
        async.parallel([
        function(callback){
          ClassStudents.remove({
            studentName: userName,
            email: email,
            className: req.body.name,
            classPeriod: req.body.period,
            classTeacher: req.body.teacher
          }, function(err, data){
            //Remove the user from the classes students
            callback(err, data)
          });
        },
        function(callback){
          UserClasses.remove(classQuery, function(err, response2){
            //Remove the class from the user's classes
            callback(err, response2)
          })
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
            //Decrement studentsEnrolled in the class
            callback(err, resp)
          }
        )},
        function(callback){
            const homeworkObj = {
                userId: userId,
                className: req.body.name
            };
            UserHomework.remove(homeworkObj, function(err, resp){
            callback(err, resp)
            //Remove all the class' homework from the user's homework
          })
        }
      ], function(err, responses){
        if(err) throw err;
      });
      res.writeHead(200, {'Content-Type': 'null'});
      res.end();
    } else{
      //If the class does not exist in the user's classes, then they have not enrolled, so we're enrolling them now
        const NewClassStudent = new ClassStudents({
            studentName: userName,
            email: email,
            id: userId,
            className: req.body.name,
            classPeriod: req.body.period,
            classTeacher: req.body.teacher
        });
        const NewUserClass = new UserClasses({
            className: req.body.name,
            classPeriod: req.body.period,
            classTeacher: req.body.teacher,
            userId: userId
        });
        const updateQuery = {
            name: req.body.name,
            period: req.body.period,
            teacherName: req.body.teacher
        };
        //Setup objects
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
            //Increment the class' students
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
              //Add all the homework from the class into the user's homework
                const NewUserHomework = new UserHomework({
                    assignmentName: home.assignmentName,
                    dueDate: home.dueDate,
                    description: home.description,
                    className: req.body.name,
                    completed: false,
                    userId: userId
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
function addHomework(req, res){
  req.body.period = parseInt(req.body.period);
  //Make sure period is an int
    const homeworkData = {
        assignmentName: req.body.homeworkName,
        description: req.body.description,
        dueDate: req.body.duedate,
        homeworkId: Math.random() * Math.pow(10, 18)
    };
    const classData = {
        className: req.body.name,
        classPeriod: req.body.period,
        classTeacher: req.body.teacher
    };
    const query = Object.assign({}, homeworkData, classData);
    const userId = req.session.id;
    UserClasses.find(classData, function(err, ids){
    if(ids===undefined){
      //This makes sure the user is enrolled
      res.end();
      return;
    }
      const classHomeworkObj = Object.assign({}, query, {userId: userId});
      //The classHomeworkObj is the concatenation of query and the user's id
      const NewClassHomework = new ClassHomework(classHomeworkObj);
      NewClassHomework.save();
    async.each(ids, function(id, callback){
      //For every person in the class, add the new homework into their homework
        const NewUserHomework = new UserHomework(Object.assign({}, homeworkData, {
            className: req.body.name,
            classPeriod: req.body.period,
            completed: false,
            userId: id.userId
        }));
        NewUserHomework.save();
    }, function(err){
      if(err) throw err;
    });
    res.end();
  });
}
function deleteHomework(req, res){
    const hId = req.body.hId;
    const userId = req.session.id;
    ClassHomework.findOne({
    homeworkId: hId
  }, function(err, homework){
    if(err) throw err;
    if(homework.userId===userId){
      //Verify that the user trying to delete the homework actually created it
      async.parallel([
        function(cb){
          ClassHomework.remove({
            homeworkId: hId
          }, function(err, resp){
            cb(err, resp)
          });
        },
        function(cb){
          UserHomework.remove({
            homeworkId: hId
          }, function(err, resp){
            cb(err, resp);
          });
        }
      ], function(err, resps){
        //Delete from both ClassHomework and UserHomework then end the response
        if(err) throw err;
        res.end();
      })
    } else{
      res.end();
    }
  })
}
function addNotes(req, res){
  console.log(req.body.note);
    const note = req.body.note;
    const classData = {
        className: req.body.name,
        classPeriod: req.body.period,
        classTeacher: req.body.teacher
    };
    const date = createDate();
    const Note = new ClassNotes(Object.assign({}, classData, {
        note: note,
        date: date,
        userId: req.session.id,
        noteId: Math.random() * Math.pow(10, 18)
    }));
    //Note is the combination of the class date, the note and the userId
  Note.save(function(err, resp){
    //Save the note and end the response
    if(err) throw err;
    res.end();
  })
}
function addQuestion(req, res){
    let question = req.body.question;
    const anonymous = req.body.anonymous,
        displayedName = (anonymous) ? "Anonymous" : req.session.name;
    //Displayed name is anonymous if the user wants it to be
  if(question[question.length-1]!=='?'){
    question = question.concat("?");
  }
  //If the question doesn't end in a ? then make it end in a ?
    const userId = req.session.id;
    const date = createDate();
    const questionId = Math.random() * Math.pow(10, 18);
    const NewQuestion = new Questions({
        userId: userId,
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
    //Create and save the question
    if(err) throw err;
    res.end();
  })
}
function addAnswer(req, res){
    const answer = req.body.answer;
    const anon = (req.body.anonymous == 'true');
    const displayedName = (anon) ? "Anonymous" : req.session.name;
    //Anonymity is same as question
    const questionId = req.body.questionId;
    const userId = req.session.id;
    const answerId = Math.random() * Math.pow(10, 18);
    const date = createDate();
    Questions.update({
    questionId: questionId
  }, {
    $push:{
      answers: {
        userId: userId,
        answerId: answerId,
        userWhoAnswered: req.session.name,
        usernameDisplayed: displayedName,
        answer: answer,
        dateAnswered: date
      }
    }
  }, function(err, resp){
    //Push the answer object into the answers array for the question answered
    if(err) throw err;
    res.end();
  });
}
function deleteClass(req, res){
    const name = req.body.name;
    const period = req.body.period;
    const teacherName = req.body.teacherName;
    const userId = req.session.id;
    const delData = {
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
        const classUserId = delClass.userWhoAdded;
        if(userId===classUserId&&(delClass.studentsEnrolled<=1)){
        //Make sure the user created the class and that not too many people are enrolled
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
          //Remove all data related to that class
          if(err) throw err;
          res.end("");
        })
      } else{
        res.end("");
      }
    } else{
      res.end("error");
    }
  })
}
function deleteNote(req, res){
    const noteId = req.body.noteId;
    const userId = req.session.id;
    ClassNotes.remove({
    noteId: noteId,
    userId: userId
  }, function(err, resp){
    //Delete that note if the user created it (That's what the userId is for in the query)
    if(err) throw err;
    res.end();
  })
}
function deleteQuestion(req, res){
    const qId = req.body.qId;
    const userId = req.session.id;
    Questions.remove({
    questionId: qId,
    userId: userId
  }, function(err, resp){
    //Same structure as deleteNote
    if(err) throw err;
    res.end();
  })
}
function deleteAnswer(req, res){
    const aId = req.body.aId;
    const qId = req.body.qId;
    //Need the qId to get the object that the answer belongs too
    const userId = req.session.id;
    Questions.update({
    questionId: qId
  }, {
    "$pull":{
      answers:{
        answerId: aId,
        userId: userId
      }
    }
  }, function(err, resp){
    //Pull the answer out of the answers array
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
  deleteNote: deleteNote,
  deleteQuestion: deleteQuestion,
  deleteAnswer: deleteAnswer
};
