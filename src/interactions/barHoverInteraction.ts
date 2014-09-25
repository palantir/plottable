///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class BarHover extends Abstract.Interaction {
    public _componentToListenTo: Abstract.BarPlot<any, any>;
    private dispatcher: Dispatcher.Mouse;
    private plotIsVertical: boolean;
    private hoverCallback: (datum: any, bar: D3.Selection) => any;
    private unhoverCallback: (datum: any, bar: D3.Selection) => any;
    private currentBar: D3.Selection = null;
    private _hoverMode = "point";


    public _anchor(barPlot: Abstract.BarPlot<any, any>, hitBox: D3.Selection) {
      super._anchor(barPlot, hitBox);
      this.plotIsVertical = this._componentToListenTo._isVertical;
      this.dispatcher = new Dispatcher.Mouse(this._hitBox);

      this.dispatcher.mousemove((p: Point) => {
        var selectedBar = this.getHoveredBar(p);

        if (selectedBar == null) {
          this._hoverOut();
        } else {
          if (this.currentBar != null) {
            if (this.currentBar.node() === selectedBar.node()) {
              return; // no message if bar is the same
            } else {
              this._hoverOut();
            }
          }

          this.getBars().classed("not-hovered", true).classed("hovered", false);
          selectedBar.classed("not-hovered", false).classed("hovered", true);
          if (this.hoverCallback != null) {
            this.hoverCallback(selectedBar.data()[0], selectedBar);
          }
        }

        this.currentBar = selectedBar;
      });

      this.dispatcher.mouseout((p: Point) => this._hoverOut());

      this.dispatcher.connect();
    }

    private getBars(): D3.Selection {
      return this._componentToListenTo._renderArea.selectAll("rect");
    }

    private _hoverOut() {
      this.getBars().classed("not-hovered hovered", false);
      if (this.unhoverCallback != null && this.currentBar != null) {
        this.unhoverCallback(this.currentBar.data()[0], this.currentBar); // last known information
      }
      this.currentBar = null;
    }

    private getHoveredBar(p: Point) {
      if (this._hoverMode === "point") {
        return this._componentToListenTo.selectBar(p.x, p.y, false);
      }

      var maxExtent: IExtent = { min: -Infinity, max: Infinity };
      if (this.plotIsVertical) {
        return this._componentToListenTo.selectBar(p.x, maxExtent, false);
      } else {
        return this._componentToListenTo.selectBar(maxExtent, p.y, false);
      }
    }

    /**
     * Gets the current hover mode.
     *
     * @return {string} The current hover mode.
     */
    public hoverMode(): string;
    /**
     * Sets the hover mode for the interaction. There are two modes:
     *     - "point": Selects the bar under the mouse cursor (default).
     *     - "line" : Selects any bar that would be hit by a line extending
     *                in the same direction as the bar and passing through
     *                the cursor.
     *
     * @param {string} mode If provided, the desired hover mode.
     * @return {BarHover} The calling BarHover.
     */
    public hoverMode(mode: string): BarHover;
    public hoverMode(mode?: string): any {
      if (mode == null) {
        return this._hoverMode;
      }

      var modeLC = mode.toLowerCase();
      if (modeLC !== "point" && modeLC !== "line") {
        throw new Error(mode + " is not a valid hover mode for Interaction.BarHover");
      }

      this._hoverMode = modeLC;
      return this;
    }

    /**
     * Attaches an callback to be called when the user mouses over a bar.
     *
     * @param {(datum: any, bar: D3.Selection) => any} callback The callback to be called.
     *      The callback will be passed the data from the hovered-over bar.
     * @return {BarHover} The calling BarHover.
     */
    public onHover(callback: (datum: any, bar: D3.Selection) => any) {
      this.hoverCallback = callback;
      return this;
    }

    /**
     * Attaches a callback to be called when the user mouses off of a bar.
     *
     * @param {(datum: any, bar: D3.Selection) => any} callback The callback to be called.
     *      The callback will be passed the data from the last-hovered bar.
     * @return {BarHover} The calling BarHover.
     */
    public onUnhover(callback: (datum: any, bar: D3.Selection) => any) {
      this.unhoverCallback = callback;
      return this;
    }
  }
}
}
