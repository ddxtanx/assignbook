$(document).ready(function(){
  $("#error").hide();
});
function resetPass(){
    const pass1 = $("#pass1").val();
    const pass2 = $("#pass2").val();
    if(pass1===pass2){
    $.ajax({
      method: "POST",
      data:{
        pass: pass1,
        siteId: siteId
      },
      success: function(data){
        if(data.error){
          $("#error").text(data.errorText);
          $("#error").show("fast", function(){
            setTimeout(function(){
              $("#error").hide("fast");
            }, 5000)
          })
        }else{
          document.location="login"
        }
      },
      error: function(data){
        alert(JSON.stringify(data));
      }
    });
  } else{
    $("#error").text("The passwords do not match!");
    $("#error").show("fast", function(){
      setTimeout(function(){
        $("#error").hide("fast");
      }, 5000)
    })
  }
}
