///<reference path="../reference.ts" />

module Plottable {
export type KeyCallback = (keyCode: number) => void;

export module Interactions {
  export class Key extends Interaction {
    /**
     * A Key Interaction listens to key events that occur while the Component is
     * moused over.
     */
    private _positionDispatcher: Plottable.Dispatchers.Mouse;
    private _keyDispatcher: Plottable.Dispatchers.Key;
    private _keyPressKeyCodeCallbacks: { [keyCode: string]: Utils.CallbackSet<KeyCallback> } = {};
    private _keyReleaseKeyCodeCallbacks: { [keyCode: string]: Utils.CallbackSet<KeyCallback> } = {};

    private _mouseMoveCallback = (point: Point) => false; // HACKHACK: registering a listener
    private _downedKeys = new Plottable.Utils.Set();
    private _keyDownCallback = (keyCode: number) => this._handleKeyDownEvent(keyCode);
    private _keyUpCallback = (keyCode: number) => this._handleKeyUpEvent(keyCode);

    protected _anchor(component: Component) {
      super._anchor(component);
      this._positionDispatcher = Dispatchers.Mouse.getDispatcher(
                                   <SVGElement> (<any> this._componentAttachedTo)._element.node()
                                 );
      this._positionDispatcher.onMouseMove(this._mouseMoveCallback);

      this._keyDispatcher = Dispatchers.Key.getDispatcher();
      this._keyDispatcher.onKeyDown(this._keyDownCallback);
      this._keyDispatcher.onKeyUp(this._keyUpCallback);
    }

    protected _unanchor() {
      super._unanchor();
      this._positionDispatcher.offMouseMove(this._mouseMoveCallback);
      this._positionDispatcher = null;

      this._keyDispatcher.offKeyDown(this._keyDownCallback);
      this._keyDispatcher.offKeyUp(this._keyUpCallback);
      this._keyDispatcher = null;
    }

    private _handleKeyDownEvent(keyCode: number) {
      var p = this._translateToComponentSpace(this._positionDispatcher.lastMousePosition());
      if (this._isInsideComponent(p)) {
        if (this._keyPressKeyCodeCallbacks[keyCode]) {
          this._keyPressKeyCodeCallbacks[keyCode].callCallbacks(keyCode);
        }
        this._downedKeys.add(keyCode);
      }
    }

    private _handleKeyUpEvent(keyCode: number) {
      if (this._downedKeys.has(keyCode) && this._keyReleaseKeyCodeCallbacks[keyCode]) {
        this._keyReleaseKeyCodeCallbacks[keyCode].callCallbacks(keyCode);
      }
      this._downedKeys.delete(keyCode);
    }

    /**
     * Adds a callback to be called when the key with the given keyCode is
     * pressed and the user is moused over the Component.
     *
     * @param {number} keyCode
     * @param {KeyCallback} callback
     * @returns {Interactions.Key} The calling Key Interaction.
     */
    public onKeyPress(keyCode: number, callback: KeyCallback) {
      if (!this._keyPressKeyCodeCallbacks[keyCode]) {
        this._keyPressKeyCodeCallbacks[keyCode] = new Utils.CallbackSet<KeyCallback>();
      }
      this._keyPressKeyCodeCallbacks[keyCode].add(callback);
      return this;
    }

    /**
     * Removes a callback that would be called when the key with the given keyCode is
     * pressed and the user is moused over the Component.
     *
     * @param {number} keyCode
     * @param {KeyCallback} callback
     * @returns {Interactions.Key} The calling Key Interaction.
     */
    public offKeyPress(keyCode: number, callback: KeyCallback) {
      this._keyPressKeyCodeCallbacks[keyCode].delete(callback);
      if (this._keyPressKeyCodeCallbacks[keyCode].size === 0) {
        delete this._keyPressKeyCodeCallbacks[keyCode];
      }
      return this;
    }

    /**
     * Adds a callback to be called when the key with the given keyCode is
     * released and the user is moused over the Component.
     *
     * @param {number} keyCode
     * @param {KeyCallback} callback
     * @returns {Interactions.Key} The calling Key Interaction.
     */
    public onKeyRelease(keyCode: number, callback: KeyCallback) {
      if (!this._keyReleaseKeyCodeCallbacks[keyCode]) {
        this._keyReleaseKeyCodeCallbacks[keyCode] = new Utils.CallbackSet<KeyCallback>();
      }
      this._keyReleaseKeyCodeCallbacks[keyCode].add(callback);
      return this;
    }

    /**
     * Removes a callback that would be called when the key with the given keyCode is
     * released and the user is moused over the Component.
     *
     * @param {number} keyCode
     * @param {KeyCallback} callback
     * @returns {Interactions.Key} The calling Key Interaction.
     */
    public offKeyRelease(keyCode: number, callback: KeyCallback) {
      this._keyReleaseKeyCodeCallbacks[keyCode].delete(callback);
      if (this._keyReleaseKeyCodeCallbacks[keyCode].size === 0) {
        delete this._keyReleaseKeyCodeCallbacks[keyCode];
      }
      return this;
    }
  }
}
}
