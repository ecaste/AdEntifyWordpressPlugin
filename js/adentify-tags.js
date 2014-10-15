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
                    $('#adentify-upload-modal').hide();
                });
                $('#adentify-modal-close').click(function(e){
                    e.preventDefault();
                    $('#adentify-upload-modal').hide();
                });
                //rajouter touche escape

                $('#adentify-uploader-button').click(function() {
                    $(this).attr('data-url', 'test-upload.php');
                    console.log($(this).attr('data-url'));
                    $('#upload-img').fileupload({
                        done: function (e, data) {
                            if (data.result) {
                                console.log("OK");
                            } else {
                                console.log("KO");
                            }
                        },
                        error: function () {
                            console.log("error");
                        }
                    }).click();
                });
                $('#upload-file').click(function(){
                    $('#file-library').removeClass('active');
                    $(this).addClass('active');
                    $('.uploader-inline').show();
                    $('#ad-library').hide();
                });
                $('#file-library').click(function(){
                    $('#upload-file').removeClass('active');
                    $(this).addClass('active');
                    $('.uploader-inline').hide();
                    $('#ad-library').show();
                });

                $('#submit_my_image_upload').click(function(){
                    console.log('submit-upload');
                });
            }
            else
                $('#adentify-upload-modal').show();
        });
    });
})(jQuery);