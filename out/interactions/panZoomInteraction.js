///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var PanZoomInteraction = (function (_super) {
        __extends(PanZoomInteraction, _super);
        /**
        * Creates a PanZoomInteraction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for interactions on.
        * @param {QuantitiveScale} xScale The X scale to update on panning/zooming.
        * @param {QuantitiveScale} yScale The Y scale to update on panning/zooming.
        */
        function PanZoomInteraction(componentToListenTo, xScale, yScale) {
            var _this = this;
            _super.call(this, componentToListenTo);
            this.xScale = xScale;
            this.yScale = yScale;
            this.zoom = d3.behavior.zoom();
            this.zoom.x(this.xScale._d3Scale);
            this.zoom.y(this.yScale._d3Scale);
            this.zoom.on("zoom", function () {
                return _this.rerenderZoomed();
            });
        }
        PanZoomInteraction.prototype.resetZoom = function () {
            var _this = this;
            // HACKHACK #254
            this.zoom = d3.behavior.zoom();
            this.zoom.x(this.xScale._d3Scale);
            this.zoom.y(this.yScale._d3Scale);
            this.zoom.on("zoom", function () {
                return _this.rerenderZoomed();
            });
            this.zoom(this.hitBox);
        };

        PanZoomInteraction.prototype._anchor = function (hitBox) {
            _super.prototype._anchor.call(this, hitBox);
            this.zoom(hitBox);
        };

        PanZoomInteraction.prototype.rerenderZoomed = function () {
            // HACKHACK since the d3.zoom.x modifies d3 scales and not our TS scales, and the TS scales have the
            // event listener machinery, let's grab the domain out of the d3 scale and pipe it back into the TS scale
            var xDomain = this.xScale._d3Scale.domain();
            var yDomain = this.yScale._d3Scale.domain();
            this.xScale.domain(xDomain);
            this.yScale.domain(yDomain);
        };
        return PanZoomInteraction;
    })(Plottable.Interaction);
    Plottable.PanZoomInteraction = PanZoomInteraction;
})(Plottable || (Plottable = {}));
