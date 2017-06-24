var opbeat = require('opbeat').start();
var cluster = require("cluster");
if(cluster.isMaster){
  var cpuCount = require('os').cpus().length;
   for (var i = 0; i < cpuCount; i += 1) {
       cluster.fork();
   }
   cluster.on('exit', function (worker) {
      console.log('Worker %d died :(', worker.id);
      cluster.fork();
  });
} else{
  var express = require("express"),
  bodyParser = require("body-parser"),
  sessions = require("client-sessions"),
  account = require("../app/account.js"),
  classes = require("../app/classes.js"),
  myPage = require("../app/myPage.js"),
  compression = require("compression"),
  path=require("path"),
  helmet=require("helmet"),
  expressEnforcesSsl = require("express-enforces-ssl"),
  expressSanitized = require('express-sanitize-escape');
  var server = express();
  server.set('views', './public');
  server.enable('trust proxy');
  server.use(bodyParser(), express.static("./public", { maxAge: 86400000 }), sessions({
    cookieName: "session",
    secret: process.env.SESSION_SECRET,
    duration: 60 * 60 * 1000,
    activeDuration: 30 * 60 * 1000
  }), compression(), opbeat.middleware.express(), helmet(), expressEnforcesSsl(), expressSanitized.middleware());
  function checkIn(req, res, callback){
    if(!req.session.active){
      console.log("Catching attempted visit without login");
      res.redirect('/login');
      res.end();
    }else {
      callback();
    }
  }
  function logData(req){
    if(req.session!==undefined){
      return {userName: req.session.name, email: req.session.email, loggedin: req.session.active, id:req.session.id};
    } else{
      return {userName: false, email: false, loggedin: 0, id: false};
    }
  }
  server.get("/*", function(req, res, next){
    if(req.session==undefined){
      req.session = {};
      req.session.active = false;
      req.session.name = "";
    }
    next();
  });
  server.get("/", function(req, res){
    res.render("twig/index.twig", logData(req));
  });
  server.get("/register", function(req, res){
    res.render("twig/register.twig", Object.assign({}, logData(req), {error: null}));
  });
  server.post("/register", function(req, res){
    account.register(req, res);
  });
  server.get("/login", function(req, res){
    res.render("twig/login.twig", Object.assign({}, logData(req), {error: null}));
  });
  server.post("/login", function(req, res){
    account.login(req, res);
  });
  server.get("/classes", function(req, res){
    checkIn(req, res, function(){
      classes.getClasses(req, res);
    });
  });
  server.post("/classes", function(req, res){
    checkIn(req, res, function(){
      classes.addClass(req, res);
    });
  });
  server.post("/viewClass", function(req, res){
    checkIn(req, res, function(){
      classes.getClassData(req, res);
    });
  });
  server.post("/enroll", function(req, res){
    checkIn(req, res, function(){
      classes.toggleEnroll(req, res);
    });
  });
  server.post("/deleteHomework", function(req, res){
    checkIn(req, res, function(){
      classes.deleteHomework(req, res);
    });
  });
  server.post("/addHomework", function(req, res){
    checkIn(req, res, function(){
      classes.addHomework(req, res);
    });
  });
  server.post("/addNotes", function(req, res){
    checkIn(req, res, function(){
      classes.addNotes(req, res);
    });
  });
  server.get("/logout", function(req, res){
    checkIn(req, res, function(){
      req.session.destroy();
      req.session.active = false;
      res.redirect("/");
    });
  });
  server.get("/myClasses", function(req, res){
    checkIn(req, res, function(){
      myPage.pageData(req, res)
    });
  });
  server.post("/addReminder", function(req, res){
    checkIn(req, res, function(){
      myPage.addReminder(req, res);
    });
  });
  server.post("/completeReminder", function(req, res){
    checkIn(req, res, function(){
      myPage.completeReminder(req, res);
    });
  });
  server.post("/deleteCompleted", function(req, res){
    checkIn(req, res, function(){
      myPage.deleteCompleted(req, res);
    });
  });
  server.post("/completeHomework", function(req, res){
    checkIn(req, res, function(){
      myPage.completeHomework(req, res);
    });
  });
  server.post("/addQuestion", function(req, res){
    checkIn(req, res, function(){
      classes.addQuestion(req, res);
    });
  });
  server.post("/addAnswer", function(req, res){
    checkIn(req, res, function(){
      classes.addAnswer(req, res);
    });
  });
  server.get("/viewClass", function(req, res){
    res.redirect("/classes")
  });
  server.get("/forgot", function(req, res){
    res.render("twig/forgot.twig", logData(req));
  });
  server.get("/change",function(req, res){
    res.render("twig/change.twig", Object.assign({}, logData(req), {siteId: req.query.id}));
  });
  server.post("/forgot", function(req, res){
    account.forgot(req, res);
  });
  server.post("/change", function(req, res){
    account.change(req, res);
  })
  server.get("/public/*", function(req, res){
    res.end();
  });
  server.get("/survey", function(req, res){
    checkIn(req, res, function(){
      res.render('twig/survey.twig');
    })
  })
  var PORT = process.env.PORT;
  console.log(`SERVER LISTENING ON PORT ${PORT}`);
  server.listen(PORT);
}
