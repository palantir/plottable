///<reference path="../reference.ts" />

module Plottable {
export module Interactions {
  export class Key extends Interaction {
    /**
     * KeyInteraction listens to key events that occur while the Component is
     * moused over.
     */
    private _positionDispatcher: Plottable.Dispatchers.Mouse;
    private _keyDispatcher: Plottable.Dispatchers.Key;
    private _keyCode2Callback: { [keyCode: string]: () => void; } = {};

    public _anchor(component: Component, hitBox: D3.Selection) {
      super._anchor(component, hitBox);

      this._positionDispatcher = Dispatchers.Mouse.getDispatcher(
                                   <SVGElement> (<any> this._componentToListenTo).element.node()
                                 );
      this._positionDispatcher.onMouseMove("Interaction.Key" + this.getID(), (p: Point) => null); // HACKHACK: registering a listener

      this._keyDispatcher = Dispatchers.Key.getDispatcher();
      this._keyDispatcher.onKeyDown("Interaction.Key" + this.getID(), (keyCode: number) => this._handleKeyEvent(keyCode));
    }

    private _handleKeyEvent(keyCode: number) {
      var p = this._translateToComponentSpace(this._positionDispatcher.getLastMousePosition());
      if (this._isInsideComponent(p) && this._keyCode2Callback[keyCode]) {
        this._keyCode2Callback[keyCode]();
      }
    }

    /**
     * Sets a callback to be called when the key with the given keyCode is
     * pressed and the user is moused over the Component.
     *
     * @param {number} keyCode The key code associated with the key.
     * @param {() => void} callback Callback to be called.
     * @returns The calling Interaction.Key.
     */
    public on(keyCode: number, callback: () => void): Key {
      this._keyCode2Callback[keyCode] = callback;
      return this;
    }
  }
}
}
