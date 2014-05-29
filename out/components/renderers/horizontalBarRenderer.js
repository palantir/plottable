///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var HorizontalBarRenderer = (function (_super) {
        __extends(HorizontalBarRenderer, _super);
        /**
        * Creates a HorizontalBarRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {QuantitiveScale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        function HorizontalBarRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset, xScale, yScale);
            this._barAlignment = "top";
        }
        HorizontalBarRenderer.prototype._paint = function () {
            var _this = this;
            _super.prototype._paint.call(this);
            this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data());
            this.dataSelection.enter().append("rect");

            var attrToProjector = this._generateAttrToProjector();

            var yFunction = attrToProjector["y"];

            attrToProjector["height"] = attrToProjector["width"]; // remapping due to naming conventions
            var heightFunction = attrToProjector["height"];

            var castYScale = this.yScale;
            var rangeType = (castYScale.rangeType == null) ? "points" : castYScale.rangeType();
            if (rangeType === "points") {
                if (this._barAlignment === "middle") {
                    attrToProjector["y"] = function (d, i) {
                        return yFunction(d, i) - heightFunction(d, i) / 2;
                    };
                } else if (this._barAlignment === "bottom") {
                    attrToProjector["y"] = function (d, i) {
                        return yFunction(d, i) - heightFunction(d, i);
                    };
                }
            } else {
                attrToProjector["height"] = function (d, i) {
                    return castYScale.rangeBand();
                };
            }

            var scaledBaseline = this.xScale.scale(this._baselineValue);

            var xFunction = attrToProjector["x"];

            if (this._animate && this._dataChanged) {
                attrToProjector["x"] = function () {
                    return scaledBaseline;
                };
                attrToProjector["width"] = function () {
                    return 0;
                };
                this.dataSelection.attr(attrToProjector);
            }

            attrToProjector["x"] = function (d, i) {
                var originalX = xFunction(d, i);
                return (originalX > scaledBaseline) ? scaledBaseline : originalX;
            };

            var widthFunction = function (d, i) {
                return Math.abs(scaledBaseline - xFunction(d, i));
            };
            attrToProjector["width"] = widthFunction; // actual SVG rect width

            if (attrToProjector["fill"] != null) {
                this.dataSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
            }

            var updateSelection = this.dataSelection;
            if (this._animate) {
                var n = this.dataSource().data().length;
                updateSelection = updateSelection.transition().delay(function (d, i) {
                    return i * _this._ANIMATION_DURATION / n;
                });
            }

            updateSelection.attr(attrToProjector);
            this.dataSelection.exit().remove();

            this._baseline.attr({
                "x1": scaledBaseline,
                "y1": 0,
                "x2": scaledBaseline,
                "y2": this.availableHeight
            });
        };

        /**
        * Sets the vertical alignment of the bars.
        *
        * @param {string} alignment Which part of the bar should align with the bar's x-value (top/middle/bottom).
        * @return {HorizontalBarRenderer} The calling HorizontalBarRenderer.
        */
        HorizontalBarRenderer.prototype.barAlignment = function (alignment) {
            var alignmentLC = alignment.toLowerCase();
            if (alignmentLC !== "top" && alignmentLC !== "middle" && alignmentLC !== "bottom") {
                throw new Error("unsupported bar alignment");
            }

            this._barAlignment = alignmentLC;
            if (this.element != null) {
                this._render();
            }
            return this;
        };
        return HorizontalBarRenderer;
    })(Plottable.AbstractBarRenderer);
    Plottable.HorizontalBarRenderer = HorizontalBarRenderer;
})(Plottable || (Plottable = {}));
