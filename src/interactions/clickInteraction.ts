///<reference path="../reference.ts" />

module Plottable {
export module Interaction {

  export interface ClickData {
    data: any[];
    pixelPositions: Point[];
    selection: D3.Selection;
  }

  export interface Clickable extends Component.AbstractComponent {
    /**
     * Called when the user clicks onto the Component.
     *
     * @param {Point} The cursor's position relative to the Component's origin.
     */
    _clickComponent(p: Point): void;
    /**
     * Returns the ClickData associated with the given position, and performs
     * any visual changes associated with hovering inside a Component.
     *
     * @param {Point} The cursor's position relative to the Component's origin.
     * @return {ClickData} The ClickData associated with the given position.
     */
    _getClickData(p: Point): ClickData;
  }

  export class Click extends AbstractInteraction {
    private clickCallback: (clickData: ClickData) => any;

    public _anchor(component: Clickable, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      hitBox.on(this._listenTo(), () => {
        var clickableComponent = <Clickable> this._componentToListenTo;
        var xy = d3.mouse(hitBox.node());
        var p = {x: xy[0], y: xy[1]};
        clickableComponent._clickComponent(p);
        var clickData = clickableComponent._getClickData(p);
        this.safeClick(clickData);
      });
    }

    private safeClick(clickData: ClickData) {
      if (this.clickCallback && clickData.data) {
        this.clickCallback(clickData);
      }
    }

    public _listenTo(): string {
      return "click";
    }

    /**
     * Sets a callback to be called when a click is received.
     *
     * @param {(p: Point) => any} cb Callback that takes the pixel position of the click event.
     */
    public onClick(callback: (clickData: ClickData) => any): Click {
      this.clickCallback = callback;
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
