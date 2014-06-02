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

    public scale(scale?: ColorScale): any {
      if (scale != null) {

        var curLegend = super.scale(scale);
        // hack to make sure broadcaster will update the isOff array whenever scale gets changed
        // first deregister this scale from when we called super.scale
        curLegend._deregisterFromBroadcaster(scale);
        // now register with our own method
        curLegend._registerToBroadcaster (scale, () => {
          var oldState = this.isOff === undefined ? [] : this.isOff.slice(0);
          this.isOff = [];
          scale.domain().forEach((d: any) => {
            // preserves the state of any existing element
            if (oldState.indexOf(d) >= 0) {
              this.isOff.splice(0, 0, d);
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
        var isOn = index < 0;
        if (isOn) { // add it into isOff array
          this.isOff.splice(0, 0, d);
        } else { // otherwise remove it
          this.isOff.splice(index, 1);
        }
        this.callback(d, !isOn);
      });
      return this;
    }
  }
}
