///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var RectRenderer = (function (_super) {
        __extends(RectRenderer, _super);
        /**
        * Creates a RectRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        function RectRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset, xScale, yScale);
            this.classed("rect-renderer", true);
            this.project("width", 4); // default
            this.project("height", 4); // default
            this.project("fill", function () {
                return "steelblue";
            });
        }
        RectRenderer.prototype._paint = function () {
            _super.prototype._paint.call(this);
            var attrToProjector = this._generateAttrToProjector();
            var xF = attrToProjector["x"];
            var yF = attrToProjector["y"];
            var widthF = attrToProjector["width"];
            var heightF = attrToProjector["height"];
            attrToProjector["x"] = function (d, i) {
                return xF(d, i) - widthF(d, i) / 2;
            };
            attrToProjector["y"] = function (d, i) {
                return yF(d, i) - heightF(d, i) / 2;
            };

            this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data());
            this.dataSelection.enter().append("rect");
            this.dataSelection.attr(attrToProjector);
            this.dataSelection.exit().remove();
        };
        return RectRenderer;
    })(Plottable.XYRenderer);
    Plottable.RectRenderer = RectRenderer;
})(Plottable || (Plottable = {}));
