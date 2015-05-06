///<reference path="../reference.ts" />

module Plottable {
export type KeyCallback = (keyCode: number) => void;
export module Interactions {
  export class Key extends Interaction {
    /**
     * KeyInteraction listens to key events that occur while the Component is
     * moused over.
     */
    private _positionDispatcher: Plottable.Dispatchers.Mouse;
    private _keyDispatcher: Plottable.Dispatchers.Key;
    private _keyCodeCallbacks: { [keyCode: string]: Utils.CallbackSet<KeyCallback> } = {};

    public _anchor(component: Component) {
      super._anchor(component);
      this._positionDispatcher = Dispatchers.Mouse.getDispatcher(
                                   <SVGElement> (<any> this._componentToListenTo)._element.node()
                                 );
      this._positionDispatcher.onMouseMove((p: Point) => null); // HACKHACK: registering a listener

      this._keyDispatcher = Dispatchers.Key.getDispatcher();
      this._keyDispatcher.onKeyDown((keyCode: number) => this._handleKeyEvent(keyCode));
    }

    private _handleKeyEvent(keyCode: number) {
      var p = this._translateToComponentSpace(this._positionDispatcher.getLastMousePosition());
      if (this._isInsideComponent(p) && this._keyCodeCallbacks[keyCode]) {
        this._keyCodeCallbacks[keyCode].callCallbacks(keyCode);
      }
    }

    /**
     * Sets a callback to be called when the key with the given keyCode is
     * pressed and the user is moused over the Component.
     *
     * @param {number} keyCode The key code associated with the key.
     * @param {() => void} callback Callback to be set.
     * @returns The calling Interaction.Key.
     */
    public onKey(keyCode: number, callback: KeyCallback) {
      if (!this._keyCodeCallbacks[keyCode]) {
        this._keyCodeCallbacks[keyCode] = new Utils.CallbackSet<KeyCallback>();
      }
      this._keyCodeCallbacks[keyCode].add(callback);
      return this;
    }

    /**
     * Removes the callback to be called when the key with the given keyCode is
     * pressed and the user is moused over the Component.
     *
     * @param {number} keyCode The key code associated with the key.
     * @param {() => void} callback Callback to be removed.
     * @returns The calling Interaction.Key.
     */
    public offKey(keyCode: number, callback: KeyCallback) {
      this._keyCodeCallbacks[keyCode].delete(callback);
      if (this._keyCodeCallbacks[keyCode].values().length === 0) {
        delete this._keyCodeCallbacks[keyCode];
      }
      return this;
    }
  }
}
}
