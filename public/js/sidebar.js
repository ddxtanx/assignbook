$(document).ready(() => {
    $("#hamDiv").click((e) => {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
});
