const opbeat = require("opbeat").start(),
    cluster = require("cluster"),
    escape = require("underscore").escape;

function checkIn(req, res, callback){
    if(!req.session.active){
        res.redirect("/login");
        res.end();
    }else {
        callback();
    }
}
function logData(req){
    if(req.session!==undefined){
        return {
            "userName": req.session.name,
            "email": req.session.email,
            "loggedin": req.session.active || 0,
            "id": req.session.id
        };
    }
    return {
        "userName": false,
        "email": false,
        "loggedin": 0,
        "id": false
    };
}
function escapeMiddleware(req, res, next){
    if(process.env.env === "prod"){
        if(req.headers.host!==undefined){
            if(req.headers.host === "assignbook.herokuapp.com"){
                Object.keys(req.body).map((key) => {
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
        Object.keys(req.body).map((key) => {
            req.body[key] = escape(req.body[key]);
        });
        next();
    }
}
if(cluster.isMaster){
    const cpuCount = require("os").cpus().length;

    for (let i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }
    cluster.on("exit", () => {
        cluster.fork();
    });
} else{
    const express = require("express"),
        bodyParser = require("body-parser"),
        sessions = require("client-sessions"),
        account = require("../app/account.js"),
        classes = require("../app/classes.js"),
        myPage = require("../app/myPage.js"),
        compression = require("compression"),
        helmet = require("helmet"),
        expressEnforcesSsl = require("express-enforces-ssl"),
        csrf = require("csurf"),
        csrfProtection = csrf({ "cookie": false }),
        manageJob = require("./manageDB"),
        server = express(),
        PORT = process.env.PORT;

    manageJob.start();
    server.set("views", "./public");
    server.enable("trust proxy");
    server.use(bodyParser(), escapeMiddleware, express.static("./public", { "maxAge": 86400000 }), sessions({
        "cookieName": "session",
        "secret": process.env.SESSION_SECRET,
        "duration": 7 * 24 * 60 * 60 * 1000,
        "activeDuration": 7 * 24 * 60 * 60 * 1000 //    Cookies are valid for 1 week
    }), compression(), opbeat.middleware.express(), helmet());
    if(process.env.env === "prod"){
        server.use(expressEnforcesSsl());
    }

    server.get("/*", (req, res, next) => {
        if(req.session === undefined){
            req.session = {};
            req.session.active = false;
            req.session.name = "";
        }
        next();
    });
    server.get("/", (req, res) => {
        res.render("twig/index.twig", logData(req));
    });
    server.get("/register", (req, res) => {
        res.render("twig/register.twig", Object.assign({}, logData(req), { "error": null }));
    });
    server.post("/register", (req, res) => {
        account.register(req, res);
    });
    server.get("/login", csrfProtection, (req, res) => {
        res.render("twig/login.twig", Object.assign({}, logData(req), { "error": null, "token": req.csrfToken() }));
    });
    server.post("/login", csrfProtection, (req, res) => {
        account.login(req, res);
    });
    server.get("/classes", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            classes.getClasses(req, res);
        });
    });
    server.post("/classes", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            classes.addClass(req, res);
        });
    });
    server.post("/viewClass", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            classes.getClassData(req, res);
        });
    });
    server.post("/enroll", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            classes.toggleEnroll(req, res);
        });
    });
    server.post("/deleteHomework", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            classes.deleteHomework(req, res);
        });
    });
    server.post("/addHomework", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            classes.addHomework(req, res);
        });
    });
    server.post("/addNotes", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            classes.addNotes(req, res);
        });
    });
    server.get("/logout", (req, res) => {
        checkIn(req, res, () => {
            req.session.destroy();
            req.session.active = false;
            res.redirect("/");
        });
    });
    server.get("/myClasses", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            myPage.pageData(req, res);
        });
    });
    server.post("/addReminder", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            myPage.addReminder(req, res);
        });
    });
    server.post("/completeReminder", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            myPage.completeReminder(req, res);
        });
    });
    server.post("/deleteCompleted", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            myPage.deleteCompleted(req, res);
        });
    });
    server.post("/completeHomework", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            myPage.completeHomework(req, res);
        });
    });
    server.post("/addQuestion", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            classes.addQuestion(req, res);
        });
    });
    server.post("/addAnswer", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            classes.addAnswer(req, res);
        });
    });
    server.get("/viewClass", (req, res) => {
        res.redirect("/classes");
    });
    server.get("/forgot", (req, res) => {
        res.render("twig/forgot.twig", logData(req));
    });
    server.get("/change", (req, res) => {
        res.render("twig/change.twig", Object.assign({}, logData(req), { "siteId": req.query.id }));
    });
    server.post("/forgot", (req, res) => {
        account.forgot(req, res);
    });
    server.post("/change", (req, res) => {
        account.change(req, res);
    });
    server.get("/public/*", (req, res) => {
        res.end();
    });
    server.get("/survey", (req, res) => {
        checkIn(req, res, () => {
            res.render("twig/survey.twig");
        });
    });
    server.post("/deleteClass", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            classes.deleteClass(req, res);
        });
    });
    server.post("/deleteNote", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            classes.deleteNote(req, res);
        });
    });
    server.post("/deleteQuestion", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            classes.deleteQuestion(req, res);
        });
    });
    server.post("/deleteAnswer", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            classes.deleteAnswer(req, res);
        });
    });
    server.get("/settings", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            res.render("twig/settings.twig", Object.assign({}, logData(req), { "token": req.csrfToken() }));
        });
    });
    server.post("/changePass", csrfProtection, (req, res) => {
        checkIn(req, res, () => {
            account.changeRequest(req, res);
        });
    });

    server.listen(PORT);
}
