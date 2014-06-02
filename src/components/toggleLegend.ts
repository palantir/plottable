///<reference path="../reference.ts" />

module Plottable {
  export class ToggleLegend extends Legend {
    private callback: (d: any, b: boolean) => any;

    // if in isOff array, it is toggled off, otherwise, it is toggled on
    private isOff: any[];
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
      this.isOff = [];
      // initially, everything is toggled on
    }

    /**
     * Assigns a new ColorScale to the Legend.
     *
     * @param {ColorScale} scale
     * @returns {ToggleLegend} The calling ToggleLegend.
     */
    public scale(scale: ColorScale): ToggleLegend;
    public scale(): ColorScale;
    public scale(scale?: ColorScale): any {
      if (scale != null) {
        var curLegend = super.scale(scale);
        // overwrite our previous listener from when we called super
        curLegend._registerToBroadcaster (scale, () => {
          var oldState = this.isOff.slice(0);
          this.isOff = [];
          scale.domain().forEach((d: any) => {
            // preserves the state of any previously existing element
            if (oldState.indexOf(d) >= 0) {
              this.isOff.push(d);
            }
          });
          this._invalidateLayout();
        });
        return curLegend;
      } else {
        return super.scale();
      }
    }

    public _doRender(): ToggleLegend {
      super._doRender();
      var dataSelection = this.content.selectAll("." + Legend._SUBELEMENT_CLASS);
      dataSelection.classed("toggled-on", (d: any) => this.isOff.indexOf(d) < 0);
      dataSelection.classed("toggled-off", (d: any) => this.isOff.indexOf(d) >= 0);
      dataSelection.on("click", (d: any) => {
        var index = this.isOff.indexOf(d);
        var turningOff = index < 0;
        if (turningOff) { // add it into isOff array
          this.isOff.push(d);
        } else { // otherwise remove it
          this.isOff.splice(index, 1);
        }
        this.callback(d, !turningOff);
      });
      return this;
    }
  }
}
