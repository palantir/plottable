///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class Key extends AbstractInteraction {
    private activated = false;
    private keyCode: number;
    private dispatcher: Plottable.Dispatcher.Keypress;
    private keyCode2Callback: { [keyCode: string]: () => void; } = {};

    /**
     * Creates a KeyInteraction.
     *
     * KeyInteraction listens to key events that occur while the component is
     * moused over.
     *
     * @constructor
     */
    constructor() {
      super();
      this.dispatcher = new Plottable.Dispatcher.Keypress();
    }

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);

      this.dispatcher.target(this._hitBox);

      this.dispatcher.onKeyDown((e: D3.D3Event) => {
        if (this.keyCode2Callback[e.keyCode]) {
          this.keyCode2Callback[e.keyCode]();
        }
      });
      this.dispatcher.connect();
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
      this.keyCode2Callback[keyCode] = callback;
      return this;
    }
  }
}
}
