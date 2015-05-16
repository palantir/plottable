///<reference path="../reference.ts" />

module Plottable {
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
   * Plottable.RenderController.setRenderPolicy(
   *   new Plottable.RenderPolicies.Immediate()
   * );
   * ```
   */
  export module RenderController {
    var _componentsNeedingRender = new Utils.Set<Component>();
    var _componentsNeedingComputeLayout = new Utils.Set<Component>();
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
     * @param {Component} component Any Plottable component.
     */
    export function registerToRender(component: Component) {
      if (_isCurrentlyFlushing) {
        Utils.Methods.warn("Registered to render while other components are flushing: request may be ignored");
      }
      _componentsNeedingRender.add(component);
      requestRender();
    }

    /**
     * If the RenderController is enabled, we enqueue the component for
     * layout and render. Otherwise, it is rendered immediately.
     *
     * @param {Component} component Any Plottable component.
     */
    export function registerToComputeLayout(component: Component) {
      _componentsNeedingComputeLayout.add(component);
      _componentsNeedingRender.add(component);
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
        _componentsNeedingComputeLayout.values().forEach((component: Component) => component.computeLayout());

        // Top level render; Containers will put their children in the toRender queue
        _componentsNeedingRender.values().forEach((component: Component) => component.render());

        _isCurrentlyFlushing = true;
        var failed = new Utils.Set<Component>();
        _componentsNeedingRender.values().forEach((component: Component) => {
          try {
            component.renderImmediately();
          } catch (err) {
            // throw error with timeout to avoid interrupting further renders
            window.setTimeout(() => { throw err; }, 0);
            failed.add(component);
          }
        });
        _componentsNeedingComputeLayout = new Utils.Set<Component>();
        _componentsNeedingRender = failed;
        _animationRequested = false;
        _isCurrentlyFlushing = false;
      }
    }
  }
}
