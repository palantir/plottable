///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export interface Interactable extends Component.AbstractComponent {
    // no features
  }

  export class AbstractInteraction extends Core.PlottableObject {
    /**
     * It maintains a 'hitBox' which is where all event listeners are
     * attached. Due to cross- browser weirdness, the hitbox needs to be an
     * opaque but invisible rectangle.  TODO: We should give the interaction
     * "foreground" and "background" elements where it can draw things,
     * e.g. crosshairs.
     */
    public _hitBox: D3.Selection;
    public _componentToListenTo: Interaction.Interactable;

    public _anchor(component: Interaction.Interactable, hitBox: D3.Selection) {
      this._componentToListenTo = component;
      this._hitBox = hitBox;
    }
  }
}
}
