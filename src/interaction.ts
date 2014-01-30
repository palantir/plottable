///<reference path="../lib/lodash.d.ts" />

class DragZoomInteraction {
  private zoom;
  constructor(public elementToListenTo: D3.Selection, public renderers: Component[]) {
    this.zoom = d3.behavior.zoom();
    this.zoom(elementToListenTo);
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
