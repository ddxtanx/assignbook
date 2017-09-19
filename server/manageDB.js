//This file is a daily cron job that remove all documents from a model that are older than 2 weeks
var CronJob = require("cron").CronJob;
var ClassHomework = require("../app/models/ClassHomework");
var Questions = require("../app/models/Questions");
var UserHomework = require("../app/models/UserHomework");
var ClassNotes = require("../app/models/ClassNotes");
var Answer = require("../app/models/Answers");
console.log(Answer);
var now = Date.now();
var modelDateArray = [
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
]
//I'm using this array to make the job definiton extensible, adding a model and a date field to the array sets it up
//to run with the cron job
var manageJob = new CronJob("0 0 * * *", function(){ //Cron job at 12 AM every day
    modelDateArray.forEach(function(modelDateObj){
        var model = modelDateObj.obj;
        var dateField = modelDateObj.date;
        model.find(function(err, docs){
            if(err) throw err;
            docs.forEach(function(doc){
                var dateComp = new Date(doc[dateField]);
                if(now - dateComp.getTime() >= 1000*60*60*24*7*2){ //2 weeks in milliseconds
                    doc.remove();
                }
            });
        });
    })
}, null, false, 'America/Chicago');
modelDateArray.forEach(function(modelDateObj){
    var model = modelDateObj.obj;
    var dateField = modelDateObj.date;
    console.log(modelDateObj.date)
    model.find(function(err, docs){
        if(err) throw err;
        docs.forEach(function(doc){
            var dateComp = new Date(doc[dateField]);
            if(now - dateComp.getTime() >= 1000*60*60*24*7*2){ //2 weeks in milliseconds
                doc.remove();
            }
        });
    });
})
module.exports = manageJob;
