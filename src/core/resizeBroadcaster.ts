///<reference path="../reference.ts" />

module Plottable {
export module Core {

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
  export module ResizeBroadcaster {
    var broadcaster: Core.Broadcaster;
    var _resizing: boolean = false;

    function _lazyInitialize() {
      if (broadcaster === undefined) {
        broadcaster = new Core.Broadcaster(<any> ResizeBroadcaster);
        window.addEventListener("resize", _onResize);
      }
    }

    function _onResize(){
      _resizing = true;
      broadcaster.broadcast();
    }

    /**
     * Checks if the window has been resized and the RenderController
     * has not yet been flushed.
     *
     * @returns {boolean} If the window has been resized/RenderController
     * has not yet been flushed.
     */
    export function resizing(): boolean {
      return _resizing;
    }

    /**
     * Sets that it is not resizing anymore. Good if it stubbornly thinks
     * it is still resizing, or for cancelling the effects of resizing
     * prematurely.
     */
    export function clearResizing() {
      _resizing = false;
    }

    /**
     * Registers a component.
     *
     * When the window is resized, ._invalidateLayout() is invoked on the
     * component, which will enqueue the component for layout and rendering
     * with the RenderController.
     *
     * @param {Component} component Any Plottable component.
     */
    export function register(c: Component.AbstractComponent) {
      _lazyInitialize();
      broadcaster.registerListener(c.getID(), () => c._invalidateLayout());
    }

    /**
     * Deregisters the components.
     *
     * The component will no longer receive updates on window resize.
     *
     * @param {Component} component Any Plottable component.
     */
    export function deregister(c: Component.AbstractComponent) {
      if (broadcaster) {
        broadcaster.deregisterListener(c.getID());
      }
    }
  }

}
}
