/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { AttributeToAppliedProjector, IAccessor } from "../core/interfaces";
import {
    CanvasDrawStep,
    ContextStyleAttrs,
    getStrokeWidth,
    renderPathWithStyle,
    resolveAttributes,
} from "./canvasDrawer";

import { Dataset } from "../core/dataset";
import { SymbolFactory } from "../core/symbolFactories";
import { CanvasBuffer } from "./canvasBuffer";
import { SVGDrawer } from "./svgDrawer";

export class SymbolSVGDrawer extends SVGDrawer {
    constructor() {
        super("path", "symbol");
    }
}

const SYMBOL_ATTRS = ContextStyleAttrs.concat(["x", "y"]);

export function makeSymbolCanvasDrawStep(
        dataset: Dataset,
        symbolProjector: () => IAccessor<SymbolFactory>,
        sizeProjector: () => IAccessor<number>,
        stepBuffer?: CanvasBuffer,
    ): CanvasDrawStep {
    return (context: CanvasRenderingContext2D, data: any[][], attrToAppliedProjector: AttributeToAppliedProjector) => {
        const { clientWidth, clientHeight } = context.canvas;

        const buffer = (stepBuffer === undefined) ? new CanvasBuffer(0, 0) : stepBuffer;
        const symbolAccessor = symbolProjector();
        const sizeAccessor = sizeProjector();

        let prevAttrs: any = null;
        let prevSymbolGenerator: any = null;
        let prevSymbolSize: number = null;
        for (let index = 0; index < data.length; index++) {
            const datum = data[index];
            if (datum == null) {
                continue;
            }

            // check symbol is in viewport
            const attrs = resolveAttributes(attrToAppliedProjector, SYMBOL_ATTRS, datum, index);
            const symbolSize = sizeAccessor(datum, index, dataset);
            if (!squareOverlapsBounds(clientWidth, clientHeight, attrs["x"], attrs["y"], symbolSize)) {
                continue;
            }

            // check attributes and symbol type
            const attrsSame = isAttributeValuesEqual(prevAttrs, attrs, ContextStyleAttrs);
            const symbolGenerator = symbolAccessor(datum, index, dataset);
            if (attrsSame && prevSymbolSize == symbolSize && prevSymbolGenerator == symbolGenerator) {
                // no-op;
            } else {
                // make room for bigger symbol if needed
                const strokeWidth = getStrokeWidth(attrs);

                // +1 to account for subpixel aliasing
                const wantedBufferSize = symbolSize + strokeWidth + 1;
                if (wantedBufferSize > buffer.screenWidth || wantedBufferSize > buffer.screenHeight) {
                    buffer.resize(wantedBufferSize, wantedBufferSize, true);
                }

                // draw actual symbol into buffer
                buffer.clear();
                const bufferCtx = buffer.ctx;
                bufferCtx.beginPath();
                symbolGenerator(symbolSize).context(bufferCtx)(null);
                bufferCtx.closePath();

                renderPathWithStyle(bufferCtx, attrs);

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
}

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
