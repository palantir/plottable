/// <reference path="../reference.d.ts" />
declare module Plottable {
    class Axis extends Component {
        public axisElement: D3.Selection;
        private d3Axis;
        public _axisScale: Scale;
        private _showEndTickLabels;
        private tickPositioning;
        static _DEFAULT_TICK_SIZE: number;
        /**
        * Creates an Axis.
        *
        * @constructor
        * @param {Scale} scale The Scale to base the Axis on.
        * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
        * @param {any} [formatter] a D3 formatter
        */
        constructor(axisScale: Scale, orientation: string, formatter?: any);
        public _setup(): Axis;
        public _doRender(): Axis;
        public showEndTickLabels(): boolean;
        public showEndTickLabels(show: boolean): Axis;
        public _hideCutOffTickLabels(): Axis;
        public _hideOverlappingTickLabels(): void;
        public scale(): Scale;
        public scale(newScale: Scale): Axis;
        /**
        * Sets or gets the tick label position relative to the tick marks.
        * The exact consequences of particular tick label positionings depends on the subclass implementation.
        *
        * @param {string} [position] The relative position of the tick label.
        * @returns {string|Axis} The current tick label position, or the calling Axis.
        */
        public tickLabelPosition(): string;
        public tickLabelPosition(position: string): Axis;
        public orient(): string;
        public orient(newOrient: string): Axis;
        public ticks(): any[];
        public ticks(...args: any[]): Axis;
        public tickValues(): any[];
        public tickValues(...args: any[]): Axis;
        public tickSize(): number;
        public tickSize(inner: number): Axis;
        public tickSize(inner: number, outer: number): Axis;
        public innerTickSize(): number;
        public innerTickSize(val: number): Axis;
        public outerTickSize(): number;
        public outerTickSize(val: number): Axis;
        public tickPadding(): number;
        public tickPadding(val: number): Axis;
        /**
        * Gets the current tick formatting function, or sets the tick formatting function.
        *
        * @param {(value: any) => string} [formatter] The new tick formatting function.
        * @returns The current tick formatting function, or the calling Axis.
        */
        public tickFormat(): (value: any) => string;
        public tickFormat(formatter: (value: any) => string): Axis;
    }
    class XAxis extends Axis {
        private _height;
        /**
        * Creates an XAxis (a horizontal Axis).
        *
        * @constructor
        * @param {Scale} scale The Scale to base the Axis on.
        * @param {string} orientation The orientation of the Axis (top/bottom)
        * @param {any} [formatter] a D3 formatter
        */
        constructor(scale: Scale, orientation?: string, formatter?: any);
        public height(h: number): XAxis;
        public _setup(): XAxis;
        public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest;
        /**
        * Sets or gets the tick label position relative to the tick marks.
        *
        * @param {string} [position] The relative position of the tick label (left/center/right).
        * @returns {string|XAxis} The current tick label position, or the calling XAxis.
        */
        public tickLabelPosition(): string;
        public tickLabelPosition(position: string): XAxis;
        public _doRender(): XAxis;
    }
    class YAxis extends Axis {
        private _width;
        /**
        * Creates a YAxis (a vertical Axis).
        *
        * @constructor
        * @param {Scale} scale The Scale to base the Axis on.
        * @param {string} orientation The orientation of the Axis (left/right)
        * @param {any} [formatter] a D3 formatter
        */
        constructor(scale: Scale, orientation?: string, formatter?: any);
        public _setup(): YAxis;
        public width(w: number): YAxis;
        public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest;
        /**
        * Sets or gets the tick label position relative to the tick marks.
        *
        * @param {string} [position] The relative position of the tick label (top/middle/bottom).
        * @returns {string|YAxis} The current tick label position, or the calling YAxis.
        */
        public tickLabelPosition(): string;
        public tickLabelPosition(position: string): YAxis;
        public _doRender(): YAxis;
    }
}
