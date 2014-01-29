class DragZoomInteraction {
  private zoom;
  constructor(public elementToListenTo: D3.Selection, public renderers: Renderer[]) {
    this.zoom = d3.behavior.zoom();
    this.zoom(elementToListenTo);
    this.zoom.on("zoom", () => console.log('zoooom'));
  }
}
