///<reference path="../reference.ts" />

module Plottable {
  export class ToggleLegend extends Legend {
    private update: (d: any, b: boolean) => any;

    // if in state array, it is toggled on, otherwise, it is toggled off
    private state: any[];
    /**
     * Creates a Legend.
     *
     * @constructor
     * @param {ColorScale} colorScale
     */
    constructor(colorScale: ColorScale, update: (d: any, b: boolean) => any) {
      super(colorScale);
      this.update = update;
      this.state = [];
      // initially, everything is toggled on
      colorScale.domain().forEach((d: any) => this.state.splice(0, 0, d));
    }

    public _doRender(): ToggleLegend {
      super._doRender();
      var toggleLegend = this;
      var dataSelection = this.content.selectAll("." + Legend._SUBELEMENT_CLASS);
      dataSelection.classed("toggled-on", (d: any) => this.state.indexOf(d) >= 0);
      dataSelection.classed("toggled-off", (d: any) => this.state.indexOf(d) < 0);
      dataSelection.on("click", function(d: any, i: number) {
        var index = toggleLegend.state.indexOf(d);
        var isOn = index >= 0;
        if (isOn) { // remove it from state
          toggleLegend.state.splice(index, 1);
        } else { // otherwise add it back in
          toggleLegend.state.splice(0, 0, d);
        }
        toggleLegend.update (d, !isOn);
      });
      return this;
    }
  }
}
