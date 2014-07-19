// @codekit-prepend "lib/jquery-1.11.1.min.js"
// @codekit-prepend "lib/tabs.js"

$(document).ready(function(){
   Tabs('#dashboard-sidebar-menu');

   $('#register-button').click(function() {
       $('#promo-form').attr('action', '/user/sign_up');
   });

  // Fix language drop-down menu height.
	var l = $('#footer-lang li').length;
	$('#footer-lang .drop-down').css({
	    "top": (-31 * l - 2) + "px",
	    "height": (31 * l - 3) + "px"
	});
});

