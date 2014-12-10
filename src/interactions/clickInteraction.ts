///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class Click extends AbstractInteraction {
    private _callback: (p: Point) => any;

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      hitBox.on(this._listenTo(), () => {
        var xy = d3.mouse(hitBox.node());
        var x = xy[0];
        var y = xy[1];
        this._callback({x: x, y: y});
      });
    }

    protected _listenTo(): string {
      return "click";
    }

    /**
     * Sets a callback to be called when a click is received.
     *
     * @param {(p: Point) => any} cb Callback that takes the pixel position of the click event.
     */
    public callback(cb: (p: Point) => any): Click {
      this._callback = cb;
      return this;
    }
  }

  export class DoubleClick extends Click {
    protected _listenTo(): string {
      return "dblclick";
    }
  }
}
}
