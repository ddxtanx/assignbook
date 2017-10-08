//This file is a daily cron job that remove all documents from a model that are older than 2 weeks
const CronJob = require("cron").CronJob;
const ClassHomework = require("../app/models/ClassHomework");
const Questions = require("../app/models/Questions");
const UserHomework = require("../app/models/UserHomework");
const ClassNotes = require("../app/models/ClassNotes");
const now = Date.now();
const modelDateArray = [
    {
        obj: ClassHomework,
        date: "dueDate"
    },
    {
        obj: Questions,
        date: "dateAsked"
    },
    {
        obj: UserHomework,
        date: "dueDate"
    },
    {
        obj: ClassNotes,
        date: "date"
    }
];
//I'm using this array to make the job definiton extensible, adding a model and a date field to the array sets it up
//to run with the cron job
const manageJob = new CronJob("0 0 * * *", function () { //Cron job at 12 AM every day
    modelDateArray.forEach(function (modelDateObj) {
        const model = modelDateObj.obj;
        const dateField = modelDateObj.date;
        model.find(function (err, docs) {
            if (err) throw err;
            docs.forEach(function (doc) {
                const dateComp = new Date(doc[dateField]);
                if (now - dateComp.getTime() >= 1000 * 60 * 60 * 24 * 7 * 2) { //2 weeks in milliseconds
                    doc.remove();
                }
            });
        });
    })
}, null, false, 'America/Chicago');
module.exports = manageJob;
