Date.prototype.toDateInputValue = (function() {
    const local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
    //This helps to default the date inputs to today's dats
});

function hide(arrayOfIdsToHide) {
    for (let x = 0; x < arrayOfIdsToHide.length; x++) {
        $(arrayOfIdsToHide[x]).hide();
    }
    //This hides every id in an array
}
$(document).ready(function() {
    const hides = ["#addHomework", "#cancelQButton", "#addQuestion", "#notLoggedIn", "#notEnrolled", "#notEnrolledNotes", "#notEnrolledQuestions", "#addNotesForm"];
    hide(hides);
    //All of the id's in hides are now hidden
    $(".notLoggedIn").remove();
    //classPeriod, className, classTeacher, hasEnrolled, isLoggedIn, homeworkArray, notesArray, and answersArray have all been declared in viewClass.php
    $("#period").text("Period " + classPeriod);
    $("#className").text(" " + className);
    $("#teacher").text("Taught By: " + classTeacher);
    $("#date").val(Date.now().toDateString);
    if (hasEnrolled) {
        $("#enroll").hide();
        $("#unenroll").show();
    } else {
        $("#enroll").show();
        $("#unenroll").hide();
        $("#addHomework").remove();
        $("#addNotesForm").remove();
        $("#addQuestion").remove();
    }
    //hides or shows elements if the user has enrolled in this class
    $("#addHomeworkBtn").click(function() {
        $("#addHomeworkBtn").hide("fast");
        if (isLoggedIn) {
            if (hasEnrolled) {
                $("#addHomework").show("fast");
            } else {
                $("#notEnrolled").show("fast");
            }
        } else {
            $("#notLoggedIn").show("fast");
        }
    });
    //Either displays the Homework Addition form or a notEnrolled message depending if the user is enrolled
    $("#cancel").click(function() {
        $("#addHomework").hide("fast");
        $("#addHomeworkBtn").show("fast");
    });
    //Cancels the form if needed
    if (!isLoggedIn) {
        $("#enroll").remove();
    }
    //Removes the oppertunity to enroll if the user is not loggedin
    let datePicked;
    $("#date").change(function() {
        datePicked = Date.parse($("#date").val());
        for (let x = 0; x < homeworkArray.length; x++) {
            //Displays homework if it is assigned on a specific day, and hides it if it is not assigned.
            homeworkDueDate = Date.parse(homeworkArray[x].dueDate);
            if (datePicked <= homeworkDueDate) {
                console.log("Yes");
                $(".homework" + (x+1)).show("fast");
            } else {
                console.log("No");
                $(".homework" + (x+1)).hide("fast");
            }
            if (isNaN(datePicked)) {
                $(".homeworkClass").show("fast");
            }
            //Displays all homework if datePicked is empty
        }
    });
    $("#date").val(new Date().toDateInputValue());
    datePicked = Date.parse($("#date").val());
    for (var x = 0; x < homeworkArray.length; x++) {
        homeworkDueDate = Date.parse(homeworkArray[x].dueDate);
        if (datePicked > homeworkDueDate) {
            $(".homework" + (x+1)).hide();
        }
    }
    $("#homeworkDate").val(new Date().toDateInputValue());
    $("#addNotesBtn").click(function() {
        if (hasEnrolled) {
            $("#addNotesForm").show("fast");
            $("#addNotesBtn").hide("fast");
        } else {
            $("#addNotesBtn").hide("fast");
            $("#notEnrolledNotes").show("fast");
        }
    });
    //Shows the notesForm if the user is enrolled in the class, else it displays an error
    $("#cancelNotes").click(function() {
        $("#addNotesForm").hide("fast");
        $("#addNotesBtn").show("fast");
    });
    //Cancels the notes form when clicked
    $("#notesDate").change(function() {
        const newDate = Date.parse($("#notesDate").val());
        for (let x = 0; x < notesArray.length; x++) {
            const datePosted = Date.parse(notesArray[x].date);
            if (newDate !== datePosted) {
                $(".notes" + (x+1)).hide("fast");
            } else {
                $(".notes" + (x+1)).show("fast");
            }
        }
        if (isNaN(newDate)) {
            $(".notesClass").show("fast");
        }
    });
    //Searches for notes on a specific date
    $("#addQButton").click(function() {
        if (hasEnrolled) {
            $("#addQuestion").show("fast");
            $("#cancelQButton").show();
            $("#addQButton").hide("fast");
        } else {
            $("#addQButton").hide("fast");
            $("#notEnrolledQuestions").show("fast");
        }
    });
    //Shows question addition form if the user is logged in, else it shows an error
    $("#cancelQButton").click(function() {
        $("#addQuestion").hide("fast");
        $("#addQButton").show("fast");
    });
    //Cancels the question form
    $(".delNote").click(function(){
        const ele = $(this);
        const noteId = ele.attr("noteId");
        $.ajax({
        method: "POST",
        url: "deleteNote",
        data:{
          noteId: noteId,
          _csrf: token
        },
        success: function(data){
          ele.parent().hide("fast", function(){
            ele.parent().remove();
          })
        },
        error: function(data){
          alert(JSON.stringify(data));
        }
      });
    });
    $(".qDelete").click(function(){
        const ele = $(this);
        const qId = ele.attr("questionId");
        $.ajax({
        method:"POST",
        url:"deleteQuestion",
        data:{
          qId: qId,
          _csrf: token
        },
        success: function(data){
          ele.parent().hide("fast", function(){
            ele.parent().remove();
          })
        },
        error: function(data){
          alert(JSON.stringify(data));
        }
      })
    });
    $(".aDelete").click(function(){
        const ele = $(this);
        const qId = ele.attr("questionId");
        const aId = ele.attr("answerId");
        $.ajax({
        method:"POST",
        url:"deleteAnswer",
        data:{
          aId: aId,
          qId: qId,
          _csrf: token
        },
        success: function(data){
          ele.parent().hide("fast", function(){
            ele.parent().remove();
          });
        },
        error: function(data){
          alert(JSON.stringify(data));
        }
      })
    });
    $(".dHomework").click(function(){
        const ele = $(this);
        const hId = ele.attr("homeworkId");
        $.ajax({
        method: "POST",
        url:"deleteHomework",
        data:{
          hId: hId,
          _csrf: token
        },
        success:function(){
          ele.parent().hide("fast", function(){
            ele.parent().remove();
          })
        },
        error: function(data){
          alert(JSON.stringify(data));
        }
      })
    })
});
//This function is used to delete mistyped or incorrect homework in the database via a button in viewClass.php
function enroll(name, period, teacher){
  $.ajax({
    method: "POST",
    url: "enroll",
    data: {
      name: name,
      period: period,
      teacher: teacher,
      _csrf: token
    },
    success: function(data){
      window.location.reload();
    },
    error: function(data){
      alert(JSON.stringify(data));
    }
  })
}
function addHomework(){
    const assignmentName = $("#homeworkName").val(),
        description = $("#homeworkDescription").val().replace(/\r?\n|\r/g, " "),
        dueDate = $("#homeworkDate").val();
    console.log(assignmentName);
  $.ajax({
    method: "POST",
    url: "addHomework",
    data: {
      homeworkName: assignmentName,
      description: description,
      duedate: dueDate,
      name: className,
      period: classPeriod,
      teacher: classTeacher,
      _csrf: token
    },
    success: function(data){
      window.location.reload();
    },
    error: function(data){
      alert(JSON.stringify(data));
    }
  })
}
function addNotes(){
    const note = $("#notesText").val();
    $.ajax({
    method: "POST",
    url: "addNotes",
    data: {
      note: note,
      name: className,
      period: classPeriod,
      teacher: classTeacher,
      _csrf: token
    },
    success: function(data){
      window.location.reload();
    },
    error: function(data){
      alert(JSON.stringify(data));
    }
  })
}
function addQuestion(){
    const question = $("#question").val();
    const anonymous = $("#anonymous").is(":checked");
    $.ajax({
    method: "POST",
    url: "addQuestion",
    data:{
      question: question,
      anonymous: anonymous,
      name: className,
      period: classPeriod,
      teacher: classTeacher,
      _csrf: token
    },
    success: function(data){
      window.location.reload();
    },
    error: function(data){
      alert(JSON.stringify(data));
    }
  });
}
function addAnswer(questionId, qNumber){
    const answer = $("#answer" + qNumber).val();
    const anon = $("#anonCheckbox" + qNumber).is(":checked");
    console.log(anon);
  $.ajax({
    method: "POST",
    url: "addAnswer",
    data:{
      answer: answer,
      anonymous: anon,
      questionId: questionId,
      "_csrf": token
    },
    success: function(data){
      window.location.reload();
    },
    error: function(data){
      alert(JSON.stringify(data));
    }
  })
}
