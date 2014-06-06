///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export interface ToggleCallback {
      (datum: any, newState: boolean): any;
  }
  export interface HoverCallback {
      (datum?: any): any;
  }

  export class Legend extends Abstract.Component {
    private static _SUBELEMENT_CLASS = "legend-row";
    private static MARGIN = 5;

    private colorScale: Scale.Color;
    private maxWidth: number;
    private nRowsDrawn: number;

    private _callbackClick: ToggleCallback;
    private _callbackHover: HoverCallback;

    // focus is the element currently being hovered over
    // if no elements are currently being hovered over, focus is undefined
    private focus: any;

    // this is the set of all elements that are currently toggled off
    private isOff: D3.Set;

    /**
     * Creates a Legend.
     *
     * @constructor
     * @param {ColorScale} colorScale
     */
    constructor(colorScale?: Scale.Color) {
      super();
      this.classed("legend", true);
      this.scale(colorScale);
      this.xAlign("RIGHT").yAlign("TOP");
      this.xOffset(5).yOffset(5);
    }

    /**
     * Assigns or gets the callback to the Legend
     * Call with argument of null to remove the callback
     * 
     * @param{ToggleCallback} callback The new callback function
     */
    public callbackClick(callback: ToggleCallback): Legend;
    public callbackClick(): ToggleCallback;
    public callbackClick(callback?: ToggleCallback): any {
      if (callback !== undefined) {
        this._callbackClick = callback;
        this.isOff = d3.set();
        this.updateListeners();
        this.updateClasses();
        return this;
      } else {
        return this._callbackClick;
      }
    }

    /**
     * Assigns or gets the callback to the Legend
     * Call with argument of null to remove the callback
     * 
     * @param{HoverCallback} callback The new callback function
     */
    public callbackHover(callback: HoverCallback): Legend;
    public callbackHover(): HoverCallback;
    public callbackHover(callback?: HoverCallback): any {
      if (callback !== undefined) {
        this._callbackHover = callback;
        this.focus = undefined;
        this.updateListeners();
        this.updateClasses();
        return this;
      } else {
        return this._callbackHover;
      }
    }


    /**
     * Assigns a new ColorScale to the Legend.
     *
     * @param {ColorScale} scale
     * @returns {Legend} The calling Legend.
     */
    public scale(scale: Scale.Color): Legend;
    public scale(): Scale.Color;
    public scale(scale?: Scale.Color): any {
      if (scale != null) {
        if (this.colorScale != null) {
          this._deregisterFromBroadcaster(this.colorScale);
        }
        this.colorScale = scale;
        this._registerToBroadcaster(this.colorScale, () => this.domainUpdate());
        this.domainUpdate();
        return this;
      } else {
        return this.colorScale;
      }
    }

    private domainUpdate() {
      if (this._callbackClick != null) {
        this.isOff = Util.Methods.intersection(this.isOff, d3.set(this.scale().domain()));
      }
      if (this._callbackHover != null) {
        this.focus = undefined;
      }
      this._invalidateLayout();
    }

    public _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(xOrigin, yOrigin, availableWidth, availableHeight);
      var textHeight = this.measureTextHeight();
      var totalNumRows = this.colorScale.domain().length;
      this.nRowsDrawn = Math.min(totalNumRows, Math.floor(this.availableHeight / textHeight));
      return this;
    }

    public _requestedSpace(offeredWidth: number, offeredY: number): ISpaceRequest {
      var textHeight = this.measureTextHeight();
      var totalNumRows = this.colorScale.domain().length;
      var rowsICanFit = Math.min(totalNumRows, Math.floor(offeredY / textHeight));

      var fakeLegendEl = this.content.append("g").classed(Legend._SUBELEMENT_CLASS, true);
      var fakeText = fakeLegendEl.append("text");
      var maxWidth = d3.max(this.colorScale.domain(), (d: string) => Util.Text.getTextWidth(fakeText, d));
      fakeLegendEl.remove();
      maxWidth = maxWidth === undefined ? 0 : maxWidth;
      var desiredWidth = maxWidth + textHeight + Legend.MARGIN;
      return {
        width : Math.min(desiredWidth, offeredWidth),
        height: rowsICanFit * textHeight,
        wantsWidth: offeredWidth < desiredWidth,
        wantsHeight: rowsICanFit < totalNumRows
      };
    }

    private measureTextHeight(): number {
      // note: can't be called before anchoring atm
      var fakeLegendEl = this.content.append("g").classed(Legend._SUBELEMENT_CLASS, true);
      var textHeight = Util.Text.getTextHeight(fakeLegendEl.append("text"));
      fakeLegendEl.remove();
      return textHeight;
    }

    public _doRender(): Legend {
      super._doRender();
      var domain = this.colorScale.domain().slice(0, this.nRowsDrawn);
      var textHeight = this.measureTextHeight();
      var availableWidth  = this.availableWidth  - textHeight - Legend.MARGIN;
      var r = textHeight - Legend.MARGIN * 2 - 2;
      var legend: D3.UpdateSelection = this.content.selectAll("." + Legend._SUBELEMENT_CLASS).data(domain, (d) => d);
      var legendEnter = legend.enter()
          .append("g").classed(Legend._SUBELEMENT_CLASS, true);
      legendEnter.append("circle")
          .attr("cx", Legend.MARGIN + r/2)
          .attr("cy", Legend.MARGIN + r/2)
          .attr("r",  r);
      legendEnter.append("text")
          .attr("x", textHeight)
          .attr("y", Legend.MARGIN + textHeight / 2);
      legend.exit().remove();
      legend.attr("transform", (d: any) => "translate(0," + domain.indexOf(d) * textHeight + ")");
      legend.selectAll("circle").attr("fill", this.colorScale._d3Scale);
      legend.selectAll("text")
            .text(function(d: any) {return Util.Text.getTruncatedText(d, availableWidth , d3.select(this));});
      this.updateListeners();
      return this;
    }

    private updateListeners() {
      if (this._isSetup) {
        var dataSelection = this.content.selectAll("." + Component.Legend._SUBELEMENT_CLASS);
        if (this._callbackHover != null) {
          // on mouseover, tag everything with the "hover" class
          var hoverAll = (mouseover: boolean) => (datum: any) => {
            this.updateClasses(mouseover);
          };
          this.content.on("mouseover", hoverAll(true));
          this.content.on("mouseout", hoverAll(false));

          // tag the element that is being hovered over with the class "focus"
          var hoverSelected = (mouseover: boolean) => (datum: any) => {
            this.focus = mouseover ? datum : undefined;
            this._callbackHover(this.focus);
            this.updateClasses();
          };
          dataSelection.on("mouseover", hoverSelected(true));
          dataSelection.on("mouseout", hoverSelected(false));
        } else {
          // remove all mouseover/mouseout listeners
          this.content.on("mouseover", null);
          this.content.on("mouseout", null);
          dataSelection.on("mouseover", null);
          dataSelection.on("mouseout", null);
        }

        if (this._callbackClick != null) {
          dataSelection.on("click", (datum: any) => {
            var turningOn = this.isOff.has(datum);
            if (turningOn) {
              this.isOff.remove(datum);
            } else {
              this.isOff.add(datum);
            }
            this._callbackClick(datum, turningOn);
            this.updateClasses();
          });
        } else {
          // remove all click listeners
          dataSelection.on("click", null);
        }
      }
    }

    private updateClasses(b?: boolean) {
      if (this._isSetup) {
        var dataSelection = this.content.selectAll("." + Component.Legend._SUBELEMENT_CLASS);
        if (this._callbackHover != null) {
          dataSelection.classed("focus", (d: any) => this.focus === d);
          dataSelection.classed("not-focus", (d: any) => this.focus !== d);
          if (b != null) {
            dataSelection.classed("hover", b);
          }
        }
        if (this._callbackClick != null) {
          dataSelection.classed("toggled-on", (d: any) => !this.isOff.has(d));
          dataSelection.classed("toggled-off", (d: any) => this.isOff.has(d));
        }
      }
    }
  }
}
}
