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
   */
  export module RenderController {
    var _componentsNeedingRender: {[key: string]: Abstract.Component} = {};
    var _componentsNeedingComputeLayout: {[key: string]: Abstract.Component} = {};
    var _animationRequested: boolean = false;
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

    export function flush() {
      if (_animationRequested) {
        // Layout
        var toCompute = d3.values(_componentsNeedingComputeLayout);
        toCompute.forEach((c) => c._computeLayout());

        // Top level render.
        // Containers will put their children in the toRender queue
        var toRender = d3.values(_componentsNeedingRender);
        toRender.forEach((c) => c._render());

        // Finally, perform render of all components
        toRender = d3.values(_componentsNeedingRender);
        toRender.forEach((c) => c._doRender());

        // Reset queues
        _componentsNeedingComputeLayout = {};
        _componentsNeedingRender = {};
        _animationRequested = false;
      }

      // Reset resize flag regardless of queue'd components
      ResizeBroadcaster.clearResizing();
    }
  }

}
}
