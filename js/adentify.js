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
      var photoEnterTime = {};
      var tagEnterTime = {};
      $('.adentify-container').hover(function() {
         photoEnterTime[$(this).attr('data-photo-id')] = Date.now();
         that.postAnalytic('hover', 'photo', null, $(this).attr('data-photo-id'));
      }, function() {
         if (photoEnterTime[$(this).attr('data-photo-id')]) {
            var interactionTime = Date.now() - photoEnterTime[$(this).attr('data-photo-id')];
            if (interactionTime > 200)
               that.postAnalytic('interaction', 'photo', null, $(this).attr('data-photo-id'), null, interactionTime)
         }
      });
      $('.adentify-container .tag').hover(function() {
         tagEnterTime[$(this).attr('data-tag-id')] = Date.now();
         that.postAnalytic('hover', 'tag', $(this).attr('data-tag-id'), null);
      }, function() {
         if (tagEnterTime[$(this).attr('data-tag-id')]) {
            var interactionTime = Date.now() - tagEnterTime[$(this).attr('data-tag-id')];
            if (interactionTime > 200)
               that.postAnalytic('interaction', 'tag', $(this).attr('data-tag-id'), null, null, interactionTime)
         }
      });
      $('.adentify-container .tag a').click(function() {
         var $tag = $(this).parents('.tag');
         if ($tag.length) {
            that.postAnalytic('click', 'tag', $tag.attr('data-tag-id'), null, $(this).attr('href'));
         }
      });
   },

   postAnalytic: function(action, element, tag, photo, link, actionValue) {
      var analytic = {
         'platform': 'wordpress',
         'element': element,
         'action': action,
         'sourceUrl': window.location.href
      };
      if (tag)
         analytic.tag = tag;
      if (photo)
         analytic.photo = photo;
      if (link)
         analytic.link = link;
      if (actionValue)
         analytic.actionValue = actionValue;

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
         if (that.parentsUntil('.ad-post-container', '.adentify-container').attr('data-tags-visibility') == 'visible-on-hover')
            $('.tags').css('display', 'block');
         that.css('display', 'block');
         if (vw > 1400)
            that.css({'margin-left': - that.find('.popover-inner').outerWidth() / 2}).css('display', 'none');
         else {
            var popoverInnerWidth = that.find('.popover-inner').outerWidth(true);
            var marginLeft = ($('.tags').outerWidth(true) / 2) - (that.parent().position().left - 15 + that.find('.popover-inner').outerWidth(true) / 2);
            that.css({'margin-left': marginLeft + 'px', 'width': popoverInnerWidth + 'px'}).css('display', 'none');
         }
         if (that.parentsUntil('.ad-post-container', '.adentify-container').attr('data-tags-visibility') == 'visible-on-hover')
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
      if (!Date.now) {
         Date.now = function() { return new Date().getTime(); };
      }
   }
};

jQuery(document).ready(function($) {
   AdEntify.init();
});
