$(document).ready(function() {
    //This small file just removes elements if the user is either not logged in or is logged in
    if (isLoggedIn == 1) {
        $(".notLoggedIn").remove();
    } else {
        $(".isLoggedIn").remove();
    }
});