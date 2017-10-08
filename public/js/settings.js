$(document).ready(function(){
  $("#passErr").hide();
  $("#passSuccess").hide();
  $("#changePass").click(function(){
      const oldPass = $("#oldPass").val();
      const newPass1 = $("#newPass1").val();
      const newPass2 = $("#newPass2").val();
      if(newPass1===newPass2){
      $.ajax({
        method:"POST",
        url:"changePass",
        data:{
          oldPass: oldPass,
          newPass: newPass1,
          _csrf: token
        },
        success: function(data){
          if(data.success){
            $("#passSuccess").text("Change successfull!");
            $("#passSuccess").show("fast", function(){
              setTimeout(function(){
                $("#passSuccess").hide("fast");
                $("#passSuccess").text("");
              }, 5000);
            });
          } else{
            $("#passErr").text("Your old password is incorrect");
            $("#passErr").show("fast", function(){
              setTimeout(function(){
                $("#passErr").hide("fast");
                $("#passErr").text("");
              }, 5000);
            });
          }
        },
        error: function(data){
          alert(JSON.stringify(data));
        }
      })
    }else{
      $("#passErr").text("The passwords do not match");
      $("#passErr").show("fast", function(){
        setTimeout(function(){
          $("#passErr").hide("fast");
          $("#passErr").text("");
        }, 5000);
      });
    }
  });
});
