///<reference path="../reference.ts" />

module Plottable {
  /**
   * The RenderController is responsible for enqueueing and synchronizing
   * layout and render calls for Components.
   *
   * Layout and render calls occur inside an animation callback
   * (window.requestAnimationFrame if available).
   *
   * RenderController.flush() immediately lays out and renders all Components currently enqueued.
   *
   * To always have immediate rendering (useful for debugging), call
   * ```typescript
   * Plottable.RenderController.setRenderPolicy(
   *   new Plottable.RenderPolicies.Immediate()
   * );
   * ```
   */
  export module RenderController {
    var componentsNeedingRender = new Utils.Set<Component>();
    var componentsNeedingComputeLayout = new Utils.Set<Component>();
    var animationRequested = false;
    var isCurrentlyFlushing = false;
    export module Policy {
      export var IMMEDIATE = "immediate";
      export var ANIMATION_FRAME = "animationframe";
      export var TIMEOUT = "timeout";
    }
    export var _renderPolicy: RenderPolicies.RenderPolicy = new RenderPolicies.AnimationFrame();

    export function setRenderPolicy(policy: string) {
      switch (policy.toLowerCase()) {
        case Policy.IMMEDIATE:
          _renderPolicy = new RenderPolicies.Immediate();
          break;
        case Policy.ANIMATION_FRAME:
          _renderPolicy = new RenderPolicies.AnimationFrame();
          break;
        case Policy.TIMEOUT:
          _renderPolicy = new RenderPolicies.Timeout();
          break;
        default:
          Utils.Window.warn("Unrecognized renderPolicy: " + policy);
      }
    }

    /**
     * Enqueues the Component for rendering.
     *
     * @param {Component} component
     */
    export function registerToRender(component: Component) {
      if (isCurrentlyFlushing) {
        Utils.Window.warn("Registered to render while other components are flushing: request may be ignored");
      }
      componentsNeedingRender.add(component);
      requestRender();
    }

    /**
     * Enqueues the Component for layout and rendering.
     *
     * @param {Component} component
     */
    export function registerToComputeLayout(component: Component) {
      componentsNeedingComputeLayout.add(component);
      componentsNeedingRender.add(component);
      requestRender();
    }

    function requestRender() {
      // Only run or enqueue flush on first request.
      if (!animationRequested) {
        animationRequested = true;
        _renderPolicy.render();
      }
    }

    /**
     * Renders all Components waiting to be rendered immediately
     * instead of waiting until the next frame.
     *
     * Useful to call when debugging.
     */
    export function flush() {
      if (animationRequested) {
        // Layout
        componentsNeedingComputeLayout.forEach((component: Component) => component.computeLayout());

        // Top level render; Containers will put their children in the toRender queue
        componentsNeedingRender.forEach((component: Component) => component.render());

        isCurrentlyFlushing = true;
        var failed = new Utils.Set<Component>();
        componentsNeedingRender.forEach((component: Component) => {
          try {
            component.renderImmediately();
          } catch (err) {
            // throw error with timeout to avoid interrupting further renders
            window.setTimeout(() => { throw err; }, 0);
            failed.add(component);
          }
        });
        componentsNeedingComputeLayout = new Utils.Set<Component>();
        componentsNeedingRender = failed;
        animationRequested = false;
        isCurrentlyFlushing = false;
      }
    }
  }
}
