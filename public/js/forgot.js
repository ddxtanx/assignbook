$(document).ready(function(){
  $("#successfull").hide();
})
function requestpassword(){
  var email = $("#email").val();
  $.ajax({
    method:"POST",
    url:"forgot",
    data:{
      email: email
    },
    success: function(data){
      $("#successfull").show('fast', function(){
        setTimeout(function(){
          $("#successfull").hide('fast');
        }, 5000)
      })
    },
    error: function(data){
      alert(JSON.stringify(data));
    }
  })
}
