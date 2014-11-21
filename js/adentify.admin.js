/**
 * Created by pierrickmartos on 06/10/2014.
 */
var AdEntifyBO = {

   tag: null,
   tags: [],
   photoIdSelected: null,
   wpPhotoIdSelected: null,
   currentSelectedPhoto: null,
   selectedPhotoClassName: 'ad-selected-photo',
   currentTagIndex: null,

   /*
    * Events handlers`
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
      $('#ad-uploader, #ad-library, #ad-tag-from-library, #ad-insert-from-library, #ad-delete-photo').hide();
      switch(e.target.id) {
         case 'file-library':
            $('#ad-library, #ad-tag-from-library, #ad-insert-from-library, #ad-delete-photo').show();
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
      this.hideOpenedSelect2();
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

   hideOpenedSelect2: function() {
      $('#select2-drop-mask').click();
   },

   clickOnUploaderButton: function() {
       var that = this;
       $('#upload-img').click().fileupload({
         datatype: 'json',
         url: adentifyTagsData.admin_ajax_url,
         formData: {
            'action': 'ad_upload'
         },
         add: function (e, data) {
            $('#ad-uploader-content').hide();
            that.startLoading('uploading-message');
            data.submit();
         },
         success: function (data) {
            that.openPhotoModal(data.data.photo);
            that.appendPhotoToLibrary(data.data.photo, data.data.wp_photo_id);
            that.photoIdSelected = data.data.photo.id;
         },
          complete: function() {
             that.stopLoading('uploading-message');
             $('#ad-uploader-content').show();
          }
      });
   },

   clickOnLibraryPhoto: function(e) {
      if (this.currentSelectedPhoto) {
         this.currentSelectedPhoto.removeClass(this.selectedPhotoClassName);
      }
      this.currentSelectedPhoto = $(e.target);
      this.currentSelectedPhoto.addClass(this.selectedPhotoClassName);
      $('#ad-insert-from-library, #ad-tag-from-library, #ad-delete-photo').removeAttr('disabled');
      this.photoIdSelected = this.currentSelectedPhoto.attr('data-adentify-photo-id');
      this.wpPhotoIdSelected = this.currentSelectedPhoto.attr('data-wp-photo-id');
   },

   clickOnDeletePhoto: function(e) {
      var that = this;
      if (!$(e.target).is('[disabled]') && typeof this.photoIdSelected !== 'undefined' && this.photoIdSelected)
      {
         that.startLoading('tag-from-library');
         $.ajax({
            type: 'GET',
            url: adentifyTagsData.admin_ajax_url,
            data: {
               'action': 'ad_delete_photo',
               'wp_photo_id': that.wpPhotoIdSelected,
               'photo_id': that.photoIdSelected
            },
            complete: function() {
               console.log("photo: " + that.wpPhotoIdSelected + " deleted from wordpress");
               console.log("photo: " + that.photoIdSelected + " deleted from Adentify");
               $('.ad-library-photo-thumbnail:has(.ad-library-photo-wrapper[data-wp-photo-id="' + that.wpPhotoIdSelected + '"])').remove();
               that.removePhotoSelection(false);
               that.stopLoading('tag-from-library');
            }
         });
      }
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
      $('#submit-tag-product, #submit-tag-venue, #submit-tag-person').click($.proxy(this.retrieveTagData, this));

      // delete a tag
      $('div').on('click', '.ad-delete-tag', $.proxy(this.removeTag, this));

      // Store the id of the selected photo and enabled the buttons
      $('.ad-library-photo-wrapper').on('click', $.proxy(this.clickOnLibraryPhoto, this));

      // show the tag modal with the selected photo
      $('#ad-tag-from-library').click($.proxy(this.getPhoto, this));

      // insert a photo in the post editor
      $('#ad-insert-from-library, #ad-insert-after-tag').click($.proxy(this.insertPhotoInPostEditor, this));

      // "back" button on the tag modal
      $('#ad-back-to-library').click($.proxy(this.backToMainModal, this));

      // delete a photo
      $('#ad-delete-photo').click($.proxy(this.clickOnDeletePhoto, this));
   },

   /*
    * Other methods
    */
   removePhotoSelection: function(needId) {
      $('.ad-library-photo-wrapper[data-adentify-photo-id=' + this.photoIdSelected +']').removeClass(this.selectedPhotoClassName);
      if (needId === false) {
         this.photoIdSelected = undefined;
         this.wpPhotoIdSelected = undefined;
      }
      $('#ad-insert-from-library, #ad-tag-from-library, #ad-delete-photo').attr('disabled', 'disabled');
   },

   renderModals: function() {
      $('body').append('<div id="adentify-upload-modal"></div>').append('<div id="adentify-tag-modal"></div>');
      $('#adentify-upload-modal').html($('#adentify-uploader').html());
      $('#adentify-tag-modal').hide().html($('#adentify-tag-modal-template').html());
      $('#ad-tag-from-library, #ad-insert-from-library, #ad-delete-photo').hide();
      this.stopLoading('uploading-message');
   },

   closeModals: function() {
      $('#adentify-upload-modal').hide(0, function() {
         $('#ad-uploader-content').show();
      });
      $('#adentify-tag-modal').hide();
      this.removePhotoSelection(false);
      $('.ad-tag-frame-content input').val('');
      this.removeTempTagsFromDOM($('.photo-overlay'));
      this.removeTagsFromDOM($('.photo-overlay'));
   },

   backToMainModal: function() {
      this.hideOpenedSelect2();
      $('#adentify-tag-modal').hide();
      $('#ad-uploader-content, #adentify-upload-modal').show();
      $('#__wp-uploader-id-2').focus();
      this.resetForms();
      this.removeTempTagsFromDOM($('.photo-overlay'));
      this.removeTagsFromDOM($('.photo-overlay'));
   },

   startLoading: function(loader, tagId) {
      switch (loader) {
         case 'tag-from-library':
            $('#ad-tag-from-library-loading').show();
            break;
         case 'uploading-message':
            $('#ad-uploading-message').show();
            break;
         case 'remove-tag':
            $('#ad-remove-tag-loader-' + tagId).show();
            break;
         case 'posting-tag':
         default:
            $('#ad-posting-tag-person, #ad-posting-tag-product, #ad-posting-tag-venue').show();
            break;
      }
   },

   stopLoading: function(loader, tagId) {
      switch (loader) {
         case 'tag-from-library':
            $('#ad-tag-from-library-loading').hide();
            break;
         case 'uploading-message':
            $('#ad-uploading-message').hide();
            break;
         case 'remove-tag':
            $('.ad-remove-tag-loader-' + tagId).hide();
            break;
         case 'posting-tag':
         default:
            $('#ad-posting-tag-person, #ad-posting-tag-product, #ad-posting-tag-venue').hide();
            break;
      }
   },

   appendPhotoToLibrary: function(photo, wp_photo_id) {
      var that = this;
      try {
         that.wpPhotoIdSelected = wp_photo_id;
         var thumbnail = '<div class="ad-library-photo-wrapper" data-wp-photo-id="' + that.wpPhotoIdSelected + '" data-adentify-photo-id="' + photo.id + '" style="background-image: url(' + photo.small_url + ')"></div>';
         var wrapper = '<li class="ad-library-photo-thumbnail">' + thumbnail + '</li>';
         $('#ad-library-list').append(wrapper);
         $('.ad-library-photo-wrapper[data-adentify-photo-id="' + photo.id + '"]').click(function() {
            if (that.currentSelectedPhoto) {
               that.currentSelectedPhoto.removeClass(that.selectedPhotoClassName);
            }
            that.currentSelectedPhoto = $(this);
            that.currentSelectedPhoto.addClass(that.selectedPhotoClassName);
            $('#ad-insert-from-library, #ad-tag-from-library, #ad-delete-photo').removeAttr('disabled');
            that.photoIdSelected = that.currentSelectedPhoto.attr('data-adentify-photo-id');
            that.wpPhotoIdSelected = that.currentSelectedPhoto.attr('data-wp-photo-id');
         });
      } catch(e) {
         console.log("Error appending photo to library: ");
         console.log(e);
      }
   },

   openPhotoModal: function(data) {
      $('#photo-getting-tagged').remove();
      $('#adentify-upload-modal').hide();
      $('#adentify-tag-modal').show(0, function() {
         $('#tag-product input').first().focus();
      });
      try {
         var that = this;
         var photo = data;
         photo.tags.forEach(function(tag) {
            that.renderTag($('.photo-overlay'), tag);
         });
         this.setupTagForms();
         var maxHeight = $('#ad-display-photo').height();

         $('#ad-wrapper-tag-photo').append('<img id="photo-getting-tagged" style="max-height:' + maxHeight
         + 'px" class="ad-photo-getting-tagged" data-wp-photo-id="' + this.wpPhotoIdSelected + '" data-adentify-photo-id="' + photo.id
         + '" src="' + photo.large_url + '"/>');
         (photo.large_height > maxHeight) ? $('#ad-wrapper-tag-photo').height(maxHeight) : $('#ad-wrapper-tag-photo').height(photo.large_height);
      } catch(e) {
         console.log(e);
         console.log("Error: " + data); // TODO gestion erreur
      }
   },

   getPhoto: function(e) {
      var that = this;
      if (!$(e.target).is('[disabled]') && typeof this.photoIdSelected !== 'undefined' && this.photoIdSelected) {
         that.startLoading('tag-from-library');
         $.ajax({
            type: 'GET',
            url: adentifyTagsData.admin_ajax_url,
            dataType: 'json',
            data: {
               'action': 'ad_get_photo',
               'photo_id': that.photoIdSelected
            },
            success: function(data) {
               if (typeof data !== 'undefined')
                  that.openPhotoModal(data);
               else
                  alert('Impossible de recuperer la photo'); // TODO: gestion erreur
               that.removePhotoSelection(true);
            },
            complete: function() {
               that.stopLoading('tag-from-library');
            }
         });
      }
   },

   setupAutocomplete: function(selector, placeholder, formatResult, formatSelection, searchUrl, getUrl, tagFormField,
                               enableCreateSearchChoice, extraQueryParams) {
      enableCreateSearchChoice = enableCreateSearchChoice || true;
      tagFormField = tagFormField || [];
      extraQueryParams = extraQueryParams || [];

      var select2Parameters = {
         placeholder: placeholder,
         minimumInputLength: 1,
         ajax: {
            id: function(e) { return typeof e.id !== 'undefined' ? e.id : e.foursquare_id; },
            url: searchUrl,
            dataType: 'json',
            quietMillis: 250,
            data: function (term, page) {
               var queryParams = {
                  query: term
               };
               $.extend(queryParams, extraQueryParams);

               return queryParams;
            },
            results: function (data, page) {
               return { results: (typeof data.data !== 'undefined' ? data.data : data) };
            },
            cache: true,
               transport: function(params) {
               params.beforeSend = function(request){
                  request.setRequestHeader("Authorization", 'Bearer ' + adentifyTagsData.adentify_api_access_token);
               };
               return $.ajax(params);
            }
         },
         initSelection: function(element, callback) {
            var id = $(element).val();
            if (id !== "") {
               $.ajax(getUrl + id, {
                  dataType: "json"
               }).done(function(data) { callback(data); });
            }
         },
         formatResult: formatResult,
         formatSelection: formatSelection,
         dropdownCssClass: "bigdrop",
         escapeMarkup: function (m) { return m; }
      };
      if (enableCreateSearchChoice) {
         $.extend(select2Parameters, {
            createSearchChoice: function(term) {
               return {
                  id: 0,
                  'name': term
               }
            },
            createSearchChoicePosition: 'bottom'
         });
      }
      $(selector).select2(select2Parameters).on('select2-selecting', function(e) {
         tagFormField.forEach(function(entry) {
            if (typeof entry.isSelect2 !== 'undefined' && entry.isSelect2) {
               $(entry.fieldSelector).select2('data', e.choice[entry.propertyName]);
            } else
               $(entry.fieldSelector).val(e.choice[entry.propertyName]);
         });
      });
   },

   setupTagForms: function() {
      var that = this;
      // Setup autocomplete with Select2.js
      this.setupAutocomplete('#brand-name', 'Search for a brand', function(item) { return that.genericFormatResult(item); },
         function(item) { return that.genericFormatSelection(item); }, adentifyTagsData.adentify_api_brand_search_url, adentifyTagsData.adentify_api_brand_get_url);

      this.setupAutocomplete('#product-name', 'Search for a product', function(item) { return that.genericFormatResult(item, 'medium_url'); },
         function(item) { return that.genericFormatSelection(item); }, adentifyTagsData.adentify_api_product_search_url,
         adentifyTagsData.adentify_api_product_get_url, [
            {
               fieldSelector: '#product-description',
               propertyName: 'description'
            },
            {
               fieldSelector: '#product-url',
               propertyName: 'purchase_url'
            },
            {
               fieldSelector: '#brand-name',
               propertyName: 'brand',
               isSelect2: true
            }
         ], true, {
            'providers': 'adentify+shopsense'
         });

      this.setupAutocomplete('#venue-name', 'Search for a venue', function(item) { return that.genericFormatResult(item); },
         function(item) { return that.genericFormatSelection(item); }, adentifyTagsData.adentify_api_venue_search_url,
         adentifyTagsData.adentify_api_venue_get_url, [
            {
               fieldSelector: '#venue-description',
               propertyName: 'description'
            },
            {
               fieldSelector: '#venue-url',
               propertyName: 'link'
            }
         ]);

      this.setupAutocomplete('#person-name', 'Search for a person', function(item) { return that.genericFormatResult(item, null, [ 'firstname', 'lastname' ]); },
         function(item) { return that.genericFormatSelection(item, [ 'firstname', 'lastname' ]); }, adentifyTagsData.adentify_api_person_search_url,
         adentifyTagsData.adentify_api_person_get_url, [
            {
               fieldSelector: '#person-url',
               propertyName: 'link'
            }
         ]);
   },

   genericFormatResult: function(item, imageKey, nameKey) {
      imageKey = imageKey || 'medium_logo_url';
      nameKey = nameKey || 'name';
      var markup = '<div class="row-fluid">' +
         (typeof item[imageKey] !== 'undefined' ? '<div class="span2"><img class="small-logo" src="' + item[imageKey] + '" /></div>' : '');

      markup += '<div class="span10">' + (nameKey instanceof Array ? this.implodeObject(item, nameKey) : item[nameKey]) + '</div>';
      markup += '</div></div>';

      return markup;
   },

   genericFormatSelection: function(item, key) {
      key = key || 'name';
      if (key instanceof Array) {
         return this.implodeObject(item, key);
      } else
         return item[key];
   },

   implodeObject: function(object, keys) {
      var implodedString = [];
      keys.forEach(function(key) {
         implodedString.push(object[key]);
      });
      return implodedString.join(' ');
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
      $(photoOverlay).find('.tags-container').append('<div class="' + adentifyTagsData.tag_shape +
         ' tag" ' + (typeof tag.temp !== 'undefined' ? 'data-temp-tag="true"' : '') + ' style="left: ' + (tag.x_position * 100) + '%; ' +
         'top: ' + tag.y_position * 100 + '%; margin-left: -15px; margin-top: -15px;">' +
         ((typeof tag.id !== 'undefined') ? '<div class="popover"><div class="popover-inner">' +
         ((typeof tag.title !== 'undefined') ? '<p class="title">' + tag.title + '</p>' : '') +
         ((typeof tag.description !== 'undefined') ? '<p class="tag-description">' + tag.description + '</p>' : '') +
         '<div data-tag-id="' + tag.id + '" class="ad-delete-tag button button-primary button-large media-button-insert">Supprimer le tag</div>' +
         '<div id="ad-remove-tag-loader-' + tag.id + '" class="loading-gif-container ad-delete-loader" style="display: none">' +
         '<div class="loader rotate"><div class="loading-gif"></div></div></div>' +
         '</div>' : '') + '</div></div>');
   },

   removeTempTagsFromDOM: function(photoOverlay) {
      $(photoOverlay).find('.tags-container .tag[data-temp-tag]').remove();
   },

   removeTagsFromDOM: function(photoOverlay) {
      $(photoOverlay).find('div .tag').remove();
   },

   removeTag: function(e) {
      var that = this;
      that.startLoading('remove-tag', e.target.attributes['data-tag-id'].value);
      $.ajax({
         type: 'GET',
         url: adentifyTagsData.admin_ajax_url,
         data: {
            'action': 'ad_remove_tag',
            'tag_id': e.target.attributes['data-tag-id'].value
         },
         complete: function() {
            console.log("tag removed");
            $('div .tag:has([data-tag-id="' + e.target.attributes['data-tag-id'].value + '"])').remove();
            that.stopLoading('remove-tag', e.target.id);
         }
      });
      return(false);
   },

   /*
   * Get value from select2
   *
   * options.array: array of select2 to retrieve with selector name and target object property name
   * options.properties: target object properties
   * options.fail: callback when failed
   * options.success: callback when all good
   * */
   getValuesFromSelect2: function(options) {
      var that = this;
      options.array.forEach(function(item) {
         var value;
         if (typeof item.objectProperty !== 'undefined') {
            var data = $(item.select2Selector).select2('data');
            value = that.implodeObject(data, item.objectProperty);
         } else
            value = $(item.select2Selector).select2('val');

         if (typeof value !== 'undefined' && value && value != "0") {
            options.properties[item.propertyName] = value;
         }
         else if ((value == 0 || value == '0') && typeof item.createIfNotExists) {
            if (typeof options.properties.extraData === 'undefined')
               options.properties.extraData = {};

            var data = $(item.select2Selector).select2('data');
            options.properties.extraData[item.propertyName] = data;
         }
         else {
            options.fail();
            return;
         }
      });

      options.success();
   },

   retrieveTagData: function(e) {
      e.preventDefault();
      var that = this;

      if (typeof this.currentTagIndex !== 'undefined' && typeof this.tags[this.currentTagIndex] !== 'undefined') {
         // Get data from form
         var tagForm = $('#' + $(e.target).context.form.id).serializeObject();
         var tag = this.tags[this.currentTagIndex];

         var properties = {
            'type': $(e.target).context.form.attributes['data-tag-type'].value,
            'description': tagForm.description,
            'link': tagForm.url,
            'photo': $('#photo-getting-tagged').attr('data-adentify-photo-id')
         };

         switch ($(e.target).context.form.attributes['data-tag-type'].value) {
            case 'place':
               this.getValuesFromSelect2({
                  array: [
                     {
                        propertyName: 'title',
                        select2Selector: '#venue-name',
                        objectProperty: [ 'name' ]
                     },
                     {
                        propertyName: 'venue',
                        select2Selector: '#venue-name',
                        createIfNotExists: true
                     }
                  ],
                  properties: properties,
                  success: function() {
                     that.postTag($.extend(tag, properties));
                  },
                  fail: function () {
                     alert('Please select a venue before adding'); // TODO: gestion erreur
                  }
               });
               break;
            case 'product':
               this.getValuesFromSelect2({
                  array: [
                     {
                        propertyName: 'product',
                        select2Selector: '#product-name'
                     },
                     {
                        propertyName: 'title',
                        select2Selector: '#product-name',
                        objectProperty: [ 'name' ]
                     },
                     {
                        propertyName: 'brand',
                        select2Selector: '#brand-name'
                     }
                  ],
                  properties: properties,
                  success: function() {
                     that.postTag($.extend(tag, properties));
                  },
                  fail: function () {
                     alert('Please select a product and a brand before adding'); // TODO: gestion erreur
                  }
               });
               break;
            case 'person':
               this.getValuesFromSelect2({
                  array: [
                     {
                        propertyName: 'title',
                        select2Selector: '#person-name',
                        objectProperty: [ 'firstname', 'lastname' ]
                     },
                     {
                        propertyName: 'person',
                        select2Selector: '#person-name'
                     }
                  ],
                  properties: properties,
                  success: function() {
                     that.postTag($.extend(tag, properties));
                  },
                  fail: function () {
                     alert('Please select a person before adding'); // TODO: gestion erreur
                  }
               });
               break;
         }
      } else {
         alert('Vous devez tout d\'abord ajouter un tag sur l\'image');
         // TODO: gestion erreur
      }
   },

   resetForms: function() {
      $('.ad-tag-frame-content textarea, .ad-tag-frame-content input').each(function(index, element) {
         $(element).val('');
      });
      $('#product-name, #venue-name, #brand-name, #person-name').select2('data', null);
   },

   postTag: function(tag) {
      var that = this;
      $('.submit-tag').hide();
      that.startLoading('posting-tag');
      $.ajax({
         type: 'POST',
         url: adentifyTagsData.admin_ajax_url,
         data: {
            'action': 'ad_tag',
            'tag': tag
         },
         success: function(data) {
            that.resetForms();
            that.renderTag($('.photo-overlay'), JSON.parse(data));
            that.removeTempTagsFromDOM($('.photo-overlay'));
            // TODO: append popover to tag
         },
         complete: function() {
            $('.submit-tag').show();
            that.stopLoading('posting-tag');
         }
      });
   },

   insertPhotoInPostEditor: function(e) {
      if (!$(e.target).is('[disabled]')) {
         if (typeof this.photoIdSelected !== "undefined" && this.photoIdSelected) {
            window.send_to_editor('[adentify=' + this.photoIdSelected + ']');
            this.closeModals();
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
      /*var xhr = this.createCORSRequest('GET', adentifyTagsData.adentify_api_brand_search_url + '?query=ad');
      if (xhr) {
         xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
         xhr.setRequestHeader('X-Custom-Header', 'value');
         xhr.send();
         //'tag=1&action=hover&element=tag&platform=wordpress&user=1'
      }

      xhr = this.createCORSRequest('POST', adentifyTagsData.adentify_api_analytics_post_url);
      if (xhr) {
         xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
         xhr.setRequestHeader('X-Custom-Header', 'value');
         xhr.send('tag=1&action=hover&element=tag&platform=wordpress&user=1');
         //'tag=1&action=hover&element=tag&platform=wordpress&user=1'
      }*/

     /* var xhr = this.createCORSRequest('POST', adentifyTagsData.adentify_api_analytics_post_url);
      if (xhr) {
         xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
         xhr.setRequestHeader('X-Custom-Header', 'value');
         xhr.send($.param({
            'analytic': {
               'platform': 'wordpress',
               'action': 'hover',
               'element': 'photo',
               'photo': 164,
               'user': 1
            }
         }));

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

      /*$.ajax({
         url: adentifyTagsData.adentify_api_analytics_post_url,
         type: 'POST',
         xhrFields: {
            withCredentials: true
         },
         contentType: 'text/plain',
         crossDomain: true,
         headers: {
            'X-Custom-Header': 'value',
            'Authorization': 'Bearer ' + adentifyTagsData.adentify_api_access_token
         },
         data: {
            'analytic': {
               'platform': 'wordpress',
               'action': 'hover',
               'element': 'photo',
               'photo': 164,
               'user': 1
            }
         }
      });*/
   }
};

jQuery(document).ready(function($) {
   // Helpers
   jQuery.fn.extend({
      serializeObject: function()
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
      }
   });

   AdEntifyBO.init();
});
