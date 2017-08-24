var opbeat = require('opbeat').start();
var cluster = require("cluster");
var escape = require("underscore").escape;
function escapeMiddleware(req, res, next){
  if(process.env.env=="prod"){
    if(req.headers.host!==undefined){
      if(req.headers.host=="assignbook.herokuapp.com"){
        Object.keys(req.body).map(function(key, index){
          console.log(req.body[key]);
          req.body[key] = escape(req.body[key]);
        });
        next();
      } else{
        res.end();
      }
    } else{
      res.end();
    }
  } else{
    Object.keys(req.body).map(function(key, index){
      req.body[key] = escape(req.body[key]);
    });
    next();
  }
}
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
  csrf = require("csurf"),
  csrfProtection = csrf({ cookie: false });
  var server = express();
  server.set('views', './public');
  server.enable('trust proxy');
  server.use(bodyParser(), escapeMiddleware, express.static("./public", { maxAge: 86400000 }), sessions({
    cookieName: "session",
    secret: process.env.SESSION_SECRET,
    duration: 7 * 24 * 60 * 60 * 1000,
    activeDuration: 7 * 24 * 60 * 60 * 1000 //Cookies are valid for 1 week
  }), compression(), opbeat.middleware.express(), helmet());
  if(process.env.env=="prod"){
    server.use(expressEnforcesSsl());
  }
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
  server.get("/login", csrfProtection, function(req, res){
    res.render("twig/login.twig", Object.assign({}, logData(req), {error: null, token: req.csrfToken()}));
  });
  server.post("/login", csrfProtection, function(req, res){
    account.login(req, res);
  });
  server.get("/classes", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      classes.getClasses(req, res);
    });
  });
  server.post("/classes", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      classes.addClass(req, res);
    });
  });
  server.post("/viewClass", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      classes.getClassData(req, res);
    });
  });
  server.post("/enroll", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      classes.toggleEnroll(req, res);
    });
  });
  server.post("/deleteHomework", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      classes.deleteHomework(req, res);
    });
  });
  server.post("/addHomework", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      classes.addHomework(req, res);
    });
  });
  server.post("/addNotes", csrfProtection, function(req, res){
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
  server.get("/myClasses", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      myPage.pageData(req, res)
    });
  });
  server.post("/addReminder", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      myPage.addReminder(req, res);
    });
  });
  server.post("/completeReminder", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      myPage.completeReminder(req, res);
    });
  });
  server.post("/deleteCompleted", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      myPage.deleteCompleted(req, res);
    });
  });
  server.post("/completeHomework", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      myPage.completeHomework(req, res);
    });
  });
  server.post("/addQuestion", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      classes.addQuestion(req, res);
    });
  });
  server.post("/addAnswer", csrfProtection, function(req, res){
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
    });
  });
  server.post("/deleteClass", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      classes.deleteClass(req, res);
    });
  });
  server.post("/deleteNote", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      classes.deleteNote(req, res);
    });
  });
  server.post("/deleteQuestion", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      classes.deleteQuestion(req, res);
    });
  });
  server.post("/deleteAnswer", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      classes.deleteAnswer(req, res);
    });
  });
  server.get("/settings", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      res.render("twig/settings.twig", Object.assign({}, logData(req), {token: req.csrfToken()}));
    });
  });
  server.post("/changePass", csrfProtection, function(req, res){
    checkIn(req, res, function(){
      account.changeRequest(req, res);
    });
  });
  var PORT = process.env.PORT;
  console.log(`SERVER LISTENING ON PORT ${PORT}`);
  server.listen(PORT);
}
