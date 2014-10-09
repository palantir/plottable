///<reference path="../reference.ts" />

module Plottable {
export module Core {
export module RenderController {

  export module RenderPolicy {
    /**
     * A policy to render components.
     */
    export interface RenderPolicy {
      render(): any;
    }

    /**
     * Never queue anything, render everything immediately. Useful for
     * debugging, horrible for performance.
     */
    export class Immediate implements RenderPolicy {
      public render() {
        RenderController.flush();
      }
    }

    /**
     * The default way to render, which only tries to render every frame
     * (usually, 1/60th of a second).
     */
    export class AnimationFrame implements RenderPolicy {
      public render() {
        _Util.DOM.requestAnimationFramePolyfill(RenderController.flush);
      }
    }

    /**
     * Renders with `setTimeout`. This is generally an inferior way to render
     * compared to `requestAnimationFrame`, but it's still there if you want
     * it.
     */
    export class Timeout implements RenderPolicy {
      public _timeoutMsec: number = _Util.DOM.POLYFILL_TIMEOUT_MSEC;

      public render() {
        setTimeout(RenderController.flush, this._timeoutMsec);
      }
    }
  }

}
}
}
