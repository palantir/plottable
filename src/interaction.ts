///<reference path="reference.ts" />

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
     * @constructor
     * @param {Component} componentToListenTo The component to listen for interactions on.
     */
    constructor(componentToListenTo: Component) {
      this.componentToListenTo = componentToListenTo;
    }

    public anchor(hitBox: D3.Selection) {
      this.hitBox = hitBox;
    }

    /**
     * Registers the Interaction on the Component it's listening to.
     * Should not be invoked externally; To be called only at the end of subclassing constructors.
     */
    public registerWithComponent(): Interaction {
      this.componentToListenTo.registerInteraction(this);
      // It would be nice to have a call to this in the Interaction constructor, but
      // can't do this right now because that depends on listenToHitBox being callable, which depends on the subclass
      // constructor finishing first.
      return this;
    }
  }

  export interface ZoomInfo {
    translate: number[];
    scale: number[];
  }

  export class PanZoomInteraction extends Interaction {
    private zoom: D3.Behavior.Zoom;
    public xScale: QuantitiveScale;
    public yScale: QuantitiveScale;

    /**
     * Creates a PanZoomInteraction.
     * @constructor
     * @param {Component} componentToListenTo The component to listen for interactions on.
     * @param {QuantitiveScale} xScale The X scale to update on panning/zooming.
     * @param {QuantitiveScale} yScale The Y scale to update on panning/zooming.
     */
    constructor(componentToListenTo: Component, xScale: QuantitiveScale, yScale: QuantitiveScale) {
      super(componentToListenTo);
      this.xScale = xScale;
      this.yScale = yScale;
      this.zoom = d3.behavior.zoom();
      this.zoom.x(this.xScale.scale);
      this.zoom.y(this.yScale.scale);
      this.zoom.on("zoom", () => this.rerenderZoomed());

      this.registerWithComponent();
    }

    public anchor(hitBox: D3.Selection) {
      super.anchor(hitBox);
      this.zoom(hitBox);
    }

    private rerenderZoomed() {
      // HACKHACK since the d3.zoom.x modifies d3 scales and not our TS scales, and the TS scales have the
      // event listener machinery, let's grab the domain out of the d3 scale and pipe it back into the TS scale
      var xDomain = this.xScale.scale.domain();
      var yDomain = this.yScale.scale.domain();
      this.xScale.domain(xDomain);
      this.yScale.domain(yDomain);
    }
  }

  export class AreaInteraction extends Interaction {
    private static CLASS_DRAG_BOX = "drag-box";
    private dragInitialized = false;
    private dragBehavior;
    private origin = [0,0];
    private location = [0,0];
    private constrainX: (n: number) => number;
    private constrainY: (n: number) => number;
    private dragBox: D3.Selection;
    private callbackToCall: (area: SelectionArea) => any;

    /**
     * Creates an AreaInteraction.
     * @param {Component} componentToListenTo The component to listen for interactions on.
     */
    constructor(componentToListenTo: Component) {
      super(componentToListenTo);
      this.dragBehavior = d3.behavior.drag();
      this.dragBehavior.on("dragstart", () => this.dragstart());
      this.dragBehavior.on("drag",      () => this.drag     ());
      this.dragBehavior.on("dragend",   () => this.dragend  ());
      this.registerWithComponent();
    }

    /**
     * Adds a callback to be called when the AreaInteraction triggers.
     * @param {(a: SelectionArea) => any} cb The function to be called. Takes in a SelectionArea in pixels.
     * @returns {AreaInteraction} The calling AreaInteraction.
     */
    public callback(cb?: (a: SelectionArea) => any): AreaInteraction {
      this.callbackToCall = cb;
      return this;
    }

    private dragstart(){
      this.clearBox();
      var availableWidth  = parseFloat(this.hitBox.attr("width"));
      var availableHeight = parseFloat(this.hitBox.attr("height"));
      // the constraint functions ensure that the selection rectangle will not exceed the hit box
      var constraintFunction = (min, max) => (x) => Math.min(Math.max(x, min), max);
      this.constrainX = constraintFunction(0, availableWidth);
      this.constrainY = constraintFunction(0, availableHeight);
    }

    private drag(){
      if (!this.dragInitialized) {
        this.origin = [d3.event.x, d3.event.y];
        this.dragInitialized = true;
      }

      this.location = [this.constrainX(d3.event.x), this.constrainY(d3.event.y)];
      var width  = Math.abs(this.origin[0] - this.location[0]);
      var height = Math.abs(this.origin[1] - this.location[1]);
      var x = Math.min(this.origin[0], this.location[0]);
      var y = Math.min(this.origin[1], this.location[1]);
      this.dragBox.attr("x", x).attr("y", y).attr("height", height).attr("width", width);
    }

    private dragend(){
      if (!this.dragInitialized) {
        return;
      }

      this.dragInitialized = false;
      if (this.callbackToCall == null) {
        return;
      }

      var xMin = Math.min(this.origin[0], this.location[0]);
      var xMax = Math.max(this.origin[0], this.location[0]);
      var yMin = Math.min(this.origin[1], this.location[1]);
      var yMax = Math.max(this.origin[1], this.location[1]);
      var pixelArea = {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
      this.callbackToCall(pixelArea);
    }

    /**
     * Clears the highlighted drag-selection box drawn by the AreaInteraction.
     * @returns {AreaInteraction} The calling AreaInteraction.
     */
    public clearBox(): AreaInteraction {
      this.dragBox.attr("height", 0).attr("width", 0);
      return this;
    }

    public anchor(hitBox: D3.Selection): AreaInteraction {
      super.anchor(hitBox);
      var cname = AreaInteraction.CLASS_DRAG_BOX;
      var foreground = this.componentToListenTo.foregroundContainer;
      this.dragBox = foreground.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
      hitBox.call(this.dragBehavior);
      return this;
    }
  }

  export class ZoomCallbackGenerator {
    private xScaleMappings = [];
    private yScaleMappings = [];

    /**
     * Adds listen-update pair of X scales.
     * @param {QuantitiveScale} listenerScale An X scale to listen for events on.
     * @param {QuantitiveScale} [targetScale] An X scale to update when events occur.
     * If not supplied, listenerScale will be updated when an event occurs.
     * @returns {ZoomCallbackGenerator} The calling ZoomCallbackGenerator.
     */
    public addXScale(listenerScale: QuantitiveScale, targetScale?: QuantitiveScale): ZoomCallbackGenerator {
      if (targetScale == null) {
        targetScale = listenerScale;
      }
      this.xScaleMappings.push([listenerScale, targetScale]);
      return this;
    }

    /**
     * Adds listen-update pair of Y scales.
     * @param {QuantitiveScale} listenerScale A Y scale to listen for events on.
     * @param {QuantitiveScale} [targetScale] A Y scale to update when events occur.
     * If not supplied, listenerScale will be updated when an event occurs.
     * @returns {ZoomCallbackGenerator} The calling ZoomCallbackGenerator.
     */
    public addYScale(listenerScale: QuantitiveScale, targetScale?: QuantitiveScale): ZoomCallbackGenerator {
      if (targetScale == null) {
        targetScale = listenerScale;
      }
      this.yScaleMappings.push([listenerScale, targetScale]);
      return this;
    }

    private updateScale(referenceScale: QuantitiveScale, targetScale: QuantitiveScale, pixelMin: number, pixelMax: number) {
      var originalDomain = referenceScale.domain();
      var newDomain = [referenceScale.invert(pixelMin), referenceScale.invert(pixelMax)];
      var sameDirection = (newDomain[0] < newDomain[1]) === (originalDomain[0] < originalDomain[1]);
      if (!sameDirection) {newDomain.reverse();}
      targetScale.domain(newDomain);
    }

    /**
     * Generates a callback that can be passed to Interactions.
     * @returns {(area: SelectionArea) => void} A callback that updates the scales previously specified.
     */
    public getCallback() {
      return (area: SelectionArea) => {
        this.xScaleMappings.forEach((sm: QuantitiveScale[]) => {
          this.updateScale(sm[0], sm[1], area.xMin, area.xMax);
        });
        this.yScaleMappings.forEach((sm: QuantitiveScale[]) => {
          this.updateScale(sm[0], sm[1], area.yMin, area.yMax);
        });
      };
    }
  }
}
