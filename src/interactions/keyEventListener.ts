///<reference path="../reference.ts" />

module Plottable {
export module Core {
  export interface IKeyEventListenerCallback {
    (e: D3.D3Event): any
  }

  export module KeyEventListener {
    var _initialized: boolean = false;
    var _callbacks: IKeyEventListenerCallback[][] = [];

    export function initialize() {
      if (_initialized) {
        return;
      }
      d3.select(document).on("keydown", processEvent);
      _initialized = true;
    }

    export function addCallback(keyCode: number, cb: IKeyEventListenerCallback) {
      if (!_initialized) {
        initialize();
      }

      if (_callbacks[keyCode] == null) {
        _callbacks[keyCode] = [];
      }

      _callbacks[keyCode].push(cb);
    }

    function processEvent() {
      if (_callbacks[d3.event.keyCode] == null) {
        return;
      }

      _callbacks[d3.event.keyCode].forEach((cb: IKeyEventListenerCallback) => {
        cb(d3.event);
      });
    }
  }
}
}
