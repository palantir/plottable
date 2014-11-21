///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export interface ToggleCallback {
      (datum: string, newState: boolean): any;
  }
  export interface HoverCallback {
      (datum?: string): any;
  }

  export class Legend extends AbstractComponent {
    /**
     * The css class applied to each legend row
     */
    public static SUBELEMENT_CLASS = "legend-row";
    private static _MARGIN = 5;

    private _colorScale: Scale.Color;
    private _nRowsDrawn: number;

    private _toggleCallback: ToggleCallback;
    private _hoverCallback: HoverCallback;

    private _datumCurrentlyFocusedOn: string;

    // this is the set of all legend domain strings that are currently toggled off
    private _isOff: D3.Set<string>;

    /**
     * Constructs a Legend.
     *
     * A legend consists of a series of legend rows, each with a color and label taken from the `colorScale`.
     * The rows will be displayed in the order of the `colorScale` domain.
     * This legend also allows interactions, through the functions `toggleCallback` and `hoverCallback`
     * Setting a callback will also put classes on the individual rows.
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
      this._fixedWidthFlag = true;
      this._fixedHeightFlag = true;
    }

    public remove() {
      super.remove();
      if (this._colorScale != null) {
        this._colorScale.broadcaster.deregisterListener(this);
      }
    }

    /**
     * Gets the toggle callback from the Legend.
     *
     * This callback is associated with toggle events, which trigger when a legend row is clicked.
     * Internally, this will change the state of of the row from "toggled-on" to "toggled-off" and vice versa.
     * Setting a callback will also set a class to each individual legend row as "toggled-on" or "toggled-off".
     * Call with argument of null to remove the callback. This will also remove the above classes to legend rows.
     *
     * @returns {ToggleCallback} The current toggle callback.
     */
    public toggleCallback(): ToggleCallback;
    /**
     * Assigns a toggle callback to the Legend.
     *
     * This callback is associated with toggle events, which trigger when a legend row is clicked.
     * Internally, this will change the state of of the row from "toggled-on" to "toggled-off" and vice versa.
     * Setting a callback will also set a class to each individual legend row as "toggled-on" or "toggled-off".
     * Call with argument of null to remove the callback. This will also remove the above classes to legend rows.
     *
     * @param {ToggleCallback} callback The new callback function.
     * @returns {Legend} The calling Legend.
     */
    public toggleCallback(callback: ToggleCallback): Legend;
    public toggleCallback(callback?: ToggleCallback): any {
      if (callback !== undefined) {
        this._toggleCallback = callback;
        this._isOff = d3.set();
        this._updateListeners();
        this._updateClasses();
        return this;
      } else {
        return this._toggleCallback;
      }
    }

    /**
     * Gets the hover callback from the Legend.
     *
     * This callback is associated with hover events, which trigger when the mouse enters or leaves a legend row
     * Setting a callback will also set the class "hover" to all legend row,
     * as well as the class "focus" to the legend row being hovered over.
     * Call with argument of null to remove the callback. This will also remove the above classes to legend rows.
     *
     * @returns {HoverCallback} The new current hover callback.
     */
    public hoverCallback(): HoverCallback;
    /**
     * Assigns a hover callback to the Legend.
     *
     * This callback is associated with hover events, which trigger when the mouse enters or leaves a legend row
     * Setting a callback will also set the class "hover" to all legend row,
     * as well as the class "focus" to the legend row being hovered over.
     * Call with argument of null to remove the callback. This will also remove the above classes to legend rows.
     *
     * @param {HoverCallback} callback If provided, the new callback function.
     * @returns {Legend} The calling Legend.
     */
    public hoverCallback(callback: HoverCallback): Legend;
    public hoverCallback(callback?: HoverCallback): any {
      if (callback !== undefined) {
        this._hoverCallback = callback;
        this._datumCurrentlyFocusedOn = undefined;
        this._updateListeners();
        this._updateClasses();
        return this;
      } else {
        return this._hoverCallback;
      }
    }

    /**
     * Gets the current color scale from the Legend.
     *
     * @returns {ColorScale} The current color scale.
     */
    public scale(): Scale.Color;
    /**
     * Assigns a new color scale to the Legend.
     *
     * @param {Scale.Color} scale If provided, the new scale.
     * @returns {Legend} The calling Legend.
     */
    public scale(scale: Scale.Color): Legend;
    public scale(scale?: Scale.Color): any {
      if (scale != null) {
        if (this._colorScale != null) {
          this._colorScale.broadcaster.deregisterListener(this);
        }
        this._colorScale = scale;
        this._colorScale.broadcaster.registerListener(this, () => this._updateDomain());
        this._updateDomain();
        return this;
      } else {
        return this._colorScale;
      }
    }

    private _updateDomain() {
      if (this._toggleCallback != null) {
        this._isOff = _Util.Methods.intersection(this._isOff, d3.set(this.scale().domain()));
      }
      if (this._hoverCallback != null) {
        this._datumCurrentlyFocusedOn = this.scale().domain().indexOf(this._datumCurrentlyFocusedOn) >= 0 ?
          this._datumCurrentlyFocusedOn : undefined;
      }
      this._invalidateLayout();
    }

    public _computeLayout(xOrigin?: number, yOrigin?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(xOrigin, yOrigin, availableWidth, availableHeight);
      var textHeight = this._measureTextHeight();
      var totalNumRows = this._colorScale.domain().length;
      this._nRowsDrawn = Math.min(totalNumRows, Math.floor(this.height() / textHeight));
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest {
      var textHeight = this._measureTextHeight();
      var totalNumRows = this._colorScale.domain().length;
      var rowsICanFit = Math.min(totalNumRows, Math.floor( (offeredHeight - 2 * Legend._MARGIN) / textHeight));
      var fakeLegendEl = this._content.append("g").classed(Legend.SUBELEMENT_CLASS, true);
      var measure = _Util.Text.getTextMeasurer(fakeLegendEl.append("text"));
      var maxWidth = _Util.Methods.max<string, number>(this._colorScale.domain(), (d: string) => measure(d).width, 0);
      fakeLegendEl.remove();
      maxWidth = maxWidth === undefined ? 0 : maxWidth;
      var desiredWidth  = rowsICanFit === 0 ? 0 : maxWidth + textHeight + 2 * Legend._MARGIN;
      var desiredHeight = rowsICanFit === 0 ? 0 : totalNumRows * textHeight + 2 * Legend._MARGIN;
      return {
        width : desiredWidth,
        height: desiredHeight,
        wantsWidth: offeredWidth < desiredWidth,
        wantsHeight: offeredHeight < desiredHeight
      };
    }

    private _measureTextHeight(): number {
      // note: can't be called before anchoring atm
      var fakeLegendEl = this._content.append("g").classed(Legend.SUBELEMENT_CLASS, true);
      var textHeight = _Util.Text.getTextMeasurer(fakeLegendEl.append("text"))(_Util.Text.HEIGHT_TEXT).height;
      // HACKHACK
      if (textHeight === 0) {
        textHeight = 1;
      }
      fakeLegendEl.remove();
      return textHeight;
    }

    public _doRender() {
      super._doRender();
      var domain = this._colorScale.domain().slice(0, this._nRowsDrawn);
      var textHeight = this._measureTextHeight();
      var availableWidth  = this.width()  - textHeight - Legend._MARGIN;
      var r = textHeight * 0.3;
      var legend: D3.UpdateSelection = this._content.selectAll("." + Legend.SUBELEMENT_CLASS).data(domain, (d) => d);
      var legendEnter = legend.enter()
          .append("g").classed(Legend.SUBELEMENT_CLASS, true);

      legendEnter.each(function(d: String) {
        d3.select(this).classed(d.replace(" ", "-"), true);
      });

      legendEnter.append("circle");
      legendEnter.append("g").classed("text-container", true);

      legend.exit().remove();

      legend.selectAll("circle")
        .attr("cx", textHeight / 2)
        .attr("cy", textHeight / 2)
        .attr("r",  r)
        .attr("fill", this._colorScale._d3Scale);
      legend.selectAll("g.text-container")
        .text("")
        .attr("transform", "translate(" + textHeight + ", 0)")
        .each(function(d: string) {
          var d3this = d3.select(this);
          var measure = _Util.Text.getTextMeasurer(d3this.append("text"));
          var writeLine = _Util.Text.getTruncatedText(d, availableWidth, measure);
          var writeLineMeasure = measure(writeLine);
          _Util.Text.writeLineHorizontally(writeLine, d3this, writeLineMeasure.width, writeLineMeasure.height);
        });

      legend.attr("transform", (d: string) => {
        return "translate(" + Legend._MARGIN + "," + (domain.indexOf(d) * textHeight + Legend._MARGIN) + ")";
      });

      this._updateClasses();
      this._updateListeners();
    }

    private _updateListeners() {
      if (!this._isSetup) {
        return;
      }
      var dataSelection = this._content.selectAll("." + Legend.SUBELEMENT_CLASS);
      if (this._hoverCallback != null) {
        // tag the element that is being hovered over with the class "focus"
        // this callback will trigger with the specific element being hovered over.
        var hoverRow = (mouseover: boolean) => (datum: string) => {
          this._datumCurrentlyFocusedOn = mouseover ? datum : undefined;
          this._hoverCallback(this._datumCurrentlyFocusedOn);
          this._updateClasses();
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
          var turningOn = this._isOff.has(datum);
          if (turningOn) {
            this._isOff.remove(datum);
          } else {
            this._isOff.add(datum);
          }
          this._toggleCallback(datum, turningOn);
          this._updateClasses();
        });
      } else {
        // remove all click listeners
        dataSelection.on("click", null);
      }
    }

    private _updateClasses() {
      if (!this._isSetup) {
        return;
      }
      var dataSelection = this._content.selectAll("." + Legend.SUBELEMENT_CLASS);
      if (this._hoverCallback != null) {
        dataSelection.classed("focus", (d: string) => this._datumCurrentlyFocusedOn === d);
        dataSelection.classed("hover", this._datumCurrentlyFocusedOn !== undefined);
      } else {
        dataSelection.classed("hover", false);
        dataSelection.classed("focus", false);
      }
      if (this._toggleCallback != null) {
        dataSelection.classed("toggled-on", (d: string) => !this._isOff.has(d));
        dataSelection.classed("toggled-off", (d: string) => this._isOff.has(d));
      } else {
        dataSelection.classed("toggled-on", false);
        dataSelection.classed("toggled-off", false);
      }
    }
  }
}
}
