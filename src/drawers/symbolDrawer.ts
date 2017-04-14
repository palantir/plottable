/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Dataset } from "../core/dataset";
import { AttributeToAppliedProjector, IAccessor } from "../core/interfaces";
import { SymbolFactory } from "../core/symbolFactories";
import { CanvasBuffer } from "./canvasBuffer";
import { CanvasDrawStep, ContextStyleAttrs, resolveAttributesSubsetWithStyles, styleContext } from "./canvasDrawer";
import { SVGDrawer } from "./svgDrawer";

export class SymbolSVGDrawer extends SVGDrawer {
    constructor() {
        super("path", "symbol");
    }
}

export function makeSymbolCanvasDrawStep(
        dataset: Dataset,
        symbolProjector: () => IAccessor<SymbolFactory>,
        sizeProjector: () => IAccessor<number>,
        stepBuffer?: CanvasBuffer,
    ): CanvasDrawStep {
    return (context: CanvasRenderingContext2D, data: any[][], attrToAppliedProjector: AttributeToAppliedProjector) => {
        const { width, height } = context.canvas;
        const buffer = (stepBuffer === undefined) ? new CanvasBuffer(0, 0) : stepBuffer;
        const symbolAccessor = symbolProjector();
        const sizeAccessor = sizeProjector();

        let prevAttrs: any = null;
        let prevSymbolGenerator: any = null;
        let prevSymbolSize: number = null;
        for (let index = 0; index < data.length; index++) {
            const datum = data[index];

            // check symbol is in viewport
            const attrs = resolveAttributesSubsetWithStyles(attrToAppliedProjector, ["x", "y"], datum, index);
            const symbolSize = sizeAccessor(datum, index, dataset);
            if (!squareOverlapsBounds(width, height, attrs["x"], attrs["y"], symbolSize)) {
                continue;
            }

            // check attributes and symbol type
            const attrsSame = isAttributeValuesEqual(prevAttrs, attrs, Object.keys(ContextStyleAttrs));
            const symbolGenerator = symbolAccessor(datum, index, this._dataset);
            if (attrsSame && prevSymbolSize == symbolSize && prevSymbolGenerator == symbolGenerator) {
                // no-op;
            } else {
                // make room for bigger symbol if needed
                if (symbolSize > buffer.screenWidth || symbolSize > buffer.screenHeight) {
                    buffer.resize(symbolSize, symbolSize, true);
                }

                // draw actual symbol into buffer
                buffer.clear();
                const bufferCtx = buffer.ctx;
                bufferCtx.beginPath();
                symbolGenerator(symbolSize).context(bufferCtx)(null);
                bufferCtx.closePath();

                styleContext(bufferCtx, attrs);

                // save the values that are in the buffer
                prevSymbolGenerator = symbolGenerator;
                prevSymbolSize = symbolSize;
                prevAttrs = attrs;
            }

            // blit the buffer to the canvas
            buffer.blitCenter(context, attrs["x"], attrs["y"]);
        }
    };
}

function squareOverlapsBounds(width: number, height: number, x: number, y: number, size: number) {
    return (
        x + size >= 0 && x - size <= width &&
        y + size >= 0 && y - size <= height
    );
};

function isAttributeValuesEqual(prevAttrs: any, attrs: any, attrKeys: string[]) {
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
