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
  export module RenderControllers {
    var _componentsNeedingRender: {[key: string]: Components.AbstractComponent} = {};
    var _componentsNeedingComputeLayout: {[key: string]: Components.AbstractComponent} = {};
    var _animationRequested: boolean = false;
    var _isCurrentlyFlushing: boolean = false;
    export var _renderPolicy: RenderPolicies.RenderPolicy = new RenderPolicies.AnimationFrame();

    export function setRenderPolicy(policy: string | RenderPolicies.RenderPolicy): void {
      if (typeof(policy) === "string") {
        switch ((<string> policy).toLowerCase()) {
          case "immediate":
          policy = new RenderPolicies.Immediate();
          break;
          case "animationframe":
          policy = new RenderPolicies.AnimationFrame();
          break;
          case "timeout":
          policy = new RenderPolicies.Timeout();
          break;
          default:
          Utils.Methods.warn("Unrecognized renderPolicy: " + policy);
          return;
        }
      }
      _renderPolicy = <RenderPolicies.RenderPolicy> policy;
    }

    /**
     * If the RenderController is enabled, we enqueue the component for
     * render. Otherwise, it is rendered immediately.
     *
     * @param {AbstractComponent} component Any Plottable component.
     */
    export function registerToRender(c: Components.AbstractComponent) {
      if (_isCurrentlyFlushing) {
        Utils.Methods.warn("Registered to render while other components are flushing: request may be ignored");
      }
      _componentsNeedingRender[c.getID()] = c;
      requestRender();
    }

    /**
     * If the RenderController is enabled, we enqueue the component for
     * layout and render. Otherwise, it is rendered immediately.
     *
     * @param {AbstractComponent} component Any Plottable component.
     */
    export function registerToComputeLayout(c: Components.AbstractComponent) {
      _componentsNeedingComputeLayout[c.getID()] = c;
      _componentsNeedingRender[c.getID()] = c;
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
        var failed: {[key: string]: Components.AbstractComponent} = {};
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
    }
  }

}
}
