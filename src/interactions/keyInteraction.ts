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
    private _keyPressCallbacks: { [keyCode: string]: Utils.CallbackSet<KeyCallback> } = {};
    private _keyReleaseCallbacks: { [keyCode: string]: Utils.CallbackSet<KeyCallback> } = {};

    private _mouseMoveCallback = (point: Point) => false; // HACKHACK: registering a listener
    private _downedKeys = new Plottable.Utils.Set();
    private _keyDownCallback = (keyCode: number, event: KeyboardEvent) => this._handleKeyDownEvent(keyCode, event);
    private _keyUpCallback = (keyCode: number, event: KeyboardEvent) => this._handleKeyUpEvent(keyCode, event);
    private _preventDefault= false;

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

    private _handleKeyDownEvent(keyCode: number, event: KeyboardEvent) {
      let p = this._translateToComponentSpace(this._positionDispatcher.lastMousePosition());
      if (this._isInsideComponent(p) && !event.repeat) {
        if (this._keyPressCallbacks[keyCode]) {
          if (this.preventDefault()) {
            event.preventDefault();
          }
          this._keyPressCallbacks[keyCode].callCallbacks(keyCode);
        }
        this._downedKeys.add(keyCode);
      }
    }

    private _handleKeyUpEvent(keyCode: number, event: KeyboardEvent) {
      if (this._downedKeys.has(keyCode) && this._keyReleaseCallbacks[keyCode]) {
        if (this.preventDefault()) {
          event.preventDefault();
        }
        this._keyReleaseCallbacks[keyCode].callCallbacks(keyCode);
      }
      this._downedKeys.delete(keyCode);
    }

    /**
     * Returns whether preventDefault is enabled for Key Interaction
     */
    public preventDefault(): boolean;
    /**
     * Enables or disables preventDefault
     */
    public preventDefault(preventDefault: boolean): Key;
    public preventDefault(preventDefault: boolean): any {
      if (preventDefault == null) {
        return this._preventDefault;
      }
      this._preventDefault = preventDefault;
      return this;
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
      if (!this._keyPressCallbacks[keyCode]) {
        this._keyPressCallbacks[keyCode] = new Utils.CallbackSet<KeyCallback>();
      }
      this._keyPressCallbacks[keyCode].add(callback);
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
      this._keyPressCallbacks[keyCode].delete(callback);
      if (this._keyPressCallbacks[keyCode].size === 0) {
        delete this._keyPressCallbacks[keyCode];
      }
      return this;
    }

    /**
     * Adds a callback to be called when the key with the given keyCode is
     * released if the key was pressed with the mouse inside of the Component.
     *
     * @param {number} keyCode
     * @param {KeyCallback} callback
     * @returns {Interactions.Key} The calling Key Interaction.
     */
    public onKeyRelease(keyCode: number, callback: KeyCallback) {
      if (!this._keyReleaseCallbacks[keyCode]) {
        this._keyReleaseCallbacks[keyCode] = new Utils.CallbackSet<KeyCallback>();
      }
      this._keyReleaseCallbacks[keyCode].add(callback);
      return this;
    }

    /**
     * Removes a callback that would be called when the key with the given keyCode is
     * released if the key was pressed with the mouse inside of the Component.
     *
     * @param {number} keyCode
     * @param {KeyCallback} callback
     * @returns {Interactions.Key} The calling Key Interaction.
     */
    public offKeyRelease(keyCode: number, callback: KeyCallback) {
      this._keyReleaseCallbacks[keyCode].delete(callback);
      if (this._keyReleaseCallbacks[keyCode].size === 0) {
        delete this._keyReleaseCallbacks[keyCode];
      }
      return this;
    }
  }
}
}
