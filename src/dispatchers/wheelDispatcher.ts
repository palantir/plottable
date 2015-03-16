///<reference path="../reference.ts" />

module Plottable {
export module Dispatcher {
  export type WheelCallback = (scrollAmount: number, e: WheelEvent) => any;

  export class Wheel extends AbstractDispatcher {
    private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Wheel";
    private _wheelBroadcaster: Core.Broadcaster<Dispatcher.Wheel>;
    private _processWheelCallback: (e: WheelEvent) => any;

    /**
     * Get a Dispatcher.Wheel for the <svg> containing elem. If one already exists
     * on that <svg>, it will be returned; otherwise, a new one will be created.
     *
     * @param {SVGElement} elem A svg DOM element.
     * @return {Dispatcher.Mouse} A Dispatcher.Wheel
     */
    public static getDispatcher(elem: SVGElement): Dispatcher.Wheel {
      var svg = _Util.DOM.getBoundingSVG(elem);

      var dispatcher: Wheel = (<any> svg)[Wheel._DISPATCHER_KEY];
      if (dispatcher == null) {
        dispatcher = new Wheel(svg);
        (<any> svg)[Wheel._DISPATCHER_KEY] = dispatcher;
      }
      return dispatcher;
    }

    /**
     * Creates a Dispatcher.Wheel.
     * This constructor not be invoked directly under most circumstances.
     *
     * @param {SVGElement} svg The root <svg> element to attach to.
     */
    constructor(svg: SVGElement) {
      super();

      this._wheelBroadcaster = new Core.Broadcaster(this);
      this._processWheelCallback = (e: WheelEvent) => this._processWheel(e);

      this._event2Callback["wheel"] = this._processWheelCallback;

      this._broadcasters = [this._wheelBroadcaster];
    }

    protected _getWrappedCallback(callback: Function): Core.BroadcasterCallback<Dispatcher.Wheel> {
      return (wd: Dispatcher.Wheel, e: WheelEvent) => callback(e.deltaY, e);
    }

    /**
     * Registers a callback to be called whenever the mouse wheel moves,
     * or removes the callback if `null` is passed as the callback.
     *
     * @param {any} key The key associated with the callback.
     *                  Key uniqueness is determined by deep equality.
     * @param {WheelCallback} callback A callback that takes the scroll amount.
     *                                 Pass `null` to remove a callback.
     * @return {Dispatcher.Wheel} The calling Dispatcher.Wheel.
     */
    public onWheel(key: any, callback: WheelCallback): Dispatcher.Wheel {
      this._setCallback(this._wheelBroadcaster, key, callback);
      return this;
    }

    private _processWheel(e: WheelEvent) {
      this._wheelBroadcaster.broadcast(e);
    }

  }
}
}
