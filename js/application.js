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
  $(function() {
    $('[data-toggle="tooltip"]').tooltip();
  });
})(window, window.document);
