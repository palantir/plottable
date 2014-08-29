///<reference path="../reference.ts" />

module Plottable {
export module Core {

  /**
   * The RenderController is responsible for enqueueing and synchronizing
   * layout and render calls for Plottable components.
   *
   * Layouts and renders occur inside an animation callback
   * (window.requestAnimationFrame if available).
   *
   * If you require immediate rendering, call RenderController.flush() to
   * perform enqueued layout and rendering serially.
   *
   * If you want to always have immediate rendering (useful for debugging),
   * call
   * ```typescript
   * Plottable.Core.RenderController.setRenderPolicy(
   *   new Plottable.Core.RenderController.RenderPolicy.Immediate()
   * );
   * ```
   */
  export module RenderController {
    var _componentsNeedingRender: {[key: string]: Abstract.Component} = {};
    var _componentsNeedingComputeLayout: {[key: string]: Abstract.Component} = {};
    var _animationRequested: boolean = false;
    var _isCurrentlyFlushing: boolean = false;
    export var _renderPolicy: RenderPolicy.IRenderPolicy = new RenderPolicy.AnimationFrame();

    export function setRenderPolicy(policy: RenderPolicy.IRenderPolicy): any {
      _renderPolicy = policy;
    }

    /**
     * If the RenderController is enabled, we enqueue the component for
     * render. Otherwise, it is rendered immediately.
     *
     * @param {Abstract.Component} component Any Plottable component.
     */
    export function registerToRender(c: Abstract.Component) {
      if (_isCurrentlyFlushing) {
        _Util.Methods.warn("Registered to render while other components are flushing: request may be ignored");
      }
      _componentsNeedingRender[c._plottableID] = c;
      requestRender();
    }

    /**
     * If the RenderController is enabled, we enqueue the component for
     * layout and render. Otherwise, it is rendered immediately.
     *
     * @param {Abstract.Component} component Any Plottable component.
     */
    export function registerToComputeLayout(c: Abstract.Component) {
      _componentsNeedingComputeLayout[c._plottableID] = c;
      _componentsNeedingRender[c._plottableID] = c;
      requestRender();
    }

    function requestRender() {
      // Only run or enqueue flush on first request.
      if (!_animationRequested) {
        _animationRequested = true;
        _renderPolicy.render();
      }
    }

    /**
     * Render everything that is waiting to be rendered right now, instead of
     * waiting until the next frame.
     *
     * Useful to call when debugging.
     */
    export function flush() {
      if (_animationRequested) {
        // Layout
        var toCompute = d3.values(_componentsNeedingComputeLayout);
        toCompute.forEach((c) => c._computeLayout());

        // Top level render.
        // Containers will put their children in the toRender queue
        var toRender = d3.values(_componentsNeedingRender);
        toRender.forEach((c) => c._render());

        // now we are flushing
        _isCurrentlyFlushing = true;

        // Finally, perform render of all components
        var failed: {[key: string]: Abstract.Component} = {};
        Object.keys(_componentsNeedingRender).forEach((k) => {
          try {
            _componentsNeedingRender[k]._doRender();
          } catch (err) {
            // using setTimeout instead of console.log, we get the familiar red
            // stack trace
            setTimeout(() => {
              throw err;
            }, 0);
            failed[k] = _componentsNeedingRender[k];
          }
        });

        // Reset queues
        _componentsNeedingComputeLayout = {};
        _componentsNeedingRender = failed;
        _animationRequested = false;
        _isCurrentlyFlushing = false;
      }

      // Reset resize flag regardless of queue'd components
      ResizeBroadcaster.clearResizing();
    }
  }

}
}
