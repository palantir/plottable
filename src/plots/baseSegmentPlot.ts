/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as Animators from "../animators";

import { BaseXYPlot, IXYPlot } from "./baseXYPlot";
import { DrawStep } from "../drawers";
import { Dataset } from "../core/dataset";
import { PlotEntity, TransformableAccessorScaleBinding, AccessorScaleBinding } from "./";
import { Accessor, Point, Bounds, Range, AttributeToProjector } from "../core/interfaces";
import { Scale } from "../scales/scale";

export interface ISegmentPlot<X, Y> extends IXYPlot<X, Y> {
  /**
   * Gets the Entities that intersect the Bounds.
   *
   * @param {Bounds} bounds
   * @returns {PlotEntity[]}
   */
  entitiesIn(bounds: Bounds): PlotEntity[];
  /**
   * Gets the Entities that intersect the area defined by the ranges.
   *
   * @param {Range} xRange
   * @param {Range} yRange
   * @returns {PlotEntity[]}
   */
  entitiesIn(xRange: Range, yRange: Range): PlotEntity[];
  entitiesIn(xRangeOrBounds: Range | Bounds, yRange?: Range): PlotEntity[]
  /**
   * Gets the AccessorScaleBinding for X2
   */
  x2(): AccessorScaleBinding<X, number>;
  /**
   * Sets X2 to a constant number or the result of an Accessor.
   * If a Scale has been set for X, it will also be used to scale X2.
   *
   * @param {number|Accessor<number>|Y|Accessor<Y>} y2
   * @returns {Plots.Segment} The calling Segment Plot
   */
  x2(x2: number | Accessor<number> | X | Accessor<X>): this;
  x2(x2?: number | Accessor<number> | X | Accessor<X>): any;
  /**
   * Gets the AccessorScaleBinding for Y2.
   */
  y2(): AccessorScaleBinding<Y, number>;
  /**
   * Sets Y2 to a constant number or the result of an Accessor.
   * If a Scale has been set for Y, it will also be used to scale Y2.
   *
   * @param {number|Accessor<number>|Y|Accessor<Y>} y2
   * @returns {Plots.Segment} The calling Segment Plot.
   */
  y2(y2: number | Accessor<number> | Y | Accessor<Y>): this;
  y2(y2?: number | Accessor<number> | Y | Accessor<Y>): any;
}

export class BaseSegmentPlot<X, Y> extends BaseXYPlot<X, Y> implements ISegmentPlot<X, Y> {
  private static _X2_KEY = "x2";
  private static _Y2_KEY = "y2";

  public entitiesAt(point: Point) {
    const entity = this.entityNearest(point);
    if (entity != null) {
      return [entity];
    } else {
      return [];
    }
  }

  public entitiesIn(bounds: Bounds): PlotEntity[];
  public entitiesIn(xRange: Range, yRange: Range): PlotEntity[];
  public entitiesIn(xRangeOrBounds: Range | Bounds, yRange?: Range): PlotEntity[] {
    let dataXRange: Range;
    let dataYRange: Range;
    if (yRange == null) {
      let bounds = (<Bounds> xRangeOrBounds);
      dataXRange = { min: bounds.topLeft.x, max: bounds.bottomRight.x };
      dataYRange = { min: bounds.topLeft.y, max: bounds.bottomRight.y };
    } else {
      dataXRange = (<Range> xRangeOrBounds);
      dataYRange = yRange;
    }
    return this._entitiesIntersecting(dataXRange, dataYRange);
  }

  public x(): TransformableAccessorScaleBinding<X, number>;
  public x(x: number | Accessor<number>): this;
  public x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
  public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
    if (x == null) {
      return super.x();
    }
    if (xScale == null) {
      super.x(<number | Accessor<number>>x);
    } else {
      super.x(<X | Accessor<X>>x, xScale);
      let x2Binding = this.x2();
      let x2 = x2Binding && x2Binding.accessor;
      if (x2 != null) {
        this._bindProperty(BaseSegmentPlot._X2_KEY, x2, xScale);
      }
    }

    return this;
  }

  public x2(): AccessorScaleBinding<X, number>;
  public x2(x2: number | Accessor<number> | X | Accessor<X>): this;
  public x2(x2?: number | Accessor<number> | X | Accessor<X>): any {
    if (x2 == null) {
      return this._propertyBindings.get(BaseSegmentPlot._X2_KEY);
    }
    let xBinding = this.x();
    let xScale = xBinding && xBinding.scale;
    this._bindProperty(BaseSegmentPlot._X2_KEY, x2, xScale);
    return this;
  }

  public y(): TransformableAccessorScaleBinding<Y, number>;
  public y(y: number | Accessor<number>): this;
  public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): this;
  public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
    if (y == null) {
      return super.y();
    }
    if (yScale == null) {
      super.y(<number | Accessor<number>>y);
    } else {
      super.y(<Y | Accessor<Y>>y, yScale);
      let y2Binding = this.y2();
      let y2 = y2Binding && y2Binding.accessor;
      if (y2 != null) {
        this._bindProperty(BaseSegmentPlot._Y2_KEY, y2, yScale);
      }
    }
    return this;
  }

  public y2(): AccessorScaleBinding<Y, number>;
  public y2(y2: number | Accessor<number> | Y | Accessor<Y>): this;
  public y2(y2?: number | Accessor<number> | Y | Accessor<Y>): any {
    if (y2 == null) {
      return this._propertyBindings.get(BaseSegmentPlot._Y2_KEY);
    }
    let yBinding = this.y();
    let yScale = yBinding && yBinding.scale;
    this._bindProperty(BaseSegmentPlot._Y2_KEY, y2, yScale);
    return this;
  }

  protected _filterForProperty(property: string) {
    if (property === "x2") {
      return super._filterForProperty("x");
    } else if (property === "y2") {
      return super._filterForProperty("y");
    }
    return super._filterForProperty(property);
  }

  protected _generateDrawSteps(): DrawStep[] {
    return [{ attrToProjector: this._generateAttrToProjector(), animator: new Animators.Null() }];
  }

  protected _propertyProjectors(): AttributeToProjector {
    let attrToProjector = super._propertyProjectors();
    attrToProjector["x1"] = BaseSegmentPlot._scaledAccessor(this.x());
    attrToProjector["x2"] = this.x2() == null ? BaseSegmentPlot._scaledAccessor(this.x()) : BaseSegmentPlot._scaledAccessor(this.x2());
    attrToProjector["y1"] = BaseSegmentPlot._scaledAccessor(this.y());
    attrToProjector["y2"] = this.y2() == null ? BaseSegmentPlot._scaledAccessor(this.y()) : BaseSegmentPlot._scaledAccessor(this.y2());
    return attrToProjector;
  }

  protected _updateExtentsForProperty(property: string) {
    super._updateExtentsForProperty(property);
    if (property === "x") {
      super._updateExtentsForProperty("x2");
    } else if (property === "y") {
      super._updateExtentsForProperty("y2");
    }
  }

  private _entitiesIntersecting(xRange: Range, yRange: Range): PlotEntity[] {
    let intersected: PlotEntity[] = [];
    let attrToProjector = this._generateAttrToProjector();
    this.entities().forEach((entity) => {
      if (this._lineIntersectsBox(entity, xRange, yRange, attrToProjector)) {
        intersected.push(entity);
      }
    });
    return intersected;
  }

  private _lineIntersectsBox(entity: PlotEntity, xRange: Range, yRange: Range, attrToProjector: AttributeToProjector) {
    let x1 = attrToProjector["x1"](entity.datum, entity.index, entity.dataset);
    let x2 = attrToProjector["x2"](entity.datum, entity.index, entity.dataset);
    let y1 = attrToProjector["y1"](entity.datum, entity.index, entity.dataset);
    let y2 = attrToProjector["y2"](entity.datum, entity.index, entity.dataset);

    // check if any of end points of the segment is inside the box
    if (( xRange.min <= x1 && x1 <= xRange.max && yRange.min <= y1 && y1 <= yRange.max ) ||
      ( xRange.min <= x2 && x2 <= xRange.max && yRange.min <= y2 && y2 <= yRange.max )) {
      return true;
    }

    let startPoint = { x: x1, y: y1 };
    let endPoint = { x: x2, y: y2 };
    let corners = [
      { x: xRange.min, y: yRange.min },
      { x: xRange.min, y: yRange.max },
      { x: xRange.max, y: yRange.max },
      { x: xRange.max, y: yRange.min },
    ];
    let intersections = corners.filter((point: Point, index: number) => {
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
    /* tslint:disable no-shadowed-variable */
    let calcOrientation = (point1: Point, point2: Point, point: Point) => {
      return (point2.x - point1.x) * (point.y - point2.y) - (point2.y - point1.y) * (point.x - point2.x);
    };
    /* tslint:enable no-shadowed-variable */

    // point3 and point4 are on different sides of line formed by point1 and point2
    return calcOrientation(point1, point2, point3) * calcOrientation(point1, point2, point4) < 0;
  }
}
