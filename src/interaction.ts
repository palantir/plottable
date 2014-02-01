///<reference path="../lib/lodash.d.ts" />

class Interaction {
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
    public selectionCallback?: (a: D3.Selection) => any
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
  private xDomainRange: number;
  private yDomainRange: number;
  private xRangeRange: number;
  private yRangeRange: number;
  private xMin: number;
  private yMin: number;

  constructor(eventComponent: XYRenderer, public componentsToZoom: Component[], public xScale: QuantitiveScale, public yScale: QuantitiveScale) {
    super(eventComponent);
    var xRange = this.xScale.range()
    var yRange = this.yScale.range()
    var xDomain = xScale.domain();
    var yDomain = yScale.domain();
    this.xDomainRange = xDomain[1] - xDomain[0];
    this.yDomainRange = yDomain[1] - yDomain[0];
    this.xMin = xRange[0];
    this.yMin = yRange[0];
    chai.assert.operator(this.xDomainRange, '>=', 0, "xDomainRange >= 0; failure may indicate scale wasn't initialized by renderers");
    chai.assert.operator(this.yDomainRange, '>=', 0, "yDomainRange >= 0; failure may indicate scale wasn't initialized by renderers");
    this.areaCallback = this.zoom;
  }

  public getZoomInfo(area: FullSelectionArea) {
    var xRange = this.xScale.range()
    var yRange = this.yScale.range()
    var pixelArea = area.pixel;
    console.log("yRange: ", yRange);
    console.log("pixelArea: ", pixelArea);
    this.xRangeRange = xRange[1] - xRange[0];
    this.yRangeRange = yRange[1] - yRange[0];
    var xTranslate = pixelArea.xMin - this.xMin;
    var yTranslate = pixelArea.yMin - this.yMin;
    var xScale = Math.abs(this.xRangeRange / (pixelArea.xMax - pixelArea.xMin));
    var yScale = Math.abs(this.yRangeRange / (pixelArea.yMax - pixelArea.yMin));
    var translate = [xTranslate, yTranslate];
    var scale = [xScale, yScale];
    return {translate: translate, scale: scale};
  }

  public zoom(area: FullSelectionArea) {
    var zoomInfo = this.getZoomInfo(area);
    var translate = zoomInfo.translate;
    var scale = zoomInfo.scale;
    var xDomain = [area.data.xMin, area.data.xMax];
    var yDomain = [area.data.yMin, area.data.yMax];
    this.xScale.domain(xDomain);
    this.yScale.domain(yDomain);
    this.componentsToZoom.forEach((c) => {
      c.zoom(translate, scale);
    });
  }
}
