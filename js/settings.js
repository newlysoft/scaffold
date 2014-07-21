$(function () {

    // ssh add button
    $('#ssh-add').on("click", function (e) {
        alert(e);
        var $addForm = $('#user-ssh-add-form');
        if ($addForm.hasClass("hide")) {
            $addForm.removeClass("hide");
        } else {
            $addForm.addClass("hide");
        }
    });

});
