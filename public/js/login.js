$(document).ready(function() {
    $("#error").hide();
    if (error == "incorrect") {
        $("#error").text("Email-Password combination not found, please try again");
        $("#error").show();
        //Displays an error if the email-password combo was not found in the database
    }
});
