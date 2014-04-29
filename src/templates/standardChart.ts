///<reference path="../reference.ts" />

module Plottable {
  export class StandardChart extends Table {
      private _xAxis: XAxis;
      private _yAxis: YAxis;
      private _xLabel: AxisLabel;
      private _yLabel: AxisLabel;
      private centerComponent: Component;
      private _titleLabel: TitleLabel;
      private xTable: Table;
      private yTable: Table;
      private xyTable: Table;
      private fullTable: Table;

      constructor() {
        super();
        this.xTable    = new Table();
        this.yTable    = new Table();
        this.centerComponent = new ComponentGroup();
        this.xyTable   = new Table().addComponent(0, 0, this.yTable)
                                    .addComponent(1, 1, this.xTable)
                                    .addComponent(0, 1, this.centerComponent);
        this.addComponent(1, 0, this.xyTable);
      }


      public yAxis(y: YAxis): StandardChart;
      public yAxis(): YAxis;
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

      public xAxis(x: XAxis): StandardChart;
      public xAxis(): XAxis;
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

    public yLabel(y: AxisLabel): StandardChart;
    public yLabel(y: string): StandardChart;
    public yLabel(): AxisLabel;
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
          y = new AxisLabel(y, "vertical-left");
        }
        this._yLabel = y;
        this.yTable.addComponent(0, 0, this._yLabel);
        return this;
      } else {
        return this._yLabel;
      }
    }

    public xLabel(x: AxisLabel): StandardChart;
    public xLabel(x: string): StandardChart;
    public xLabel(): AxisLabel;
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
          x = new AxisLabel(x, "horizontal");
        }
        this._xLabel = x;
        this.xTable.addComponent(1, 0, this._xLabel);
        return this;
      } else {
        return this._xLabel;
      }
    }

    public titleLabel(x: TitleLabel): StandardChart;
    public titleLabel(x: string): StandardChart;
    public titleLabel(): TitleLabel;
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
          x = new TitleLabel(x, "horizontal");
        }
        this._titleLabel = x;
        this.addComponent(0, 0, this._titleLabel);
        return this;
      } else {
        return this._titleLabel;
      }
    }

    public center(c: Component): StandardChart {
      this.centerComponent.merge(c);
      return this;
    }
  }
}
