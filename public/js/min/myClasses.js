function ajaxPost(e,a,o){$.ajax({method:"POST",url:e,data:a,error:function(e){o(e,void 0)},success:function(e){o(void 0,e)}})}function addreminder(){var e=$("#reminder").val().replace(/\r?\n|\r/g," ");$.ajax({method:"POST",url:"addReminder",data:{reminder:e,_csrf:token},success:function(e){window.location.reload()},error:function(e){alert(JSON.stringify(e))}})}Date.dateDiff=function(e,a){var o=a-e;return Math.floor(o/864e5)},$(document).ready(function(){$("#successFail").hide(),$(".notLoggedIn").remove(),$("#reminderForm").hide();var e;$("#date").change(function(){e=Date.parse($("#date").val());for(var a=0;a<homeworkArray.length;a++){e==Date.parse(homeworkArray[a].dueDate)?(console.log("Showing homework"+a),$("#homework"+(a+1)).show("fast")):(console.log("Hiding homework"+a),$("#homework"+(a+1)).hide("fast")),isNaN(e)&&$(".homeworkClass").show("fast")}}),$(".checks").click(function(){var e=$(this),a=e.attr("homeworkId"),o=!$("#showCompleted").is(":checked");"completing"==(e.is(":checked")?"completing":"uncompleting")?ajaxPost("completeHomework",{homeworkId:a,action:"complete",_csrf:token},function(a){o&&e.parent().parent().hide("fast"),e.parent().parent().removeClass("notCompleted"),e.parent().parent().addClass("completed")},function(){alert("ERROR")}):jQuery.ajax({type:"POST",url:"completeHomework",data:{homeworkId:a,action:"uncomplete",_csrf:token},success:function(){e.parent().parent().addClass("notCompleted"),e.parent().parent().removeClass("completed")}})});var a=!1;if($(".completed").hide(),$("#showCompleted").change(function(){$(this).is(":checked")?($(".completed").show("fast"),a=!0):($(".completed").hide("fast"),a=!1)}),$("#deleteCompleted").click(function(){jQuery.ajax({type:"POST",url:"deleteCompleted",data:{_csrf:token},success:function(){$(".completed").hide("fast",function(){$(".completed").remove()}),$("#successFail").show("fast"),setTimeout(function(){$("#successFail").hide("fast")},3e3)},error:function(){$("#successFail").removeClass("alert-success"),$("#successFail").addClass("alert-danger"),$("#successFail").text("Something went wrong! Please contact gcc@ameritech.net for assistance"),$("#successFail").show("fast")}})}),0===classesArray.length){$("#classesDiv").append("<br/>"),$("#classesDiv").append("<h3 class='alert alert-info'> Make sure to enroll in your classes! You have to go to your classes' pages and enroll there!</h3>")}$("#reminderButton").click(function(){$("#reminderButton").hide("fast"),$("#reminderForm").show("fast")}),$("#cancelReminder").click(function(){$("#reminderButton").show("fast"),$("#reminderForm").hide("fast")}),$(".reminderChecks").click(function(){var e=$(this);ajaxPost("completeReminder",{reminderID:e.attr("reminderID"),_csrf:token},function(a,o){a&&alert("error "+o),e.parent().parent().hide("fast",function(){e.parent().parent().remove()})})});$(".search").change(function(){for(var e=$("#nameSearchBar").val(),a=$("#teacherSearchBar").val(),o=$("#periodSearchBar").val(),t=0;t<classesArray.length;t++){var r=classesArray[t],s=""===e||r.className.includes(e),n=""===a||r.classTeacher.includes(a),c=""===o||r.classPeriod==o;s&&n&&c?$(".class"+(t+1)).show("fast"):$(".class"+(t+1)).hide("fast")}}),$(".duedate").each(function(e,a){console.log("running");var o=a.attributes[1].value;console.log(o);var t=o.split("-");o=new Date(t[0],t[1]-1,t[2]),console.log(o);var r=new Date,s=Date.dateDiff(r,o)+1;console.log(s);var n=s<0?"ago":"away";s=Math.abs(s);var c=1==s?"day":"days",i=0==s?" Today":" "+s+" "+c+" "+n;console.log(i),a.innerText=a.innerText+i})});