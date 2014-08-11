///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export interface ToggleCallback {
      (datum: string, newState: boolean): any;
  }
  export interface HoverCallback {
      (datum?: string): any;
  }

  export class Legend extends Abstract.Component {
    /**
     * The css class applied to each legend row
     */
    public static SUBELEMENT_CLASS = "legend-row";
    private static MARGIN = 5;

    private colorScale: Scale.Color;
    private maxWidth: number;
    private nRowsDrawn: number;

    private _toggleCallback: ToggleCallback;
    private _hoverCallback: HoverCallback;

    private datumCurrentlyFocusedOn: string;

    // this is the set of all elements that are currently toggled off
    private isOff: D3.Set;

    /**
     * Creates a Legend.
     *
     * A legend consists of a series of legend rows, each with a color and label taken from the `colorScale`.
     * The rows will be displayed in the order of the `colorScale` domain.
     * This legend also allows interactions, through the functions `toggleCallback` and `hoverCallback`
     * Setting a callback will also put classes on the individual rows.
     *
     * @constructor
     * @param {Scale.Color} colorScale
     */
    constructor(colorScale?: Scale.Color) {
      super();
      this.classed("legend", true);
      this.scale(colorScale);
      this.xAlign("RIGHT").yAlign("TOP");
      this.xOffset(5).yOffset(5);
      this._fixedWidthFlag = true;
      this._fixedHeightFlag = true;
    }

    public remove() {
      super.remove();
      if (this.colorScale != null) {
        this.colorScale.broadcaster.deregisterListener(this);
      }
    }

    /**
     * Assigns or gets the callback to the Legend
     *
     * This callback is associated with toggle events, which trigger when a legend row is clicked.
     * Internally, this will change the state of of the row from "toggled-on" to "toggled-off" and vice versa.
     * Setting a callback will also set a class to each individual legend row as "toggled-on" or "toggled-off".
     * Call with argument of null to remove the callback. This will also remove the above classes to legend rows.
     *
     * @param {ToggleCallback} callback The new callback function
     */
    public toggleCallback(callback: ToggleCallback): Legend;
    public toggleCallback(): ToggleCallback;
    public toggleCallback(callback?: ToggleCallback): any {
      if (callback !== undefined) {
        this._toggleCallback = callback;
        this.isOff = d3.set();
        this.updateListeners();
        this.updateClasses();
        return this;
      } else {
        return this._toggleCallback;
      }
    }

    /**
     * Assigns or gets the callback to the Legend
     * This callback is associated with hover events, which trigger when the mouse enters or leaves a legend row
     * Setting a callback will also set the class "hover" to all legend row,
     * as well as the class "focus" to the legend row being hovered over.
     * Call with argument of null to remove the callback. This will also remove the above classes to legend rows.
     *
     * @param{HoverCallback} callback The new callback function
     */
    public hoverCallback(callback: HoverCallback): Legend;
    public hoverCallback(): HoverCallback;
    public hoverCallback(callback?: HoverCallback): any {
      if (callback !== undefined) {
        this._hoverCallback = callback;
        this.datumCurrentlyFocusedOn = undefined;
        this.updateListeners();
        this.updateClasses();
        return this;
      } else {
        return this._hoverCallback;
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
          this.colorScale.broadcaster.deregisterListener(this);
        }
        this.colorScale = scale;
        this.colorScale.broadcaster.registerListener(this, () => this.updateDomain());
        this.updateDomain();
        return this;
      } else {
        return this.colorScale;
      }
    }

    private updateDomain() {
      if (this._toggleCallback != null) {
        this.isOff = Util.Methods.intersection(this.isOff, d3.set(this.scale().domain()));
      }
      if (this._hoverCallback != null) {
        this.datumCurrentlyFocusedOn = this.scale().domain().indexOf(this.datumCurrentlyFocusedOn) >= 0 ?
          this.datumCurrentlyFocusedOn : undefined;
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

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      var textHeight = this.measureTextHeight();
      var totalNumRows = this.colorScale.domain().length;
      var rowsICanFit = Math.min(totalNumRows, Math.floor( (offeredHeight - 2 * Legend.MARGIN) / textHeight));
      var fakeLegendEl = this.content.append("g").classed(Legend.SUBELEMENT_CLASS, true);
      var measure = Util.Text.getTextMeasure(fakeLegendEl.append("text"));
      var maxWidth = d3.max(this.colorScale.domain(), (d: string) => measure(d).width);
      fakeLegendEl.remove();
      maxWidth = maxWidth === undefined ? 0 : maxWidth;
      var desiredWidth  = rowsICanFit === 0 ? 0 : maxWidth + textHeight + 2 * Legend.MARGIN;
      var desiredHeight = rowsICanFit === 0 ? 0 : totalNumRows * textHeight + 2 * Legend.MARGIN;
      return {
        width : desiredWidth,
        height: desiredHeight,
        wantsWidth: offeredWidth < desiredWidth,
        wantsHeight: offeredHeight < desiredHeight
      };
    }

    private measureTextHeight(): number {
      // note: can't be called before anchoring atm
      var fakeLegendEl = this.content.append("g").classed(Legend.SUBELEMENT_CLASS, true);
      var textHeight = Util.Text.getTextMeasure(fakeLegendEl.append("text"))(Util.Text.HEIGHT_TEXT).height;
      // HACKHACK
      if (textHeight === 0) {
        textHeight = 1;
      }
      fakeLegendEl.remove();
      return textHeight;
    }

    public _doRender(): Legend {
      super._doRender();
      var domain = this.colorScale.domain().slice(0, this.nRowsDrawn);
      var textHeight = this.measureTextHeight();
      var availableWidth  = this.availableWidth  - textHeight - Legend.MARGIN;
      var r = textHeight * 0.3;
      var legend: D3.UpdateSelection = this.content.selectAll("." + Legend.SUBELEMENT_CLASS).data(domain, (d) => d);
      var legendEnter = legend.enter()
          .append("g").classed(Legend.SUBELEMENT_CLASS, true);

      legendEnter.append("circle");
      legendEnter.append("g").classed("text-container", true);

      legend.exit().remove();

      legend.selectAll("circle")
        .attr("cx", textHeight / 2)
        .attr("cy", textHeight / 2)
        .attr("r",  r)
        .attr("fill", this.colorScale._d3Scale);
      legend.selectAll("g.text-container")
        .text("")
        .attr("transform", "translate(" + textHeight + ", 0)")
        .each(function(d: string) {
          var d3this = d3.select(this);
          var measure = Util.Text.getTextMeasure(d3this.append("text"));
          var writeLine = Util.Text.getTruncatedText(d, availableWidth, measure);
          var writeLineMeasure = measure(writeLine);
          Util.Text.writeLineHorizontally(writeLine, d3this, writeLineMeasure.width, writeLineMeasure.height);
        });

      legend.attr("transform", (d: string) => {
        return "translate(" + Legend.MARGIN + "," + (domain.indexOf(d) * textHeight + Legend.MARGIN) + ")";
      });

      this.updateClasses();
      this.updateListeners();
      return this;
    }

    private updateListeners() {
      if (!this._isSetup) {
        return;
      }
      var dataSelection = this.content.selectAll("." + Legend.SUBELEMENT_CLASS);
      if (this._hoverCallback != null) {
        // tag the element that is being hovered over with the class "focus"
        // this callback will trigger with the specific element being hovered over.
        var hoverRow = (mouseover: boolean) => (datum: string) => {
          this.datumCurrentlyFocusedOn = mouseover ? datum : undefined;
          this._hoverCallback(this.datumCurrentlyFocusedOn);
          this.updateClasses();
        };
        dataSelection.on("mouseover", hoverRow(true));
        dataSelection.on("mouseout", hoverRow(false));
      } else {
        // remove all mouseover/mouseout listeners
        dataSelection.on("mouseover", null);
        dataSelection.on("mouseout", null);
      }

      if (this._toggleCallback != null) {
        dataSelection.on("click", (datum: string) => {
          var turningOn = this.isOff.has(datum);
          if (turningOn) {
            this.isOff.remove(datum);
          } else {
            this.isOff.add(datum);
          }
          this._toggleCallback(datum, turningOn);
          this.updateClasses();
        });
      } else {
        // remove all click listeners
        dataSelection.on("click", null);
      }
    }

    private updateClasses() {
      if (!this._isSetup) {
        return;
      }
      var dataSelection = this.content.selectAll("." + Legend.SUBELEMENT_CLASS);
      if (this._hoverCallback != null) {
        dataSelection.classed("focus", (d: string) => this.datumCurrentlyFocusedOn === d);
        dataSelection.classed("hover", this.datumCurrentlyFocusedOn !== undefined);
      } else {
        dataSelection.classed("hover", false);
        dataSelection.classed("focus", false);
      }
      if (this._toggleCallback != null) {
        dataSelection.classed("toggled-on", (d: string) => !this.isOff.has(d));
        dataSelection.classed("toggled-off", (d: string) => this.isOff.has(d));
      } else {
        dataSelection.classed("toggled-on", false);
        dataSelection.classed("toggled-off", false);
      }
    }
  }
}
}
