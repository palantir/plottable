///<reference path="../reference.ts" />

module Plottable {
export module Singleton {

  /**
   * The ResizeBroadcaster will broadcast a notification to any registered
   * components when the window is resized.
   *
   * The broadcaster and single event listener are lazily constructed.
   *
   * Upon resize, the _resized flag will be set to true until after the next
   * flush of the RenderController. This is used, for example, to disable
   * animations during resize.
   */
  export class ResizeBroadcaster {
    private static _broadcaster: Abstract.Broadcaster;
    public static _resized: boolean = false;

    private static _lazyInitialize() {
      if (ResizeBroadcaster._broadcaster === undefined) {
        ResizeBroadcaster._broadcaster = new Abstract.Broadcaster();
        window.addEventListener("resize", ResizeBroadcaster._onResize);
      }
    }

    private static _onResize(){
      ResizeBroadcaster._resized = true;
      ResizeBroadcaster._broadcaster._broadcast();
    }

    /**
     * Registers a component.
     *
     * When the window is resized, we invoke ._invalidateLayout() on the
     * component, which will enqueue the component for layout and rendering
     * with the RenderController.
     *
     * @param {Abstract.Component} component Any Plottable component.
     */
    public static register(c: Abstract.Component) {
      ResizeBroadcaster._lazyInitialize();
      ResizeBroadcaster._broadcaster.registerListener(c._plottableID, () => c._invalidateLayout());
    }

    /**
     * Deregisters the components.
     *
     * The component will no longer receive updates on window resize.
     *
     * @param {Abstract.Component} component Any Plottable component.
     */
    public static deregister(c: Abstract.Component) {
      if (ResizeBroadcaster._broadcaster) {
        ResizeBroadcaster._broadcaster.deregisterListener(c._plottableID);
      }
    }
  }

}
}
