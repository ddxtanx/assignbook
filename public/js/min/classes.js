$(document).ready(function(){$(".notLoggedIn").remove(),$("#hello").hide(),$("#addFormDiv").hide(),$("#warning").hide(),$("#add").click(function(){1==isLoggedIn?($("#add").hide("fast"),$("#addFormDiv").show("fast")):($("#add").hide("fast"),$("#warning").show("fast"))}),$("#cancel").click(function(){$("#add").show("fast"),$("#addFormDiv").hide("fast")});$(".search").change(function(){for(var a=$("#nameSearchBar").val(),e=$("#teacherSearchBar").val(),s=$("#periodSearchBar").val(),t=0;t<classesArray.length;t++){var n=classesArray[t],r=""===a||n.name.includes(a),c=""===e||n.teacherName.includes(e),d=""===s||n.period==s;r&&c&&d?$(".class"+(t+1)).show("fast"):$(".class"+(t+1)).hide("fast")}}),$(".delClass").click(function(){var a=$(this).attr("classData"),e=$(this);$.ajax({method:"POST",url:"deleteClass",data:{Class:a},success:function(a){e.parent().parent().hide("fast",function(){e.parent().parent().remove()})},error:function(a){alert(JSON.stringify(a))}})})}),$(document).ready(function(){$("#hamDiv").click(function(a){a.preventDefault(),$("#wrapper").toggleClass("toggled")})});
