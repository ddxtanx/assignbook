function ajaxPost(e,a,t){$.ajax({method:"POST",url:e,data:a,error:function(e){t(e,void 0)},success:function(e){t(void 0,e)}})}function addreminder(){var e=$("#reminder").val().replace(/\r?\n|\r/g," ");$.ajax({method:"POST",url:"addReminder",data:{reminder:e,_csrf:token},success:function(e){window.location.reload()},error:function(e){alert(JSON.stringify(e))}})}Date.dateDiff=function(e,a){var t=a-e;return Math.floor(t/864e5)},$(document).ready(function(){$("#successFail").hide(),$(".notLoggedIn").remove(),$("#reminderForm").hide();var e;$("#date").change(function(){e=Date.parse($("#date").val());for(var a=0;a<homeworkArray.length;a++)homeworkDueDate=Date.parse(homeworkArray[a][1]),e<=homeworkDueDate?$(".homework"+a).show("fast"):$(".homework"+a).hide("fast"),isNaN(e)&&$(".homeworkClass").show("fast")}),$(".checks").click(function(){var e=$(this),a=e.attr("homeworkId"),t=!$("#showCompleted").is(":checked");"completing"==(e.is(":checked")?"completing":"uncompleting")?ajaxPost("completeHomework",{homeworkId:a,action:"complete",_csrf:token},function(a){t&&e.parent().parent().hide("fast"),e.parent().parent().removeClass("notCompleted"),e.parent().parent().addClass("completed")},function(){alert("ERROR")}):jQuery.ajax({type:"POST",url:"completeHomework",data:{homeworkId:a,action:"uncomplete",_csrf:token},success:function(){e.parent().parent().addClass("notCompleted"),e.parent().parent().removeClass("completed")}})});var a=!1;if($(".completed").hide(),$("#showCompleted").change(function(){$(this).is(":checked")?($(".completed").show("fast"),a=!0):($(".completed").hide("fast"),a=!1)}),$("#deleteCompleted").click(function(){jQuery.ajax({type:"POST",url:"deleteCompleted",data:{_csrf:token},success:function(){$(".completed").hide("fast",function(){$(".completed").remove()}),$("#successFail").show("fast"),setTimeout(function(){$("#successFail").hide("fast")},3e3)},error:function(){$("#successFail").removeClass("alert-success"),$("#successFail").addClass("alert-danger"),$("#successFail").text("Something went wrong! Please contact gcc@ameritech.net for assistance"),$("#successFail").show("fast")}})}),0===classesArray.length){$("#classesDiv").append("<br/>"),$("#classesDiv").append("<h3 class='alert alert-info'> Make sure to enroll in your classes! You have to go to your classes' pages and enroll there!</h3>")}$("#reminderButton").click(function(){$("#reminderButton").hide("fast"),$("#reminderForm").show("fast")}),$("#cancelReminder").click(function(){$("#reminderButton").show("fast"),$("#reminderForm").hide("fast")}),$(".reminderChecks").click(function(){var e=$(this);ajaxPost("completeReminder",{reminderID:e.attr("reminderID"),_csrf:token},function(a,t){a&&alert("error "+t),e.parent().parent().hide("fast",function(){e.parent().parent().remove()})})});$(".search").change(function(){for(var e=$("#nameSearchBar").val(),a=$("#teacherSearchBar").val(),t=$("#periodSearchBar").val(),o=0;o<classesArray.length;o++){var r=classesArray[o],s=""===e||r.className.includes(e),n=""===a||r.classTeacher.includes(a),c=""===t||r.classPeriod==t;s&&n&&c?$(".class"+(o+1)).show("fast"):$(".class"+(o+1)).hide("fast")}}),$(".duedate").each(function(e,a){console.log("running");var t=a.attributes[1].value;console.log(t);var o=t.split("-");t=new Date(o[0],o[1]-1,o[2]),console.log(t);var r=new Date,s=Date.dateDiff(r,t)+1;console.log(s);var n=s<0?"ago":"away";s=Math.abs(s);var c=1==s?"day":"days",i=0==s?" Today":" "+s+" "+c+" "+n;console.log(i),a.innerText=a.innerText+i})}),$(document).ready(function(){$("#hamDiv").click(function(e){e.preventDefault(),$("#wrapper").toggleClass("toggled")})});
