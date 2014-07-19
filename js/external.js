$(function(){

    // fix language drop-down menu height
    (function($){
        var l = $('#footer-lang li').length;
        $('#footer-lang .drop-down').css({
            "top": (-31 * l - 2) + "px",
            "height": (31 * l - 3) + "px"
        });
    }(jQuery));

});

