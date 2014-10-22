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
                var uploadModal = $('#adentify-uploader').html();
                $('body').append('<div id="adentify-upload-modal"></div>');
                $('#adentify-upload-modal').html(uploadModal);

                var tagModal = $('#adentify-tag-modal-template').html();
                $('body').append('<div id="adentify-tag-modal"></div>');
                $('#adentify-tag-modal').hide().html(tagModal);

                // hide the upload modal
                $('#adentify-modal-backdrop, #adentify-modal-backdrop2').click(function(){
                    $('#adentify-upload-modal').hide();
                    $('#adentify-tag-modal').hide();
                });
                $('#adentify-modal-close, #adentify-modal-close2').click(function(e){
                    e.preventDefault();
                    $('#adentify-upload-modal').hide();
                    $('#adentify-tag-modal').hide();
                });
                //rajouter touche escape

                // switch between the upload and library tabs
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

                // upload image
                $('#adentify-uploader-button').click(function() {
                    $('#upload-img').click().fileupload({
                        datatype: 'json',
                        url: 'http://local.wordpress.com/wp-admin/admin-ajax.php', //utiliser global
                        formData: {
                            'action': 'ad_upload'
                        },
                        done: function (e, data) {
                            $('#ad-display-photo').html('');
                            $('#adentify-upload-modal').hide();
                            $('#adentify-tag-modal').show();
                            try {
                                var photo = JSON.parse(data.result);
                                var img = document.createElement("img");

                                //console.log(photo.id);
                                //console.log($('#ad-display-photo').width());
                                img.src = photo.large_url;
                                //img.width = $('#ad-display-photo').width() * (2 / 3);
                                //img.height = $('#ad-display-photo').height() * (2 / 3);
                                //img.alt = alt;

                                // This next line will just add it to the <body> tag
                                document.getElementById('ad-display-photo').appendChild(img);
                            } catch(e) {
                                console.log(data.result);
                            }
/*                            console.log(photo.id);
                            console.log(data);
                            if (data.result) {
                                console.log("OK");
                            } else {
                                console.log("KO");
                            }*/
                        },
                        error: function () {
                            console.log("error");
                        }
                    });
                });
                $('#uploading-or-tagging').change(function() {
                   console.log("toto");
                });
            }
            else
                $('#adentify-upload-modal').show();
        });
    });
})(jQuery);