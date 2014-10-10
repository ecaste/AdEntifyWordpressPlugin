/**
 * Created by pierrickmartos on 06/10/2014.
 */
jQuery(function($) {
   /*var delay=70, setTimeoutConst;
   $('.tag').hover(function() {
      $(this).find('.popover').fadeIn(100);
      clearTimeout(setTimeoutConst);
   }, function(){
      var that = this;
      setTimeoutConst = setTimeout(function(){
         $(that).find('.popover').fadeOut(100);
      }, delay);
   });*/
});

(function($) {
    $(document).ready(function(){
        $('#adentify-upload-img').click(function(){
            if($('#adentify-upload-modal').html() === undefined)
            {
                var modal = $('#adentify-uploader').html();
                $('body').append('<div id="adentify-upload-modal"></div>');
                $('#adentify-upload-modal').html(modal);
                $('#adentify-modal-backdrop').click(function(){
                    console.log("toto");
                    $('#adentify-upload-modal').hide();
                });
                $('#adentify-modal-close').click(function(e){
                    e.preventDefault();
                    console.log("toto");
                    $('#adentify-upload-modal').hide();
                });
            }
            else
                $('#adentify-upload-modal').show();
        });
    });
})(jQuery);
