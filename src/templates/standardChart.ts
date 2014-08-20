///<reference path="../reference.ts" />

module Plottable {
export module Template {
  export class StandardChart extends Component.Table {
      private _xAxis: Abstract.Axis;
      private _yAxis: Abstract.Axis;
      private _xLabel: Component.AxisLabel;
      private _yLabel: Component.AxisLabel;
      private centerComponent: Abstract.Component;
      private _titleLabel: Component.TitleLabel;
      private xTable: Component.Table;
      private yTable: Component.Table;
      private xyTable: Component.Table;
      private fullTable: Component.Table;

      /**
       * Creates a StandartChart.
       *
       * A StandardChart is a Component.Table with presets set to what users
       * generally want.
       *
       * If you want to do this:
       * ```typescript
       * var table = new Table([[xAxis.merge(xLabel), plot.merge(title)],
       *                        [null,                yAxis.merge(yLabel)]]);
       * ```
       * and laboriously create xLabel, xAxis, etc., you can do this:
       * ```typescript
       * var table = new StandardChart();
       * table.xLabel("foo");
       * table.xAxis(xAxis);
       * ...
       * ```
       *
       * StandardChart is what you should use if you just want a freakin'
       * chart.
       */
      constructor() {
        super();
        this.xTable    = new Component.Table();
        this.yTable    = new Component.Table();
        this.centerComponent = new Component.Group();
        this.xyTable   = new Component.Table().addComponent(0, 0, this.yTable)
                                    .addComponent(1, 1, this.xTable)
                                    .addComponent(0, 1, this.centerComponent);
        this.addComponent(1, 0, this.xyTable);
      }


      public yAxis(): Abstract.Axis;
      public yAxis(y: Abstract.Axis): StandardChart;
      public yAxis(y?: Abstract.Axis): any {
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
      }

      public xAxis(): Abstract.Axis;
      public xAxis(x: Abstract.Axis): StandardChart;
      public xAxis(x?: Abstract.Axis): any {
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
      }

    /**
     * @return {Component.AxisLabel} The label along the y-axis, such as
     * "profit".
     */
    public yLabel(): Component.AxisLabel;
    /**
     * @param {Component.AxisLabel} y The desired label along the y-axis.
     * @return {StandardChart} The calling StandardChart.
     */
    public yLabel(y: Component.AxisLabel): StandardChart;
    /**
     * @param {string} y The desired label along the y-axis. A
     * Component.AxisLabel will be generated out of this string.
     */
    public yLabel(y: string): StandardChart;
    public yLabel(y?: any): any {
      if (y != null) {
        if (this._yLabel != null) {
          if (typeof(y) === "string") {
            this._yLabel.text(y);
            return this;
          } else {
            throw new Error("yLabel already assigned!");
          }
        }
        if (typeof(y) === "string") {
          y = new Component.AxisLabel(y, "vertical-left");
        }
        this._yLabel = y;
        this.yTable.addComponent(0, 0, this._yLabel);
        return this;
      } else {
        return this._yLabel;
      }
    }

    /**
     * @return {Component.AxisLabel} The label along the x-axis, such as
     * "profit".
     */
    public xLabel(): Component.AxisLabel;
    /**
     * @param {Component.AxisLabel} x The desired label along the x-axis.
     * @return {StandardChart} The calling StandardChart.
     */
    public xLabel(x: Component.AxisLabel): StandardChart;
    /**
     * @param {string} x The desired label along the x-axis. A
     * Component.AxisLabel will be generated out of this string.
     */
    public xLabel(x: string): StandardChart;
    public xLabel(x?: any): any {
      if (x != null) {
        if (this._xLabel != null) {
          if (typeof(x) === "string") {
            this._xLabel.text(x);
            return this;
          } else {
            throw new Error("xLabel already assigned!");
          }
        }
        if (typeof(x) === "string") {
          x = new Component.AxisLabel(x, "horizontal");
        }
        this._xLabel = x;
        this.xTable.addComponent(1, 0, this._xLabel);
        return this;
      } else {
        return this._xLabel;
      }
    }

    /**
     * @return {Component.TitleLabel} The label for the title, such as
     * "profit".
     */
    public titleLabel(): Component.TitleLabel;
    /**
     * @param {Component.TitleLabel} x The desired label for the title.
     * @return {StandardChart} The calling StandardChart.
     */
    public titleLabel(x: Component.TitleLabel): StandardChart;
    /**
     * @param {string} x The desired label for the title. A
     * Component.TitleLabel will be generated out of this string.
     */
    public titleLabel(x: string): StandardChart;
    public titleLabel(x?: any): any {
      if (x != null) {
        if (this._titleLabel != null) {
          if (typeof(x) === "string") {
            this._titleLabel.text(x);
            return this;
          } else {
            throw new Error("titleLabel already assigned!");
          }
        }
        if (typeof(x) === "string") {
          x = new Component.TitleLabel(x, "horizontal");
        }
        this._titleLabel = x;
        this.addComponent(0, 0, this._titleLabel);
        return this;
      } else {
        return this._titleLabel;
      }
    }

    /**
     * Sets the component in the center, typically a plot.
     *
     * @param {Abstract.Component} c The component to place in the center.
     * @return {StandardChart} The calling StandardChart.
     */
    public center(c: Abstract.Component): StandardChart {
      this.centerComponent.merge(c);
      return this;
    }
  }
}
}
