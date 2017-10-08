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
        return { "userName": req.session.name, "email": req.session.email, "loggedin": req.session.active, "id": req.session.id };
    }
    return { "userName": false, "email": false, "loggedin": false, "id": false };

}
function createDate(){
    const DateObj = new Date(),
        year = DateObj.getFullYear(),
        month = DateObj.getMonth() + 1,
        day = DateObj.getDate(),
        date = `${year}-${month}-${day}`;

    return date;
}
// Same logdata as before
function getClasses(req, res){
    Class.find({}, {
        "_id": false
    }, {
        "sort": {
            "period": 1
        }
    }, (err, classes) => {
        if(err) {
            throw err;
        }
        res.render("twig/classes.twig", Object.assign({}, logData(req), { "classesArray": classes, "token": req.csrfToken() }));
    });
}
// This get's all classes and renders them onto classes.twig, csrf token is anti-csrf
function addClass(req, res){
    if((!isNaN(req.body.period))&&(req.body.className!=="")&&(req.body.teacherName!=="")){
        // Verify all fields are filled in
        const newClass = new Class({
            "name": req.body.className,
            "period": req.body.period,
            "studentsEnrolled": 0,
            "teacherName": req.body.teacherName,
            "userWhoAdded": req.session.id
        });

        newClass.save((err) => {
            if(err) {
                throw err;
            }
            // Save new class document and re-render page
            getClasses(req, res);
        });
    } else{
        // If not, just re-render page
        getClasses(req, res);
    }
}
function getData(classData, req, res){
    // This get's all the class data, like homework, notes, and questions
    const classQuery = {
        "className": classData.name,
        "classPeriod": classData.period,
        "classTeacher": classData.teacher
    };

    async.parallel({
        // Asyncing to be fast
        "homeworkArray": function(cb){
            ClassHomework.find(classQuery, { "_id": false }, { "sort": "dueDate" }, (err, homework) => {
                cb(err, homework);
            });
        },
        "notesArray": function(cb){
            ClassNotes.find(classQuery, { "_id": false }, { "sort": "date" }, (err, notes) => {
                notes = notes.map((note) => {
                    const newNote = note;

                    newNote.note = newNote.note.replace(/\n/g, "<br />").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
                    return newNote;
                });
                cb(err, notes);
            });
        },
        "questionsArray": function(cb){
            Questions.find(classQuery, { "_id": false }, (err, questions) => {
                cb(err, questions);
            });
        }
    }, (err, results) => {
        if(err) {
            throw err;
        }
        res.render("twig/viewClass.twig", Object.assign({ "token": req.csrfToken() }, logData(req), Object.assign({}, results, classData)));
    });
}
function getClassData(req, res){
    const name = req.body.name,
        period = req.body.period,
        teacher = req.body.teacher,
        userId = req.session.id;

    if(!isNaN(req.body.period)){
        // Verify period is a number
        Class.findOne({
            "name": name,
            "period": period,
            "teacherName": teacher
        }, (err, cl) => {
            if(err){
                throw err;
            }
            if(cl!==null){
                // Make sure the class exists
                UserClasses.findOne({
                    "className": name,
                    "classPeriod": period,
                    "classTeacher": teacher,
                    "userId": userId
                }, {}, (err2, foundClass) => {
                    if(err2) {
                        throw err2;
                    }
                    if(foundClass!==null){
                        // If found class exists, then the user has enrolled in the class
                        getData({ "name": name, "period": period, "teacher": teacher, "hasEnrolled": true }, req, res);
                    } else{
                        // If it doesnt exist, the user hasn't enrolled in the class
                        getData({ "name": name, "period": period, "teacher": teacher, "hasEnrolled": false }, req, res);
                    }
                });
            } else{
                // If the class is null, redirect to classes
                res.redirect("/classes");
            }
        });
    } else{
        // If period isn't a number, redirect to classes
        res.redirect("/classes");
    }
}
function toggleEnroll(req, res){
    const userId = req.session.id,
        userName = req.session.name,
        email = req.session.email,
        classQuery = {
            "className": req.body.name,
            "classPeriod": req.body.period,
            "classTeacher": req.body.teacher,
            "userId": userId
        };

    req.body.period = parseInt(req.body.period);

    UserClasses.findOne(classQuery, (err, foundClass) => {
        if(err) {
            throw err;
        }
        if(foundClass!==null){
            // If the class exists in UserClasses, the user has already enrolled, so we're unenrolling them
            async.parallel([
                function(callback){
                    ClassStudents.remove({
                        "studentName": userName,
                        "email": email,
                        "className": req.body.name,
                        "classPeriod": req.body.period,
                        "classTeacher": req.body.teacher
                    }, (err2, data) => {
                        // Remove the user from the classes students
                        callback(err2, data);
                    });
                },
                function(callback){
                    UserClasses.remove(classQuery, (err2, response2) => {
                        // Remove the class from the user's classes
                        callback(err2, response2);
                    });
                },
                function(callback){
                    Class.update({
                        "name": req.body.name,
                        "period": req.body.period,
                        "teacherName": req.body.teacher
                    }, {
                        "$inc": {
                            "studentsEnrolled": -1
                        }
                    }, (err2, resp) => {
                        // Decrement studentsEnrolled in the class
                        callback(err2, resp);
                    }
                    );
                },
                function(callback){
                    const homeworkObj = {
                        "userId": userId,
                        "className": req.body.name
                    };

                    UserHomework.remove(homeworkObj, (err2, resp) => {
                        callback(err2, resp);
                        // Remove all the class' homework from the user's homework
                    });
                }
            ], (err2) => {
                if(err2) {
                    throw err2;
                }
            });
            res.writeHead(200, { "Content-Type": "null" });
            res.end();
        } else{
            // If the class does not exist in the user's classes, then they have not enrolled, so we're enrolling them now
            const NewClassStudent = new ClassStudents({
                    "studentName": userName,
                    "email": email,
                    "id": userId,
                    "className": req.body.name,
                    "classPeriod": req.body.period,
                    "classTeacher": req.body.teacher
                }),
                NewUserClass = new UserClasses({
                    "className": req.body.name,
                    "classPeriod": req.body.period,
                    "classTeacher": req.body.teacher,
                    "userId": userId
                }),
                updateQuery = {
                    "name": req.body.name,
                    "period": req.body.period,
                    "teacherName": req.body.teacher
                };
            // Setup objects

            async.parallel([
                function(callback){
                    NewClassStudent.save((err2, resp) => {
                        callback(err2, resp);
                    });
                },
                function(callback){
                    NewUserClass.save((err2, resp) => {
                        callback(err2, resp);
                    });
                },
                function(callback){
                    Class.update(updateQuery, {
                        "$inc": {
                            "studentsEnrolled": 1
                        }
                    }, (err2, resp) => {
                        // Increment the class' students
                        callback(err2, resp);
                    });
                },
                function(callback){
                    ClassHomework.find({
                        "className": req.body.name,
                        "classPeriod": req.body.period,
                        "classTeacher": req.body.teacher
                    }, (err2, homework) => {
                        async.each(homework, (home, cb) => {
                            // Add all the homework from the class into the user's homework
                            const NewUserHomework = new UserHomework({
                                "assignmentName": home.assignmentName,
                                "dueDate": home.dueDate,
                                "description": home.description,
                                "className": req.body.name,
                                "completed": false,
                                "userId": userId
                            });

                            NewUserHomework.save((err3, resp) => {
                                cb(err3, resp);
                            });
                        }, (err3, resp) => {
                            callback(err3, resp);
                        });
                    });
                }
            ], (err2) => {
                if(err2) {
                    throw err;
                }
                res.writeHead(200, { "Content-Type": "null" });
                res.end();
            });
        }
    });
}
function addHomework(req, res){
    req.body.period = parseInt(req.body.period);
    // Make sure period is an int
    const homeworkData = {
            "assignmentName": req.body.homeworkName,
            "description": req.body.description,
            "dueDate": req.body.duedate,
            "homeworkId": Math.random() * Math.pow(10, 18)
        },
        classData = {
            "className": req.body.name,
            "classPeriod": req.body.period,
            "classTeacher": req.body.teacher
        },
        query = Object.assign({}, homeworkData, classData),
        userId = req.session.id;

    UserClasses.find(classData, (err, ids) => {
        if(ids===undefined){
            // This makes sure the user is enrolled
            res.end();
            return;
        }
        const classHomeworkObj = Object.assign({}, query, { "userId": userId }),
            // The classHomeworkObj is the concatenation of query and the user's id
            NewClassHomework = new ClassHomework(classHomeworkObj);

        NewClassHomework.save();
        async.each(ids, (id) => {
            // For every person in the class, add the new homework into their homework
            const NewUserHomework = new UserHomework(Object.assign({}, homeworkData, {
                "className": req.body.name,
                "classPeriod": req.body.period,
                "completed": false,
                "userId": id.userId
            }));

            NewUserHomework.save();
        }, (err2) => {
            if(err2) {
                throw err;
            }
        });
        res.end();
    });
}
function deleteHomework(req, res){
    const hId = req.body.hId,
        userId = req.session.id;

    ClassHomework.findOne({
        "homeworkId": hId
    }, (err, homework) => {
        if(err) {
            throw err;
        }
        if(homework.userId===userId){
            // Verify that the user trying to delete the homework actually created it
            async.parallel([
                function(cb){
                    ClassHomework.remove({
                        "homeworkId": hId
                    }, (err2, resp) => {
                        cb(err2, resp);
                    });
                },
                function(cb){
                    UserHomework.remove({
                        "homeworkId": hId
                    }, (err2, resp) => {
                        cb(err2, resp);
                    });
                }
            ], (err2) => {
                // Delete from both ClassHomework and UserHomework then end the response
                if(err2) {
                    throw err2;
                }
                res.end();
            });
        } else{
            res.end();
        }
    });
}
function addNotes(req, res){
    const note = req.body.note,
        classData = {
            "className": req.body.name,
            "classPeriod": req.body.period,
            "classTeacher": req.body.teacher
        },
        date = createDate(),
        Note = new ClassNotes(Object.assign({}, classData, {
            "note": note,
            "date": date,
            "userId": req.session.id,
            "noteId": Math.random() * Math.pow(10, 18)
        }));
    // Note is the combination of the class date, the note and the userId

    Note.save((err) => {
        // Save the note and end the response
        if(err) {
            throw err;
        }
        res.end();
    });
}
function addQuestion(req, res){
    let question = req.body.question;
    const anonymous = req.body.anonymous,
        displayedName = (anonymous) ? "Anonymous" : req.session.name,
        // Displayed name is anonymous if the user wants it to be
        userId = req.session.id,
        date = createDate(),
        questionId = Math.random() * Math.pow(10, 18),
        NewQuestion = new Questions({
            "userId": userId,
            "userWhoAsked": req.session.name,
            "usernameDisplayed": displayedName,
            "question": question,
            "dateAsked": date,
            "questionId": questionId,
            "answers": [],
            "className": req.body.name,
            "classPeriod": req.body.period,
            "classTeacher": req.body.teacher
        });

    if(question[question.length-1]!=="?"){
        question = question.concat("?");
    }
    // If the question doesn't end in a ? then make it end in a ?


    NewQuestion.save((err) => {
        // Create and save the question
        if(err) {
            throw err;
        }
        res.end();
    });
}
function addAnswer(req, res){
    const answer = req.body.answer,
        anon = (req.body.anonymous === "true"),
        displayedName = (anon) ? "Anonymous" : req.session.name,
        // Anonymity is same as question
        questionId = req.body.questionId,
        userId = req.session.id,
        answerId = Math.random() * Math.pow(10, 18),
        date = createDate();

    Questions.update({
        "questionId": questionId
    }, {
        "$push": {
            "answers": {
                "userId": userId,
                "answerId": answerId,
                "userWhoAnswered": req.session.name,
                "usernameDisplayed": displayedName,
                "answer": answer,
                "dateAnswered": date
            }
        }
    }, (err) => {
        // Push the answer object into the answers array for the question answered
        if(err) {
            throw err;
        }
        res.end();
    });
}
function deleteClass(req, res){
    const name = req.body.name,
        period = req.body.period,
        teacherName = req.body.teacherName,
        userId = req.session.id,
        delData = {
            "className": name,
            "classPeriod": period,
            "classTeacher": teacherName
        };

    Class.findOne({
        "name": name,
        "period": period,
        "teacherName": teacherName
    }, (err, delClass) => {
        if(err) {
            throw err;
        }
        if(delClass!==null){
            const classUserId = delClass.userWhoAdded;

            if(userId===classUserId&&(delClass.studentsEnrolled<=1)){
                // Make sure the user created the class and that not too many people are enrolled
                async.parallel([
                    function(cb){
                        Class.remove({
                            "name": name,
                            "period": period,
                            "teacherName": teacherName,
                            "userWhoAdded": userId
                        }, (err2, resp) => {
                            cb(err2, resp);
                        });
                    },
                    function(cb){
                        ClassHomework.remove(delData, (err2, resp) => {
                            cb(err2, resp);
                        });
                    },
                    function(cb){
                        ClassNotes.remove(delData, (err2, resp) => {
                            cb(err2, resp);
                        });
                    },
                    function(cb){
                        ClassStudents.remove(delData, (err2, resp) => {
                            cb(err2, resp);
                        });
                    },
                    function(cb){
                        Questions.remove(delData, (err2, resp) => {
                            cb(err2, resp);
                        });
                    },
                    function(cb){
                        UserClasses.remove(delData, (err2, resp) => {
                            cb(err2, resp);
                        });
                    },
                    function(cb){
                        UserHomework.remove({ "className": name }, (err2, resp) => {
                            cb(err2, resp);
                        });
                    }
                ], (err2) => {
                    // Remove all data related to that class
                    if(err2) {
                        throw err2;
                    }
                    res.end("");
                });
            } else{
                res.end("");
            }
        } else{
            res.end("error");
        }
    });
}
function deleteNote(req, res){
    const noteId = req.body.noteId,
        userId = req.session.id;

    ClassNotes.remove({
        "noteId": noteId,
        "userId": userId
    }, (err) => {
        // Delete that note if the user created it (That's what the userId is for in the query)
        if(err) {
            throw err;
        }
        res.end();
    });
}
function deleteQuestion(req, res){
    const qId = req.body.qId,
        userId = req.session.id;

    Questions.remove({
        "questionId": qId,
        "userId": userId
    }, (err) => {
        // Same structure as deleteNote
        if(err) {
            throw err;
        }
        res.end();
    });
}
function deleteAnswer(req, res){
    const aId = req.body.aId,
        qId = req.body.qId,
        // Need the qId to get the object that the answer belongs too
        userId = req.session.id;

    Questions.update({
        "questionId": qId
    }, {
        "$pull": {
            "answers": {
                "answerId": aId,
                "userId": userId
            }
        }
    }, (err) => {
        // Pull the answer out of the answers array
        if(err) {
            throw err;
        }
        res.end();
    });
}
module.exports = {
    "getClasses": getClasses,
    "addClass": addClass,
    "getClassData": getClassData,
    "toggleEnroll": toggleEnroll,
    "deleteHomework": deleteHomework,
    "addHomework": addHomework,
    "addNotes": addNotes,
    "addQuestion": addQuestion,
    "addAnswer": addAnswer,
    "deleteClass": deleteClass,
    "deleteNote": deleteNote,
    "deleteQuestion": deleteQuestion,
    "deleteAnswer": deleteAnswer
};
