///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Gridlines = (function (_super) {
        __extends(Gridlines, _super);
        /**
        * Creates a set of Gridlines.
        * @constructor
        *
        * @param {QuantitiveScale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
        * @param {QuantitiveScale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
        */
        function Gridlines(xScale, yScale) {
            var _this = this;
            _super.call(this);
            this.classed("gridlines", true);
            this.xScale = xScale;
            this.yScale = yScale;
            if (this.xScale != null) {
                this._registerToBroadcaster(this.xScale, function () {
                    return _this._render();
                });
            }
            if (this.yScale != null) {
                this._registerToBroadcaster(this.yScale, function () {
                    return _this._render();
                });
            }
        }
        Gridlines.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.xLinesContainer = this.content.append("g").classed("x-gridlines", true);
            this.yLinesContainer = this.content.append("g").classed("y-gridlines", true);
            return this;
        };

        Gridlines.prototype._doRender = function () {
            _super.prototype._doRender.call(this);
            this.redrawXLines();
            this.redrawYLines();
            return this;
        };

        Gridlines.prototype.redrawXLines = function () {
            var _this = this;
            if (this.xScale != null) {
                var xTicks = this.xScale.ticks();
                var getScaledXValue = function (tickVal) {
                    return _this.xScale.scale(tickVal);
                };
                var xLines = this.xLinesContainer.selectAll("line").data(xTicks);
                xLines.enter().append("line");
                xLines.attr("x1", getScaledXValue).attr("y1", 0).attr("x2", getScaledXValue).attr("y2", this.availableHeight);
                xLines.exit().remove();
            }
        };

        Gridlines.prototype.redrawYLines = function () {
            var _this = this;
            if (this.yScale != null) {
                var yTicks = this.yScale.ticks();
                var getScaledYValue = function (tickVal) {
                    return _this.yScale.scale(tickVal);
                };
                var yLines = this.yLinesContainer.selectAll("line").data(yTicks);
                yLines.enter().append("line");
                yLines.attr("x1", 0).attr("y1", getScaledYValue).attr("x2", this.availableWidth).attr("y2", getScaledYValue);
                yLines.exit().remove();
            }
        };
        return Gridlines;
    })(Plottable.Component);
    Plottable.Gridlines = Gridlines;
})(Plottable || (Plottable = {}));
