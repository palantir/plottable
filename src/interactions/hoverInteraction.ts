///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export interface HoverData {
    data: any[];
    pixelPositions: Point[];
    selection: D3.Selection;
  }

  export interface Hoverable extends Component.AbstractComponent {
    /**
     * Called when the user first mouses over the Component.
     *
     * @param {Point} The cursor's position relative to the Component's origin.
     */
    _hoverOverComponent(p: Point): void;
    /**
     * Called when the user mouses out of the Component.
     *
     * @param {Point} The cursor's position relative to the Component's origin.
     */
    _hoverOutComponent(p: Point): void;
    /**
     * Returns the HoverData associated with the given position, and performs
     * any visual changes associated with hovering inside a Component.
     *
     * @param {Point} The cursor's position relative to the Component's origin.
     * @return {HoverData} The HoverData associated with the given position.
     */
    _doHover(p: Point): HoverData;
  }

  export class Hover extends Interaction.AbstractInteraction {
    public _componentToListenTo: Hoverable;
    private dispatcher: Dispatcher.Mouse;
    private hoverOverCallback: (hoverData: HoverData) => any;
    private hoverOutCallback: (hoverData: HoverData) => any;

    private currentHoverData: HoverData = {
      data: null,
      pixelPositions: null,
      selection: null
    };

    public _anchor(component: Hoverable, hitBox: D3.Selection) {
      super._anchor(component, hitBox);

      this.dispatcher = new Dispatcher.Mouse(this._hitBox);
      this.dispatcher.mouseover((p: Point) => this._handleHoverBegin(p));
      this.dispatcher.mouseout((p: Point) => this._handleHoverEnd(p));
      this.dispatcher.mousemove((p: Point) => this._handleHoverOver(p));
      this.dispatcher.connect();
    }

    /**
     * Returns a HoverData consisting of all data and selections in a but not in b.
     */
    private static diffHoverData(a: HoverData, b: HoverData): HoverData {
      if (a.data == null || b.data == null) {
        return a;
      }

      var diffData: any[] = [];
      var diffPoints: Point[] = [];
      var diffElements: Element[] = [];
      a.data.forEach((d: any, i: number) => {
        if (b.data.indexOf(d) === -1) {
          diffData.push(d);
          diffPoints.push(a.pixelPositions[i]);
          diffElements.push(a.selection[0][i]);
        }
      });

      if (diffData.length === 0) {
        return {
          data: null,
          pixelPositions: null,
          selection: null
        };
      }

      return {
        data: diffData,
        pixelPositions: diffPoints,
        selection: d3.selectAll(diffElements)
      };
    }

    private safeHoverOut(outData: HoverData) {
      if (this.hoverOutCallback && outData.data) {
        this.hoverOutCallback(outData);
      }
    }

    private safeHoverOver(overData: HoverData) {
      if (this.hoverOverCallback && overData.data) {
        this.hoverOverCallback(overData);
      }
    }

    public _handleHoverBegin(p: Point) {
      this._componentToListenTo._hoverOverComponent(p);
      this._handleHoverOver(p);
    }

    public _handleHoverOver(p: Point) {
      var lastHoverData = this.currentHoverData;
      var newHoverData = this._componentToListenTo._doHover(p);

      this.currentHoverData = newHoverData;

      var outData = Hover.diffHoverData(lastHoverData, newHoverData);
      this.safeHoverOut(outData);

      var overData = Hover.diffHoverData(newHoverData, lastHoverData);
      this.safeHoverOver(overData);
    }

    public _handleHoverEnd(p: Point) {
      this._componentToListenTo._hoverOutComponent(p);
      this.safeHoverOut(this.currentHoverData);
      this.currentHoverData = {
        data: null,
        pixelPositions: null,
        selection: null
      };
    }

    /**
     * Attaches an callback to be called when the user mouses over an element.
     *
     * @param {(hoverData: HoverData) => any} callback The callback to be called.
     *      The callback will be passed data for newly hovered-over elements.
     * @return {Interaction.Hover} The calling Interaction.Hover.
     */
    public onHoverOver(callback: (hoverData: HoverData) => any) {
      this.hoverOverCallback = callback;
      return this;
    }

    /**
     * Attaches a callback to be called when the user mouses off of an element.
     *
     * @param {(hoverData: HoverData) => any} callback The callback to be called.
     *      The callback will be passed data from the hovered-out elements.
     * @return {Interaction.Hover} The calling Interaction.Hover.
     */
    public onHoverOut(callback: (hoverData: HoverData) => any) {
      this.hoverOutCallback = callback;
      return this;
    }

    /**
     * Retrieves the HoverData associated with the elements the user is currently hovering over.
     *
     * @return {HoverData} The data and selection corresponding to the elements
     *                     the user is currently hovering over.
     */
    public getCurrentHoverData(): HoverData {
      return this.currentHoverData;
    }
  }
}
}
