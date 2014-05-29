///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var CircleRenderer = (function (_super) {
        __extends(CircleRenderer, _super);
        /**
        * Creates a CircleRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        function CircleRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset, xScale, yScale);
            this.classed("circle-renderer", true);
            this.project("r", 3); // default
            this.project("fill", function () {
                return "steelblue";
            }); // default
        }
        CircleRenderer.prototype.project = function (attrToSet, accessor, scale) {
            attrToSet = attrToSet === "cx" ? "x" : attrToSet;
            attrToSet = attrToSet === "cy" ? "y" : attrToSet;
            _super.prototype.project.call(this, attrToSet, accessor, scale);
            return this;
        };

        CircleRenderer.prototype._paint = function () {
            var _this = this;
            _super.prototype._paint.call(this);
            var attrToProjector = this._generateAttrToProjector();
            attrToProjector["cx"] = attrToProjector["x"];
            attrToProjector["cy"] = attrToProjector["y"];
            delete attrToProjector["x"];
            delete attrToProjector["y"];

            var rFunction = attrToProjector["r"];
            attrToProjector["r"] = function () {
                return 0;
            };

            this.dataSelection = this.renderArea.selectAll("circle").data(this._dataSource.data());
            this.dataSelection.enter().append("circle");
            this.dataSelection.attr(attrToProjector);

            var updateSelection = this.dataSelection;
            if (this._animate && this._dataChanged) {
                var n = this.dataSource().data().length;
                updateSelection = updateSelection.transition().delay(function (d, i) {
                    return i * _this._ANIMATION_DURATION / n;
                });
            }
            updateSelection.attr("r", rFunction);

            this.dataSelection.exit().remove();
        };
        return CircleRenderer;
    })(Plottable.XYRenderer);
    Plottable.CircleRenderer = CircleRenderer;
})(Plottable || (Plottable = {}));
