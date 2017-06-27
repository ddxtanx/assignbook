Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
    //This helps to default the date inputs to today's dats
});

function hide(arrayOfIdsToHide) {
    for (var x = 0; x < arrayOfIdsToHide.length; x++) {
        $(arrayOfIdsToHide[x]).hide();
    }
    //This hides every id in an array
}
$(document).ready(function() {
    var hides = ["#addHomework", "#cancelQButton", "#addQuestion", "#notLoggedIn", "#notEnrolled", "#notEnrolledNotes", "#notEnrolledQuestions", "#addNotesForm"];
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
    var datePicked;
    $("#date").change(function() {
        datePicked = Date.parse($("#date").val());
        for (var x = 0; x < homeworkArray.length; x++) {
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
        var newDate = Date.parse($("#notesDate").val());
        for (var x = 0; x < notesArray.length; x++) {
            var datePosted = Date.parse(notesArray[x].date);
            if (newDate != datePosted) {
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
      var ele = $(this);
      var note = ele.attr("note");
      $.ajax({
        method: "POST",
        url: "deleteNote",
        data:{
          note: note,
          name: className,
          period: classPeriod,
          teacher: classTeacher
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
      var ele = $(this);
      var qId = ele.attr("questionId");
      $.ajax({
        method:"POST",
        url:"deleteQuestion",
        data:{
          qId: qId
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
    })
    $(".aDelete").click(function(){
      var ele = $(this);
      var qId = ele.attr("questionId");
      var aId = ele.attr("answerId");
      $.ajax({
        method:"POST",
        url:"deleteAnswer",
        data:{
          aId: aId,
          qId: qId
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
    })
});
function deleteHomework(array){
    var hName = array[0];
    var hDueDate = array[1];
    var hDescription = array[2];
    var x = array[3];
    //Initializing variables for ajax and hiding
    $.ajax({
        method: "POST",
        url:"deleteHomework",
        data:{hName: hName, hDueDate: hDueDate, hDescription: hDescription, cName: className, cPeriod: classPeriod, cTeacher: classTeacher},
        //Submits a post request to deleteHomework.php to delete the requested homework
        success:function(data){
          var data = JSON.parse(data);
          if(data.deleted){
            $(".homework"+x).hide("fast",function(){
               $(".homework"+x).remove();
            });
          } else{
            alert("You can't delete homework that you didn't post!");
          }
        },
        error:function(data){
            alert(JSON.stringify(data));
        }
    });
}
//This function is used to delete mistyped or incorrect homework in the database via a button in viewClass.php
function enroll(name, period, teacher){
  $.ajax({
    method: "POST",
    url: "enroll",
    data: {
      name: name,
      period: period,
      teacher: teacher
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
  var assignmentName = $("#homeworkName").val(),
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
      teacher: classTeacher
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
  var note = $("#notesText").val().replace(/\r?\n|\r/g, " ");
  $.ajax({
    method: "POST",
    url: "addNotes",
    data: {
      note: note,
      name: className,
      period: classPeriod,
      teacher: classTeacher
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
  var question = $("#question").val();
  var anonymous = $("#anonymous").is(":checked");
  $.ajax({
    method: "POST",
    url: "addQuestion",
    data:{
      question: question,
      anonymous: anonymous,
      name: className,
      period: classPeriod,
      teacher: classTeacher
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
  var answer = $("#answer"+qNumber).val();
  var anon = $("#anonCheckbox"+qNumber).is(":checked");
  console.log(anon);
  $.ajax({
    method: "POST",
    url: "addAnswer",
    data:{
      answer: answer,
      anonymous: anon,
      questionId: questionId
    },
    success: function(data){
      window.location.reload();
    },
    error: function(data){
      alert(JSON.stringify(data));
    }
  })
}
