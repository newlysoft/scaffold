$(function(){

    // fix language drop-down menu height
    (function($){
        var l = $('#footer-lang li').length;
        $('#footer-lang .drop-down').css({
            "top": (-31 * l - 2) + "px",
            "height": (31 * l - 3) + "px"
        });
    }(jQuery));

    // promo register button click event
    (function($){
        $('#register-button').click(function() {
            $('#promo-form').attr('action', '/user/sign_up');
        });
    }(jQuery));

});

