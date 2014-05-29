///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var GridRenderer = (function (_super) {
        __extends(GridRenderer, _super);
        /**
        * Creates a GridRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {OrdinalScale} xScale The x scale to use.
        * @param {OrdinalScale} yScale The y scale to use.
        * @param {ColorScale|InterpolatedColorScale} colorScale The color scale to use for each grid
        *     cell.
        */
        function GridRenderer(dataset, xScale, yScale, colorScale) {
            _super.call(this, dataset, xScale, yScale);
            this.classed("grid-renderer", true);

            // The x and y scales should render in bands with no padding
            this.xScale.rangeType("bands", 0, 0);
            this.yScale.rangeType("bands", 0, 0);

            this.colorScale = colorScale;
            this.project("fill", "value", colorScale); // default
        }
        GridRenderer.prototype.project = function (attrToSet, accessor, scale) {
            _super.prototype.project.call(this, attrToSet, accessor, scale);
            if (attrToSet === "fill") {
                this.colorScale = this._projectors["fill"].scale;
            }
            return this;
        };

        GridRenderer.prototype._paint = function () {
            _super.prototype._paint.call(this);

            this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data());
            this.dataSelection.enter().append("rect");

            var xStep = this.xScale.rangeBand();
            var yStep = this.yScale.rangeBand();

            var attrToProjector = this._generateAttrToProjector();
            attrToProjector["width"] = function () {
                return xStep;
            };
            attrToProjector["height"] = function () {
                return yStep;
            };

            this.dataSelection.attr(attrToProjector);
            this.dataSelection.exit().remove();
        };
        return GridRenderer;
    })(Plottable.XYRenderer);
    Plottable.GridRenderer = GridRenderer;
})(Plottable || (Plottable = {}));
