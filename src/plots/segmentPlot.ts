/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as Animators from "../animators";
import { AttributeToProjector, Bounds, IAccessor, Point, Range } from "../core/interfaces";
import * as Drawers from "../drawers";
import { ProxyDrawer } from "../drawers/drawer";
import { SegmentSVGDrawer } from "../drawers/segmentDrawer";
import * as Scales from "../scales";
import { Scale } from "../scales/scale";
import { warn } from "../utils/windowUtils";
import { IAccessorScaleBinding, IPlotEntity, ITransformableAccessorScaleBinding } from "./";
import { Plot } from "./plot";
import { XYPlot } from "./xyPlot";

export class Segment<X, Y> extends XYPlot<X, Y> {
  private static _X2_KEY = "x2";
  private static _Y2_KEY = "y2";

  /**
   * A Segment Plot displays line segments based on the data.
   *
   * @constructor
   */
  constructor() {
    super();
    this.addClass("segment-plot");
    this.attr("stroke", new Scales.Color().range()[0]);
    this.attr("stroke-width", "2px");
  }

  protected _createDrawer() {
    return new ProxyDrawer(
      () => new SegmentSVGDrawer(),
      () => {
        warn("canvas renderer is not supported on Segment Plot!");
        return null;
      },
    );
  }

  protected _generateDrawSteps(): Drawers.DrawStep[] {
    return [{ attrToProjector: this._getAttrToProjector(), animator: new Animators.Null() }];
  }

  protected _filterForProperty(property: string) {
    if (property === "x2") {
      return super._filterForProperty("x");
    } else if (property === "y2") {
      return super._filterForProperty("y");
    }
    return super._filterForProperty(property);
  }

  /**
   * Gets the AccessorScaleBinding for X
   */
  public x(): ITransformableAccessorScaleBinding<X, number>;
  /**
   * Sets X to a constant value or the result of an Accessor.
   *
   * @param {X|Accessor<X>} x
   * @returns {Plots.Segment} The calling Segment Plot.
   */
  public x(x: number | IAccessor<number>): this;
  /**
   * Sets X to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {X|Accessor<X>} x
   * @param {Scale<X, number>} xScale
   * @returns {Plots.Segment} The calling Segment Plot.
   */
  public x(x: X | IAccessor<X>, xScale: Scale<X, number>): this;
  public x(x?: number | IAccessor<number> | X | IAccessor<X>, xScale?: Scale<X, number>): any {
    if (x == null) {
      return super.x();
    }
    if (xScale == null) {
      super.x(<number | IAccessor<number>>x);
    } else {
      super.x(<X | IAccessor<X>>x, xScale);
      const x2Binding = this.x2();
      const x2 = x2Binding && x2Binding.accessor;
      if (x2 != null) {
        this._bindProperty(Segment._X2_KEY, x2, xScale);
      }
    }
    return this;
  }

  /**
   * Gets the AccessorScaleBinding for X2
   */
  public x2(): IAccessorScaleBinding<X, number>;
  /**
   * Sets X2 to a constant number or the result of an Accessor.
   * If a Scale has been set for X, it will also be used to scale X2.
   *
   * @param {number|Accessor<number>|Y|Accessor<Y>} y2
   * @returns {Plots.Segment} The calling Segment Plot
   */
  public x2(x2: number | IAccessor<number> | X | IAccessor<X>): this;
  public x2(x2?: number | IAccessor<number> | X | IAccessor<X>): any {
    if (x2 == null) {
      return this._propertyBindings.get(Segment._X2_KEY);
    }
    const xBinding = this.x();
    const xScale = xBinding && xBinding.scale;
    this._bindProperty(Segment._X2_KEY, x2, xScale);
    this.render();
    return this;
  }

  /**
   * Gets the AccessorScaleBinding for Y
   */
  public y(): ITransformableAccessorScaleBinding<Y, number>;
  /**
   * Sets Y to a constant value or the result of an Accessor.
   *
   * @param {Y|Accessor<Y>} y
   * @returns {Plots.Segment} The calling Segment Plot.
   */
  public y(y: number | IAccessor<number>): this;
  /**
   * Sets Y to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {Y|Accessor<Y>} y
   * @param {Scale<Y, number>} yScale
   * @returns {Plots.Segment} The calling Segment Plot.
   */
  public y(y: Y | IAccessor<Y>, yScale: Scale<Y, number>): this;
  public y(y?: number | IAccessor<number> | Y | IAccessor<Y>, yScale?: Scale<Y, number>): any {
    if (y == null) {
      return super.y();
    }
    if (yScale == null) {
      super.y(<number | IAccessor<number>>y);
    } else {
      super.y(<Y | IAccessor<Y>>y, yScale);
      const y2Binding = this.y2();
      const y2 = y2Binding && y2Binding.accessor;
      if (y2 != null) {
        this._bindProperty(Segment._Y2_KEY, y2, yScale);
      }
    }
    return this;
  }

  /**
   * Gets the AccessorScaleBinding for Y2.
   */
  public y2(): IAccessorScaleBinding<Y, number>;
  /**
   * Sets Y2 to a constant number or the result of an Accessor.
   * If a Scale has been set for Y, it will also be used to scale Y2.
   *
   * @param {number|Accessor<number>|Y|Accessor<Y>} y2
   * @returns {Plots.Segment} The calling Segment Plot.
   */
  public y2(y2: number | IAccessor<number> | Y | IAccessor<Y>): this;
  public y2(y2?: number | IAccessor<number> | Y | IAccessor<Y>): any {
    if (y2 == null) {
      return this._propertyBindings.get(Segment._Y2_KEY);
    }
    const yBinding = this.y();
    const yScale = yBinding && yBinding.scale;
    this._bindProperty(Segment._Y2_KEY, y2, yScale);
    this.render();
    return this;
  }

  protected _propertyProjectors(): AttributeToProjector {
    const attrToProjector = super._propertyProjectors();
    attrToProjector["x1"] = Plot._scaledAccessor(this.x());
    attrToProjector["x2"] = this.x2() == null ? Plot._scaledAccessor(this.x()) : Plot._scaledAccessor(this.x2());
    attrToProjector["y1"] = Plot._scaledAccessor(this.y());
    attrToProjector["y2"] = this.y2() == null ? Plot._scaledAccessor(this.y()) : Plot._scaledAccessor(this.y2());
    return attrToProjector;
  }

  public entitiesAt(point: Point): IPlotEntity[] {
    const entity = this.entityNearest(point);
    if (entity != null) {
      return [entity];
    } else {
      return [];
    }
  }

  /**
   * Gets the Entities that intersect the Bounds.
   *
   * @param {Bounds} bounds
   * @returns {PlotEntity[]}
   */
  public entitiesIn(bounds: Bounds): IPlotEntity[];
  /**
   * Gets the Entities that intersect the area defined by the ranges.
   *
   * @param {Range} xRange
   * @param {Range} yRange
   * @returns {PlotEntity[]}
   */
  public entitiesIn(xRange: Range, yRange: Range): IPlotEntity[];
  public entitiesIn(xRangeOrBounds: Range | Bounds, yRange?: Range): IPlotEntity[] {
    let dataXRange: Range;
    let dataYRange: Range;
    if (yRange == null) {
      const bounds = (<Bounds> xRangeOrBounds);
      dataXRange = { min: bounds.topLeft.x, max: bounds.bottomRight.x };
      dataYRange = { min: bounds.topLeft.y, max: bounds.bottomRight.y };
    } else {
      dataXRange = (<Range> xRangeOrBounds);
      dataYRange = yRange;
    }
    return this._entitiesIntersecting(dataXRange, dataYRange);
  }

  private _entitiesIntersecting(xRange: Range, yRange: Range): IPlotEntity[] {
    const intersected: IPlotEntity[] = [];
    const attrToProjector = this._getAttrToProjector();
    const entities = this.entities();
    const entitiesLen = entities.length;
    for (let i = 0; i < entitiesLen; i++) {
      const entity = entities[i];
      if (this._lineIntersectsBox(entity, xRange, yRange, attrToProjector)) {
        intersected.push(entity);
      }
    }
    return intersected;
  }

  private _lineIntersectsBox(entity: IPlotEntity, xRange: Range, yRange: Range, attrToProjector: AttributeToProjector) {
    const x1 = attrToProjector["x1"](entity.datum, entity.index, entity.dataset);
    const x2 = attrToProjector["x2"](entity.datum, entity.index, entity.dataset);
    const y1 = attrToProjector["y1"](entity.datum, entity.index, entity.dataset);
    const y2 = attrToProjector["y2"](entity.datum, entity.index, entity.dataset);

    // check if any of end points of the segment is inside the box
    if (( xRange.min <= x1 && x1 <= xRange.max && yRange.min <= y1 && y1 <= yRange.max ) ||
      ( xRange.min <= x2 && x2 <= xRange.max && yRange.min <= y2 && y2 <= yRange.max )) {
      return true;
    }

    const startPoint = { x: x1, y: y1 };
    const endPoint = { x: x2, y: y2 };
    const corners = [
      { x: xRange.min, y: yRange.min },
      { x: xRange.min, y: yRange.max },
      { x: xRange.max, y: yRange.max },
      { x: xRange.max, y: yRange.min },
    ];
    const intersections = corners.filter((point: Point, index: number) => {
      if (index !== 0) {
        // return true if border formed by conecting current corner and previous corner intersects with the segment
        return this._lineIntersectsSegment(startPoint, endPoint, point, corners[index - 1]) &&
          this._lineIntersectsSegment(point, corners[index - 1], startPoint, endPoint);
      }
      return false;
    });
    return intersections.length > 0;
  }

  private _lineIntersectsSegment(point1: Point, point2: Point, point3: Point, point4: Point) {
    // tslint:disable-next-line:no-shadowed-variable
    const calcOrientation = (point1: Point, point2: Point, point: Point) => {
      return (point2.x - point1.x) * (point.y - point2.y) - (point2.y - point1.y) * (point.x - point2.x);
    };

    // point3 and point4 are on different sides of line formed by point1 and point2
    return calcOrientation(point1, point2, point3) * calcOrientation(point1, point2, point4) < 0;
  }
}
