/**
 * Created by pierrickmartos on 06/10/2014.
 */
var AdEntify = {

   tag: null,
   tags: [],
   photoIdSelected: null,
   currentSelectedPhoto: null,
   selectedPhotoClassName: 'ad-selected-photo',
   currentTagIndex: null,

   /*
    * Events handlers
    */
   clickOnAdEntifyButton: function() {
      if ($('#adentify-upload-modal').html() === undefined) {
         // render modals
         this.renderModals();
         // Setup event handlers
         this.setupEventHandlers();
      }
      else
         $('#adentify-upload-modal').show();

      $('#__wp-uploader-id-2').focus();
   },

   clickOnUploadTab: function(e) {
      $('#upload-file, #file-library').removeClass('active');
      $(e.target).addClass('active');
      $('#ad-uploader, #ad-library, #ad-tag-from-library, #ad-insert-from-library').hide();
      switch(e.target.id) {
         case 'file-library':
            $('#ad-library, #ad-tag-from-library, #ad-insert-from-library').show();
            break;
         case 'upload-file':
         default:
            $('#ad-uploader').show();
            break;
      }
   },

   clickOnTagTab: function(e) {
      $('#ad-tag-product-tab, #ad-tag-venue-tab, #ad-tag-person-tab').removeClass('active');
      $(e.target).addClass('active');
      $('.tag-form').hide();
      switch(e.target.id) {
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
   },

   clickOnUploaderButton: function(e) {
       var that = this;
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
                  that.photoIdSelected = photo.id;
                  $('#ad-wrapper-tag-photo').append('<img id="photo-getting-tagged" style="max-height:' + $('#ad-display-photo').height()
                  + 'px" class="ad-photo-getting-tagged" data-adentify-photo-id="' + photo.id
                  + '" src="' + photo.large_url + '"/>');
                  setTimeout(function() {
                      $('#ad-wrapper-tag-photo').height($('#photo-getting-tagged').height());
                  }, 500);

                  // append the new photo to the library content
                  var thumbnail = '<div class="ad-library-photo-wrapper" data-adentify-photo-id="' + photo.id + '" style="background-image: url(' + photo.small_url + ')"></div>';
                  var wrapper = '<li class="ad-library-photo-thumbnail">' + thumbnail + '</li>';
                  $('#ad-library-list').append(wrapper);
                  $('.ad-library-photo-wrapper[data-adentify-photo-id="' + photo.id + '"]').click(function() {
                     if (that.currentSelectedPhoto) {
                        that.currentSelectedPhoto.removeClass(that.selectedPhotoClassName);
                     }
                     that.currentSelectedPhoto = $(this);
                     that.currentSelectedPhoto.addClass(that.selectedPhotoClassName);
                     $('#ad-insert-from-library, #ad-tag-from-library').removeAttr('disabled');
                     that.photoIdSelected = that.currentSelectedPhoto.attr('data-adentify-photo-id');
                  });
               } catch(e) {
                  console.log("Error: " + data.data); // TODO : gestion erreur
               }
            } else {
               console.log("Error: " + data.data); // TODO : gestion erreur
            }
         }
      });
   },

   clickOnLibraryPhoto: function(e) {
      if (this.currentSelectedPhoto) {
         this.currentSelectedPhoto.removeClass(this.selectedPhotoClassName);
      }
      this.currentSelectedPhoto = $(e.target);
      this.currentSelectedPhoto.addClass(this.selectedPhotoClassName);
      $('#ad-insert-from-library, #ad-tag-from-library').removeAttr('disabled');
      this.photoIdSelected = this.currentSelectedPhoto.attr('data-adentify-photo-id');
   },

   /*
    * Setup event handlers
    */
   setupEventHandlers: function() {
      var that = this;

      // hide the modals
      $('#adentify-modal-backdrop, #adentify-modal-backdrop2, #adentify-modal-close, #adentify-modal-close2').click($.proxy(this.closeModals, this));

      // Close modals on ECHAP
      $('#__wp-uploader-id-2, #__wp-uploader-id-3').keydown(function(e) { if (e.which == 27) that.closeModals(); });

      // switch between the upload's tabs
      $('#upload-file, #file-library').click($.proxy(this.clickOnUploadTab, this));

      // switch between the tag's tabs
      $('#ad-tag-product-tab, #ad-tag-venue-tab, #ad-tag-person-tab').click($.proxy(this.clickOnTagTab, this));

      // upload the image
      $('#adentify-uploader-button').click($.proxy(this.clickOnUploaderButton, this));

      // Add tag
      $('.ad-media-frame-content .photo-overlay').click($.proxy(this.addTag, this));

      // post tag
      $('#submit-tag-product, #submit-tag-venue, #submit-tag-person').click($.proxy(this.postTag, this));

      // Store the id of the selected photo and enabled the buttons
      $('.ad-library-photo-wrapper').on('click', $.proxy(this.clickOnLibraryPhoto, this));

      // show the tag modal with the selected photo
      $('#ad-tag-from-library').click($.proxy(this.openPhotoModal, this));

      // insert a photo in the post editor
      $('#ad-insert-from-library, #ad-insert-after-tag').click($.proxy(this.insertPhotoInPostEditor, this));

      // "back" button on the tag modal
      $('#ad-back-to-library').click($.proxy(this.backToMainModal, this));
   },

   /*
    * Other methods
    */
   removePhotoSelection: function(needId) {
      $('.ad-library-photo-wrapper[data-adentify-photo-id=' + this.photoIdSelected +']').removeClass(this.selectedPhotoClassName);
      if (needId === 0)
         this.photoIdSelected = undefined;
      $('#ad-insert-from-library, #ad-tag-from-library').attr('disabled', 'disabled');
   },

   renderModals: function() {
      $('body').append('<div id="adentify-upload-modal"></div>').append('<div id="adentify-tag-modal"></div>');
      $('#adentify-upload-modal').html($('#adentify-uploader').html());
      $('#adentify-tag-modal').hide().html($('#adentify-tag-modal-template').html());
      $('#ad-tag-from-library, #ad-insert-from-library, #ad-uploading-message').hide();
   },

   closeModals: function() {
      $('#adentify-upload-modal').hide(0, function() {
         $('#ad-uploader-content').show();
         $('#ad-uploading-message').hide();
      });
      $('#adentify-tag-modal').hide();
      this.removePhotoSelection(0);
      $('.ad-tag-frame-content input').val('');
   },

   backToMainModal: function() {
      $('#ad-uploading-message, #adentify-tag-modal').hide();
      $('#ad-uploader-content, #adentify-upload-modal').show();
      $('#__wp-uploader-id-2').focus();
      $('.ad-tag-frame-content input').val('');
   },

   startLoading: function() {
      $('#ad-tag-from-library-loading, #ad-uploading-message').show();
   },

   stopLoading: function() {
      $('#ad-tag-from-library-loading').hide();
   },

   openPhotoModal: function(e) {
      var that = this;
      this.startLoading();
      if (!$(e.target).is('[disabled]') && typeof this.photoIdSelected !== 'undefined' && this.photoIdSelected) {
         $.ajax({
            type: 'GET',
            url: adentifyTagsData.admin_ajax_url,
            dataType: 'json',
            data: {
               'action': 'ad_get_photo',
               'photo_id': that.photoIdSelected
            },
            success: function(data) {
               if (typeof data.data !== 'undefined') {
                  $('#photo-getting-tagged').remove();
                  $('#adentify-upload-modal').hide();
                  $('#adentify-tag-modal').show(0, function() {
                     $('#tag-product input').first().focus();
                  });
                  that.setupSelect2Js();
                  try {
                     var photo = JSON.parse(data.data);
                     $('#ad-wrapper-tag-photo').append('<img id="photo-getting-tagged" style="max-height:' + $('#ad-display-photo').height()
                     + 'px" class="ad-photo-getting-tagged" data-adentify-photo-id="' + photo.id
                     + '" src="' + photo.large_url + '"/>');
                     setTimeout(function() {
                        $('#ad-wrapper-tag-photo').height($('#photo-getting-tagged').height());
                     }, 500);
                     that.removePhotoSelection(1);
                  } catch(e) {
                     console.log(e);
                     console.log("Error: " + data.data); // TODO gestion erreur
                  }
               } else {
                  alert('Impossible de r�cup�rer la photo.');
                  // TOOD: gestion erreur
               }
            },
            complete: function() {
               that.stopLoading();
            }
         });
      }
   },

   setupSelect2Js: function() {
      $("#brand-name").select2({
         placeholder: "Search for a brand",
         minimumInputLength: 1,
         ajax: {
            url: adentifyTagsData.adentify_api_brand_search_url,
            dataType: 'json',
            quietMillis: 250,
            data: function (term, page) {
               return {
                  query: term
               };
            },
            results: function (data, page) {
               return { results: data.data };
            },
            cache: true
         },
         initSelection: function(element, callback) {
            // the input tag has a value attribute preloaded that points to a preselected repository's id
            // this function resolves that id attribute to an object that select2 can render
            // using its formatResult renderer - that way the repository name is shown preselected
            var id = $(element).val();
            if (id !== "") {
               $.ajax(adentifyTagsData.adentify_api_brand_get_url + id, {
                  dataType: "json"
               }).done(function(data) { callback(data); });
            }
         },
         formatResult: this.brandFormatResult, // omitted for brevity, see the source of this page
         formatSelection: this.brandFormatSelection,  // omitted for brevity, see the source of this page
         dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
         escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
      });

      $("#product-name").select2({
	 placeholder: "Search for a product",
	 minimumInputLength: 1,
	 ajax: {
	    url: adentifyTagsData.adentify_api_product_search_url,
	    dataType: 'json',
	    quietMillis: 250,
	    data: function (term, page) {
	       return {
		  query: term
	       };
	    },
	    results: function (data, page) {
	       return { results: data };
	    },
	    cache: true
	 },
	 initSelection: function(element, callback) {
	    // the input tag has a value attribute preloaded that points to a preselected repository's id
	    // this function resolves that id attribute to an object that select2 can render
	    // using its formatResult renderer - that way the repository name is shown preselected
	    var id = $(element).val();
	    if (id !== "") {
	       $.ajax(adentifyTagsData.adentify_api_product_get_url + id, {
		  dataType: "json"
	       }).done(function(data) { callback(data); });
	    }
	 },
	 formatResult: this.productFormatResult, // omitted for brevity, see the source of this page
	 formatSelection: this.productFormatSelection,  // omitted for brevity, see the source of this page
	 dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
	 escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
      });
   },

   brandFormatResult: function(brand) {
      var markup = '<div class="row-fluid">' +
         (brand.medium_logo_url ? '<div class="span2"><img class="small-logo" src="' + brand.medium_logo_url + '" /></div>' : '') +
         '<div class="span10">' + brand.name + '</div>';

      markup += '</div></div>';

      return markup;
   },

   brandFormatSelection: function(brand) {
      return brand.name;
   },

   productFormatResult: function(product) {
      var markup = '<div class="row-fluid">' +
	 (product.medium_url ? '<div class="span2"><img class="small-logo" src="' + product.medium_url + '" /></div>' : '') +
	 '<div class="span10">' + product.name + '</div>';

      markup += '</div></div>';

      return markup;
   },

   productFormatSelection: function(product) {
      return brand.name;
   },

   addTag: function(e) {
      if ($(e.target).hasClass('photo-overlay')) {
         var xPosition = (e.offsetX === undefined ? e.originalEvent.layerX : e.offsetX) / e.currentTarget.clientWidth;
         var yPosition = (e.offsetY === undefined ? e.originalEvent.layerY : e.offsetY) / e.currentTarget.clientHeight;

         // Remove tags aren't persisted
         if (this.tags.length > 0) {
            for (i = 0; i < this.tags.length; i++) {
               if (typeof this.tags[i].temp !== 'undefined')
                  this.tags.splice(i--, 1);
            }
            this.removeTempTagsFromDOM(e.target);
         }

         var tag = {
            'x_position': xPosition,
            'y_position': yPosition,
            'temp': true
         };

         this.currentTagIndex = this.tags.push(tag) - 1;
         this.renderTag(e.target, tag);
      }
   },

   renderTag: function(photoOverlay, tag) {
      $(photoOverlay).find('.tags-container').append('<div class="tag" data-temp-tag="true" style="left: ' + (tag.x_position * 100) + '%; ' +
         'top: ' + tag.y_position * 100 + '%; margin-left: -15px; margin-top: -15px;"></div>');
   },

   removeTempTagsFromDOM: function(photoOverlay) {
      $(photoOverlay).find('.tags-container .tag[data-temp-tag]').remove();
   },

   postTag: function(e) {
      e.preventDefault();

      // Get data from form
      var tagForm = $('#' + $(e.target).context.form.id).serializeArray();

      if (typeof this.currentTagIndex !== 'undefined' && typeof this.tags[this.currentTagIndex] !== 'undefined') {
         var tag = this.tags[this.currentTagIndex];
         var data = {
            'type': $(e.target).context.form.attributes['data-tag-type'].value,
            'title': tagForm.name,
            'description': tagForm.description,
            'link': tagForm.url,
            'photo': $('#photo-getting-tagged').attr('data-adentify-photo-id'),
            'venue': 62
            //'brand': 10,
            //'product': 10,
            //'productType': 10,
            //'person': 10
         };
         $('.submit-tag').hide();
         $('#ad-posting-tag, #ad-uploading-message').show();
         $.extend(tag, data);
         $.ajax({
            type: 'POST',
            url: adentifyTagsData.admin_ajax_url,
            data: {
               'action': 'ad_tag',
               'tag': tag
            },
            complete: function() {
               $('.submit-tag').show();
               $('#ad-posting-tag').hide();
               $('.ad-tag-frame-content input').val('');
               console.log("completed submit-tag-ajax");
            }
         });
      } else {
         alert('Vous devez tout d\'abord ajouter un tag sur l\'image');
         // TODO: gestion erreur
      }
   },

   insertPhotoInPostEditor: function(e) {
      if (!$(e.target).is('[disabled]')) {
         if (typeof this.photoIdSelected !== "undefined" && this.photoIdSelected) {
            window.send_to_editor('[adentify=' + this.photoIdSelected + ']');
            this.removePhotoSelection(0);
            $('#adentify-upload-modal, #adentify-tag-modal').hide();
            $('.ad-tag-frame-content input').val('');
         }
         else
            console.log("you have to select a photo"); // TODO: gestion erreur
      }
   },

   createCORSRequest: function(method, url) {
      var xhr = new XMLHttpRequest();
      if ("withCredentials" in xhr) {
         // XHR for Chrome/Firefox/Opera/Safari.
         xhr.open(method, url, true);
      } else if (typeof XDomainRequest != "undefined") {
         // XDomainRequest for IE.
         xhr = new XDomainRequest();
         xhr.open(method, url);
      } else {
         // CORS not supported.
         xhr = null;
      }
      return xhr;
   },

   /*
    * Init
    * */
   init: function() {
      /*var xhr = this.createCORSRequest('GET', 'https://local.adentify.com/api/v1/brand/search?query=ad');
      if (xhr) {
         *//*xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");*//*
         xhr.setRequestHeader('X-Custom-Header', 'value');
         console.log(xhr.send());

         *//*xhr.send('tagId=' + jQuery(this).data('tag-id') + '&statType=hover');*//*
      }*/

      var that = this;
      // Listen click event on AdEntify button
      var adentifyButton = $('#adentify-upload-img');
      if (adentifyButton.length) {
         adentifyButton.click(function() {
            that.clickOnAdEntifyButton();
         });
      }
   }
};

jQuery(document).ready(function($) {
   // Helpers
   $.fn.serializeObject = function()
   {
      var o = {};
      var a = this.serializeArray();
      $.each(a, function() {
         if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
         } else {
            o[this.name] = this.value || '';
         }
      });
      return o;
   };

   AdEntify.init();
});
