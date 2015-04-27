///<reference path="../reference.ts" />

module Plottable {
export module Interactions {
  export class Key extends Interaction {
    /**
     * KeyInteraction listens to key events that occur while the Component is
     * moused over.
     */
    private keyCallbacks: { [keyCode: string]: () => void; } = {};
    private keyDispatcher: Plottable.Dispatchers.Key;
    private positionDispatcher: Plottable.Dispatchers.Mouse;

    public anchor(component: Component, hitBox: D3.Selection) {
      super.anchor(component, hitBox);

      this.positionDispatcher = Dispatchers.Mouse.getDispatcher(
                                   <SVGElement> (<any> this.component).element.node()
                                 );
      this.positionDispatcher.onMouseMove("Interaction.Key" + this.getID(), (p: Point) => null); // HACKHACK: registering a listener

      this.keyDispatcher = Dispatchers.Key.getDispatcher();
      this.keyDispatcher.onKeyDown("Interaction.Key" + this.getID(), (keyCode: number) => this.handleKeyEvent(keyCode));
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
      this.keyCallbacks[keyCode] = callback;
      return this;
    }

    private handleKeyEvent(keyCode: number) {
      var p = this.translateToComponentSpace(this.positionDispatcher.getLastMousePosition());
      if (this.isInsideComponent(p) && this.keyCallbacks[keyCode]) {
        this.keyCallbacks[keyCode]();
      }
    }
  }
}
}
