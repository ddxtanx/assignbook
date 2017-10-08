$(document).ready(() => {
    $("#successfull").hide();
});
function requestpassword(){
    const email = $("#email").val();

    $.ajax({
        "method": "POST",
        "url": "forgot",
        "data": {
            "email": email
        },
        "success": function(data){
            $("#successfull").show("fast", () => {
                setTimeout(() => {
                    $("#successfull").hide("fast");
                }, 5000);
            });
        },
        "error": function(data){
            alert(JSON.stringify(data));
        }
    });
}
