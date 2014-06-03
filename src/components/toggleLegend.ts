///<reference path="../reference.ts" />

module Plottable {
  export class ToggleLegend extends Legend {
    private callback: (datum: any, setState: boolean) => any;

    // this is the set of all elements that are currently toggled off
    private isOff: D3.Set;

    /**
     * Creates a ToggleLegend.
     *
     * @constructor
     * @param {ColorScale} colorScale
     * @param {(datum: any, setState: boolean) => any} callback The callback function for clicking on a legend entry.
     */
    constructor(colorScale: ColorScale, callback: (datum: any, setState: boolean) => any) {
      super(colorScale);
      this.callback = callback;
      this.isOff = d3.set([]);
      // initially, everything is toggled on
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
          this.isOff = Utils.intersection(this.isOff, d3.set(scale.domain()));
          this._invalidateLayout();
        });
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
        this.callback(d, turningOn);
        this.updateClasses();
      });
      return this;
    }

    private updateClasses() {
      var dataSelection = this.content.selectAll("." + Legend._SUBELEMENT_CLASS);
      dataSelection.classed("toggled-on", (d: any) => !this.isOff.has(d));
      dataSelection.classed("toggled-off", (d: any) => this.isOff.has(d));
    }
  }
}
