///<reference path="../reference.ts" />

module Plottable {
  export interface ToggleCallback {
      (datum: any, newState: boolean): any;
  }

  export class ToggleLegend extends Legend {
    private callback: ToggleCallback;

    // this is the set of all elements that are currently toggled off
    private isOff: D3.Set;

    /**
     * Creates a ToggleLegend.
     *
     * @constructor
     * @param {ColorScale} colorScale
     * @param {ToggleCallback} callback The function to be called when a legend entry is clicked.
     */
    constructor(colorScale: ColorScale, callback?: ToggleCallback) {
      this.callback = callback;
      this.isOff = d3.set(); // initially, everything is toggled on
      super(colorScale);
    }

    /**
     * Assigns the callback to the ToggleLegend
     * Call with argument of null to remove the callback
     * 
     * @param{ToggleCallback} callback The new callback function
     */
    public setCallback(callback: ToggleCallback): ToggleLegend {
      this.callback = callback;
      return this;
    }

    /**
     * Assigns a new ColorScale to the Legend.
     *
     * @param {ColorScale} scale
     * @returns {ToggleLegend} The calling ToggleLegend.
     */
    public scale(scale?: ColorScale): any {
      if (scale != null) {
        super.scale(scale);
        // overwrite our previous listener from when we called super
        this._registerToBroadcaster (scale, () => {
          // preserve the state of already existing elements
          this.isOff = Utils.intersection(this.isOff, d3.set(this.scale().domain()));
          this._invalidateLayout();
        });
        this.isOff = Utils.intersection(this.isOff, d3.set(this.scale().domain()));
        this.updateClasses();
        return this;
      } else {
        return super.scale();
      }
    }

    public _doRender(): ToggleLegend {
      super._doRender();
      this.updateClasses();
      this.content.selectAll("." + Legend._SUBELEMENT_CLASS).on("click", (d: any) => {
        var turningOn = this.isOff.has(d);
        if (turningOn) {
          this.isOff.remove(d);
        } else {
          this.isOff.add(d);
        }
        if (this.callback != null) {
          this.callback(d, turningOn);
        }
        this.updateClasses();
      });
      return this;
    }

    private updateClasses() {
      if (this._isSetup) {
        var dataSelection = this.content.selectAll("." + Legend._SUBELEMENT_CLASS);
        dataSelection.classed("toggled-on", (d: any) => !this.isOff.has(d));
        dataSelection.classed("toggled-off", (d: any) => this.isOff.has(d));
      }
    }
  }
}
