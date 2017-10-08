$(document).ready(function() {
    $("#error").hide();
    $(".isLoggedIn").remove();
    if (error === "passwordNotMatched") {
        $("#error").text("Please try again, the passwords did not match!");
        $("#error").show();
    } else if (error === "alreadyRegistered") {
        $("#error").text("You are already registered, please log in!");
        $("#error").show();
    }
    if (error === "noError") {
        $("#error").text("You are registered! Now go login!");
        $("#error").removeClass("alert-danger");
        $("#error").addClass("alert-success");
        $("#error").show();
    }
});
