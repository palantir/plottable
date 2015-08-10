///<reference path="../reference.ts" />

module Plottable {
export module Plots {
  export class Pie extends Plot {

    private static _INNER_RADIUS_KEY = "inner-radius";
    private static _OUTER_RADIUS_KEY = "outer-radius";
    private static _SECTOR_VALUE_KEY = "sector-value";
    private _startAngles: number[];
    private _endAngles: number[];
    private _labelFormatter: Formatter = Formatters.identity();
    private _labelsEnabled = false;

    /**
     * @constructor
     */
    constructor() {
      super();
      this.innerRadius(0);
      this.outerRadius(() => Math.min(this.width(), this.height()) / 2);
      this.addClass("pie-plot");
      this.attr("fill", (d, i) => String(i), new Scales.Color());
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      this._renderArea.attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");
      var radiusLimit = Math.min(this.width(), this.height()) / 2;
      if (this.innerRadius().scale != null) {
        this.innerRadius().scale.range([0, radiusLimit]);
      }
      if (this.outerRadius().scale != null) {
        this.outerRadius().scale.range([0, radiusLimit]);
      }
      return this;
    }

    public addDataset(dataset: Dataset, callUpdateHandler: boolean = true) {
      if (this.datasets().length === 1) {
        Utils.Window.warn("Only one dataset is supported in Pie plots");
        return this;
      }
      this._updatePieAngles();
      super.addDataset(dataset, callUpdateHandler);
      return this;
    }

    public removeDataset(dataset: Dataset) {
      super.removeDataset(dataset);
      this._startAngles = [];
      this._endAngles = [];
      return this;
    }

    protected _onDatasetUpdate() {
      this._updatePieAngles();
      super._onDatasetUpdate();
    }

    protected _createDrawer(dataset: Dataset) {
      return new Plottable.Drawers.Arc(dataset);
    }

    public entities(datasets = this.datasets()): PlotEntity[] {
      var entities = super.entities(datasets);
      entities.forEach((entity) => {
        entity.position.x += this.width() / 2;
        entity.position.y += this.height() / 2;
      });
      return entities;
    }

    /**
     * Gets the AccessorScaleBinding for the sector value.
     */
    public sectorValue<S>(): AccessorScaleBinding<S, number>;
    /**
     * Sets the sector value to a constant number or the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} sectorValue
     * @returns {Pie} The calling Pie Plot.
     */
    public sectorValue(sectorValue: number | Accessor<number>): Plots.Pie;
    /**
     * Sets the sector value to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {S|Accessor<S>} sectorValue
     * @param {Scale<S, number>} scale
     * @returns {Pie} The calling Pie Plot.
     */
    public sectorValue<S>(sectorValue: S | Accessor<S>, scale: Scale<S, number>): Plots.Pie;
    public sectorValue<S>(sectorValue?: number | Accessor<number> | S | Accessor<S>, scale?: Scale<S, number>): any {
      if (sectorValue == null) {
        return this._propertyBindings.get(Pie._SECTOR_VALUE_KEY);
      }
      this._bindProperty(Pie._SECTOR_VALUE_KEY, sectorValue, scale);
      this._updatePieAngles();
      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for the inner radius.
     */
    public innerRadius<R>(): AccessorScaleBinding<R, number>;
    /**
     * Sets the inner radius to a constant number or the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} innerRadius
     * @returns {Pie} The calling Pie Plot.
     */
    public innerRadius(innerRadius: number | Accessor<number>): Plots.Pie;
    /**
     * Sets the inner radius to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {R|Accessor<R>} innerRadius
     * @param {Scale<R, number>} scale
     * @returns {Pie} The calling Pie Plot.
     */
    public innerRadius<R>(innerRadius: R | Accessor<R>, scale: Scale<R, number>): Plots.Pie;
    public innerRadius<R>(innerRadius?: number | Accessor<number> | R | Accessor<R>, scale?: Scale<R, number>): any {
      if (innerRadius == null) {
        return this._propertyBindings.get(Pie._INNER_RADIUS_KEY);
      }
      this._bindProperty(Pie._INNER_RADIUS_KEY, innerRadius, scale);
      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for the outer radius.
     */
    public outerRadius<R>(): AccessorScaleBinding<R, number>;
    /**
     * Sets the outer radius to a constant number or the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} outerRadius
     * @returns {Pie} The calling Pie Plot.
     */
    public outerRadius(outerRadius: number | Accessor<number>): Plots.Pie;
    /**
     * Sets the outer radius to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {R|Accessor<R>} outerRadius
     * @param {Scale<R, number>} scale
     * @returns {Pie} The calling Pie Plot.
     */
    public outerRadius<R>(outerRadius: R | Accessor<R>, scale: Scale<R, number>): Plots.Pie;
    public outerRadius<R>(outerRadius?: number | Accessor<number> | R | Accessor<R>, scale?: Scale<R, number>): any {
      if (outerRadius == null) {
        return this._propertyBindings.get(Pie._OUTER_RADIUS_KEY);
      }
      this._bindProperty(Pie._OUTER_RADIUS_KEY, outerRadius, scale);
      this.render();
      return this;
    }

    /**
     * Get whether slice labels are enabled.
     *
     * @returns {boolean} Whether slices should display labels or not.
     */
    public labelsEnabled(): boolean;
    /**
     * Sets whether labels are enabled.
     *
     * @param {boolean} labelsEnabled
     * @returns {Pie} The calling Pie Plot.
     */
    public labelsEnabled(enabled: boolean): Pie;
    public labelsEnabled(enabled?: boolean): any {
      if (enabled === undefined) {
        return this._labelsEnabled;
      } else {
        this._labelsEnabled = enabled;
        this.render();
        return this;
      }
    }

    /**
     * Gets the Formatter for the labels.
     */
    public labelFormatter(): Formatter;
    /**
     * Sets the Formatter for the labels.
     *
     * @param {Formatter} formatter
     * @returns {Pie} The calling Pie Plot.
     */
    public labelFormatter(formatter: Formatter): Pie;
    public labelFormatter(formatter?: Formatter): any {
      if (formatter == null) {
        return this._labelFormatter;
      } else {
        this._labelFormatter = formatter;
        this.render();
        return this;
      }
    }

    /*
     * Gets the Entities at a particular Point.
     *
     * @param {Point} p
     * @param {PlotEntity[]}
     */
    public entitiesAt(queryPoint: Point) {
      var center = { x: this.width() / 2, y: this.height() / 2 };
      var adjustedQueryPoint = { x: queryPoint.x - center.x, y: queryPoint.y - center.y };
      var index = this._sliceIndexForPoint(adjustedQueryPoint);
      return index == null ? [] : [this.entities()[index]];
    }

    protected _propertyProjectors(): AttributeToProjector {
      var attrToProjector = super._propertyProjectors();
      var innerRadiusAccessor = Plot._scaledAccessor(this.innerRadius());
      var outerRadiusAccessor = Plot._scaledAccessor(this.outerRadius());
      attrToProjector["d"] = (datum: any, index: number, ds: Dataset) => {
        return d3.svg.arc().innerRadius(innerRadiusAccessor(datum, index, ds))
                           .outerRadius(outerRadiusAccessor(datum, index, ds))
                           .startAngle(this._startAngles[index])
                           .endAngle(this._endAngles[index])(datum, index);
      };
      return attrToProjector;
    }

    private _updatePieAngles() {
      if (this.sectorValue() == null) { return; }
      if (this.datasets().length === 0) { return; }
      var sectorValueAccessor = Plot._scaledAccessor(this.sectorValue());
      var dataset = this.datasets()[0];
      var data = dataset.data().filter((d, i) => Plottable.Utils.Math.isValidNumber(sectorValueAccessor(d, i, dataset)));
      var pie = d3.layout.pie().sort(null).value((d, i) => sectorValueAccessor(d, i, dataset))(data);
      if (pie.some((slice) => slice.value < 0)) {
        Utils.Window.warn("Negative values will not render correctly in a Pie Plot.");
      }
      this._startAngles = pie.map((slice) => slice.startAngle);
      this._endAngles = pie.map((slice) => slice.endAngle);
    }

    protected _getDataToDraw() {
      var dataToDraw = super._getDataToDraw();
      if (this.datasets().length === 0) { return dataToDraw; }
      var sectorValueAccessor = Plot._scaledAccessor(this.sectorValue());
      var ds = this.datasets()[0];
      var data = dataToDraw.get(ds);
      var filteredData = data.filter((d, i) => Plottable.Utils.Math.isValidNumber(sectorValueAccessor(d, i, ds)));
      dataToDraw.set(ds, filteredData);
      return dataToDraw;
    }

    protected _pixelPoint(datum: any, index: number, dataset: Dataset) {
      var innerRadius = Plot._scaledAccessor(this.innerRadius())(datum, index, dataset);
      var outerRadius = Plot._scaledAccessor(this.outerRadius())(datum, index, dataset);
      var avgRadius = (innerRadius + outerRadius) / 2;

      var scaledValueAccessor = Plot._scaledAccessor(this.sectorValue());
      var pie = d3.layout.pie()
                         .sort(null)
                         .value((d: any, i: number) => scaledValueAccessor(d, i, dataset))(dataset.data());
      var startAngle = pie[index].startAngle;
      var endAngle = pie[index].endAngle;
      var avgAngle = (startAngle + endAngle) / 2;
      return { x: avgRadius * Math.sin(avgAngle), y: -avgRadius * Math.cos(avgAngle) };
    }

    protected _additionalPaint(time: number) {
      this._renderArea.select(".label-area").remove();
      if (this._labelsEnabled) {
        Utils.Window.setTimeout(() => this._drawLabels(), time);
      }
    }

    private _sliceIndexForPoint(p: Point) {
      var pointRadius = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
      var pointAngle = Math.acos(-p.y / pointRadius);
      if (p.x < 0) {
        pointAngle = Math.PI * 2 - pointAngle;
      }
      var index: number;
      for (var i = 0; i < this._startAngles.length; i++) {
        if (this._startAngles[i] < pointAngle && this._endAngles[i] > pointAngle) {
          index = i;
          break;
        }
      }
      if (index !== undefined) {
        var dataset = this.datasets()[0];
        var datum = dataset.data()[index];
        var innerRadius = this.innerRadius().accessor(datum, index, dataset);
        var outerRadius = this.outerRadius().accessor(datum, index, dataset);
        if (pointRadius > innerRadius && pointRadius < outerRadius) {
          return index;
        }
      }
      return null;
    }

    private _drawLabels() {
      var attrToProjector = this._generateAttrToProjector();
      var labelArea = this._renderArea.append("g").classed("label-area", true);
      var measurer = new SVGTypewriter.Measurers.Measurer(labelArea);
      var writer = new SVGTypewriter.Writers.Writer(measurer);
      var dataset = this.datasets()[0];
      var data = this._getDataToDraw().get(dataset);
      data.forEach((datum, datumIndex) => {
        var value = this.sectorValue().accessor(datum, datumIndex, dataset);
        if (!Plottable.Utils.Math.isValidNumber(value)) {
          return;
        }
        value = this._labelFormatter(value);
        var measurement = measurer.measure(value);

        var theta = (this._endAngles[datumIndex] + this._startAngles[datumIndex]) / 2;
        var outerRadius = this.outerRadius().accessor(datum, datumIndex, dataset);
        if (this.outerRadius().scale) {
          outerRadius = this.outerRadius().scale.scale(outerRadius);
        }
        var innerRadius = this.innerRadius().accessor(datum, datumIndex, dataset);
        if (this.innerRadius().scale) {
          innerRadius = this.innerRadius().scale.scale(innerRadius);
        }
        var labelRadius = (outerRadius + innerRadius) / 2;

        var x = Math.sin(theta) * labelRadius - measurement.width / 2;
        var y = -Math.cos(theta) * labelRadius - measurement.height / 2;

        var corners = [
          { x: x, y: y },
          { x: x, y: y + measurement.height},
          { x: x + measurement.width, y: y },
          { x: x + measurement.width, y: y + measurement.height }
        ];

        var showLabel = corners.every((corner) => {
          return Math.abs(corner.x) <= this.width() / 2 && Math.abs(corner.y) <= this.height() / 2;
        });

        if (showLabel) {
          var sliceIndices = corners.map((corner) => this._sliceIndexForPoint(corner));
          showLabel = sliceIndices.every((index) => index === datumIndex);
        }

        var color = attrToProjector["fill"](datum, datumIndex, dataset);
        var dark = Utils.Color.contrast("white", color) * 1.6 < Utils.Color.contrast("black", color);
        var g = labelArea.append("g").attr("transform", "translate(" + x + "," + y + ")");
        var className = dark ? "dark-label" : "light-label";
        g.classed(className, true);
        g.style("visibility", showLabel ? "inherit" : "hidden");

        writer.write(value, measurement.width, measurement.height, {
          selection: g,
          xAlign: "center",
          yAlign: "center",
          textRotation: 0
        });
      });
    }
  }
}
}
