///<reference path="../reference.ts" />

module Plottable{
export module Templates {
  export class StandardChart extends Components.Table {
      private _xAxis: Axis.XAxis;
      private _yAxis: Axis.YAxis;
      private _xLabel: Components.AxisLabel;
      private _yLabel: Components.AxisLabel;
      private centerComponent: Abstract.Component;
      private _titleLabel: Components.TitleLabel;
      private xTable: Components.Table;
      private yTable: Components.Table;
      private xyTable: Components.Table;
      private fullTable: Components.Table;

      constructor() {
        super();
        this.xTable    = new Components.Table();
        this.yTable    = new Components.Table();
        this.centerComponent = new Components.Group();
        this.xyTable   = new Components.Table().addComponent(0, 0, this.yTable)
                                    .addComponent(1, 1, this.xTable)
                                    .addComponent(0, 1, this.centerComponent);
        this.addComponent(1, 0, this.xyTable);
      }


      public yAxis(y: Axis.YAxis): StandardChart;
      public yAxis(): Axis.YAxis;
      public yAxis(y?: any): any {
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

      public xAxis(x: Axis.XAxis): StandardChart;
      public xAxis(): Axis.XAxis;
      public xAxis(x?: any): any {
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

    public yLabel(y: Components.AxisLabel): StandardChart;
    public yLabel(y: string): StandardChart;
    public yLabel(): Components.AxisLabel;
    public yLabel(y?: any): any {
      if (y != null) {
        if (this._yLabel != null) {
          if (typeof(y) === "string") {
            this._yLabel.setText(y);
            return this;
          } else {
            throw new Error("yLabel already assigned!");
          }
        }
        if (typeof(y) === "string") {
          y = new Components.AxisLabel(y, "vertical-left");
        }
        this._yLabel = y;
        this.yTable.addComponent(0, 0, this._yLabel);
        return this;
      } else {
        return this._yLabel;
      }
    }

    public xLabel(x: Components.AxisLabel): StandardChart;
    public xLabel(x: string): StandardChart;
    public xLabel(): Components.AxisLabel;
    public xLabel(x?: any): any {
      if (x != null) {
        if (this._xLabel != null) {
          if (typeof(x) === "string") {
            this._xLabel.setText(x);
            return this;
          } else {
            throw new Error("xLabel already assigned!");
          }
        }
        if (typeof(x) === "string") {
          x = new Components.AxisLabel(x, "horizontal");
        }
        this._xLabel = x;
        this.xTable.addComponent(1, 0, this._xLabel);
        return this;
      } else {
        return this._xLabel;
      }
    }

    public titleLabel(x: Components.TitleLabel): StandardChart;
    public titleLabel(x: string): StandardChart;
    public titleLabel(): Components.TitleLabel;
    public titleLabel(x?: any): any {
      if (x != null) {
        if (this._titleLabel != null) {
          if (typeof(x) === "string") {
            this._titleLabel.setText(x);
            return this;
          } else {
            throw new Error("titleLabel already assigned!");
          }
        }
        if (typeof(x) === "string") {
          x = new Components.TitleLabel(x, "horizontal");
        }
        this._titleLabel = x;
        this.addComponent(0, 0, this._titleLabel);
        return this;
      } else {
        return this._titleLabel;
      }
    }

    public center(c: Abstract.Component): StandardChart {
      this.centerComponent.merge(c);
      return this;
    }
  }
}
}
