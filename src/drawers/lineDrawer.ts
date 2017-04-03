/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { AttributeToAppliedProjector, SimpleSelection } from "../core/interfaces";
import { CanvasDrawStep } from "./canvasDrawer";
import { SVGDrawer } from "./svgDrawer";
import { AppliedDrawStep } from "./index";

interface ILineBucket {
  min: number;
  max: number;
  prevX: number;
  prevY: number;
}

type d3Projector = (d: any, index: number, data: any[]) => number;

export class LineSVGDrawer extends SVGDrawer {
  constructor() {
    super("path", "line");
  }

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    selection.style("fill", "none");
  }

  public getVisualPrimitiveAtIndex(index: number) {
    return super.getVisualPrimitiveAtIndex(0);
  }
}

/**
 * @param d3LineFactory A callback that gives this Line Drawer a d3.Line object which will be
 * used to draw with.
 *
 * TODO put the d3.Line into the attrToAppliedProjector directly
 */
export function makeLineCanvasDrawStep(d3LineFactory: () => d3.Line<any>, collapseProximateX = true): CanvasDrawStep {
  return (context: CanvasRenderingContext2D, data: any[][], attrToAppliedProjector: AttributeToAppliedProjector) => {
    const d3Line = d3LineFactory();
    const resolvedAttrs = Object.keys(attrToAppliedProjector).reduce((obj, attrName) => {
      if (attrName !== "d") {
        obj[attrName] = attrToAppliedProjector[attrName](data[0], 0);
      }
      return obj;
    }, {} as { [key: string]: any | number | string });

    context.beginPath();

    if (collapseProximateX) {
      _collapseLineGeometry(context, data[0]);
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
  function _collapseLineGeometry(ctx: CanvasRenderingContext2D, data: any[]) {
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
    _bucketByX(ctx, data, i, xFn, yFn, bucket);

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
  function _bucketByX(
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
