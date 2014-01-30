///<reference path="../lib/lodash.d.ts" />

class DragZoomInteraction {
  private zoom;
  constructor(public elementToListenTo: D3.Selection, public renderers: Component[], public xScale: Scale, public yScale: Scale) {
    this.zoom = d3.behavior.zoom();
    this.zoom(elementToListenTo);
    this.zoom.x(this.xScale.scale);
    this.zoom.y(this.yScale.scale);
    var throttledZoom = _.throttle(() => this.rerenderZoomed(), 30);
    this.zoom.on("zoom", throttledZoom);
  }

  private rerenderZoomed() {
    var translate = this.zoom.translate();
    console.log(translate);
    var scale = this.zoom.scale();
    this.renderers.forEach((r) => {
      r.zoom(translate, scale);
      })
  }
}
