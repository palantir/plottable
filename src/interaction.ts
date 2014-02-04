///<reference path="../lib/lodash.d.ts" />

class Interaction {
  /* A general base class for interactions.
  It maintains a 'hitBox' which is where all event listeners are attached. Due to cross-
  browser weirdness, the hitbox needs to be an opaque but invisible rectangle.
  TODO: We should give the interaction "foreground" and "background" elements where it can
  draw things, e.g. crosshairs.
  */
  public hitBox: D3.Selection;

  constructor(public componentToListenTo: Component) {
  }

  public anchor(hitBox: D3.Selection) {
    this.hitBox = hitBox;
  }

  public registerWithComponent() {
    this.componentToListenTo.registerInteraction(this);
    // It would be nice to have a call to this in the Interaction constructor, but
    // can't do this right now because that depends on listenToHitBox being callable, which depends on the subclass
    // constructor finishing first.
  }
}

interface ZoomInfo {
  translate: number[];
  scale: number[];
}

class PanZoomInteraction extends Interaction {
  private zoom;
  constructor(componentToListenTo: Component, public renderers: Component[], public xScale: QuantitiveScale, public yScale: QuantitiveScale) {
    super(componentToListenTo);
    this.zoom = d3.behavior.zoom();
    this.zoom.x(this.xScale.scale);
    this.zoom.y(this.yScale.scale);
    var throttledZoom = _.throttle(() => this.rerenderZoomed(), 16);
    this.zoom.on("zoom", throttledZoom);

    this.registerWithComponent();
  }

  public anchor(hitBox: D3.Selection) {
    super.anchor(hitBox);
    this.zoom(hitBox);
  }

  private rerenderZoomed() {
    var translate = this.zoom.translate();
    var scale = this.zoom.scale();
    this.renderers.forEach((r) => {
      r.zoom(translate, scale);
      })
  }
}

class AreaInteraction extends Interaction {
  /*
  This class is responsible for any kind of interaction in which you brush over an area
  of a renderer and plan to execute some logic based on the selected area.
  Right now it only works for XYRenderers, but we can make the interface more general in
  the future.
  You pass it a rendererComponent (:XYRenderer) and it sets up events so that you can draw
  a rectangle over it. Then, you pass it callbacks that the AreaInteraction will execute on
  the selected region. The first callback (areaCallback) will be passed a FullSelectionArea
  object which contains info on both the pixel and data range of the selected region.
  The selectionCallback will be passed a D3.Selection object that contains the elements bound
  to the data in the selection region. You can use this, for example, to change their class
  and display properties.
  */
  private static CLASS_DRAG_BOX = "drag-box";
  private dragInitialized = false;
  private dragBehavior;
  private origin = [0,0];
  private location = [0,0];
  private constrainX: (n: number) => number;
  private constrainY: (n: number) => number;
  private dragBox: D3.Selection;

  constructor(
    private rendererComponent: XYRenderer,
    public areaCallback?: (a: FullSelectionArea) => any,
    public selectionCallback?: (a: D3.Selection) => any,
    public indicesCallback?: (a: number[]) => any
  ) {
    super(rendererComponent);
    this.dragBehavior = d3.behavior.drag();
    this.dragBehavior.on("dragstart", () => this.dragstart());
    this.dragBehavior.on("drag", () => this.drag());
    this.dragBehavior.on("dragend", () => this.dragend());
    this.registerWithComponent();
  }

  private dragstart(){
    this.dragBox.attr("height", 0).attr("width", 0);
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
      // It records a tap as a dragstart+dragend, but this can have unintended consequences.
      // only trigger logic if we actually did some dragging.
    }
    this.dragInitialized = false;
    var xMin = Math.min(this.origin[0], this.location[0]);
    var xMax = Math.max(this.origin[0], this.location[0]);
    var yMin = Math.min(this.origin[1], this.location[1]);
    var yMax = Math.max(this.origin[1], this.location[1]);
    var pixelArea = {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
    var dataArea = this.rendererComponent.invertXYSelectionArea(pixelArea);
    var fullArea = {pixel: pixelArea, data: dataArea};
    if (this.areaCallback != null) {
      this.areaCallback(fullArea);
    }
    if (this.selectionCallback != null) {
      var selection = this.rendererComponent.getSelectionFromArea(fullArea);
      this.selectionCallback(selection);
    }
    if (this.indicesCallback != null) {
      var indices = this.rendererComponent.getDataIndicesFromArea(fullArea);
      this.indicesCallback(indices);
    }
  }

  public anchor(hitBox: D3.Selection) {
    super.anchor(hitBox);
    var cname = AreaInteraction.CLASS_DRAG_BOX;
    var element = this.componentToListenTo.element;
    this.dragBox = element.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
    hitBox.call(this.dragBehavior);
  }
}

class BrushZoomInteraction extends AreaInteraction {
  /*
  This is an extension of the AreaInteraction which is used for zooming into a selected region.
  It takes the XYRenderer to initialize the AreaInteraction on, and the xScale and yScale to be
  scaled according to the domain of the data selected. Note that the xScale and yScale given to
  the BrushZoomInteraction can be distinct from those that the renderer depends on, e.g. if you
  make a sparkline, you do not want to update the sparkline's scales, but rather the scales of a
  linked chart.
  */
  constructor(eventComponent: XYRenderer, public xScale: QuantitiveScale, public yScale: QuantitiveScale) {
    super(eventComponent);
    this.areaCallback = this.zoom;
  }

  public zoom(area: FullSelectionArea) {
    var originalXDomain = this.xScale.domain();
    var originalYDomain = this.yScale.domain();
    var xDomain = [area.data.xMin, area.data.xMax];
    var yDomain = [area.data.yMin, area.data.yMax];

    var xOrigDirection = originalXDomain[0] > originalXDomain[1];
    var yOrigDirection = originalYDomain[0] > originalYDomain[1];
    var xDirection = xDomain[0] > xDomain[1];
    var yDirection = yDomain[0] > yDomain[1]
    // make sure we don't change inversion of the scale by zooming

    if (xDirection != xOrigDirection) {xDomain.reverse();};
    if (yDirection != yOrigDirection) {yDomain.reverse();};


    this.xScale.domain(xDomain);
    this.yScale.domain(yDomain);
  }
}
