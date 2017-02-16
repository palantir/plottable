/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */
import * as d3 from "d3";
import * as Utils from "../utils";
import { Map } from "../utils";
import * as Animators from "../animators";
import { Null } from "../animators";
import * as Drawers from "../drawers";

import { IComponent } from "../components";
import { LabeledComponent } from "../components/labeled";
import  { BasePlot, IPlot } from "./basePlot";
import { Scale } from "../scales/scale";
import { PlotEntity, AccessorScaleBinding } from "./";
import { Accessor, Point, AttributeToProjector } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import { DrawerFactory } from "./basePlot";

export interface IPiePlot extends IPlot {
  /**
   * Gets the end angle of the Pie Plot.
   *
   * @returns {number} Returns the end angle
   */
  endAngle(): number;
  /**
   * Sets the end angle of the Pie Plot.
   *
   * @param {number} endAngle
   * @returns {Pie} The calling Pie Plot.
   */
  endAngle(angle: number): this;
  endAngle(angle?: number): any
  /**
   * Gets the AccessorScaleBinding for the inner radius.
   */
  innerRadius<R>(): AccessorScaleBinding<R, number>;
  /**
   * Sets the inner radius to a constant number or the result of an Accessor<number>.
   *
   * @param {number|Accessor<number>} innerRadius
   * @returns {Pie} The calling Pie Plot.
   */
  innerRadius(innerRadius: number | Accessor<number>): any;
  /**
   * Sets the inner radius to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {R|Accessor<R>} innerRadius
   * @param {Scale<R, number>} scale
   * @returns {Pie} The calling Pie Plot.
   */
  innerRadius<R>(innerRadius: R | Accessor<R>, scale: Scale<R, number>): any;
  innerRadius<R>(innerRadius?: number | Accessor<number> | R | Accessor<R>, scale?: Scale<R, number>): any
  /**
   * Gets the AccessorScaleBinding for the outer radius.
   */
  outerRadius<R>(): AccessorScaleBinding<R, number>;
  /**
   * Sets the outer radius to a constant number or the result of an Accessor<number>.
   *
   * @param {number|Accessor<number>} outerRadius
   * @returns {Pie} The calling Pie Plot.
   */
  outerRadius(outerRadius: number | Accessor<number>): this;
  /**
   * Sets the outer radius to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {R|Accessor<R>} outerRadius
   * @param {Scale<R, number>} scale
   * @returns {Pie} The calling Pie Plot.
   */
  outerRadius<R>(outerRadius: R | Accessor<R>, scale: Scale<R, number>): this;
  outerRadius<R>(outerRadius?: number | Accessor<number> | R | Accessor<R>, scale?: Scale<R, number>): any;
  /**
   * Gets the AccessorScaleBinding for the sector value.
   */
  sectorValue<S>(): AccessorScaleBinding<S, number>;
  /**
   * Sets the sector value to a constant number or the result of an Accessor<number>.
   *
   * @param {number|Accessor<number>} sectorValue
   * @returns {Pie} The calling Pie Plot.
   */
  sectorValue(sectorValue: number | Accessor<number>): this;
  /**
   * Sets the sector value to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {S|Accessor<S>} sectorValue
   * @param {Scale<S, number>} scale
   * @returns {Pie} The calling Pie Plot.
   */
  sectorValue<S>(sectorValue: S | Accessor<S>, scale: Scale<S, number>): this;
  sectorValue<S>(sectorValue?: number | Accessor<number> | S | Accessor<S>, scale?: Scale<S, number>): any;
  /**
   * Gets the start angle of the Pie Plot
   *
   * @returns {number} Returns the start angle
   */
  startAngle(): number;
  /**
   * Sets the start angle of the Pie Plot.
   *
   * @param {number} startAngle
   * @returns {Pie} The calling Pie Plot.
   */
  startAngle(angle: number): this;
  startAngle(angle?: number): any
}

export class BasePiePlot extends BasePlot implements IPiePlot {
  private static _INNER_RADIUS_KEY = "inner-radius";
  private static _OUTER_RADIUS_KEY = "outer-radius";
  private static _SECTOR_VALUE_KEY = "sector-value";

  private _startAngle: number = 0;
  private _endAngle: number = 2 * Math.PI;
  private _startAngles: number[];
  private _endAngles: number[];
  private _strokeDrawers: Utils.Map<Dataset, Drawers.ArcOutline>;

  protected _component: LabeledComponent;

  constructor(drawerFactory: DrawerFactory, component: LabeledComponent) {
    super(drawerFactory, component);
    this._strokeDrawers = new Utils.Map<Dataset, Drawers.ArcOutline>();
  }

  public startAngles() {
    return this._startAngles;
  }

  public endAngles() {
    return this._endAngles;
  }


  public endAngle(): number;
  public endAngle(angle: number): this;
  public endAngle(angle?: number): any {
    if (angle == null) {
      return this._endAngle;
    } else {
      this._endAngle = angle;
      this._updatePieAngles();
      return this;
    }
  }

  public entities(datasets = this.datasets()) {
    let entities = super.entities(datasets);
      entities.forEach((entity) => {
      entity.position.x += this._component.width() / 2;
      entity.position.y += this._component.height() / 2;
    });
    return entities;
  }

  /*
   * Gets the Entities at a particular Point.
   *
   * @param {Point} p
   * @param {PlotEntity[]}
   */
  public entitiesAt(queryPoint: Point) {
    let center = { x: this._component.width() / 2, y: this._component.height() / 2 };
    let adjustedQueryPoint = { x: queryPoint.x - center.x, y: queryPoint.y - center.y };
    let index = this.sliceIndexForPoint(adjustedQueryPoint);
    return index == null ? [] : [this.entities()[index]];
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    let dataToDraw = super._getDataToDraw();
    if (this.datasets().length === 0) {
      return dataToDraw;
    }
    let sectorValueAccessor = BasePiePlot._scaledAccessor(this.sectorValue());
    let ds = this.datasets()[0];
    let data = dataToDraw.get(ds);
    let filteredData = data.filter((d, i) => BasePiePlot._isValidData(sectorValueAccessor(d, i, ds)));
    dataToDraw.set(ds, filteredData);
    return dataToDraw;
  }

  protected _propertyProjectors(): AttributeToProjector {
    let attrToProjector = super._propertyProjectors();
    let innerRadiusAccessor = BasePiePlot._scaledAccessor(this.innerRadius());
    let outerRadiusAccessor = BasePiePlot._scaledAccessor(this.outerRadius());
    attrToProjector["d"] = (datum: any, index: number, ds: Dataset) => {
      return d3.svg.arc().innerRadius(innerRadiusAccessor(datum, index, ds))
        .outerRadius(outerRadiusAccessor(datum, index, ds))
        .startAngle(this._startAngles[index])
        .endAngle(this._endAngles[index])(datum, index);
    };
    return attrToProjector;
  }

  public innerRadius<R>(): AccessorScaleBinding<R, number>;
  public innerRadius(innerRadius: number | Accessor<number>): any;
  public innerRadius<R>(innerRadius: R | Accessor<R>, scale: Scale<R, number>): any;
  public innerRadius<R>(innerRadius?: number | Accessor<number> | R | Accessor<R>, scale?: Scale<R, number>): any {
    if (innerRadius == null) {
      return this._propertyBindings.get(BasePiePlot._INNER_RADIUS_KEY);
    }
    this._bindProperty(BasePiePlot._INNER_RADIUS_KEY, innerRadius, scale);
    return this;
  }


  public outerRadius<R>(): AccessorScaleBinding<R, number>;
  public outerRadius(outerRadius: number | Accessor<number>): this;
  public outerRadius<R>(outerRadius: R | Accessor<R>, scale: Scale<R, number>): this;
  public outerRadius<R>(outerRadius?: number | Accessor<number> | R | Accessor<R>, scale?: Scale<R, number>): any {
    if (outerRadius == null) {
      return this._propertyBindings.get(BasePiePlot._OUTER_RADIUS_KEY);
    }
    this._bindProperty(BasePiePlot._OUTER_RADIUS_KEY, outerRadius, scale);
    return this;
  }

  public sectorValue<S>(): AccessorScaleBinding<S, number>;
  public sectorValue(sectorValue: number | Accessor<number>): this;

  public sectorValue<S>(sectorValue: S | Accessor<S>, scale: Scale<S, number>): this;
  public sectorValue<S>(sectorValue?: number | Accessor<number> | S | Accessor<S>, scale?: Scale<S, number>): any {
    if (sectorValue == null) {
      return this._propertyBindings.get(BasePiePlot._SECTOR_VALUE_KEY);
    }
    this._bindProperty(BasePiePlot._SECTOR_VALUE_KEY, sectorValue, scale);
    this._updatePieAngles();
    return this;
  }

  public startAngle(): number;
  public startAngle(angle: number): this;
  public startAngle(angle?: number): any {
    if (angle == null) {
      return this._startAngle;
    } else {
      this._startAngle = angle;
      this._updatePieAngles();
      return this;
    }
  }

  protected _addDataset(dataset: Dataset) {
    if (this.datasets().length === 1) {
      Utils.Window.warn("Only one dataset is supported in Pie plots");
      return this;
    }
    this._updatePieAngles();
    let strokeDrawer = new Drawers.ArcOutline(dataset);
    if (this._renderArea != null) {
      strokeDrawer.renderArea(this._renderArea(dataset));
    }
    this._strokeDrawers.set(dataset, strokeDrawer);
    super._addDataset(dataset);
    return this;
  }

  protected _additionalPaint(time: number) {
    Utils.Window.setTimeout(() => this._component.drawLabels(this._getDataToDraw(), this._generateAttrToProjector()), time);

    let drawSteps = this._generateStrokeDrawSteps();
    let dataToDraw = this._getDataToDraw();
    this.datasets().forEach((dataset) => this.drawer(dataset).draw(dataToDraw.get(dataset), drawSteps));
  }

  protected _pixelPoint(datum: any, index: number, dataset: Dataset) {
    let scaledValueAccessor = BasePiePlot._scaledAccessor(this.sectorValue());
    if (!BasePiePlot._isValidData(scaledValueAccessor(datum, index, dataset))) {
      return { x: NaN, y: NaN };
    }

    let innerRadius = BasePlot._scaledAccessor(this.innerRadius())(datum, index, dataset);
    let outerRadius = BasePlot._scaledAccessor(this.outerRadius())(datum, index, dataset);
    let avgRadius = (innerRadius + outerRadius) / 2;

    let pie = d3.layout.pie()
      .sort(null)
      .value((d: any, i: number) => {
        let value = scaledValueAccessor(d, i, dataset);
        return BasePiePlot._isValidData(value) ? value : 0;
      }).startAngle(this._startAngle).endAngle(this._endAngle)(dataset.data());
    let startAngle = pie[index].startAngle;
    let endAngle = pie[index].endAngle;
    let avgAngle = (startAngle + endAngle) / 2;
    return { x: avgRadius * Math.sin(avgAngle), y: -avgRadius * Math.cos(avgAngle) };
  }

  public pieCenter(): Point {
    let a = this._startAngle < this._endAngle ? this._startAngle : this._endAngle;
    let b = this._startAngle < this._endAngle ? this._endAngle : this._startAngle;
    let sinA = Math.sin(a);
    let cosA = Math.cos(a);
    let sinB = Math.sin(b);
    let cosB = Math.cos(b);
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
        wRight = sinA
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
      x: wLeft + wRight == 0 ? 0 : (wLeft / (wLeft + wRight)) * this._component.width(),
      y: hTop + hBottom == 0 ? 0 : (hTop / (hTop + hBottom)) * this._component.height()
    }
  }

  public sliceIndexForPoint(p: Point) {
    let pointRadius = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
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
      let dataset = this.datasets()[0];
      let datum = dataset.data()[index];
      let innerRadius = this.innerRadius().accessor(datum, index, dataset);
      let outerRadius = this.outerRadius().accessor(datum, index, dataset);
      if (pointRadius > innerRadius && pointRadius < outerRadius) {
        return index;
      }
    }
    return null;
  }

  protected _onDatasetUpdate() {
    super._onDatasetUpdate();
    this._updatePieAngles();
  }

  protected _removeDataset(dataset: Dataset) {
    super._removeDataset(dataset);
    this._startAngles = [];
    this._endAngles = [];
    this._strokeDrawers.get(dataset).remove();
    return this;
  }

  private _generateStrokeDrawSteps() {
    let attrToProjector = this._generateAttrToProjector();
    return [{ attrToProjector: attrToProjector, animator: new Animators.Null() }];
  }

  private _updatePieAngles() {
    if (this.sectorValue() == null) {
      return;
    }
    if (this.datasets().length === 0) {
      return;
    }
    let sectorValueAccessor = BasePiePlot._scaledAccessor(this.sectorValue());
    let dataset = this.datasets()[0];
    let data = this._getDataToDraw().get(dataset);
    let pie = d3.layout.pie().sort(null).startAngle(this._startAngle).endAngle(this._endAngle)
      .value((d, i) => sectorValueAccessor(d, i, dataset))(data);
    this._startAngles = pie.map((slice) => slice.startAngle);
    this._endAngles = pie.map((slice) => slice.endAngle);
  }

  protected static _isValidData(value: any) {
    return Utils.Math.isValidNumber(value) && value >= 0;
  }
}
