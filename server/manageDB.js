// This file is a daily cron job that remove all documents from a model that are older than 2 weeks
const CronJob = require("cron").CronJob,
    ClassHomework = require("../app/models/ClassHomework"),
    Questions = require("../app/models/Questions"),
    UserHomework = require("../app/models/UserHomework"),
    ClassNotes = require("../app/models/ClassNotes"),
    now = Date.now(),
    modelDateArray = [
        {
            "obj": ClassHomework,
            "date": "dueDate"
        },
        {
            "obj": Questions,
            "date": "dateAsked"
        },
        {
            "obj": UserHomework,
            "date": "dueDate"
        },
        {
            "obj": ClassNotes,
            "date": "date"
        }
    ],
    // I'm using this array to make the job definiton extensible, adding a model and a date field to the array sets it up
    // to run with the cron job
    manageJob = new CronJob("0 0 * * *", (() => { // Cron job at 12 AM every day
        modelDateArray.forEach((modelDateObj) => {
            const model = modelDateObj.obj,
                dateField = modelDateObj.date;

            model.find((err, docs) => {
                if (err) {
                    throw err;
                }
                docs.forEach((doc) => {
                    const dateComp = new Date(doc[dateField]);

                    if (now - dateComp.getTime() >= 1000 * 60 * 60 * 24 * 7 * 2) { // 2 weeks in milliseconds
                        doc.remove();
                    }
                });
            });
        });
    }), null, false, "America/Chicago");

module.exports = manageJob;
