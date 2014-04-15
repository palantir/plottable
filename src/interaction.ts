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
     *
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
      this.zoom.x(this.xScale._d3Scale);
      this.zoom.y(this.yScale._d3Scale);
      this.zoom.on("zoom", () => this.rerenderZoomed());
    }

    public resetZoom() {
      // HACKHACK #254
      this.zoom = d3.behavior.zoom();
      this.zoom.x(this.xScale._d3Scale);
      this.zoom.y(this.yScale._d3Scale);
      this.zoom.on("zoom", () => this.rerenderZoomed());
      this.zoom(this.hitBox);
    }

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      this.zoom(hitBox);
    }

    private rerenderZoomed() {
      // HACKHACK since the d3.zoom.x modifies d3 scales and not our TS scales, and the TS scales have the
      // event listener machinery, let's grab the domain out of the d3 scale and pipe it back into the TS scale
      var xDomain = this.xScale._d3Scale.domain();
      var yDomain = this.yScale._d3Scale.domain();
      this.xScale.domain(xDomain);
      this.yScale.domain(yDomain);
    }
  }

  export class AreaInteraction extends Interaction {
    private static CLASS_DRAG_BOX = "drag-box";
    private dragInitialized = false;
    private dragBehavior: D3.Behavior.Drag;
    private origin = [0,0];
    private location = [0,0];
    private constrainX: (n: number) => number;
    private constrainY: (n: number) => number;
    private dragBox: D3.Selection;
    private callbackToCall: (area: SelectionArea) => any;

    /**
     * Creates an AreaInteraction.
     *
     * @param {Component} componentToListenTo The component to listen for interactions on.
     */
    constructor(componentToListenTo: Component) {
      super(componentToListenTo);
      this.dragBehavior = d3.behavior.drag();
      this.dragBehavior.on("dragstart", () => this.dragstart());
      this.dragBehavior.on("drag",      () => this.drag     ());
      this.dragBehavior.on("dragend",   () => this.dragend  ());
    }

    /**
     * Adds a callback to be called when the AreaInteraction triggers.
     *
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
      var constraintFunction = (min: number, max: number) => (x: number) => Math.min(Math.max(x, min), max);
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
     *
     * @returns {AreaInteraction} The calling AreaInteraction.
     */
    public clearBox(): AreaInteraction {
      this.dragBox.attr("height", 0).attr("width", 0);
      return this;
    }

    public _anchor(hitBox: D3.Selection): AreaInteraction {
      super._anchor(hitBox);
      var cname = AreaInteraction.CLASS_DRAG_BOX;
      var background = this.componentToListenTo.backgroundContainer;
      this.dragBox = background.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
      hitBox.call(this.dragBehavior);
      return this;
    }
  }

  export class ZoomCallbackGenerator {
    private xScaleMappings: QuantitiveScale[][] = [];
    private yScaleMappings: QuantitiveScale[][] = [];

    /**
     * Adds listen-update pair of X scales.
     *
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
     *
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
     *
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

  export class MousemoveInteraction extends Interaction {
    constructor(componentToListenTo: Component) {
      super(componentToListenTo);
    }

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      hitBox.on("mousemove", () => {
        var xy = d3.mouse(hitBox.node());
        var x = xy[0];
        var y = xy[1];
        this.mousemove(x, y);
      });
    }

    public mousemove(x: number, y: number) {
      return; //no-op
    }
  }


  export class ClickInteraction extends Interaction {
    private _callback: (x: number, y:number) => any;

    /**
     * Creates a ClickInteraction.
     *
     * @constructor
     * @param {Component} componentToListenTo The component to listen for clicks on.
     */
    constructor(componentToListenTo: Component) {
      super(componentToListenTo);
    }

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      hitBox.on("click", () => {
        var xy = d3.mouse(hitBox.node());
        var x = xy[0];
        var y = xy[1];
        this._callback(x, y);
      });
    }

    /**
     * Sets an callback to be called when a click is received.
     *
     * @param {(x: number, y: number) => any} cb: Callback to be called. Takes click x and y in pixels.
     */
    public callback(cb: (x: number, y: number) => any): ClickInteraction {
      this._callback = cb;
      return this;
    }
  }

  export class KeyInteraction extends Interaction {
    private _callback: () => any;
    private activated = false;
    private keyCode: number;

    /**
     * Creates a KeyInteraction.
     *
     * @constructor
     * @param {Component} componentToListenTo The component to listen for keypresses on.
     * @param {number} keyCode The key code to listen for.
     */
    constructor(componentToListenTo: Component, keyCode: number) {
      super(componentToListenTo);
      this.keyCode = keyCode;
    }

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      hitBox.on("mouseover", () => {
        this.activated = true;
      });
      hitBox.on("mouseout", () => {
        this.activated = false;
      });

      Plottable.KeyEventListener.addCallback(this.keyCode, (e: D3.Event) => {
        if (this.activated && this._callback != null) {
          this._callback();
        }
      });
    }

    /**
     * Sets an callback to be called when the designated key is pressed.
     *
     * @param {() => any} cb: Callback to be called.
     */
    public callback(cb: () => any): KeyInteraction {
      this._callback = cb;
      return this;
    }
  }


  export class CrosshairsInteraction extends MousemoveInteraction {
    private renderer: NumericXYRenderer;

    private circle: D3.Selection;
    private xLine: D3.Selection;
    private yLine: D3.Selection;
    private lastx: number;
    private lasty: number;

    constructor(renderer: NumericXYRenderer) {
      super(renderer);
      this.renderer = renderer;
      renderer.xScale.registerListener(this, () => this.rescale());
      renderer.yScale.registerListener(this, () => this.rescale());
    }

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      var container = this.renderer.foregroundContainer.append("g").classed("crosshairs", true);
      this.circle = container.append("circle").classed("centerpoint", true);
      this.xLine = container.append("path").classed("x-line", true);
      this.yLine = container.append("path").classed("y-line", true);
      this.circle.attr("r", 5);
    }

    public mousemove(x: number, y: number) {
      this.lastx = x;
      this.lasty = y;
      var domainX = this.renderer.xScale.invert(x);
      var data = this.renderer.dataSource().data();
      var xA = Utils.applyAccessor(this.renderer._xAccessor, this.renderer.dataSource());
      var yA = Utils.applyAccessor(this.renderer._yAccessor, this.renderer.dataSource());
      var dataIndex = OSUtils.sortedIndex(domainX, data, xA);
      dataIndex = dataIndex > 0 ? dataIndex - 1 : 0;
      var dataPoint = data[dataIndex];

      var dataX = xA(dataPoint, dataIndex);
      var dataY = yA(dataPoint, dataIndex);
      var pixelX = this.renderer.xScale.scale(dataX);
      var pixelY = this.renderer.yScale.scale(dataY);
      this.circle.attr("cx", pixelX).attr("cy", pixelY);

      var width = this.renderer.availableWidth;
      var height = this.renderer.availableHeight;
      this.xLine.attr("d", "M 0 " + pixelY + " L " + width + " " + pixelY);
      this.yLine.attr("d", "M " + pixelX + " 0 L " + pixelX + " " + height);
    }

    public rescale() {
      if (this.lastx != null) {
        this.mousemove(this.lastx, this.lasty);
      }
    }
  }
}
