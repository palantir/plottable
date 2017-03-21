/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Dataset } from "../core/dataset";
import { Accessor, AttributeToAppliedProjector } from "../core/interfaces";
import { SymbolFactory } from "../core/symbolFactories";
import { CanvasBuffer } from "./canvasBuffer";
import { Drawer } from "./drawer";
import { AppliedDrawStep } from "./index";

export class Symbol extends Drawer {
  private buffer: CanvasBuffer;

  constructor(
      dataset: Dataset,
      private symbolProjector: () => Accessor<SymbolFactory>,
      private sizeProjector: () => Accessor<number>,
  ) {
    super(dataset);
    this._svgElementName = "path";
    this._className = "symbol";
  }

  protected _drawStepCanvas(data: any[], step: AppliedDrawStep) {
    this._drawSymbolsRubberStamp(data, step);
  }

  /**
   * Uses an internal canvas buffer to blit the symbols into the canvas.
   *
   * For each symbol, we first detect if it's even in to the canvas bounds, if
   * not we continue. Then we check it's other style attributes and symbol type.
   * If those don't match what are in the buffer, we redraw the buffer. Finally,
   * we blit the buffer to the canvas at the symbol coordinates.
   */
  private _drawSymbolsRubberStamp(data: any[], step: AppliedDrawStep) {
    const ctx = this.canvas().node().getContext("2d");
    const projector = step.attrToAppliedProjector;
    const styleKeys = Object.keys(Drawer._CANVAS_CONTEXT_ATTRIBUTES);
    const attrKeys = styleKeys.concat(["x", "y"]);

    // create canvas intersection tester
    const { width, height } = ctx.canvas; // TODO devicePixelRatio?
    const intersectsCanvasBounds = (x: number, y: number, size: number) => {
      return (
        x + size >= 0 && x - size <= width &&
        y + size >= 0 && y - size <= height
      );
    };

    // lazilly create offscreen buffer of modest size
    if (this.buffer == null) {
      this.buffer = new CanvasBuffer(10, 10, 1);
      this.buffer.ctx.translate(5, 5);
    }

    let prevAttrs: any = null;
    let prevSymbolGenerator: any = null;
    let prevSymbolSize: number = null;
    let skipped = 0;
    for(let index = 0; index < data.length; index++) {
      const datum = data[index];

      // check symbol is in viewport
      const attrs = this._resolveAttributesSubset(projector, attrKeys, datum, index);
      const symbolSize = this.sizeProjector()(datum, index, this._dataset);
      if (!intersectsCanvasBounds(attrs["x"], attrs["y"], symbolSize * 2)) {
        skipped++;
        continue;
      }

      // check attributes and symbol type
      const attrsSame = this._attributesSame(prevAttrs, attrs, styleKeys);
      const symbolGenerator = this.symbolProjector()(datum, index, this._dataset);
      if (attrsSame && prevSymbolSize == symbolSize && prevSymbolGenerator == symbolGenerator) {
        skipped++;
      } else {
        // make room for bigger symbol if needed
        if (2*symbolSize > this.buffer.pixelWidth || 2*symbolSize > this.buffer.pixelHeight) {
          this.buffer.resize(2*symbolSize, 2*symbolSize);
          this.buffer.ctx.translate(symbolSize, symbolSize);
        }

        // draw actual symbol into buffer
        this.buffer.clear();
        const bufferCtx = this.buffer.ctx;
        bufferCtx.beginPath();
        symbolGenerator(symbolSize).context(bufferCtx)(null);
        bufferCtx.closePath();
        this._setCanvasContextStyles(attrs, bufferCtx);

        // save the values that are in the buffer
        prevSymbolGenerator = symbolGenerator;
        prevSymbolSize = symbolSize;
        prevAttrs = attrs;
      }

      // blit the buffer to the canvas
      this.buffer.blitCenter(ctx, attrs["x"], attrs["y"]);
    }
  }

  private _attributesSame(prevAttrs: any, attrs: any, attrKeys: string[]) {
    if (prevAttrs == null) {
      return false;
    }
    for (let i = 0; i < attrKeys.length; i++) {
      const attrKey = attrKeys[i];
      if (prevAttrs[attrKey] != attrs[attrKey]) {
        return false;
      }
    }
    return true;
  }

  private _resolveAttributesSubset(projector: AttributeToAppliedProjector, attrKeys: string[], datum: any, index: number){
    const attrs: {[key: string]: any} = {};
    for (let i = 0; i < attrKeys.length; i++) {
      const attrKey = attrKeys[i];
      if (projector.hasOwnProperty(attrKey)) {
        attrs[attrKey] = projector[attrKey](datum, index);
      }
    }
    return attrs;
  }
}
