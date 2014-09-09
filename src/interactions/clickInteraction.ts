///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class Click extends Abstract.Interaction {
    private _callback: (x: number, y: number) => any;

    public _anchor(component: Abstract.Component, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      hitBox.on(this._listenTo(), () => {
        var xy = d3.mouse(hitBox.node());
        var x = xy[0];
        var y = xy[1];
        this._callback(x, y);
      });
    }

    public _listenTo(): string {
      return "click";
    }

    /**
     * Sets a callback to be called when a click is received.
     *
     * @param {(x: number, y: number) => any} cb Callback to be called. Takes click x and y in pixels.
     */
    public callback(cb: (x: number, y: number) => any): Click {
      this._callback = cb;
      return this;
    }
  }

  export class DoubleClick extends Click {
    public _listenTo(): string {
      return "dblclick";
    }
  }
}
}
