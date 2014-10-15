///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export interface HoverData {
    data: any[];
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

    private lastHoverData: HoverData = {
      data: null,
      selection: null
    };

    public _anchor(component: Hoverable, hitBox: D3.Selection) {
      super._anchor(component, hitBox);
      this.dispatcher = new Dispatcher.Mouse(this._hitBox);

      this.dispatcher.mouseover((p: Point) => {
        this._componentToListenTo._hoverOverComponent(p);
        this.handleHoverOver(p);
      });

      this.dispatcher.mouseout((p: Point) => {
        this._componentToListenTo._hoverOutComponent(p);
        this.safeHoverOut(this.lastHoverData);
        this.lastHoverData = {
          data: null,
          selection: null
        };
      });

      this.dispatcher.mousemove((p: Point) => this.handleHoverOver(p));

      this.dispatcher.connect();
    }

    /**
     * Returns a HoverData consisting of all data and selections in A but not in B.
     */
    private diffHoverData(A: HoverData, B: HoverData): HoverData {
      if (A.data == null || B.data == null) {
        return A;
      }

      var notInB = (d: any) => B.data.indexOf(d) === -1;

      var diffData = A.data.filter(notInB);
      if (diffData.length === 0) {
        return {
          data: null,
          selection: null
        };
      }

      var diffSelection = A.selection.filter(notInB);
      return {
        data: diffData,
        selection: diffSelection
      };
    }

    private handleHoverOver(p: Point) {
      var newHoverData = this._componentToListenTo._doHover(p);

      var outData = this.diffHoverData(this.lastHoverData, newHoverData);
      this.safeHoverOut(outData);

      var overData = this.diffHoverData(newHoverData, this.lastHoverData);
      this.safeHoverOver(overData);

      this.lastHoverData = newHoverData;
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
    public getCurrentlyHovered(): HoverData {
      return this.lastHoverData;
    }
  }
}
}
