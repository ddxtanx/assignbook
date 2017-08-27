var CronJob = require("cron").CronJob;
var ClassHomework = require("../app/models/ClassHomework");
var Questions = require("../app/models/Questions");
var UserHomework = require("../app/models/UserHomework");
var now = new Date();
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
    }
]
var manageJob = new CronJob("0 0 * * *", function(){
    modelDateArray.forEach(function(modelDateObj){
        var model = modelDateObj.obj;
        var dateField = modelDateObj.date;
        model.find(function(err, docs){
            if(err) throw err;
            docs.forEach(function(doc){
                var dateComp = new Date(doc[dateField]);
                if(now.valueOf() - dateComp.valueOf() >= 1209600000){
                    doc.remove();
                }
            });
        });
    })
}, null, false, 'America/Chicago');
module.exports = manageJob;