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
                // append the modals
                $('body').append('<div id="adentify-upload-modal"></div>').append('<div id="adentify-tag-modal"></div>');
                $('#adentify-upload-modal').html($('#adentify-uploader').html());
                $('#adentify-tag-modal').hide().html($('#adentify-tag-modal-template').html());

                // hide the upload modal
                $('#adentify-modal-backdrop, #adentify-modal-backdrop2, #adentify-modal-close, #adentify-modal-close2').click(function(){
                    $('#adentify-upload-modal').hide();
                    $('#adentify-tag-modal').hide();
                });
                $('#__wp-uploader-id-2, #__wp-uploader-id-3').keydown(function(e) {
                    if (e.which == 27)
                    {
                        $('#adentify-upload-modal').hide();
                        $('#adentify-tag-modal').hide();
                    }
                });

                // switch between the upload's tabs
                $('#upload-file, #file-library').click(function(e){
                    $('#upload-file, #file-library').removeClass('active');
                    $(e.target).addClass('active');
                    $('#ad-uploader, #ad-library').hide();
                    switch(e.target.id) {
                        case 'upload-file':
                            $('#ad-uploader').show();
                            break;
                        case 'file-library':
                            $('#ad-library').show();
                            break;
                        default:
                            break;
                    }
                });

                // switch between the tag's tabs
                $('#ad-tag-product-tab, #ad-tag-venue-tab, #ad-tag-person-tab').click(function(e){
                    $('#ad-tag-product-tab, #ad-tag-venue-tab, #ad-tag-person-tab').removeClass('active');
                    $(e.target).addClass('active');
                    $('.tag-form').hide();
                    switch(e.target.id) {
                        case 'ad-tag-product-tab':
                            $('#tag-product').show();
                            break;
                        case 'ad-tag-venue-tab':
                            $('#tag-venue').show();
                            break;
                        case 'ad-tag-person-tab':
                            $('#tag-person').show();
                            break;
                        default:
                            break;
                    }
                });

                // upload the image
                $('#adentify-uploader-button').click(function() {
                    $('#upload-img').click().fileupload({
                        datatype: 'json',
                        url: adentifyTagsData.admin_ajax_url,
                        formData: {
                            'action': 'ad_upload'
                        },
                        done: function (e, data) {
                            $('#photo-getting-tagged').remove();
                            $('#adentify-upload-modal').hide();
                            $('#adentify-tag-modal').show();
                            $('#__wp-uploader-id-3').focus();
                            try {
                                //var photo = JSON.parse(data.result);
                                var img = document.createElement("img");

                                //console.log(photo.id);
                                //console.log($('#ad-display-photo').width());
                                img.id = 'photo-getting-tagged';
                                //img.src = photo.large_url;
                                img.src = "https://s3-eu-west-1.amazonaws.com/cdndev.adentify.com/uploads/photos/users/35/photo-large/5448fd6335ab7phpB8lkkp.jpg";
                                //img.src = "https://s3-eu-west-1.amazonaws.com/cdndev.adentify.com/uploads/photos/users/35/original/544914da6484fphpkoHMVU"
                                //console.log($('#ad-display-photo').height());
                                img.style.maxHeight = $('#ad-display-photo').height() + 'px';
                                img.style.display = 'block';
                                img.style.marginLeft = 'auto';
                                img.style.marginRight = 'auto';
                                img.style.right = "300px";
                                //img.alt = alt;

                                document.getElementById('ad-display-photo').appendChild(img);
                            } catch(e) {
                                console.log("Error:" + data.result);
                            }
                        },
                        error: function () {
                            console.log("error");
                        }
                    });
                });
            }
            else
                $('#adentify-upload-modal').show();
            $('#__wp-uploader-id-2').focus();
        });
    });
})(jQuery);