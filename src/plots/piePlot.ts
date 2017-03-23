/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as Typesetter from "typesettable";

import * as Animators from "../animators";
import { Dataset } from "../core/dataset";
import * as Formatters from "../core/formatters";
import { Formatter } from "../core/formatters";
import { Accessor, AttributeToProjector, Point, SimpleSelection } from "../core/interfaces";
import * as Scales from "../scales";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";

import { ArcSVGDrawer } from "../drawers/arcDrawer";
import { ArcOutlineSVGDrawer } from "../drawers/arcOutlineDrawer";
import { ProxyDrawer } from "../drawers/drawer";
import { warn } from "../utils/windowUtils";
import { AccessorScaleBinding, PlotEntity } from "./";
import { Plot } from "./plot";

export interface PiePlotEntity extends PlotEntity {
  strokeSelection: SimpleSelection<any>;
}

export class Pie extends Plot {

  private static _INNER_RADIUS_KEY = "inner-radius";
  private static _OUTER_RADIUS_KEY = "outer-radius";
  private static _SECTOR_VALUE_KEY = "sector-value";
  private _startAngle: number = 0;
  private _endAngle: number = 2 * Math.PI;
  private _startAngles: number[];
  private _endAngles: number[];
  private _labelFormatter: Formatter = Formatters.identity();
  private _labelsEnabled = false;
  private _strokeDrawers: Utils.Map<Dataset, ArcOutlineSVGDrawer>;

  /**
   * @constructor
   */
  constructor() {
    super();
    this.innerRadius(0);
    this.outerRadius(() => {
      const pieCenter = this._pieCenter();
      return Math.min(Math.max(this.width() - pieCenter.x, pieCenter.x), Math.max(this.height() - pieCenter.y, pieCenter.y));
    });
    this.addClass("pie-plot");
    this.attr("fill", (d, i) => String(i), new Scales.Color());

    this._strokeDrawers = new Utils.Map<Dataset, ArcOutlineSVGDrawer>();
  }

  protected _setup() {
    super._setup();
    this._strokeDrawers.forEach((d) => d.attachTo(this._renderArea));
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);

    const pieCenter = this._pieCenter();
    this._renderArea.attr("transform", "translate(" + pieCenter.x + "," + pieCenter.y + ")");

    const radiusLimit = Math.min(Math.max(this.width() - pieCenter.x, pieCenter.x), Math.max(this.height() - pieCenter.y, pieCenter.y));

    if (this.innerRadius().scale != null) {
      this.innerRadius().scale.range([0, radiusLimit]);
    }
    if (this.outerRadius().scale != null) {
      this.outerRadius().scale.range([0, radiusLimit]);
    }
    return this;
  }

  public addDataset(dataset: Dataset) {
    super.addDataset(dataset);
    return this;
  }

  protected _addDataset(dataset: Dataset) {
    if (this.datasets().length === 1) {
      Utils.Window.warn("Only one dataset is supported in Pie plots");
      return this;
    }
    this._updatePieAngles();
    const strokeDrawer = new ArcOutlineSVGDrawer();
    if (this._isSetup) {
      strokeDrawer.attachTo(this._renderArea);
    }
    this._strokeDrawers.set(dataset, strokeDrawer);
    super._addDataset(dataset);
    return this;
  }

  public removeDataset(dataset: Dataset) {
    super.removeDataset(dataset);
    return this;
  }

  protected _removeDatasetNodes(dataset: Dataset) {
    super._removeDatasetNodes(dataset);
    this._strokeDrawers.get(dataset).remove();
  }

  protected _removeDataset(dataset: Dataset) {
    super._removeDataset(dataset);
    this._startAngles = [];
    this._endAngles = [];
    return this;
  }

  public selections(datasets = this.datasets()): SimpleSelection<any> {
    const allSelections = super.selections(datasets).nodes();
    datasets.forEach((dataset) => {
      const drawer = this._strokeDrawers.get(dataset);
      if (drawer == null) {
        return;
      }
      allSelections.push(...drawer.getVisualPrimitives());
    });
    return d3.selectAll(allSelections);
  }

  protected _onDatasetUpdate() {
    super._onDatasetUpdate();
    this._updatePieAngles();
    this.render();
  }

  protected _createDrawer() {
    return new ProxyDrawer(() => new ArcSVGDrawer(), () => {
      warn("canvas renderer is not supported on Pie Plot!");
    });
  }

  public entities(datasets = this.datasets()): PiePlotEntity[] {
    const entities = super.entities(datasets);
    return entities.map((entity) => {
      entity.position.x += this.width() / 2;
      entity.position.y += this.height() / 2;
      const stroke = d3.select(this._strokeDrawers.get(entity.dataset).getVisualPrimitiveAtIndex(entity.index));
      const piePlotEntity = entity as PiePlotEntity;
      piePlotEntity.strokeSelection = stroke;
      return piePlotEntity;
    });
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
    if (outerRadius == null) {
      return this._propertyBindings.get(Pie._OUTER_RADIUS_KEY);
    }
    this._bindProperty(Pie._OUTER_RADIUS_KEY, outerRadius, scale);
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
    if (angle == null) {
      return this._startAngle;
    } else {
      this._startAngle = angle;
      this._updatePieAngles();
      this.render();
      return this;
    }
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
    if (angle == null) {
      return this._endAngle;
    } else {
      this._endAngle = angle;
      this._updatePieAngles();
      this.render();
      return this;
    }
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

  /*
   * Gets the Entities at a particular Point.
   *
   * @param {Point} p
   * @param {PlotEntity[]}
   */
  public entitiesAt(queryPoint: Point) {
    const center = { x: this.width() / 2, y: this.height() / 2 };
    const adjustedQueryPoint = { x: queryPoint.x - center.x, y: queryPoint.y - center.y };
    const index = this._sliceIndexForPoint(adjustedQueryPoint);
    return index == null ? [] : [this.entities()[index]];
  }

  protected _propertyProjectors(): AttributeToProjector {
    const attrToProjector = super._propertyProjectors();
    const innerRadiusAccessor = Plot._scaledAccessor(this.innerRadius());
    const outerRadiusAccessor = Plot._scaledAccessor(this.outerRadius());
    attrToProjector["d"] = (datum: any, index: number, ds: Dataset) => {
      return d3.arc().innerRadius(innerRadiusAccessor(datum, index, ds))
        .outerRadius(outerRadiusAccessor(datum, index, ds))
        .startAngle(this._startAngles[index])
        .endAngle(this._endAngles[index])(datum, index);
    };
    return attrToProjector;
  }

  private _updatePieAngles() {
    if (this.sectorValue() == null) {
      return;
    }
    if (this.datasets().length === 0) {
      return;
    }
    const sectorValueAccessor = Plot._scaledAccessor(this.sectorValue());
    const dataset = this.datasets()[0];
    const data = this._getDataToDraw().get(dataset);
    const pie = d3.pie().sort(null).startAngle(this._startAngle).endAngle(this._endAngle)
      .value((d, i) => sectorValueAccessor(d, i, dataset))(data);
    this._startAngles = pie.map((slice) => slice.startAngle);
    this._endAngles = pie.map((slice) => slice.endAngle);
  }

  private _pieCenter(): Point {
    const a = this._startAngle < this._endAngle ? this._startAngle : this._endAngle;
    const b = this._startAngle < this._endAngle ? this._endAngle : this._startAngle;
    const sinA = Math.sin(a);
    const cosA = Math.cos(a);
    const sinB = Math.sin(b);
    const cosB = Math.cos(b);
    let hTop: number;
    let hBottom: number;
    let wRight: number;
    let wLeft: number;

    /**
     *  The center of the pie is computed using the sine and cosine of the start angle and the end angle
     *  The sine indicates whether the start and end fall on the right half or the left half of the pie
     *  The cosine indicates whether the start and end fall on the top or the bottom half of the pie
     *  Different combinations provide the different heights and widths the pie needs from the center to the sides
     */
    if (sinA >= 0 && sinB >= 0) {
      if (cosA >= 0 && cosB >= 0) {
        hTop = cosA;
        hBottom = 0;
        wLeft = 0;
        wRight = sinB;
      }
      else if (cosA < 0 && cosB < 0) {
        hTop = 0;
        hBottom = -cosB;
        wLeft = 0;
        wRight = sinA;
      }
      else if (cosA >= 0 && cosB < 0) {
        hTop = cosA;
        hBottom = -cosB;
        wLeft = 0;
        wRight = sinA;
      }
      else if (cosA < 0 && cosB >= 0) {
        hTop = 1;
        hBottom = 1;
        wLeft = 1;
        wRight = Math.max(sinA, sinB);
      }
    }
    else if (sinA >= 0 && sinB < 0) {
      if (cosA >= 0 && cosB >= 0) {
        hTop = Math.max(cosA, cosB);
        hBottom = 1;
        wLeft = 1;
        wRight = 1;
      }
      else if (cosA < 0 && cosB < 0) {
        hTop = 0;
        hBottom = 1;
        wLeft = -sinB;
        wRight = sinA;
      }
      else if (cosA >= 0 && cosB < 0) {
        hTop = cosA;
        hBottom = 1;
        wLeft = -sinB;
        wRight = 1;
      }
      else if (cosA < 0 && cosB >= 0) {
        hTop = cosB;
        hBottom = 1;
        wLeft = 1;
        wRight = sinA;
      }
    }
    else if (sinA < 0 && sinB >= 0) {
      if (cosA >= 0 && cosB >= 0) {
        hTop = 1;
        hBottom = 0;
        wLeft = -sinA;
        wRight = sinB;
      }
      else if (cosA < 0 && cosB < 0) {
        hTop = 1;
        hBottom = Math.max(-cosA, -cosB);
        wLeft = 1;
        wRight = 1;
      }
      else if (cosA >= 0 && cosB < 0) {
        hTop = 1;
        hBottom = -cosB;
        wLeft = -sinA;
        wRight = 1;
      }
      else if (cosA < 0 && cosB >= 0) {
        hTop = 1;
        hBottom = -cosA;
        wLeft = 1;
        wRight = sinB;
      }
    }
    else if (sinA < 0 && sinB < 0) {
      if (cosA >= 0 && cosB >= 0) {
        hTop = cosB;
        hBottom = 0;
        wLeft = -sinA;
        wRight = 0;
      }
      else if (cosA < 0 && cosB < 0) {
        hTop = 0;
        hBottom = -cosA;
        wLeft = -sinB;
        wRight = 0;
      }
      else if (cosA >= 0 && cosB < 0) {
        hTop = 1;
        hBottom = 1;
        wLeft = Math.max(cosA, -cosB);
        wRight = 1;
      }
      else if (cosA < 0 && cosB >= 0) {
        hTop = cosB;
        hBottom = -cosA;
        wLeft = 1;
        wRight = 0;
      }
    }

    return {
      x: wLeft + wRight == 0 ? 0 : (wLeft / (wLeft + wRight)) * this.width(),
      y: hTop + hBottom == 0 ? 0 : (hTop / (hTop + hBottom)) * this.height(),
    };
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    const dataToDraw = super._getDataToDraw();
    if (this.datasets().length === 0) {
      return dataToDraw;
    }
    const sectorValueAccessor = Plot._scaledAccessor(this.sectorValue());
    const ds = this.datasets()[0];
    const data = dataToDraw.get(ds);
    const filteredData = data.filter((d, i) => Pie._isValidData(sectorValueAccessor(d, i, ds)));
    dataToDraw.set(ds, filteredData);
    return dataToDraw;
  }

  protected static _isValidData(value: any) {
    return Utils.Math.isValidNumber(value) && value >= 0;
  }

  protected _pixelPoint(datum: any, index: number, dataset: Dataset) {
    const scaledValueAccessor = Plot._scaledAccessor(this.sectorValue());
    if (!Pie._isValidData(scaledValueAccessor(datum, index, dataset))) {
      return { x: NaN, y: NaN };
    }

    const innerRadius = Plot._scaledAccessor(this.innerRadius())(datum, index, dataset);
    const outerRadius = Plot._scaledAccessor(this.outerRadius())(datum, index, dataset);
    const avgRadius = (innerRadius + outerRadius) / 2;

    const pie = d3.pie()
      .sort(null)
      .value((d: any, i: number) => {
        const value = scaledValueAccessor(d, i, dataset);
        return Pie._isValidData(value) ? value : 0;
      }).startAngle(this._startAngle).endAngle(this._endAngle)(dataset.data());
    const startAngle = pie[index].startAngle;
    const endAngle = pie[index].endAngle;
    const avgAngle = (startAngle + endAngle) / 2;
    return { x: avgRadius * Math.sin(avgAngle), y: -avgRadius * Math.cos(avgAngle) };
  }

  protected _additionalPaint(time: number) {
    this._renderArea.select(".label-area").remove();
    if (this._labelsEnabled) {
      Utils.Window.setTimeout(() => this._drawLabels(), time);
    }

    const drawSteps = this._generateStrokeDrawSteps();
    const dataToDraw = this._getDataToDraw();
    this.datasets().forEach((dataset) => {
      const appliedDrawSteps = Plot.applyDrawSteps(drawSteps, dataset);
      this._strokeDrawers.get(dataset).draw(dataToDraw.get(dataset), appliedDrawSteps);
    });
  }

  private _generateStrokeDrawSteps() {
    const attrToProjector = this._generateAttrToProjector();
    return [{ attrToProjector: attrToProjector, animator: new Animators.Null() }];
  }

  private _sliceIndexForPoint(p: Point) {
    const pointRadius = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
    let pointAngle = Math.acos(-p.y / pointRadius);
    if (p.x < 0) {
      pointAngle = Math.PI * 2 - pointAngle;
    }
    let index: number;
    for (let i = 0; i < this._startAngles.length; i++) {
      if (this._startAngles[i] < pointAngle && this._endAngles[i] > pointAngle) {
        index = i;
        break;
      }
    }
    if (index !== undefined) {
      const dataset = this.datasets()[0];
      const datum = dataset.data()[index];
      const innerRadius = this.innerRadius().accessor(datum, index, dataset);
      const outerRadius = this.outerRadius().accessor(datum, index, dataset);
      if (pointRadius > innerRadius && pointRadius < outerRadius) {
        return index;
      }
    }
    return null;
  }

  private _drawLabels() {
    const attrToProjector = this._generateAttrToProjector();
    const labelArea = this._renderArea.append("g").classed("label-area", true);

    const context = new Typesetter.SvgContext(labelArea.node() as SVGElement);
    const measurer = new Typesetter.CacheMeasurer(context);
    const writer = new Typesetter.Writer(measurer, context);
    const dataset = this.datasets()[0];
    const data = this._getDataToDraw().get(dataset);
    data.forEach((datum, datumIndex) => {
      let value = this.sectorValue().accessor(datum, datumIndex, dataset);
      if (!Utils.Math.isValidNumber(value)) {
        return;
      }
      value = this._labelFormatter(value);
      const measurement = measurer.measure(value);

      const theta = (this._endAngles[datumIndex] + this._startAngles[datumIndex]) / 2;
      let outerRadius = this.outerRadius().accessor(datum, datumIndex, dataset);
      if (this.outerRadius().scale) {
        outerRadius = this.outerRadius().scale.scale(outerRadius);
      }
      let innerRadius = this.innerRadius().accessor(datum, datumIndex, dataset);
      if (this.innerRadius().scale) {
        innerRadius = this.innerRadius().scale.scale(innerRadius);
      }
      const labelRadius = (outerRadius + innerRadius) / 2;

      const x = Math.sin(theta) * labelRadius - measurement.width / 2;
      const y = -Math.cos(theta) * labelRadius - measurement.height / 2;

      const corners = [
        { x: x, y: y },
        { x: x, y: y + measurement.height },
        { x: x + measurement.width, y: y },
        { x: x + measurement.width, y: y + measurement.height },
      ];

      let showLabel = corners.every((corner) => {
        return Math.abs(corner.x) <= this.width() / 2 && Math.abs(corner.y) <= this.height() / 2;
      });

      if (showLabel) {
        const sliceIndices = corners.map((corner) => this._sliceIndexForPoint(corner));
        showLabel = sliceIndices.every((index) => index === datumIndex);
      }

      const color = attrToProjector["fill"](datum, datumIndex, dataset);
      const dark = Utils.Color.contrast("white", color) * 1.6 < Utils.Color.contrast("black", color);
      const g = labelArea.append("g").attr("transform", "translate(" + x + "," + y + ")");
      const className = dark ? "dark-label" : "light-label";
      g.classed(className, true);
      g.style("visibility", showLabel ? "inherit" : "hidden");

      writer.write(value, measurement.width, measurement.height, {
        xAlign: "center",
        yAlign: "center",
      }, g.node());
    });
  }
}
