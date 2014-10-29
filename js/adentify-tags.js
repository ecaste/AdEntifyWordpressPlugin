/**
 * Created by pierrickmartos on 06/10/2014.
 */
(function($) {
    $(document).ready(function(){
        $('#adentify-upload-img').click(function(){
            if($('#adentify-upload-modal').html() === undefined)
            {
                // append the modals
                $('body').append('<div id="adentify-upload-modal"></div>').append('<div id="adentify-tag-modal"></div>');
                $('#adentify-upload-modal').html($('#adentify-uploader').html());
                $('#adentify-tag-modal').hide().html($('#adentify-tag-modal-template').html());

                // hide the modals
                $('#adentify-modal-backdrop, #adentify-modal-backdrop2, #adentify-modal-close, #adentify-modal-close2').click(function(){
                    $('#adentify-upload-modal').hide();
                    $('#adentify-tag-modal').hide();
                });
                $('#__wp-uploader-id-2, #__wp-uploader-id-3').keydown(function(e) {
                    if (e.which == 27) {
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
                        case 'file-library':
                            $('#ad-library').show();
                            break;
                        case 'upload-file':
                        default:
                           $('#ad-uploader').show();
                           break;
                    }
                });

                // switch between the tag's tabs
                $('#ad-tag-product-tab, #ad-tag-venue-tab, #ad-tag-person-tab').click(function(e){
                    $('#ad-tag-product-tab, #ad-tag-venue-tab, #ad-tag-person-tab').removeClass('active');
                    $(e.target).addClass('active');
                    $('.tag-form').hide();
                    switch(e.target.id) {
                        case 'ad-tag-venue-tab':
                            $('#tag-venue').show();
                            break;
                        case 'ad-tag-person-tab':
                            $('#tag-person').show();
                            break;
                        case 'ad-tag-product-tab':
                        default:
                            $('#tag-product').show();
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
                                    var photo = data.data;
                                    var style = {
                                        'max-height': $('#ad-display-photo').height()
                                    };
                                    $('#ad-display-photo').append('<img id="photo-getting-tagged" src="' + photo.large_url + '"/>');
                                    $('#photo-getting-tagged').css(style).addClass('ad-photo-getting-tagged');

                                    // append the new photo to the library content
                                    var img = '<img tabindex="0" class="ad-library-photo" data-adentify-photo-id="' + photo.id + '" src="' + photo.small_url + '" />';
                                    var wrapper = '<div class="ad-library-photo-wrapper" data-adentify-photo-id="' + photo.id + '">' + img + '</div>';
                                    $('#ad-library-content').append(wrapper);
                                } catch(e) {
                                    console.log("Error: " + data.data); // TODO : gestion erreur
                                }
                            } else {
                                console.log("Error: " + data.data); // TODO : gestion erreur
                            }
                        }
                    });
                });

                // post tag
                $('#submit-tag-product, #submit-tag-venue, #submit-tag-person').click(function(e) {
                    e.preventDefault();
                    // TODO: Ajouter un switch suivant le type de tag + builder tag
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
                        'venue': 62
                        //'person': 10
                    };
                    $.ajax({
                        type: 'POST',
                        url: adentifyTagsData.admin_ajax_url,
                        data: {
                            'action': 'ad_tag',
                            'tag': tag
                        },
                        complete: function() {
                            // TODO: Clean form ajout tag
                            console.log("completed submit-tag-ajax");
                        }
                    });
                });

                // Store the id of the selected photo and enabled the buttons
                var photoIdSelected;
                var currentSelectedPhoto = null;
                var selectedPhotoClassName = 'ad-selected-photo';
                $('.ad-library-photo').on('click', function() {
                   if (currentSelectedPhoto) {
                      currentSelectedPhoto.removeClass(selectedPhotoClassName);
                   }
                   currentSelectedPhoto = $(this);
                   currentSelectedPhoto.addClass(selectedPhotoClassName);
                   $('#ad-insert-from-library').removeAttr('disabled');
                   $('#ad-tag-from-library').removeAttr('disabled');
                   photoIdSelected = currentSelectedPhoto.attr('data-adentify-photo-id');
                });

                // show the tag modal with the selected photo
                $('#ad-tag-from-library').click(function(e) {
                    if (!$(this).is('[disabled]') && typeof photoIdSelected !== 'undefined' && photoIdSelected) {
                        $.ajax({
                            type: 'GET',
                            url: adentifyTagsData.admin_ajax_url,
                            data: {
                                'action': 'ad_get_photo',
                                'photo_id': photoIdSelected
                            },
                            success: function(data) {
                                $('#photo-getting-tagged').remove();
                                $('#adentify-upload-modal').hide();
                                $('#adentify-tag-modal').show();
                                $('#__wp-uploader-id-3').focus();
                                try {
                                    var photo = JSON.parse(data.data);
                                    var style = {
                                        'max-height': $('#ad-display-photo').height()
                                    };
                                    $('#ad-display-photo').append('<img id="photo-getting-tagged" src="' + photo.large_url + '"/>');
                                    $('#photo-getting-tagged').css(style).addClass('ad-photo-getting-tagged');
                                    photoIdSelected = undefined;
                                    $('#ad-insert-from-library').attr('disabled', 'disabled');
                                    $('#ad-tag-from-library').attr('disabled', 'disabled');
                                } catch(e) {
                                    console.log("Error: " + data.data); // TODO gestion erreur
                                }
                            }
                        });
                    }
                });
                $('#ad-insert-from-library').click(function() {
                    if (!$(this).is('[disabled]')) {
                        if (typeof photoIdSelected !== "undefined" && photoIdSelected) {
                            window.send_to_editor('[adentify=' + photoIdSelected + ']');
                            $('.ad-library-photo[data-adentify-photo-id=' + photoIdSelected + ']').removeClass(selectedPhotoClassName);
                            photoIdSelected = undefined;
                            $('#ad-insert-from-library').attr('disabled', 'disabled');
                            $('#ad-tag-from-library').attr('disabled', 'disabled');
                            $('#adentify-upload-modal').hide();
                        }
                        else
                            console.log("you have to select a photo"); // TODO: gestion erreur
                    }
                });
            }
            else
                $('#adentify-upload-modal').show();
            $('#__wp-uploader-id-2').focus();
        });
    });
})(jQuery);