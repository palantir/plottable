///<reference path="../reference.ts" />

module Plottable {
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
}
