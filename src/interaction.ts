///<reference path="../lib/lodash.d.ts" />

class Interaction {
  constructor(public componentToListenTo: Component) {
  }

  public listenToHitBox(hitBox: D3.Selection) {
    // no-op; should be overwritten
  }

  public registerWithComponent() {
    this.componentToListenTo.registerInteraction(this);
  }
}

class DragZoomInteraction extends Interaction {
  private zoom;
  constructor(componentToListenTo: Component, public renderers: Component[], public xScale: Scale, public yScale: Scale) {
    super(componentToListenTo);
    this.zoom = d3.behavior.zoom();
    this.zoom.x(this.xScale.scale);
    this.zoom.y(this.yScale.scale);
    var throttledZoom = _.throttle(() => this.rerenderZoomed(), 16);
    this.zoom.on("zoom", throttledZoom);

    this.registerWithComponent(); // It would be nice to have a call to this in the Interaction constructor, but
    // can't do this right now because that depends on listenToHitBox being callable, which depends on the DragZoomInteractor
    // constructor finishing first.
  }

  public listenToHitBox(hitBox: D3.Selection) {
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
