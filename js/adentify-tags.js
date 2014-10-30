/**
 * Created by pierrickmartos on 06/10/2014.
 */
(function($) {
    $(document).ready(function(){
        $('#adentify-upload-img').click(function(){
            if($('#adentify-upload-modal').html() === undefined)
            {
                function removePhotoSelection() {
                    $('.ad-library-photo-wrapper[data-adentify-photo-id=' + photoIdSelected +']').removeClass(selectedPhotoClassName);
                    photoIdSelected = undefined;
                    $('#ad-insert-from-library, #ad-tag-from-library').attr('disabled', 'disabled');
                }

                // append the modals
                $('body').append('<div id="adentify-upload-modal"></div>').append('<div id="adentify-tag-modal"></div>');
                $('#adentify-upload-modal').html($('#adentify-uploader').html());
                $('#adentify-tag-modal').hide().html($('#adentify-tag-modal-template').html());

                // hide the modals
                $('#adentify-modal-backdrop, #adentify-modal-backdrop2, #adentify-modal-close, #adentify-modal-close2').click(function(){
                    $('#adentify-upload-modal').hide(0, function() {
                        $('#ad-uploader-content').show();
                        $('#ad-uploading-message').hide();
                    });
                    $('#adentify-tag-modal').hide();
                    removePhotoSelection();
                    $('.ad-tag-frame-content input').val('');
                });
                $('#__wp-uploader-id-2, #__wp-uploader-id-3').keydown(function(e) {
                    if (e.which == 27) {
                        $('#adentify-upload-modal').hide(0, function() {
                            $('#ad-uploader-content').show();
                            $('#ad-uploading-message').hide();
                        });
                        $('#adentify-tag-modal').hide();
                        removePhotoSelection();
                        $('.ad-tag-frame-content input').val('');
                    }
                });

                // switch between the upload's tabs
                $('#upload-file, #file-library').click(function(){
                    $('#upload-file, #file-library').removeClass('active');
                    $(this).addClass('active');
                    $('#ad-uploader, #ad-library').hide();
                    switch(this.id) {
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
                $('#ad-tag-product-tab, #ad-tag-venue-tab, #ad-tag-person-tab').click(function(){
                    $('#ad-tag-product-tab, #ad-tag-venue-tab, #ad-tag-person-tab').removeClass('active');
                    $(this).addClass('active');
                    $('.tag-form').hide();
                    switch(this.id) {
                        case 'ad-tag-venue-tab':
                            $('#tag-venue').show();
                            $('#tag-venue input').first().focus();
                            break;
                        case 'ad-tag-person-tab':
                            $('#tag-person').show();
                            $('#tag-person input').first().focus();
                            break;
                        case 'ad-tag-product-tab':
                        default:
                            $('#tag-product').show();
                            $('#tag-product input').first().focus();
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
                        add: function (e, data) {
                            $('#ad-uploader-content').hide();
                            $('#ad-uploading-message').show();
                            data.submit();
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#photo-getting-tagged').remove();
                                $('#adentify-upload-modal').hide();
                                $('#adentify-tag-modal').show(0, function() {
                                    $('#tag-product input').first().focus();
                                });
                                try {
                                    var photo = data.data;
                                    var style = {
                                        'max-height': $('#ad-display-photo').height()
                                    };
                                    $('#ad-display-photo').append('<img id="photo-getting-tagged" data-adentify-photo-id="' + photo.id + '" src="' + photo.large_url + '"/>');
                                    $('#photo-getting-tagged').css(style).addClass('ad-photo-getting-tagged');

                                    // append the new photo to the library content
                                    var thumbnail = '<div class="ad-library-photo-wrapper" data-adentify-photo-id="' + photo.id + '" style="background-image: url(' + photo.small_url + ')"></div>';
                                    var wrapper = '<li class="ad-library-photo-thumbnail">' + thumbnail + '</li>';
                                    $('#ad-library-list').append(wrapper);
                                    $('.ad-library-photo-wrapper[data-adentify-photo-id="' + photo.id + '"]').click(function() {
                                        if (currentSelectedPhoto) {
                                            currentSelectedPhoto.removeClass(selectedPhotoClassName);
                                        }
                                        currentSelectedPhoto = $(this);
                                        currentSelectedPhoto.addClass(selectedPhotoClassName);
                                        $('#ad-insert-from-library, #ad-tag-from-library').removeAttr('disabled');
                                        photoIdSelected = currentSelectedPhoto.attr('data-adentify-photo-id');
                                    });
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

                    var tagForm = $('#' + $(this).context.form.id).serializeArray().map(function(item) { var obj = {}; obj[item.name] = item.value; return obj; });
                    var tag = {
                        'type': $(this).context.form.attributes['data-tag-type'].value,
                        'title': tagForm[0].name,
                        'description': tagForm[1].description,
                        'link': tagForm[2].url,
                        'photo': $('#photo-getting-tagged').attr('data-adentify-photo-id'),
                        'x_position': 0.5,
                        'y_position': 0.5,
                        'venue': 62
                        //'brand': 10,
                        //'product': 10,
                        //'productType': 10,
                        //'person': 10
                    };
                    console.log(tag);
                    $.ajax({
                        type: 'POST',
                        url: adentifyTagsData.admin_ajax_url,
                        data: {
                            'action': 'ad_tag',
                            'tag': tag
                        },
                        complete: function() {
                            $('.ad-tag-frame-content input').val('');
                            console.log("completed submit-tag-ajax");
                        }
                    });
                });

                // Store the id of the selected photo and enabled the buttons
                var photoIdSelected;
                var currentSelectedPhoto = null;
                var selectedPhotoClassName = 'ad-selected-photo';
                $('.ad-library-photo-wrapper').on('click', function() {
                   if (currentSelectedPhoto) {
                      currentSelectedPhoto.removeClass(selectedPhotoClassName);
                   }
                   currentSelectedPhoto = $(this);
                   currentSelectedPhoto.addClass(selectedPhotoClassName);
                   $('#ad-insert-from-library, #ad-tag-from-library').removeAttr('disabled');
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
                                $('#adentify-tag-modal').show(0, function() {
                                    $('#tag-product input').first().focus();
                                });
                                try {
                                    var photo = JSON.parse(data.data);
                                    var style = {
                                        'max-height': $('#ad-display-photo').height()
                                    };
                                    $('#ad-display-photo').append('<img id="photo-getting-tagged" data-adentify-photo-id="' + photo.id + '" src="' + photo.large_url + '"/>');
                                    $('#photo-getting-tagged').css(style).addClass('ad-photo-getting-tagged');
                                    removePhotoSelection();
                                } catch(e) {
                                    console.log("Error: " + data.data); // TODO gestion erreur
                                }
                            }
                        });
                    }
                });
                // insert a photo in the post editor
                $('#ad-insert-from-library').click(function() {
                    if (!$(this).is('[disabled]')) {
                        if (typeof photoIdSelected !== "undefined" && photoIdSelected) {
                            window.send_to_editor('[adentify=' + photoIdSelected + ']');
                            removePhotoSelection();
                            $('#adentify-upload-modal').hide();
                        }
                        else
                            console.log("you have to select a photo"); // TODO: gestion erreur
                    }
                });
                // "back" button on the tag modal
                $('#ad-back-to-library').click(function() {
                    $('#ad-uploading-message, #adentify-tag-modal').hide();
                    $('#ad-uploader-content, #adentify-upload-modal').show();
                    $('#__wp-uploader-id-2').focus();
                });
            }
            else
                $('#adentify-upload-modal').show();
            $('#__wp-uploader-id-2').focus();
        });
    });
})(jQuery);