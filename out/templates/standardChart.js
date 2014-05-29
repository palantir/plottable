///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var StandardChart = (function (_super) {
        __extends(StandardChart, _super);
        function StandardChart() {
            _super.call(this);
            this.xTable = new Plottable.Table();
            this.yTable = new Plottable.Table();
            this.centerComponent = new Plottable.ComponentGroup();
            this.xyTable = new Plottable.Table().addComponent(0, 0, this.yTable).addComponent(1, 1, this.xTable).addComponent(0, 1, this.centerComponent);
            this.addComponent(1, 0, this.xyTable);
        }
        StandardChart.prototype.yAxis = function (y) {
            if (y != null) {
                if (this._yAxis != null) {
                    throw new Error("yAxis already assigned!");
                }
                this._yAxis = y;
                this.yTable.addComponent(0, 1, this._yAxis);
                return this;
            } else {
                return this._yAxis;
            }
        };

        StandardChart.prototype.xAxis = function (x) {
            if (x != null) {
                if (this._xAxis != null) {
                    throw new Error("xAxis already assigned!");
                }
                this._xAxis = x;
                this.xTable.addComponent(0, 0, this._xAxis);
                return this;
            } else {
                return this._xAxis;
            }
        };

        StandardChart.prototype.yLabel = function (y) {
            if (y != null) {
                if (this._yLabel != null) {
                    if (typeof (y) === "string") {
                        this._yLabel.setText(y);
                        return this;
                    } else {
                        throw new Error("yLabel already assigned!");
                    }
                }
                if (typeof (y) === "string") {
                    y = new Plottable.AxisLabel(y, "vertical-left");
                }
                this._yLabel = y;
                this.yTable.addComponent(0, 0, this._yLabel);
                return this;
            } else {
                return this._yLabel;
            }
        };

        StandardChart.prototype.xLabel = function (x) {
            if (x != null) {
                if (this._xLabel != null) {
                    if (typeof (x) === "string") {
                        this._xLabel.setText(x);
                        return this;
                    } else {
                        throw new Error("xLabel already assigned!");
                    }
                }
                if (typeof (x) === "string") {
                    x = new Plottable.AxisLabel(x, "horizontal");
                }
                this._xLabel = x;
                this.xTable.addComponent(1, 0, this._xLabel);
                return this;
            } else {
                return this._xLabel;
            }
        };

        StandardChart.prototype.titleLabel = function (x) {
            if (x != null) {
                if (this._titleLabel != null) {
                    if (typeof (x) === "string") {
                        this._titleLabel.setText(x);
                        return this;
                    } else {
                        throw new Error("titleLabel already assigned!");
                    }
                }
                if (typeof (x) === "string") {
                    x = new Plottable.TitleLabel(x, "horizontal");
                }
                this._titleLabel = x;
                this.addComponent(0, 0, this._titleLabel);
                return this;
            } else {
                return this._titleLabel;
            }
        };

        StandardChart.prototype.center = function (c) {
            this.centerComponent.merge(c);
            return this;
        };
        return StandardChart;
    })(Plottable.Table);
    Plottable.StandardChart = StandardChart;
})(Plottable || (Plottable = {}));
