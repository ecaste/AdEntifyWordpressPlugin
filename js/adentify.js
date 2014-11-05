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

   init: function() {
      this.setupTagsBehavior();
   }
};

jQuery(document).ready(function($) {
   AdEntify.init();
});
