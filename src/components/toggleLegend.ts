///<reference path="../reference.ts" />

module Plottable {
  export class ToggleLegend extends Legend {
    private callback: (d: any, b: boolean) => any;

    // if in isOff array, it is toggled off, otherwise, it is toggled on
    private isOff: D3.Set;
    /**
     * Creates a ToggleLegend.
     *
     * @constructor
     * @param {ColorScale} colorScale
     * @param {(d: any, b: boolean) => any} callback The callback function for clicking on a legend entry.
     * @param {any} callback.d The legend entry.
     * @param {boolean} callback.b The state that the entry has changed to.
     */
    constructor(colorScale: ColorScale, callback: (d: any, b: boolean) => any) {
      super(colorScale);
      this.callback = callback;
      this.isOff = d3.set([]);
      // initially, everything is toggled on
    }

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
      var dataSelection = this.content.selectAll("." + Legend._SUBELEMENT_CLASS);
      dataSelection.classed("toggled-on", (d: any) => !this.isOff.has(d));
      dataSelection.classed("toggled-off", (d: any) => this.isOff.has(d));
      dataSelection.on("click", (d: any) => {
        var turningOn = this.isOff.has(d);
        if (turningOn) {
          this.isOff.remove(d);
        } else {
          this.isOff.add(d);
        }
        this.callback(d, turningOn);
        this._invalidateLayout();
      });
      return this;
    }
  }
}
