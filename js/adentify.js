/**
 * Created by pierrickmartos on 05/11/14.
 */
var AdEntify = {
   setupTagsBehavior: function() {
      $('.adentify-container[data-tags-visibility="visible-on-hover"]').hover(function() {
         $(this).find('.tags').fadeIn();
      }, function() {
         $(this).find('.tags').fadeOut();
      });
   },

   setupEventHandlers: function() {
      var that = this;
      $('.adentify-container').hover(function() {
         that.postAnalytic('hover', 'photo', null, $(this).attr('data-photo-id'));
      }, function() {});
      $('.adentify-container .tag').hover(function() {
         that.postAnalytic('hover', 'tag', $(this).attr('data-tag-id'), null);
      }, function() {});
      $('.adentify-container .tag a').click(function() {
         that.postAnalytic('click', 'tag', $(this).attr('data-tag-id'), null);
      });
   },

   postAnalytic: function(action, element, tag, photo) {
      var analytic = {
         'platform': 'wordpress',
         'element': element,
         'action': action
      };
      if (tag)
         analytic.tag = tag;
      if (photo)
         analytic.photo = photo;

      $.ajax({
         type: 'POST',
         url: adentifyTagsData.admin_ajax_url,
         data: {
            'action': 'ad_analytics',
            'analytic': analytic
         }
      });
   },

   changePopoverPos: function(that) {
      var deferreds = [];
      var i = 0;

      // Create a deferred for all images
      $(that).find('img').each(function() {
         deferreds.push(new $.Deferred());
      });

      // When image is loaded, resolve the next deferred
      $(that).find('img').load(function() {
         deferreds[i].resolve();
         i++;
      }).each(function() {
         if(this.complete)
            $(this).load();
      });

      // When all deferreds are done (all images loaded) do some stuff
      $.when.apply(null, deferreds).done(function() {
         that.css('display', 'block').css({'margin-left': - that.find('.popover-inner').outerWidth() / 2}).css('display', 'none');
      });
   },

   changeAllPopoverPos: function() {
      var that = this;
      $('.adentify-container .popover').each(function() {
         that.changePopoverPos($(this));
      });
   },

   init: function() {
      var that = this;
      this.setupTagsBehavior();
      this.setupEventHandlers();
      $('.adentify-container').each(function() {
         that.postAnalytic('view', 'photo', null, $(this).attr('data-photo-id'));
      });
      if ($(window).width() > 1400)
         that.changeAllPopoverPos();
   }
};

jQuery(document).ready(function($) {
   AdEntify.init();
});
