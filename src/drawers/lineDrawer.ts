/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Dataset } from "../core/dataset";

import { SimpleSelection } from "../core/interfaces";
import { Drawer } from "./drawer";
import { AppliedDrawStep } from "./index";

interface ILineBucket {
  min: number;
  max: number;
  prevX: number;
  prevY: number;
}

type d3Projector = (d: any, index: number, data: any[]) => number;

export class Line extends Drawer {
  public static COLLAPSE_LINES = true;

  private _d3LineFactory: () => d3.Line<any>;

  /**
   * @param dataset
   * @param _d3LineFactory A callback that gives this Line Drawer a d3.Line object which will be
   * used to draw with.
   */
  constructor(dataset: Dataset, d3LineFactory: () => d3.Line<any>) {
    super(dataset);
    this._d3LineFactory = d3LineFactory;
    this._className = "line";
    this._svgElementName = "path";
  }

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    super._applyDefaultAttributes(selection);
    selection.style("fill", "none");
  }

  public selectionForIndex(index: number): SimpleSelection<any> {
    return d3.select(this.selection().node());
  }

  /**
   *
   * @param data Data to draw. The data will be passed through the line factory in order to get applied
   * onto the canvas.
   * @param step
   * @private
   */
  protected _drawStepCanvas(data: any[][], step: AppliedDrawStep) {
    const context = this.canvas().node().getContext("2d");

    const d3Line = this._d3LineFactory();

    const attrToAppliedProjector = step.attrToAppliedProjector;
    const resolvedAttrs = Object.keys(attrToAppliedProjector).reduce((obj, attrName) => {
      obj[attrName] = attrToAppliedProjector[attrName](data, 0);
      return obj;
    }, {} as { [key: string]: any | number | string });

    context.save();

    context.beginPath();

    if (Line.COLLAPSE_LINES) {
      this._collapseLineGeometry(context, data[0]);
    } else {
      d3Line.context(context);
      d3Line(data[0]);
    }

    if (resolvedAttrs["stroke-width"]) {
      context.lineWidth = parseFloat(resolvedAttrs["stroke-width"]);
    }

    if (resolvedAttrs["stroke"]) {
      const strokeColor = d3.color(resolvedAttrs["stroke"]);
      if (resolvedAttrs["opacity"]) {
        strokeColor.opacity = resolvedAttrs["opacity"];
      }
      context.strokeStyle = strokeColor.rgb().toString();
      context.stroke();
    }

    context.restore();
  }

  /**
   * Collapse line geometry
   *
   * Assuming that there are many points that are drawn on the same coordinate,
   * we can save a lot of render time by just drawing one line from the min to
   * max y-coordinate of all those points.
   */
  private _collapseLineGeometry(ctx: CanvasRenderingContext2D, data: any[]) {
    const d3Line = this._d3LineFactory();
    const xFn = d3Line.x();
    const yFn = d3Line.y();

    // move to valid start
    let i = 0;
    for (; i <= data.length; ++i) {
      const d = data[i];
      if (d != null) {
        const x = xFn(d, i, data);
        const y = yFn(d, i, data);
        ctx.moveTo(x, y);
        ++i;
        break;
      }
    }

    const bucket: ILineBucket = {
      min: null,
      max: null,
      prevX: null,
      prevY: null,
    };
    // iterate over subsequent points
    // TODO determine if we should collapse x or y or not collapse at all.
    // For now, we assume line charts are always a function of x
    this._bucketByX(ctx, data, i, xFn, yFn, bucket);

    // finally, draw last line segment
    if (bucket.prevX != null) {
      ctx.lineTo(bucket.prevX, bucket.prevY);
    }
  }

  /**
   * Iterates over the line points collapsing points that fall on the same
   * floored x coordinate.
   *
   * Once all the points with the same x coordinate are detected, we draw a
   * single line from the min to max y coorindate.
   *
   * The "entrance" and "exit" lines to/from this collapsed vertical line are
   * also drawn. This allows lines with no collapsed segments to render
   * correctly.
   */
  private _bucketByX(
      ctx: CanvasRenderingContext2D,
      data: any[],
      iStart: number,
      xFn: d3Projector,
      yFn: d3Projector,
      bucket: ILineBucket,
    ) {

    for (let i = iStart; i <= data.length; ++i) {
      const d = data[i];
      if (d == null) {
        continue;
      }
      const x = Math.floor(xFn(d, i, data));
      const y = yFn(d, i, data);

      if (bucket.prevX != null) {
        if (bucket.prevX == x) {
          // point is inside of bucket
          if (bucket.min == null) {
            bucket.min = y;
            bucket.max = y;
          } else if (y < bucket.min) {
            bucket.min = y;
          } else if (y > bucket.max) {
            bucket.max = y;
          }
        } else {
          // point is outside of bucket
          if (bucket.min != null) {
            // if the bucket had valid bounds, finish drawing it
            ctx.lineTo(bucket.prevX, bucket.min); // to bucket min
            ctx.lineTo(bucket.prevX, bucket.max); // to bucket max
            ctx.lineTo(bucket.prevX, bucket.prevY); // to bucket exit
          }
          ctx.lineTo(x, y); // draw line to current point
          bucket.min = bucket.max = null;
        }
      }

      bucket.prevX = x;
      bucket.prevY = y;
    }
  }
}
