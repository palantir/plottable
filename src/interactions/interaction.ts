///<reference path="../reference.ts" />

module Plottable {
  export class Interaction {
    /* A general base class for interactions.
    It maintains a 'hitBox' which is where all event listeners are attached. Due to cross-
    browser weirdness, the hitbox needs to be an opaque but invisible rectangle.
    TODO: We should give the interaction "foreground" and "background" elements where it can
    draw things, e.g. crosshairs.
    */
    public hitBox: D3.Selection;
    public componentToListenTo: Component;

    /**
     * Creates an Interaction.
     *
     * @constructor
     * @param {Component} componentToListenTo The component to listen for interactions on.
     */
    constructor(componentToListenTo: Component) {
      this.componentToListenTo = componentToListenTo;
    }

    public _anchor(hitBox: D3.Selection) {
      this.hitBox = hitBox;
    }

    /**
     * Registers the Interaction on the Component it's listening to.
     * This needs to be called to activate the interaction.
     */
    public registerWithComponent(): Interaction {
      this.componentToListenTo.registerInteraction(this);
      return this;
    }
  }
}
