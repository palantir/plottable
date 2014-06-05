///<reference path="../reference.ts" />

module Plottable {
  export interface HoverCallback {
    (datum?: any): any;
  }
  export class HoverLegend extends Component.Legend {
    private _callback: HoverCallback;

    // focus is the element currently being hovered over
    // if no elements are currently being hovered over, focus is undefined
    private focus: any;
    
    /**
     * Creates a HoverLegend.
     *
     * @constructor
     * @param {Scale.Color} colorScale
     * @param {HoverCallback} callback The callback function for hovering over a legend entry.
     */
    constructor(colorScale: Scale.Color, callback?: HoverCallback) {
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
      var dataSelection = this.content.selectAll("." + Component.Legend._SUBELEMENT_CLASS);

      // on mouseover, tag everything with the "hover" class
      var func1 = (b: boolean) => (d: any) => {
         dataSelection.classed("hover", b);
      };
      this.content.on("mouseover", func1(true));
      this.content.on("mouseout", func1(false));

      // tag the element that is being hovered over with the class "focus"
      var func2 = (b: boolean) => (d: any) => {
        this.focus = b ? d : undefined;
        if (this._callback != null) {
          this._callback(this.focus);
        }
        this.updateClasses();
      };
      dataSelection.on("mouseover", func2(true));
      dataSelection.on("mouseout", func2(false));
      return this;
    }

    private updateClasses() {
      if (this._isSetup) {
        var dataSelection = this.content.selectAll("." + Component.Legend._SUBELEMENT_CLASS);
        dataSelection.classed("focus", (d: any) => this.focus === d);
      }
    }
  }
}
