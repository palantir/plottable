///<reference path="../reference.ts" />

module Plottable {
  export interface IKeyEventListenerCallback {
    (e: D3.Event): any
  }

  export class KeyEventListener {
    private static initialized = false;
    private static callbacks: IKeyEventListenerCallback[][] = [];

    public static initialize() {
      if (KeyEventListener.initialized) {
        return;
      }
      d3.select(document).on("keydown", KeyEventListener.processEvent);
      KeyEventListener.initialized = true;
    }

    public static addCallback(keyCode: number, cb: IKeyEventListenerCallback) {
      if (!KeyEventListener.initialized) {
        KeyEventListener.initialize();
      }

      if (KeyEventListener.callbacks[keyCode] == null) {
        KeyEventListener.callbacks[keyCode] = [];
      }

      KeyEventListener.callbacks[keyCode].push(cb);
    }

    private static processEvent() {
      if (KeyEventListener.callbacks[d3.event.keyCode] == null) {
        return;
      }

      KeyEventListener.callbacks[d3.event.keyCode].forEach((cb: IKeyEventListenerCallback) => {
        cb(d3.event);
      });
    }
  }
}
