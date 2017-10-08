$(document).ready(function() {
    $("#hamDiv").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
});
