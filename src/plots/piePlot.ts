/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as SVGTypewriter from "svg-typewriter";

import * as Animators from "../animators";
import { Accessor, Point, AttributeToProjector } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import * as Drawers from "../drawers";
import { Formatter } from "../core/formatters";
import * as Formatters from "../core/formatters";
import * as Scales from "../scales";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";

import { PlotEntity, AccessorScaleBinding } from "./";
import { Plot } from "./plot";

import { BasePiePlot, IPiePlot } from "./basePiePlot";

export class Pie extends Plot implements IPiePlot {
  protected _plot: BasePiePlot;

  private _labelFormatter: Formatter = Formatters.identity();
  private _labelsEnabled = false;

  /**
   * @constructor
   */
  constructor() {
    super();
    this.innerRadius(0)
    this.outerRadius(() => {
      let pieCenter = this._plot.pieCenter();
      return Math.min(Math.max(this.width() - pieCenter.x, pieCenter.x), Math.max(this.height() - pieCenter.y, pieCenter.y));
    });
    this.addClass("pie-plot");
    this.attr("fill", (d, i) => String(i), new Scales.Color());
  }

  protected _setup() {
    super._setup();
    this._plot.renderArea((dataset) => this._renderArea.append("g"));
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);

    let pieCenter = this._plot.pieCenter()
    this._renderArea.attr("transform", "translate(" + pieCenter.x + "," + pieCenter.y + ")");

    let radiusLimit = Math.min(Math.max(this.width() - pieCenter.x, pieCenter.x), Math.max(this.height() - pieCenter.y, pieCenter.y));

    if (this.innerRadius().scale != null) {
      this.innerRadius().scale.range([0, radiusLimit]);
    }
    if (this.outerRadius().scale != null) {
      this.outerRadius().scale.range([0, radiusLimit]);
    }
    return this;
  }

  public selections(datasets = this.datasets()) {
    let allSelections = super.selections(datasets)[0];
    datasets.forEach((dataset) => {
      let drawer = this._plot.drawer(dataset) as Drawers.Arc;
      if (drawer == null) {
        return;
      }
      drawer.renderArea().selectAll(drawer.selector()).each(function () {
        allSelections.push(this);
      });
    });
    return d3.selectAll(allSelections);
  }

  protected _createPlot() {
    return new BasePiePlot((dataset) => new Drawers.Arc(dataset), this)
  }

  public entities(datasets = this.datasets()): PlotEntity[] {
    return this._plot.entities(datasets);
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
  public sectorValue(sectorValue: number | Accessor<number>): this;
  /**
   * Sets the sector value to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {S|Accessor<S>} sectorValue
   * @param {Scale<S, number>} scale
   * @returns {Pie} The calling Pie Plot.
   */
  public sectorValue<S>(sectorValue: S | Accessor<S>, scale: Scale<S, number>): this;
  public sectorValue<S>(sectorValue?: number | Accessor<number> | S | Accessor<S>, scale?: Scale<S, number>): any {
    const plotSectorValue = this._plot.sectorValue(sectorValue as S, scale);

    if (sectorValue == null) {
      return plotSectorValue;
    }

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
  public innerRadius(innerRadius: number | Accessor<number>): any;
  /**
   * Sets the inner radius to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {R|Accessor<R>} innerRadius
   * @param {Scale<R, number>} scale
   * @returns {Pie} The calling Pie Plot.
   */
  public innerRadius<R>(innerRadius: R | Accessor<R>, scale: Scale<R, number>): any;
  public innerRadius<R>(innerRadius?: number | Accessor<number> | R | Accessor<R>, scale?: Scale<R, number>): any {
    const plotInnerRadius = this._plot.innerRadius(innerRadius as R, scale);
    if (innerRadius == null) {
      return plotInnerRadius;
    }

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
  public outerRadius(outerRadius: number | Accessor<number>): this;
  /**
   * Sets the outer radius to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {R|Accessor<R>} outerRadius
   * @param {Scale<R, number>} scale
   * @returns {Pie} The calling Pie Plot.
   */
  public outerRadius<R>(outerRadius: R | Accessor<R>, scale: Scale<R, number>): this;
  public outerRadius<R>(outerRadius?: number | Accessor<number> | R | Accessor<R>, scale?: Scale<R, number>): any {
    const plotOuterRadius = this._plot.outerRadius(outerRadius as R, scale);
    if (outerRadius == null) {
      return plotOuterRadius;
    }

    this.render();
    return this;
  }

  /**
   * Gets the start angle of the Pie Plot
   *
   * @returns {number} Returns the start angle
   */
  public startAngle(): number;
  /**
   * Sets the start angle of the Pie Plot.
   *
   * @param {number} startAngle
   * @returns {Pie} The calling Pie Plot.
   */
  public startAngle(angle: number): this;
  public startAngle(angle?: number): any {
    const plotStartAngle = this._plot.startAngle(angle);
    if (angle == null) {
      return plotStartAngle;
    }

    this.render();
    return this;
  }

  /**
   * Gets the end angle of the Pie Plot.
   *
   * @returns {number} Returns the end angle
   */
  public endAngle(): number;
  /**
   * Sets the end angle of the Pie Plot.
   *
   * @param {number} endAngle
   * @returns {Pie} The calling Pie Plot.
   */
  public endAngle(angle: number): this;
  public endAngle(angle?: number): any {
    const plotEndAngle = this._plot.endAngle(angle);
    if (angle == null) {
      return plotEndAngle;
    }

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
  public labelsEnabled(enabled: boolean): this;
  public labelsEnabled(enabled?: boolean): any {
    if (enabled == null) {
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
  public labelFormatter(formatter: Formatter): this;
  public labelFormatter(formatter?: Formatter): any {
    if (formatter == null) {
      return this._labelFormatter;
    } else {
      this._labelFormatter = formatter;
      this.render();
      return this;
    }
  }

  protected _additionalPaint(time: number) {
    this._renderArea.select(".label-area").remove();
    let drawSteps = this._plot.generateStrokeDrawSteps();
    let dataToDraw = this._plot.getDataToDraw();
    this.datasets().forEach((dataset) => this._plot.drawer(dataset).draw(dataToDraw.get(dataset), drawSteps));
  }

  public drawLabels(dataToDraw: Utils.Map<Dataset, any[]>, attrToProjector: AttributeToProjector) {
    this._renderArea.select(".label-area").remove();

    if (this._labelsEnabled) {
      let labelArea = this._renderArea.append("g").classed("label-area", true);
      let measurer = new SVGTypewriter.CacheMeasurer(labelArea);
      let writer = new SVGTypewriter.Writer(measurer);
      let dataset = this.datasets()[0];
      let data = this._plot.getDataToDraw().get(dataset);
      data.forEach((datum, datumIndex) => {
        let value = this.sectorValue().accessor(datum, datumIndex, dataset);
        if (!Utils.Math.isValidNumber(value)) {
          return;
        }
        value = this._labelFormatter(value);
        let measurement = measurer.measure(value);

        let theta = (this._plot.endAngles()[datumIndex] + this._plot.startAngles()[datumIndex]) / 2;
        let outerRadius = this.outerRadius().accessor(datum, datumIndex, dataset);
        if (this.outerRadius().scale) {
          outerRadius = this.outerRadius().scale.scale(outerRadius);
        }
        let innerRadius = this.innerRadius().accessor(datum, datumIndex, dataset);
        if (this.innerRadius().scale) {
          innerRadius = this.innerRadius().scale.scale(innerRadius);
        }
        let labelRadius = (outerRadius + innerRadius) / 2;

        let x = Math.sin(theta) * labelRadius - measurement.width / 2;
        let y = -Math.cos(theta) * labelRadius - measurement.height / 2;

        let corners = [
          { x: x, y: y },
          { x: x, y: y + measurement.height },
          { x: x + measurement.width, y: y },
          { x: x + measurement.width, y: y + measurement.height },
        ];

        let showLabel = corners.every((corner) => {
          return Math.abs(corner.x) <= this.width() / 2 && Math.abs(corner.y) <= this.height() / 2;
        });

        if (showLabel) {
          let sliceIndices = corners.map((corner) => this._plot.sliceIndexForPoint(corner));
          showLabel = sliceIndices.every((index) => index === datumIndex);
        }

        let color = attrToProjector["fill"](datum, datumIndex, dataset);
        let dark = Utils.Color.contrast("white", color) * 1.6 < Utils.Color.contrast("black", color);
        let g = labelArea.append("g").attr("transform", "translate(" + x + "," + y + ")");
        let className = dark ? "dark-label" : "light-label";
        g.classed(className, true);
        g.style("visibility", showLabel ? "inherit" : "hidden");

        writer.write(value, measurement.width, measurement.height, {
          selection: g,
          xAlign: "center",
          yAlign: "center",
          textRotation: 0,
        });
      });
    }
  }
}
