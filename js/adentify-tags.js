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
                        success: function (data) {
                            if (data.success) {
                                $('#photo-getting-tagged').remove();
                                $('#adentify-upload-modal').hide();
                                $('#adentify-tag-modal').show();
                                $('#__wp-uploader-id-3').focus();
                                try {
                                    var photo = data.result.data;
                                    var img = document.createElement("img");

                                    img.id = 'photo-getting-tagged';
                                    img.src = photo.large_url;
                                    img.style.maxHeight = $('#ad-display-photo').height() + 'px';
                                    img.style.display = 'block';
                                    img.style.marginLeft = 'auto';
                                    img.style.marginRight = 'auto';
                                    img.style.right = "300px";
                                    document.getElementById('ad-display-photo').appendChild(img);

                                    // append the new photo to the library content
                                    var library_img = document.createElement("img");
                                    library_img.className = 'ad-library-photo';
                                    library_img.src = photo.small_url;
                                    document.getElementById('ad-library-content').appendChild(library_img);
                                } catch(e) {
                                    console.log("Error: " + data.data);
                                }
                            } else {
                                console.log("Error: " + data.data);
                            }
                        }
                    });
                });

                // post tag
                $('#submit-tag-product, #submit-tag-venue, #submit-tag-person').click(function(e) {
                    e.preventDefault();
                    var tag = {
                        'type': 'venue',
                        'title': 'toto',
                        'description': 'toto',
                        'link': 'http://www.sss.com',
                        'x_position': 0.5,
                        'y_position': 0.5,
                        'photo': 434,
                        //'brand': 10,
                        //'product': 10,
                        //'productType': 10,
                        'venue': 62,
                        //'person': 10
                    };
                    console.log("submitting tag");
                    $.ajax({
                        type: 'POST',
                        url: adentifyTagsData.admin_ajax_url,
                        data: {
                            'action': 'ad_tag',
                            'tag': tag
                        },
                        complete: function() {
                            console.log("completed submit-tag-ajax");
                        }
                    });
                });

                // store the id of the selected photo and enabled the buttons
                var photoIdSelected;
                $('.ad-library-photo').click(function(e) {
                    console.log(e.target.name);
                    $(e.target).addClass('ad-selected-photo');
                    document.getElementById('ad-insert-from-library').removeAttribute('disabled');
                    document.getElementById('ad-tag-from-library').removeAttribute('disabled');
                    photoIdSelected = e.target.name;
                });
                // show the tag modal with the selected photo
                $('#ad-tag-from-library').click(function(e) {
                    if (!e.target.hasAttribute('disabled')) {
                        $.ajax({
                            type: 'GET',
                            url: adentifyTagsData.admin_ajax_url,
                            data: {
                                'action': 'ad_get_photo',
                                'photo_id': photoIdSelected //gerer erreur si photoIdSelected est vide/unselected
                            },
                            success: function(data) {
                                $('#photo-getting-tagged').remove();
                                $('#adentify-upload-modal').hide();
                                $('#adentify-tag-modal').show();
                                $('#__wp-uploader-id-3').focus();
                                try {
                                    var photo = JSON.parse(data.data);
                                    var img = document.createElement("img");
                                    img.id = 'photo-getting-tagged';
                                    img.src = photo.large_url;
                                    img.style.maxHeight = $('#ad-display-photo').height() + 'px';
                                    img.style.display = 'block';
                                    img.style.marginLeft = 'auto';
                                    img.style.marginRight = 'auto';
                                    img.style.right = "300px";
                                    document.getElementById('ad-display-photo').appendChild(img);
                                    photoIdSelected = undefined;
                                    document.getElementById('ad-insert-from-library').setAttribute('disabled', 'disabled');
                                    document.getElementById('ad-tag-from-library').setAttribute('disabled', 'disabled');
                                } catch(e) {
                                    console.log("Error: " + data.data);
                                }
                            }
                        });
                    }
                });
                $('#ad-insert-from-library').click(function(e) {
                    if (!e.target.hasAttribute('disabled')) {
                        if (photoIdSelected !== undefined) {
                            window.send_to_editor('[adentify=' + photoIdSelected + ']');
                            //$('.ad-library-photo[name=' + photoIdSelected + ']').removeClass('ad-selected-photo');
                            photoIdSelected = undefined;
                            document.getElementById('ad-insert-from-library').setAttribute('disabled', 'disabled');
                            document.getElementById('ad-tag-from-library').setAttribute('disabled', 'disabled');
                        }
                        else
                            console.log("you have to select a photo");
                    }
                });
            }
            else
                $('#adentify-upload-modal').show();
            $('#__wp-uploader-id-2').focus();
        });
    });
})(jQuery);