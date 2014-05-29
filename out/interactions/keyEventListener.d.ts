/// <reference path="../reference.d.ts" />
declare module Plottable {
    interface IKeyEventListenerCallback {
        (e: D3.Event): any;
    }
    class KeyEventListener {
        private static initialized;
        private static callbacks;
        static initialize(): void;
        static addCallback(keyCode: number, cb: IKeyEventListenerCallback): void;
        private static processEvent();
    }
}
