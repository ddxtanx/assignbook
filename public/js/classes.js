$(document).ready(() => {
    $(".notLoggedIn").remove();
    $("#hello").hide();
    $("#addFormDiv").hide();
    $("#warning").hide();
    // Hiding sections that will be revealed if needed
    $("#add").click(() => {
        if (isLoggedIn === 1) {
            // isLoggedIn is declared in classes.php
            $("#add").hide("fast");
            $("#addFormDiv").show("fast");
            // Displaying the class create form, if the user is logged in
        } else {
            $("#add").hide("fast");
            $("#warning").show("fast");
            // If the user is not logged in, display the warning div
        }
    });
    $("#cancel").click(() => {
        $("#add").show("fast");
        $("#addFormDiv").hide("fast");
        // If the user want's to cancel, hide the class creation form, and unhide the create button
    });
    let element, period, name, teacher;
    // Classes array is declared in the php files that call getClasses, and it contains all of the classes' information

    $(".search").change(() => {
        // Whenever a search box is changed, classes that match those search values are displayed, and those who don't are hidden.
        const nameSearchValue = $("#nameSearchBar").val();
        const teacherSearchValue = $("#teacherSearchBar").val();
        const period = $("#periodSearchBar").val();

        for (let x = 0; x < classesArray.length; x++) {
            const userClass = classesArray[x];
            const nameCheck = (nameSearchValue === "") ? true : userClass.name.includes(nameSearchValue);
            // nameCheck is a variable that either checks if the nameSearchValue is empty, or, if that is not the case, checks if the search value is included in the classes' name name
            const teacherCheck = (teacherSearchValue === "") ? true : userClass.teacherName.includes(teacherSearchValue);
            // teacherCheck functions like nameCheck, except it checks if the teacherSearchValue is included in the teacher's name
            const periodCheck = (period === "") ? true : userClass.period === period;
            // periodCheck, again, functions like the two variables above, except it checks if the period is equal

            if (!(nameCheck && teacherCheck && periodCheck)) {
                $(`.class${ x+1}`).hide("fast");
            } else {
                $(`.class${ x+1}`).show("fast");
            }
        }
    });
    $(".delClass").click(function(){
        const element = $(this);
        const name = element.attr("name");
        const period = element.attr("period");
        const teacherName = element.attr("teacherName");

        console.log({
            "name": name,
            "period": period,
            "teacherName": teacherName
        });
        $.ajax({
            "method": "POST",
            "url": "deleteClass",
            "data": {
                "name": name,
                "period": period,
                "teacherName": teacherName,
                "_csrf": token
            },
            "success": function(data){
                element.parent().parent().hide("fast", () => {
                    element.parent().parent().remove();
                });
            },
            "error": function(data){
                alert(JSON.stringify(data));
            }
        });
    });
});
