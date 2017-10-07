var User = require("./models/User");
var bcrypt = require("bcrypt");
var random = require("secure-random");
var Reset = require("./models/Reset");
var nodemailer = require("nodemailer");
//Create email instance
var transporter = nodemailer.createTransport({
  host: process.env.EmailServer,
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: process.env.Email,
        pass: process.env.EmailPass
    }
});

//Rounds is for salting bcrypt
const rounds = 10;

//I don't want to keep putting userdata into twig so here's a nice function to return the user object I need
function logData(req){
  if(req.session!==undefined){
    return {userName: req.session.name, email: req.session.email, loggedin: req.session.active, id:req.session.id};
  } else{
    return {userName: false, email: false, loggedin: false, id: false};
  }
}

//Takes in a password, hashes it, and sends a callback
function passHash(password, callback){
  bcrypt.genSalt(rounds, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      callback(err, hash);
    });
  });
}

//Returns true if passwords match, false if they do not
function checkIfPassesMatch(pass1, pass2){
  if(pass1!==pass2){
    return false;
  }
  return true;
}

//Returns true if the user has already registered, false if they have not
function checkIfAlreadyRegistered(users){
  if(users.length!==0){
    return true;
  }
  return false;
}

//Given the datafields below, this will save a user to the database & res a page
function saveUser(name, email, hash, req, res){
  var userData = {
    username: name,
    email: email,
    password: hash,
    id: random(10).join(""),
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress
  };
  var user = new User(userData);
  user.save(function(err, data){
    if(err) throw err;
    res.render("twig/register.twig", Object.assign({}, {error: "noError"}, logData(req, res)));
  });
}

//This is the base of the registration API
function register(req, res){
  var name = req.body.name,
  email = req.body.email,
  pass1 = req.body.password,
  pass2 = req.body.password2
  if (!checkIfPassesMatch(pass1, pass2)){
    res.render("twig/register.twig", Object.assign({}, logData(req), {error:"passwordNotMatched"}));
    return;
  }
  //If passwords don't match, stop and render register with that error
  User.find({
    email: email
  }, function(err, users){
    //Query to determine if any users already use that email
    if(err) throw err;
    if(checkIfAlreadyRegistered(users)){
      res.render("twig/register.twig", Object.assign({}, logData(req), {error:"alreadyRegistered"}));
      return;
    }
    //If a user already exists with that email, stop and render register with that error
    passHash(pass1, function(err, hash){
      if(err) throw err;
      saveUser(name, email, hash, req, res);
    });
  });
}

//This compares a password and a password hash & logs in if the passwords are the same
function passCompare(pass, user, req, res){
  var userPassHash = user.password;
  bcrypt.compare(pass, userPassHash, function(err, same){
    //Compare the hashed pass in db and the password the user entered
    if(err) throw err;
    if(!same){
      res.render("twig/login.twig", Object.assign({}, logData(req), {error: "incorrect"}));
      //If they're not the same, stop and render login
    } else{
      //Else, set session data with user data and render login with the user's information
      req.session.name = user.username;
      req.session.email = user.email;
      req.session.active = true;
      req.session.id = user.id;
      res.render("twig/login.twig", Object.assign({}, logData(req), {error: "none"}));
    }
  });
}
function login(req, res){
  var email = req.body.email,
  pass = req.body.password;
  User.findOne({
    email: email
  }, {_id: false},function(err, user){
    if(err) throw err;
    if(user!==null){
      //A user exists with that email!
      passCompare(pass, user, req, res);
    }else{
      //If no user exists with the email, stop and render login
      res.render("twig/login.twig", Object.assign({}, logData(req), {error:"incorrect", token: req.csrfToken()}));
    }
  });
}
function sendForgotMail(email){
  var mailOptions = {
    from: '"Easy Assignbook Password Assistance" <gcc@ameritech.net>',
    to: email,
    subject: "Password Reset",
    text:`We have recently received a request to reset the password associated with this email. If you did not request a password change, please ignore this email. If you have requested password assistance, please visit http://assignbook.herokuapp.com/change?id=${siteId} Thank you, and have a wonderful day!`
  }
  transporter.sendMail(mailOptions, function(err, info){
    if (err) throw err;
    res.end();
  })
}
function createResetRequest(user, email){
  var userId = user.id;
  var siteId = random(10).join("");
  var NewReset = new Reset({
    siteId: siteId,
    userId: userId
  });
  NewReset.save(function(err, resp){
    if(err) throw err;
    sendForgotMail(email);
  });
}
function forgot(req, res){
  var email = req.body.email;
  User.findOne({
    email: email
  }, function(err, user){
    if(err) throw err;
    if(user!==null){
      createResetRequest(user, email);
    } else{
      res.end();
    }
  })
}
/*
  * If a user wants to reset their pass, get the user id associated with the email
  * and generate a new site id, and save those together in a reset document,
  * then send an email with the site id as a message
*/
function sendPasswordChangeEmail(email){
  var mailOptions = {
    from: '"Easy Assignbook Password Assistance" <gcc@ameritech.net>',
    to: email,
    subject: "Password Change",
    text: "We have recently received a request to change your password. If you have requested to change your password, do not worry. If you did not make this request, please reply to this email to receive assistance. Thank you!"
  }
  transporter.sendMail(mailOptions, function(err, info){
    if (err) throw err;
  })
}
function updateUserPass(userId, hash, email, cb){
  User.update({
    id: userId
  }, {
    $set:{
      password: hash
    }
  }, function(err, resp){
      if(err) throw err;
      sendPasswordChangeEmail(email);
      cb();
  });
}
function changePass(userId, pass, email, cb){
  passHash(pass, function(err, hash){
    //Hash the password
    if(err) throw err;
    updateUserPass(userId, hash, email, cb);
  });
}
function findUserForReset(userId, req, res){
  User.findOne({
    id: userId
  }, function(err, user){
    var pass = req.body.pass;
    changePass(userId, pass, user.email, function(){
      Reset.remove({
        userId: userId
      });
      //Remove the reset request
      res.end();
    });
  })
}
function findReset(siteId, req, res){
  Reset.findOne({
    siteId: siteId
  }, function(err, reset){
    if(err) throw err;
    if(reset!==null){
      //If a reset request has come through with that id, procees
      var userId = reset.userId;
      findUserForReset(userId, req, res);
    } else{
      res.redirect("/");
    }
  })
}
function change(req, res){
  var siteId = req.body.siteId;
  //Site id is same from aboce
  findReset(siteId, req, res);
}
function comparePasswordsForChange(oldPass, newPass, userId, email, user, res){
  bcrypt.compare(oldPass, user.password, function(err, same){
    if(err) throw err;
    if(same){
      changePass(userId, newPass, email, function(){
        var data = {success: true};
        res.writeHead(200, {"Content-Type": "text/json"});
        res.end(JSON.stringify(data));
      })
    } else{
      var data = {success: false};
      res.writeHead(200, {"Content-Type": "text/json"});
      res.end(JSON.stringify(data));
    }
  })
}
function changeRequest(req, res){
  var userId = req.session.id;
  var email = req.session.email;
  var oldPass = req.body.oldPass;
  var newPass = req.body.newPass;
  User.findOne({
    id: userId
  }, function(err, user){
    if(err) throw err;
    comparePasswordsForChange(oldPass, newPass, userId, email, user, res);
  })
}
module.exports = {
  register: register,
  login: login,
  forgot: forgot,
  change: change,
  changeRequest: changeRequest
}
