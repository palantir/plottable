///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var AbstractBarRenderer = (function (_super) {
        __extends(AbstractBarRenderer, _super);
        /**
        * Creates an AbstractBarRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        function AbstractBarRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset, xScale, yScale);
            this._baselineValue = 0;
            this.classed("bar-renderer", true);
            this.project("width", 10);
            this.project("fill", function () {
                return "steelblue";
            });
        }
        AbstractBarRenderer.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this._baseline = this.renderArea.append("line").classed("baseline", true);
            return this;
        };

        /**
        * Sets the baseline for the bars to the specified value.
        *
        * @param {number} value The value to position the baseline at.
        * @return {AbstractBarRenderer} The calling AbstractBarRenderer.
        */
        AbstractBarRenderer.prototype.baseline = function (value) {
            this._baselineValue = value;
            if (this.element != null) {
                this._render();
            }
            return this;
        };

        /**
        * Sets the bar alignment relative to the independent axis.
        * Behavior depends on subclass implementation.
        *
        * @param {string} alignment The desired alignment.
        * @return {AbstractBarRenderer} The calling AbstractBarRenderer.
        */
        AbstractBarRenderer.prototype.barAlignment = function (alignment) {
            // implementation in child classes
            return this;
        };

        /**
        * Selects the bar under the given pixel position.
        *
        * @param {number} x The pixel x position.
        * @param {number} y The pixel y position.
        * @param {boolean} [select] Whether or not to select the bar (by classing it "selected");
        * @return {D3.Selection} The selected bar, or null if no bar was selected.
        */
        AbstractBarRenderer.prototype.selectBar = function (x, y, select) {
            if (typeof select === "undefined") { select = true; }
            var selectedBar = null;

            // currently, linear scan the bars. If inversion is implemented on non-numeric scales we might be able to do better.
            this.dataSelection.each(function (d) {
                var bbox = this.getBBox();
                if (bbox.x <= x && x <= bbox.x + bbox.width && bbox.y <= y && y <= bbox.y + bbox.height) {
                    selectedBar = d3.select(this);
                }
            });

            if (selectedBar != null) {
                selectedBar.classed("selected", select);
            }

            return selectedBar;
        };

        /**
        * Deselects all bars.
        * @return {AbstractBarRenderer} The calling AbstractBarRenderer.
        */
        AbstractBarRenderer.prototype.deselectAll = function () {
            this.dataSelection.classed("selected", false);
            return this;
        };
        return AbstractBarRenderer;
    })(Plottable.XYRenderer);
    Plottable.AbstractBarRenderer = AbstractBarRenderer;
})(Plottable || (Plottable = {}));
