///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var XYRenderer = (function (_super) {
        __extends(XYRenderer, _super);
        /**
        * Creates an XYRenderer.
        *
        * @constructor
        * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Renderer.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        function XYRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset);
            this.classed("xy-renderer", true);

            this.project("x", "x", xScale); // default accessor
            this.project("y", "y", yScale); // default accessor
        }
        XYRenderer.prototype.project = function (attrToSet, accessor, scale) {
            // We only want padding and nice-ing on scales that will correspond to axes / pixel layout.
            // So when we get an "x" or "y" scale, enable autoNiceing and autoPadding.
            if (attrToSet === "x") {
                this.xScale = scale != null ? scale : this.xScale;
                this._xAccessor = accessor;
                this.xScale._autoNice = true;
                this.xScale._autoPad = true;
            }
            if (attrToSet === "y") {
                this.yScale = scale != null ? scale : this.yScale;
                this._yAccessor = accessor;
                this.yScale._autoNice = true;
                this.yScale._autoPad = true;
            }
            _super.prototype.project.call(this, attrToSet, accessor, scale);

            return this;
        };

        XYRenderer.prototype._computeLayout = function (xOffset, yOffset, availableWidth, availableHeight) {
            this._hasRendered = false;
            _super.prototype._computeLayout.call(this, xOffset, yOffset, availableWidth, availableHeight);
            this.xScale.range([0, this.availableWidth]);
            this.yScale.range([this.availableHeight, 0]);
            return this;
        };

        XYRenderer.prototype.rescale = function () {
            if (this.element != null && this._hasRendered) {
                this._render();
            }
        };
        return XYRenderer;
    })(Plottable.Renderer);
    Plottable.XYRenderer = XYRenderer;
})(Plottable || (Plottable = {}));
