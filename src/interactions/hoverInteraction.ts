///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export interface HoverData {
    data: any[];
    selection: D3.Selection;
  }

  export interface Hoverable extends Interactable {
    hoverOver(p: Point): any;
    hoverOut(p: Point): any;
    getHoverData(p: Point): HoverData;
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
        this._componentToListenTo.hoverOver(p);
        this.handleHoverOver(p);
      });

      this.dispatcher.mouseout((p: Point) => {
        this._componentToListenTo.hoverOut(p);
        this.safeHoverOut();
      });

      this.dispatcher.mousemove((p: Point) => this.handleHoverOver(p));

      this.dispatcher.connect();
    }

    private handleHoverOver(p: Point) {
      var newHoverData = this._componentToListenTo.getHoverData(p);

      if (newHoverData.data == null) {
        this.safeHoverOut();
      } else {
        var overData = newHoverData.data;
        var overSelection = newHoverData.selection;

        if (this.lastHoverData.data != null) {
          var wasHoveredOut = (d: any) => newHoverData.data.indexOf(d) === -1;
          var outData = this.lastHoverData.data.filter(wasHoveredOut);
          if (outData.length > 0) {
            var outSelection = this.lastHoverData.selection.filter(wasHoveredOut);
            if (this.hoverOutCallback) {
              this.hoverOutCallback({
                data: outData,
                selection: outSelection
              });
            }
          }

          var newlyHoveredOver = (d: any) => this.lastHoverData.data.indexOf(d) === -1;
          overData = newHoverData.data.filter(newlyHoveredOver);
          overSelection = newHoverData.selection.filter(newlyHoveredOver);
        }

        if (this.hoverOverCallback && overData.length > 0) {
          this.hoverOverCallback({
            data: overData,
            selection: overSelection
          });
        }
      }

      this.lastHoverData = newHoverData;
    }

    private safeHoverOut() {
      if (this.hoverOutCallback && this.lastHoverData.data != null) {
        this.hoverOutCallback(this.lastHoverData);
      }
      this.lastHoverData = {
        data: null,
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

    public getCurrentlyHovered(): HoverData {
      return this.lastHoverData;
    }
  }
}
}
