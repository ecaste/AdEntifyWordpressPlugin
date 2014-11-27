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

   changePopoverPos: function(that, vw) {
      var deferreds = [];
      var i = 0;

      // Create a deferred for all images
      $(that).find('img').each(function() {
         deferreds.push(new $.Deferred());
      });

      // When image is loaded, resolve the next deferred
      $(that).find('img').load(function() {
         if (deferreds.length != 0)
            deferreds[i].resolve();
         i++;
      }).each(function() {
         if(this.complete)
            $(this).load();
      });

      // When all deferreds are done (all images loaded) do some stuff
      $.when.apply(null, deferreds).done(function() {
         $('.tags').css('display', 'block');
         that.css('display', 'block');
         if (vw > 1400)
            that.css({'margin-left': - that.find('.popover-inner').outerWidth() / 2}).css('display', 'none');
         else {
            var popoverInnerWidth = that.find('.popover-inner').outerWidth(true);
            var marginLeft = ($('.tags').outerWidth(true) / 2) - (that.parent().position().left - 15 + that.find('.popover-inner').outerWidth(true) / 2);
            that.css({'margin-left': marginLeft + 'px', 'width': popoverInnerWidth + 'px'}).css('display', 'none');
         }
         $('.tags').css('display', 'none');
      });
   },

   changeAllPopoverPos: function(vw) {
      var that = this;
      $('.adentify-container .popover').each(function() {
         that.changePopoverPos($(this), vw);
      });
   },

   init: function() {
      var that = this;
      this.setupTagsBehavior();
      this.setupEventHandlers();
      $('.adentify-container').each(function() {
         that.postAnalytic('view', 'photo', null, $(this).attr('data-photo-id'));
      });
      that.changeAllPopoverPos($(window).width());
   }
};

jQuery(document).ready(function($) {
   AdEntify.init();
});
