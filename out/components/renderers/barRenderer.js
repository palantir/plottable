///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var BarRenderer = (function (_super) {
        __extends(BarRenderer, _super);
        /**
        * Creates a BarRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {QuantitiveScale} yScale The y scale to use.
        */
        function BarRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset, xScale, yScale);
            this._barAlignment = "left";
        }
        BarRenderer.prototype._paint = function () {
            var _this = this;
            _super.prototype._paint.call(this);
            var scaledBaseline = this.yScale.scale(this._baselineValue);

            this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data());
            this.dataSelection.enter().append("rect");

            var attrToProjector = this._generateAttrToProjector();

            var xF = attrToProjector["x"];
            var widthF = attrToProjector["width"];

            var castXScale = this.xScale;
            var rangeType = (castXScale.rangeType == null) ? "points" : castXScale.rangeType();

            if (rangeType === "points") {
                if (this._barAlignment === "center") {
                    attrToProjector["x"] = function (d, i) {
                        return xF(d, i) - widthF(d, i) / 2;
                    };
                } else if (this._barAlignment === "right") {
                    attrToProjector["x"] = function (d, i) {
                        return xF(d, i) - widthF(d, i);
                    };
                }
            } else {
                attrToProjector["width"] = function (d, i) {
                    return castXScale.rangeBand();
                };
            }

            var yFunction = attrToProjector["y"];

            if (this._animate && this._dataChanged) {
                attrToProjector["y"] = function () {
                    return scaledBaseline;
                };
                attrToProjector["height"] = function () {
                    return 0;
                };
                this.dataSelection.attr(attrToProjector);
            }

            attrToProjector["y"] = function (d, i) {
                var originalY = yFunction(d, i);
                return (originalY > scaledBaseline) ? scaledBaseline : originalY;
            };

            var heightFunction = function (d, i) {
                return Math.abs(scaledBaseline - yFunction(d, i));
            };
            attrToProjector["height"] = heightFunction;

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
                "x1": 0,
                "y1": scaledBaseline,
                "x2": this.availableWidth,
                "y2": scaledBaseline
            });
        };

        /**
        * Sets the horizontal alignment of the bars.
        *
        * @param {string} alignment Which part of the bar should align with the bar's x-value (left/center/right).
        * @return {BarRenderer} The calling BarRenderer.
        */
        BarRenderer.prototype.barAlignment = function (alignment) {
            var alignmentLC = alignment.toLowerCase();
            if (alignmentLC !== "left" && alignmentLC !== "center" && alignmentLC !== "right") {
                throw new Error("unsupported bar alignment");
            }

            this._barAlignment = alignmentLC;
            if (this.element != null) {
                this._render();
            }
            return this;
        };
        return BarRenderer;
    })(Plottable.AbstractBarRenderer);
    Plottable.BarRenderer = BarRenderer;
})(Plottable || (Plottable = {}));
