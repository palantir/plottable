///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var LineRenderer = (function (_super) {
        __extends(LineRenderer, _super);
        /**
        * Creates a LineRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        function LineRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset, xScale, yScale);
            this._ANIMATION_DURATION = 500;
            this.classed("line-renderer", true);
            this.project("stroke", function () {
                return "steelblue";
            });
        }
        LineRenderer.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.path = this.renderArea.append("path").classed("line", true);
            return this;
        };

        LineRenderer.prototype._paint = function () {
            _super.prototype._paint.call(this);
            var attrToProjector = this._generateAttrToProjector();
            var scaledZero = this.yScale.scale(0);
            var xFunction = attrToProjector["x"];
            var yFunction = attrToProjector["y"];
            delete attrToProjector["x"];
            delete attrToProjector["y"];

            this.dataSelection = this.path.datum(this._dataSource.data());
            if (this._animate && this._dataChanged) {
                var animationStartLine = d3.svg.line().x(xFunction).y(scaledZero);
                this.path.attr("d", animationStartLine).attr(attrToProjector);
            }

            this.line = d3.svg.line().x(xFunction).y(yFunction);
            var updateSelection = (this._animate) ? this.path.transition().duration(this._ANIMATION_DURATION) : this.path;
            updateSelection.attr("d", this.line).attr(attrToProjector);
        };
        return LineRenderer;
    })(Plottable.XYRenderer);
    Plottable.LineRenderer = LineRenderer;
})(Plottable || (Plottable = {}));
