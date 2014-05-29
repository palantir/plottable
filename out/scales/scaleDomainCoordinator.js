///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    var ScaleDomainCoordinator = (function () {
        /**
        * Creates a ScaleDomainCoordinator.
        *
        * @constructor
        * @param {Scale[]} scales A list of scales whose domains should be linked.
        */
        function ScaleDomainCoordinator(scales) {
            var _this = this;
            /* This class is responsible for maintaining coordination between linked scales.
            It registers event listeners for when one of its scales changes its domain. When the scale
            does change its domain, it re-propogates the change to every linked scale.
            */
            this.rescaleInProgress = false;
            this.scales = scales;
            this.scales.forEach(function (s) {
                return s.registerListener(_this, function (sx) {
                    return _this.rescale(sx);
                });
            });
        }
        ScaleDomainCoordinator.prototype.rescale = function (scale) {
            if (this.rescaleInProgress) {
                return;
            }
            this.rescaleInProgress = true;
            var newDomain = scale.domain();
            this.scales.forEach(function (s) {
                return s.domain(newDomain);
            });
            this.rescaleInProgress = false;
        };
        return ScaleDomainCoordinator;
    })();
    Plottable.ScaleDomainCoordinator = ScaleDomainCoordinator;
})(Plottable || (Plottable = {}));
