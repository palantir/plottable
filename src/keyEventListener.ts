///<reference path="reference.ts" />

module Plottable {
  export interface IKeyEventListenerCallback {
    (e: D3.Event): any
  }

  export class KeyEventListener {
    private static INITIALIZED = false;
    private static CALLBACKS: IKeyEventListenerCallback[][] = [];

    public static initialize() {
      if (KeyEventListener.INITIALIZED) {
        return;
      }
      d3.select(document).on("keydown", KeyEventListener.processEvent);
      KeyEventListener.INITIALIZED = true;
    }

    public static addCallback(keyCode: number, cb: IKeyEventListenerCallback) {
      if (!KeyEventListener.INITIALIZED) {
        KeyEventListener.initialize();
      }

      if (KeyEventListener.CALLBACKS[keyCode] == null) {
        KeyEventListener.CALLBACKS[keyCode] = [];
      }

      KeyEventListener.CALLBACKS[keyCode].push(cb);
    }

    private static processEvent() {
      if (KeyEventListener.CALLBACKS[d3.event.keyCode] == null) {
        return;
      }

      KeyEventListener.CALLBACKS[d3.event.keyCode].forEach((cb: IKeyEventListenerCallback) => {
        cb(d3.event);
      });
    }
  }
}
