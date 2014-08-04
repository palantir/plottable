/*!
 * application.js - Plottable.
 * Takashi Okamoto <tokamoto@palantir.com>
 *
 * Copyright 2014 Palantir Technologies.
 */

// Modernizr tests
Modernizr.addTest('retina', function() {
  if (window.matchMedia) {
    var mq = window.matchMedia("only screen and (-moz-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
    return mq && mq.matches;
  }
});

(function(window, document, undefined) {
  'use strict';
  var $window = $(window)

  // vertical pager
  var VerticalPager = function($sections) {
    this.$sections = $sections;
    this.$currentSection = null;
    this.isPaging = false;
    this.pageDelay = 1200;
  };
  VerticalPager.prototype = {

    init: function() {
      if (typeof this.initialized === 'undefined') {
        this.initialized = true;
        this.$currentSection = this.getCurrentSection();
        this.$lastSection = this.$sections.last();
      } else {
        console.log('Already initialized VerticalPager.');
      }
    },

    gotoSection: function($section) {
      if ($section != this.$currentSection && !this.isPaging) {
        this.isPaging = true;
        $('html body').animate({ scrollTop: $section.offset().top }, $.proxy(function() {
          window.setTimeout($.proxy(function() {
            this.isPaging = false;
          }, this), this.pageDelay);
          this.$currentSection = $section;
        }, this));
      }
    },

    getCurrentSection: function() {
      for (var i = 0, len = this.$sections.length; i < len; ++i) {
        var elem = this.$sections.get(i),
            $elem = $(elem);
        if ($window.scrollTop() <= $elem.offset().top) {
          return $elem;
        }
      }
      return null;
    }
  };
  window.VerticalPager = VerticalPager;


  $(function() {
    $('[data-toggle="tooltip"]').tooltip();
  });
})(window, window.document);
