///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Legend = (function (_super) {
        __extends(Legend, _super);
        /**
        * Creates a Legend.
        *
        * @constructor
        * @param {ColorScale} colorScale
        */
        function Legend(colorScale) {
            _super.call(this);
            this.classed("legend", true);
            this.scale(colorScale);
            this.xAlign("RIGHT").yAlign("TOP");
            this.xOffset(5).yOffset(5);
        }
        Legend.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.legendBox = this.content.append("rect").classed("legend-box", true);
            return this;
        };

        Legend.prototype.scale = function (scale) {
            var _this = this;
            if (scale != null) {
                if (this.colorScale != null) {
                    this._deregisterFromBroadcaster(this.colorScale);
                }
                this.colorScale = scale;
                this._registerToBroadcaster(this.colorScale, function () {
                    return _this._invalidateLayout();
                });
                return this;
            } else {
                return this.colorScale;
            }
        };

        Legend.prototype._computeLayout = function (xOrigin, yOrigin, availableWidth, availableHeight) {
            _super.prototype._computeLayout.call(this, xOrigin, yOrigin, availableWidth, availableHeight);
            var textHeight = this.measureTextHeight();
            var totalNumRows = this.colorScale.domain().length;
            this.nRowsDrawn = Math.min(totalNumRows, Math.floor(this.availableHeight / textHeight));
            return this;
        };

        Legend.prototype._requestedSpace = function (offeredWidth, offeredY) {
            var textHeight = this.measureTextHeight();
            var totalNumRows = this.colorScale.domain().length;
            var rowsICanFit = Math.min(totalNumRows, Math.floor(offeredY / textHeight));

            var fakeLegendEl = this.content.append("g").classed(Legend.SUBELEMENT_CLASS, true);
            var fakeText = fakeLegendEl.append("text");
            var maxWidth = d3.max(this.colorScale.domain(), function (d) {
                return Plottable.TextUtils.getTextWidth(fakeText, d);
            });
            fakeLegendEl.remove();
            maxWidth = maxWidth === undefined ? 0 : maxWidth;
            var desiredWidth = maxWidth + textHeight + Legend.MARGIN;
            return {
                width: Math.min(desiredWidth, offeredWidth),
                height: rowsICanFit * textHeight,
                wantsWidth: offeredWidth < desiredWidth,
                wantsHeight: rowsICanFit < totalNumRows
            };
        };

        Legend.prototype.measureTextHeight = function () {
            // note: can't be called before anchoring atm
            var fakeLegendEl = this.content.append("g").classed(Legend.SUBELEMENT_CLASS, true);
            var textHeight = Plottable.TextUtils.getTextHeight(fakeLegendEl.append("text"));
            fakeLegendEl.remove();
            return textHeight;
        };

        Legend.prototype._doRender = function () {
            _super.prototype._doRender.call(this);
            var domain = this.colorScale.domain().slice(0, this.nRowsDrawn);
            var textHeight = this.measureTextHeight();
            var availableWidth = this.availableWidth - textHeight - Legend.MARGIN;
            var r = textHeight - Legend.MARGIN * 2 - 2;
            this.content.selectAll("." + Legend.SUBELEMENT_CLASS).remove(); // hackhack to ensure it always rerenders properly
            var legend = this.content.selectAll("." + Legend.SUBELEMENT_CLASS).data(domain);
            var legendEnter = legend.enter().append("g").classed(Legend.SUBELEMENT_CLASS, true).attr("transform", function (d, i) {
                return "translate(0," + i * textHeight + ")";
            });
            legendEnter.append("circle").attr("cx", Legend.MARGIN + r / 2).attr("cy", Legend.MARGIN + r / 2).attr("r", r);
            legendEnter.append("text").attr("x", textHeight).attr("y", Legend.MARGIN + textHeight / 2);
            legend.selectAll("circle").attr("fill", this.colorScale._d3Scale);
            legend.selectAll("text").text(function (d, i) {
                return Plottable.TextUtils.getTruncatedText(d, availableWidth, d3.select(this));
            });
            return this;
        };
        Legend.SUBELEMENT_CLASS = "legend-row";
        Legend.MARGIN = 5;
        return Legend;
    })(Plottable.Component);
    Plottable.Legend = Legend;
})(Plottable || (Plottable = {}));
