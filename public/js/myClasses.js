// This file handles everything on the myClasses page
Date.dateDiff = function(fromdate, todate) {
    const diff = todate - fromdate;
    const divideBy = 86400000;

    return Math.floor( diff/divideBy);
};
function ajaxPost(ajaxUrl, ajaxData, callback) {
    $.ajax({
        "method": "POST",
        "url": ajaxUrl,
        "data": ajaxData,
        "error": function(data) {
            callback(data, undefined);
        },
        "success": function(data) {
            callback(undefined, data);
        }
    });
}
// This function is used to make a Node.js style ajax request
$(document).ready(() => {
    $("#successFail").hide();
    $(".notLoggedIn").remove();
    $("#reminderForm").hide();
    // Hides elements that might be unhidden later
    // homeworkArray, classesArray, and remindersArray are all declared in myClasses.php
    let datePicked;

    $("#date").change(() => {
        // This handler checks if #date changes, and when it does it shows homework that is assigned on that day, and hides homework that is not
        datePicked = Date.parse($("#date").val()) + 1000*60*60*24;
        for (let x = 0; x < homeworkArray.length; x++) {
            const homeworkDueDate = Date.parse(homeworkArray[x].dueDate);

            if (datePicked === homeworkDueDate) {
                $(`#homework${ x+1}`).show("fast");
            } else {
                $(`#homework${ x+1}`).hide("fast");
            }
            if (isNaN(datePicked)) {
                $(".homeworkClass").show("fast");
            }
            // If #date is empty, it displays every homework assignment
        }
    });
    $(".checks").click(function() {
        // .checks, when checked, completes the homework in the database
        const ele = $(this);
        const hId = ele.attr("homeworkId");
        const hideCompleted = (!$("#showCompleted").is(":checked"));
        const whatAmIDoing = (ele.is(":checked")) ? "completing" : "uncompleting";

        if (whatAmIDoing === "completing") {
            // Here AJAX requests are sent out to complete the homework, so everything appears seamless on the UI
            ajaxPost("completeHomework", {
                "homeworkId": hId,
                "action": "complete",
                "_csrf": token
            }, (data) => {
                if (hideCompleted) {
                    ele.parent().parent().hide("fast");
                }
                ele.parent().parent().removeClass("notCompleted");
                ele.parent().parent().addClass("completed");
            }, () => {
                alert("ERROR");
            });
        } else {
            jQuery.ajax({
                "type": "POST",
                "url": "completeHomework",
                "data": {
                    "homeworkId": hId,
                    "action": "uncomplete",
                    "_csrf": token
                },
                "success": function() {
                    ele.parent().parent().addClass("notCompleted");
                    ele.parent().parent().removeClass("completed");
                }
            });
        }
    });
    let showingCompleted = false;

    $(".completed").hide();
    $("#showCompleted").change(function() {
        // If showingCompleted is true, then the page shows all completed items. If it is false, all completed items are hidden
        if ($(this).is(":checked")) {
            $(".completed").show("fast");
            showingCompleted = true;
        } else {
            $(".completed").hide("fast");
            showingCompleted = false;
        }
    });
    $("#deleteCompleted").click(() => {
        // This deletes completed homework off the database via an AJAX request.
        jQuery.ajax({
            "type": "POST",
            "url": "deleteCompleted",
            "data": {
                "_csrf": token
            },
            "success": function() {
                $(".completed").hide("fast", () => {
                    $(".completed").remove();
                });
                $("#successFail").show("fast");
                setTimeout(() => {
                    $("#successFail").hide("fast");
                }, 1000 * 3);
                // If it is successfull, it removes the completed homework from the page, and displays a success message.
            },
            "error": function() {
                $("#successFail").removeClass("alert-success");
                $("#successFail").addClass("alert-danger");
                $("#successFail").text("Something went wrong! Please contact gcc@ameritech.net for assistance");
                $("#successFail").show("fast");
                // If it fails for some reason, an error message is displayed.
            }
        });
    });
    if (classesArray.length === 0) {
        // This alerts the user to add classes if they have not added any yet
        var element = "<h3 class='alert alert-info'> Make sure to enroll in your classes! You have to go to your classes' pages and enroll there!</h3>";

        $("#classesDiv").append("<br/>");
        $("#classesDiv").append(element);
    }
    $("#reminderButton").click(() => {
        $("#reminderButton").hide("fast");
        $("#reminderForm").show("fast");
    });
    $("#cancelReminder").click(() => {
        $("#reminderButton").show("fast");
        $("#reminderForm").hide("fast");
    });
    // These two buttons hide or show the Reminder Creation form, and the create and cancel buttons.
    $(".reminderChecks").click(function() {
        // This functions like the homework check, and completes the reminders in the database
        const ele = $(this);
        const id = ele.attr("reminderID");

        ajaxPost("completeReminder", {
            "reminderID": id,
            "_csrf": token
        }, (err, data) => {
            if (err) {
                alert(`error ${ data}`);
            }
            ele.parent().parent().hide("fast", () => {
                ele.parent().parent().remove();
            });
        });
    });
    var element, period, name, teacher;
    // Classes array is declared in the php files that call getClasses, and it contains all of the classes' information

    $(".search").change(() => {
        // Whenever a search box is changed, classes that match those search values are displayed, and those who don't are hidden.
        const nameSearchValue = $("#nameSearchBar").val();
        const teacherSearchValue = $("#teacherSearchBar").val();
        const period = $("#periodSearchBar").val();

        for (let x = 0; x < classesArray.length; x++) {
            const userClass = classesArray[x];
            const nameCheck = (nameSearchValue === "") ? true : userClass.className.includes(nameSearchValue);
            // nameCheck is a variable that either checks if the nameSearchValue is empty, or, if that is not the case, checks if the search value is included in the classes' name name
            const teacherCheck = (teacherSearchValue === "") ? true : userClass.classTeacher.includes(teacherSearchValue);
            // teacherCheck functions like nameCheck, except it checks if the teacherSearchValue is included in the teacher's name
            const periodCheck = (period === "") ? true : userClass.classPeriod === period;
            // periodCheck, again, functions like the two variables above, except it checks if the period is equal

            if (!(nameCheck && teacherCheck && periodCheck)) {
                $(`.class${ x+1}`).hide("fast");
            } else {
                $(`.class${ x+1}`).show("fast");
            }
        }
    });
    $(".duedate").each((i, element) => {
        let dueDate = element.attributes[1].value;
        const parts = dueDate.split("-");

        dueDate = new Date(parts[0], parts[1]-1, parts[2]);
        const today = new Date();
        let daysDiff = Date.dateDiff(today, dueDate) + 1;
        const adj = (daysDiff < 0) ? "ago" : "away";

        daysDiff = Math.abs(daysDiff);
        const prefix = (daysDiff === 1) ? "day" : "days";
        const sentence = (daysDiff === 0) ? " Today" : ` ${ daysDiff } ${ prefix } ${ adj}`;

        element.innerText=element.innerText+sentence;
    });
});
function addreminder(){
    const reminderText = $("#reminder").val().replace(/\r?\n|\r/g, " ");

    $.ajax({
        "method": "POST",
        "url": "addReminder",
        "data": {
            "reminder": reminderText,
            "_csrf": token
        },
        "success": function(data){
            window.location.reload();
        },
        "error": function(data){
            alert(JSON.stringify(data));
        }
    });
}
