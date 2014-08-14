///<reference path="../reference.ts" />

module Plottable {
export module Core {
export module RenderController {

  export module RenderPolicy {
    export interface IRenderPolicy {
      render(): any;
    }

    export class Immediate implements IRenderPolicy {
      public render() {
        RenderController.flush();
      }
    }

    export class AnimationFrame implements IRenderPolicy {
      public render() {
        _Util.DOM.requestAnimationFramePolyfill(RenderController.flush);
      }
    }

    export class Timeout implements IRenderPolicy {
      public _timeoutMsec: number = _Util.DOM.POLYFILL_TIMEOUT_MSEC;

      public render() {
        setTimeout(RenderController.flush, this._timeoutMsec);
      }
    }
  }

}
}
}
