///<reference path="../reference.ts" />

module Plottable {
  export class HoverLegend extends Legend {
    private callback: (d?: any) => any;

    // if in state array, it is toggled on, otherwise, it is toggled off
    private selected: any;
    /**
     * Creates a HoverLegend.
     *
     * @constructor
     * @param {ColorScale} colorScale
     * @param {(d?: any) => any} callback The callback function for clicking on a legend entry.
     * @param {any} callback.d The legend entry. No argument corresponds to a mouseout
     */
    constructor(colorScale: ColorScale, callback: (d?: any) => any) {
      super(colorScale);
      this.callback = callback;
    }

    public _doRender(): HoverLegend {
      super._doRender();
      var dataSelection = this.content.selectAll("." + Legend._SUBELEMENT_CLASS);
      dataSelection.classed("selected", (d: any) => this.selected !== undefined ? this.selected === d : false);
      dataSelection.classed("not-selected", (d: any) => this.selected !== undefined ? this.selected !== d : false);
      dataSelection.on("mouseover", (d: any, i: number) => {
        console.log("ON: " + d + " " + i);
        this.selected = d;
        this.callback(d);
      });
      dataSelection.on("mouseout", (d: any, i: number) => {
        console.log("OFF: " + d + " " + i);
        this.selected = undefined;
        this.callback();
      });
      return this;
    }
  }
}
