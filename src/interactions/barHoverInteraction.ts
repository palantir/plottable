///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class BarHover extends Abstract.Interaction {
    public componentToListenTo: Abstract.BarPlot<any, any>;
    private dispatcher: Dispatcher.Mouse;
    private plotIsVertical = true;
    private hoverCallback: (datum: any, bar: D3.Selection) => any;
    private unhoverCallback: (datum: any, bar: D3.Selection) => any;
    private currentBar: D3.Selection = null;
    private _hoverMode = "point";

    /**
     * Creates a new BarHover Interaction.
     *
     * @param {Abstract.BarPlot} barPlot The Bar Plot to listen for hover events on.
     */
    constructor(barPlot: Abstract.BarPlot<any, any>) {
      super(barPlot);
      this.plotIsVertical = Plottable.Plot.VerticalBar.prototype.isPrototypeOf(this.componentToListenTo);
    }

    public _anchor(hitBox: D3.Selection) {
      this.dispatcher = new Dispatcher.Mouse(hitBox);

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

          this.componentToListenTo._bars.classed("not-hovered", true).classed("hovered", false);
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

    private _hoverOut() {
      this.componentToListenTo._bars.classed("not-hovered hovered", false);
      if (this.unhoverCallback != null && this.currentBar != null) {
        this.unhoverCallback(this.currentBar.data()[0], this.currentBar); // last known information
      }
      this.currentBar = null;
    }

    private getHoveredBar(p: Point) {
      if (this._hoverMode === "point") {
        return this.componentToListenTo.selectBar(p.x, p.y, false);
      }

      var maxExtent: IExtent = { min: -Infinity, max: Infinity };
      if (this.plotIsVertical) {
        return this.componentToListenTo.selectBar(p.x, maxExtent, false);
      } else {
        return this.componentToListenTo.selectBar(maxExtent, p.y, false);
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
     * @param {string} mode The desired hover mode.
     * @return {BarHover} The calling Interaction.BarHover.
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
     * @param {(datum: any, bar: D3.Selection) => any} The callback to be called.
     *      The callback will be passed the data from the hovered-over bar.
     * @return {BarHover} The calling Interaction.BarHover.
     */
    public onHover(callback: (datum: any, bar: D3.Selection) => any) {
      this.hoverCallback = callback;
      return this;
    }

    /**
     * Attaches a callback to be called when the user mouses off of a bar.
     *
     * @param {(datum: any, bar: D3.Selection) => any} The callback to be called.
     *      The callback will be passed the data from the last-hovered bar.
     * @return {BarHover} The calling Interaction.BarHover.
     */
    public onUnhover(callback: (datum: any, bar: D3.Selection) => any) {
      this.unhoverCallback = callback;
      return this;
    }
  }
}
}
