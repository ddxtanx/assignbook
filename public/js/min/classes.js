$(document).ready(function(){$(".notLoggedIn").remove(),$("#hello").hide(),$("#addFormDiv").hide(),$("#warning").hide(),$("#add").click(function(){1==isLoggedIn?($("#add").hide("fast"),$("#addFormDiv").show("fast")):($("#add").hide("fast"),$("#warning").show("fast"))}),$("#cancel").click(function(){$("#add").show("fast"),$("#addFormDiv").hide("fast")});$(".search").change(function(){for(var e=$("#nameSearchBar").val(),a=$("#teacherSearchBar").val(),r=$("#periodSearchBar").val(),t=0;t<classesArray.length;t++){var n=classesArray[t],c=""===e||n.name.includes(e),d=""===a||n.teacherName.includes(a),s=""===r||n.period==r;c&&d&&s?$(".class"+(t+1)).show("fast"):$(".class"+(t+1)).hide("fast")}}),$(".delClass").click(function(){var e=$(this),a=e.attr("name"),r=e.attr("period"),t=e.attr("teacherName");console.log({name:a,period:r,teacherName:t}),$.ajax({method:"POST",url:"deleteClass",data:{name:a,period:r,teacherName:t,_csrf:token},success:function(a){e.parent().parent().hide("fast",function(){e.parent().parent().remove()})},error:function(e){alert(JSON.stringify(e))}})})}),$(document).ready(function(){$("#hamDiv").click(function(e){e.preventDefault(),$("#wrapper").toggleClass("toggled")})});
