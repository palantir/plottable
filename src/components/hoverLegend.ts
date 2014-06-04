///<reference path="../reference.ts" />

module Plottable {
  export interface HoverCallback {
    (datum?: any): any;
  }
  export class HoverLegend extends Legend {
    private _callback: HoverCallback;

    // selected is the element currently being hovered over
    // if no elements are currently being hovered over, selected is undefined
    private selected: any;
    
    /**
     * Creates a HoverLegend.
     *
     * @constructor
     * @param {ColorScale} colorScale
     * @param {HoverCallback} callback The callback function for hovering over a legend entry.
     */
    constructor(colorScale: ColorScale, callback?: HoverCallback) {
      super(colorScale);
      this.callback(callback);
      this._callback = callback;
    }

    /**
     * Assigns or gets the callback to the HoverLegend
     * Call with argument of null to remove the callback
     * 
     * @param{HoverCallback} callback The new callback function
     */
    public callback(callback: HoverCallback): HoverLegend;
    public callback(): HoverCallback;
    public callback(callback?: HoverCallback): any {
      if (callback !== undefined) {
        this._callback = callback;
        return this;
      } else {
        return this;
      }
    }

    public _doRender(): HoverLegend {
      super._doRender();
      this.updateClasses();
      var dataSelection = this.content.selectAll("." + Legend._SUBELEMENT_CLASS);
      var func = (b: boolean) => (d: any, i: number) => {
        this.selected = b ? d : undefined;
        if (this._callback != null) {
          this._callback(this.selected);
        }
        this.updateClasses();
      };
      dataSelection.on("mouseover", func(true));
      dataSelection.on("mouseout", func(false));
      return this;
    }

    private updateClasses() {
      if (this._isSetup) {
        var dataSelection = this.content.selectAll("." + Legend._SUBELEMENT_CLASS);
        dataSelection.classed("selected", (d: any) => this.selected !== undefined ? this.selected === d : false);
        dataSelection.classed("not-selected", (d: any) => this.selected !== undefined ? this.selected !== d : false);
      }
    }
  }
}
