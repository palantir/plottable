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


      public yAxis(y: Abstract.Axis): StandardChart;
      public yAxis(): Abstract.Axis;
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

      public xAxis(x: Abstract.Axis): StandardChart;
      public xAxis(): Abstract.Axis;
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

    public yLabel(y: Component.AxisLabel): StandardChart;
    public yLabel(y: string): StandardChart;
    public yLabel(): Component.AxisLabel;
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
          y = new Component.AxisLabel(y, "vertical-left");
        }
        this._yLabel = y;
        this.yTable.addComponent(0, 0, this._yLabel);
        return this;
      } else {
        return this._yLabel;
      }
    }

    public xLabel(x: Component.AxisLabel): StandardChart;
    public xLabel(x: string): StandardChart;
    public xLabel(): Component.AxisLabel;
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
          x = new Component.AxisLabel(x, "horizontal");
        }
        this._xLabel = x;
        this.xTable.addComponent(1, 0, this._xLabel);
        return this;
      } else {
        return this._xLabel;
      }
    }

    public titleLabel(x: Component.TitleLabel): StandardChart;
    public titleLabel(x: string): StandardChart;
    public titleLabel(): Component.TitleLabel;
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
          x = new Component.TitleLabel(x, "horizontal");
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
