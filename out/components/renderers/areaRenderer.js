///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var AreaRenderer = (function (_super) {
        __extends(AreaRenderer, _super);
        /**
        * Creates an AreaRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        function AreaRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset, xScale, yScale);
            this._ANIMATION_DURATION = 500;
            this.classed("area-renderer", true);
            this.project("y0", 0, yScale); // default
            this.project("fill", function () {
                return "steelblue";
            }); // default
        }
        AreaRenderer.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.path = this.renderArea.append("path").classed("area", true);
            return this;
        };

        AreaRenderer.prototype._paint = function () {
            _super.prototype._paint.call(this);
            var attrToProjector = this._generateAttrToProjector();
            var xFunction = attrToProjector["x"];
            var y0Function = attrToProjector["y0"];
            var yFunction = attrToProjector["y"];
            delete attrToProjector["x"];
            delete attrToProjector["y0"];
            delete attrToProjector["y"];

            this.dataSelection = this.path.datum(this._dataSource.data());
            if (this._animate && this._dataChanged) {
                var animationStartArea = d3.svg.area().x(xFunction).y0(y0Function).y1(y0Function);
                this.path.attr("d", animationStartArea).attr(attrToProjector);
            }

            this.area = d3.svg.area().x(xFunction).y0(y0Function).y1(yFunction);
            var updateSelection = (this._animate) ? this.path.transition().duration(this._ANIMATION_DURATION) : this.path;
            updateSelection.attr("d", this.area).attr(attrToProjector);
        };
        return AreaRenderer;
    })(Plottable.XYRenderer);
    Plottable.AreaRenderer = AreaRenderer;
})(Plottable || (Plottable = {}));
