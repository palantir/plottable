///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export class Interaction {
    /**
     * It maintains a 'hitBox' which is where all event listeners are
     * attached. Due to cross- browser weirdness, the hitbox needs to be an
     * opaque but invisible rectangle.  TODO: We should give the interaction
     * "foreground" and "background" elements where it can draw things,
     * e.g. crosshairs.
     */
    public hitBox: D3.Selection;
    public componentToListenTo: Abstract.Component;

    /**
     * Creates an Interaction.
     *
     * Some Interactions include Interaction.PanZoom and
     * Interaction.DragBox. Interactions listen on events and do something that
     * would be annoying to write by hand, such as pan/zoom. Many Interactions
     * can have event listeners, such as a DragBox having listeners trigger
     * each time the box changes size.
     *
     * @constructor
     * @param {Component} componentToListenTo The component to listen for
     * interactions on.
     */
    constructor(componentToListenTo: Abstract.Component) {
      if (componentToListenTo == null) {throw new Error("Interactions require a component to listen to");}
      this.componentToListenTo = componentToListenTo;
    }

    public _anchor(hitBox: D3.Selection) {
      this.hitBox = hitBox;
    }

    /**
     * Registers the Interaction on the Component it's listening to.
     * This needs to be called to activate the interaction.
     * @returns {Interaction} The calling Interaction.
     */
    public registerWithComponent(): Interaction {
      this.componentToListenTo.registerInteraction(this);
      return this;
    }
  }
}
}
