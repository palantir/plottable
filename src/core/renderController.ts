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
    var componentsNeedingRender: {[key: string]: Component} = {};
    var componentsNeedingComputeLayout: {[key: string]: Component} = {};
    var animationRequested: boolean = false;
    var isCurrentlyFlushing: boolean = false;
    export var renderPolicy: RenderPolicies.RenderPolicy = new RenderPolicies.AnimationFrame();

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
      renderPolicy = <RenderPolicies.RenderPolicy> policy;
    }

    /**
     * If the RenderController is enabled, we enqueue the component for
     * render. Otherwise, it is rendered immediately.
     *
     * @param {Component} component Any Plottable component.
     */
    export function registerToRender(c: Component) {
      if (isCurrentlyFlushing) {
        Utils.Methods.warn("Registered to render while other components are flushing: request may be ignored");
      }
      componentsNeedingRender[c.getID()] = c;
      requestRender();
    }

    /**
     * If the RenderController is enabled, we enqueue the component for
     * layout and render. Otherwise, it is rendered immediately.
     *
     * @param {Component} component Any Plottable component.
     */
    export function registerToComputeLayout(c: Component) {
      componentsNeedingComputeLayout[c.getID()] = c;
      componentsNeedingRender[c.getID()] = c;
      requestRender();
    }

    function requestRender() {
      // Only run or enqueue flush on first request.
      if (!animationRequested) {
        animationRequested = true;
        renderPolicy.render();
      }
    }

    /**
     * Render everything that is waiting to be rendered right now, instead of
     * waiting until the next frame.
     *
     * Useful to call when debugging.
     */
    export function flush() {
      if (animationRequested) {
        // Layout
        var toCompute = d3.values(componentsNeedingComputeLayout);
        toCompute.forEach((c) => c._computeLayout());

        // Top level render.
        // Containers will put their children in the toRender queue
        var toRender = d3.values(componentsNeedingRender);
        toRender.forEach((c) => c._render());

        // now we are flushing
        isCurrentlyFlushing = true;

        // Finally, perform render of all components
        var failed: {[key: string]: Component} = {};
        Object.keys(componentsNeedingRender).forEach((k) => {
          try {
            componentsNeedingRender[k]._doRender();
          } catch (err) {
            // using setTimeout instead of console.log, we get the familiar red
            // stack trace
            setTimeout(() => {
              throw err;
            }, 0);
            failed[k] = componentsNeedingRender[k];
          }
        });

        // Reset queues
        componentsNeedingComputeLayout = {};
        componentsNeedingRender = failed;
        animationRequested = false;
        isCurrentlyFlushing = false;
      }
    }
  }

}
}
