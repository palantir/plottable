///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export class Axis extends Abstract.Component {
    public axisElement: D3.Selection;
    private d3Axis: D3.Svg.Axis;
    public _axisScale: Abstract.Scale;
    private _showEndTickLabels = false;
    private tickPositioning = "center";
    public orientToAlign: {[s: string]: string} = {left: "right", right: "left", top: "bottom", bottom: "top"};
    public static _DEFAULT_TICK_SIZE = 6;

    /**
     * Creates an Axis.
     *
     * @constructor
     * @param {Scale} scale The Scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     * @param {any} [formatter] a D3 formatter or a Plottable Formatter.
     */
    constructor(axisScale: Abstract.Scale, orientation: string, formatter?: any) {
      super();
      this._axisScale = axisScale;
      orientation = orientation.toLowerCase();
      this.d3Axis = d3.svg.axis().scale(axisScale._d3Scale).orient(orientation);
      this.classed("axis", true);
      var formatFunction = formatter;
      if (formatter == null) {
        formatter = new Formatter.General();
      }
      if (formatter instanceof Abstract.Formatter) {
        formatFunction = (d: any) => (<Abstract.Formatter> formatter).format(d);
      }
      this.tickFormat(formatFunction);
      this._axisScale.broadcaster.registerListener(this, () => this._render());
    }

    public _setup() {
      super._setup();
      this.axisElement = this.content.append("g").classed("axis", true);
      return this;
    }

    public _doRender() {
      var domain = this._axisScale.domain();
      var extent = Math.abs(domain[1] - domain[0]);
      var min = +d3.min(domain);
      var max = +d3.max(domain);
      var newDomain: any;
      var standardOrder = domain[0] < domain[1];
      if (typeof(domain[0]) === "number") {
        newDomain = standardOrder ? [min - extent, max + extent] : [max + extent, min - extent];
      } else {
        newDomain = standardOrder ? [new Date(min - extent), new Date(max + extent)] : [new Date(max + extent), new Date(min - extent)];
      }

      // hackhack Make tiny-zero representations not look terrible, by rounding them to 0
      if ((<Abstract.QuantitiveScale> this._axisScale).ticks != null) {
        var scale         = <Abstract.QuantitiveScale> this._axisScale;
        var nTicks        = 10;
        var ticks         = scale.ticks(nTicks);
        var numericDomain = scale.domain();
        var interval      = numericDomain[1] - numericDomain[0];
        var cleanTick     = (n: number) => Math.abs(n / interval / nTicks) < 0.0001 ? 0 : n;
        ticks = ticks.map(cleanTick);
        this.d3Axis.tickValues(ticks);
      }

      this.axisElement.call(this.d3Axis);
      this.axisElement.selectAll(".tick").select("text").style("visibility", "visible");

      return this;
    }

    public showEndTickLabels(): boolean;
    public showEndTickLabels(show: boolean): Axis;
    public showEndTickLabels(show?: boolean): any {
      if (show == null) {
        return this._showEndTickLabels;
      }
      this._showEndTickLabels = show;
      return this;
    }

    public _hideCutOffTickLabels() {
      var availableWidth  = this.availableWidth ;
      var availableHeight = this.availableHeight;
      var tickLabels      = this.axisElement.selectAll(".tick").select("text");
      var boundingBox     = this.element.select(".bounding-box")[0][0].getBoundingClientRect();

      tickLabels.each(function (d: any){
        if (!Util.DOM.isInsideBBox(boundingBox, this.getBoundingClientRect())) {
          d3.select(this).style("visibility", "hidden");
        }
      });

      return this;
    }

    public _hideOverlappingTickLabels() {
      var tickLabels = this.axisElement.selectAll(".tick").select("text");
      var lastLabelClientRect: ClientRect;

      tickLabels.each(function (d: any) {
        var clientRect = this.getBoundingClientRect();
        if (lastLabelClientRect != null  && Util.DOM.isOverlapBBox(clientRect, lastLabelClientRect)) {
          d3.select(this).style("visibility", "hidden");
        } else {
          lastLabelClientRect = clientRect;
          d3.select(this).style("visibility", "visible");
        }
      });
    }

    public scale(): Abstract.Scale;
    public scale(newScale: Abstract.Scale): Axis;
    public scale(newScale?: Abstract.Scale): any {
      if (newScale == null) {
        return this._axisScale;
      } else {
        this._axisScale = newScale;
        this.d3Axis.scale(newScale._d3Scale);
        return this;
      }
    }

    /**
     * Sets or gets the tick label position relative to the tick marks. The
     * exact consequences of particular tick label positionings depends on the
     * subclass implementation.
     *
     * @param {string} [position] The relative position of the tick label.
     * @returns {string|Axis} The current tick label position, or the calling Axis.
     */
    public tickLabelPosition(): string;
    public tickLabelPosition(position: string): Axis;
    public tickLabelPosition(position?: string): any {
      if (position == null) {
        return this.tickPositioning;
      } else {
        this.tickPositioning = position;
        return this;
      }
    }

    public orient(): string;
    public orient(newOrient: string): Axis;
    public orient(newOrient?: string): any {
      if (newOrient == null) {
        return this.d3Axis.orient();
      } else {
        this.d3Axis.orient(newOrient);
        return this;
      }
    }

    public ticks(): any[];
    public ticks(...args: any[]): Axis;
    public ticks(...args: any[]): any {
      if (args == null || args.length === 0) {
        return this.d3Axis.ticks();
      } else {
        this.d3Axis.ticks(args);
        return this;
      }
    }

    public tickValues(): any[];
    public tickValues(...args: any[]): Axis;
    public tickValues(...args: any[]): any {
      if (args == null) {
        return this.d3Axis.tickValues();
      } else {
        this.d3Axis.tickValues(args);
        return this;
      }
    }

    public tickSize(): number;
    public tickSize(inner: number): Axis;
    public tickSize(inner: number, outer: number): Axis;
    public tickSize(inner?: number, outer?: number): any {
      if (inner != null && outer != null) {
        this.d3Axis.tickSize(inner, outer);
        return this;
      } else if (inner != null) {
        this.d3Axis.tickSize(inner);
        return this;
      } else {
        return this.d3Axis.tickSize();
      }
    }

    public innerTickSize(): number;
    public innerTickSize(val: number): Axis;
    public innerTickSize(val?: number): any {
      if (val == null) {
        return this.d3Axis.innerTickSize();
      } else {
        this.d3Axis.innerTickSize(val);
        return this;
      }
    }

    public outerTickSize(): number;
    public outerTickSize(val: number): Axis;
    public outerTickSize(val?: number): any {
      if (val == null) {
        return this.d3Axis.outerTickSize();
      } else {
        this.d3Axis.outerTickSize(val);
        return this;
      }
    }

    public tickPadding(): number;
    public tickPadding(val: number): Axis;
    public tickPadding(val?: number): any {
      if (val == null) {
        return this.d3Axis.tickPadding();
      } else {
        this.d3Axis.tickPadding(val);
        return this;
      }
    }

    /**
     * Gets the current tick formatting function, or sets the tick formatting function.
     *
     * @param {(value: any) => string} [formatter] The new tick formatting function.
     * @returns The current tick formatting function, or the calling Axis.
     */
    public tickFormat(): (value: any) => string;
    public tickFormat(formatter: (value: any) => string): Axis;
    public tickFormat(formatter?: (value: any) => string): any {
      if (formatter == null) {
        return this.d3Axis.tickFormat();
      } else {
        this.d3Axis.tickFormat(formatter);
        this._invalidateLayout();
        return this;
      }
    }
  }

  export class XAxis extends Axis {
    private _height = 30;
    /**
     * Creates an XAxis (a horizontal Axis).
     *
     * @constructor
     * @param {Scale} scale The Scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom)
     * @param {any} [formatter] a D3 formatter
     */
    constructor(scale: Abstract.Scale, orientation = "bottom", formatter: any = null) {
      super(scale, orientation, formatter);
      var orientation = orientation.toLowerCase();
      if (orientation !== "top" && orientation !== "bottom") {
        throw new Error(orientation + " is not a valid orientation for XAxis");
      }
      this.tickLabelPosition("center");
      var desiredAlignment = this.orientToAlign[orientation];
      this.yAlign(desiredAlignment);
    }

    public height(h: number) {
      this._height = h;
      this._invalidateLayout();
      return this;
    }

    public _setup() {
      super._setup();
      this.axisElement.classed("x-axis", true);
      return this;
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      return {
        width       : 0,
        height      : Math.min(offeredHeight, this._height),
        wantsWidth  : false,
        wantsHeight : offeredHeight < this._height
      };
    }

    /**
     * Sets or gets the tick label position relative to the tick marks.
     *
     * @param {string} [position] The relative position of the tick label (left/center/right).
     * @returns {string|XAxis} The current tick label position, or the calling XAxis.
     */
    public tickLabelPosition(): string;
    public tickLabelPosition(position: string): XAxis;
    public tickLabelPosition(position?: string): any {
      if (position == null) {
        return super.tickLabelPosition();
      } else {
        var positionLC = position.toLowerCase();
        if (positionLC === "left" || positionLC === "center" || positionLC === "right") {
          if (positionLC === "center") {
            this.tickSize(XAxis._DEFAULT_TICK_SIZE);
          } else {
            this.tickSize(12); // longer than default tick size
          }
          return super.tickLabelPosition(positionLC);
        } else {
          throw new Error(position + " is not a valid tick label position for XAxis");
        }
      }
    }

    public _doRender() {
      super._doRender();
      if (this.orient() === "top")  {
        this.axisElement.attr("transform", "translate(0," + this._height + ")");
      } else if (this.orient() === "bottom") {
        this.axisElement.attr("transform", "");
      }

      var tickTextLabels = this.axisElement.selectAll("text");
      if (tickTextLabels[0].length > 0) { // at least one tick label
        if (this.tickLabelPosition() !== "center") {
          tickTextLabels.attr("y", "0px");

          if (this.orient() === "bottom") {
            tickTextLabels.attr("dy", "1em");
          } else {
            tickTextLabels.attr("dy", "-0.25em");
          }

          if (this.tickLabelPosition() === "right") {
            tickTextLabels.attr("dx", "0.2em").style("text-anchor", "start");
          } else if (this.tickLabelPosition() === "left") {
            tickTextLabels.attr("dx", "-0.2em").style("text-anchor", "end");
          }
        }

        if ((<Scale.Ordinal> this._axisScale).rangeType != null) { // ordinal scale
          var scaleRange = this._axisScale.range();
          var availableWidth = this.availableWidth;
          var tickLengthWithPadding = Math.abs(parseFloat(d3.select(tickTextLabels[0][0]).attr("y")));
          var availableHeight = this.availableHeight - tickLengthWithPadding;
          if (tickTextLabels[0].length > 1) { // more than one label
            var tickValues = tickTextLabels.data();
            var tickPositions = tickValues.map((v: any) => this._axisScale.scale(v));
            tickPositions.forEach((p: number, i: number) => {
              var spacing = Math.abs(tickPositions[i + 1] - p);
              availableWidth = (spacing < availableWidth) ? spacing : availableWidth;
            });
          }

          availableWidth = 0.9 * availableWidth; // add in some padding

          tickTextLabels.each(function(t: any, i: number) {
            var textEl = d3.select(this);
            var currentText = textEl.text();
            var measure = Util.Text.getTextMeasure(textEl);
            var wrappedLines = Util.WordWrap.breakTextToFitRect(currentText, availableWidth, availableHeight, measure).lines;
            if (wrappedLines.length === 1) {
              textEl.text(Util.Text.getTruncatedText(currentText, availableWidth, measure));
            } else {
              textEl.text("");
              var tspans = textEl.selectAll("tspan").data(wrappedLines);
              tspans.enter().append("tspan");
              tspans.text((line: string) => line)
                    .attr("x", "0")
                    // first line gets the original shift, each subsequent line is one line down
                    .attr("dy", (line: string, i: number) => (i === 0) ? textEl.attr("dy") : "1em")
                    .style("text-anchor", textEl.style("text-anchor"));
            }
          });
        } else { // numeric scale
          this._hideOverlappingTickLabels();
        }
      }

      if (!this.showEndTickLabels()) {
        this._hideCutOffTickLabels();
      }
      return this;
    }
  }

  export class YAxis extends Axis {
    private _width = 50;
    /**
     * Creates a YAxis (a vertical Axis).
     *
     * @constructor
     * @param {Scale} scale The Scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (left/right)
     * @param {any} [formatter] a D3 formatter
     */
    constructor(scale: Abstract.Scale, orientation = "left", formatter: any = null) {
      super(scale, orientation, formatter);
      orientation = orientation.toLowerCase();
      if (orientation !== "left" && orientation !== "right") {
        throw new Error(orientation + " is not a valid orientation for YAxis");
      }
      this.tickLabelPosition("middle");
      var desiredAlignment = this.orientToAlign[orientation];
      this.xAlign(desiredAlignment);
    }

    public _setup() {
      super._setup();
      this.axisElement.classed("y-axis", true);
      return this;
    }

    public width(w: number) {
      this._width = w;
      this._invalidateLayout();
      return this;
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      return {
        width       : Math.min(offeredWidth, this._width),
        height      : 0,
        wantsWidth  : offeredWidth < this._width,
        wantsHeight : false
      };
    }

    /**
     * Sets or gets the tick label position relative to the tick marks.
     *
     * @param {string} [position] The relative position of the tick label (top/middle/bottom).
     * @returns {string|YAxis} The current tick label position, or the calling YAxis.
     */
    public tickLabelPosition(): string;
    public tickLabelPosition(position: string): YAxis;
    public tickLabelPosition(position?: string): any {
      if (position == null) {
        return super.tickLabelPosition();
      } else {
        var positionLC = position.toLowerCase();
        if (positionLC === "top" || positionLC === "middle" || positionLC === "bottom") {
          if (positionLC === "middle") {
            this.tickSize(YAxis._DEFAULT_TICK_SIZE);
          } else {
            this.tickSize(30); // longer than default tick size
          }
          return super.tickLabelPosition(positionLC);
        } else {
          throw new Error(position + " is not a valid tick label position for YAxis");
        }
      }
    }

    public _doRender() {
      super._doRender();
      if (this.orient() === "left") {
        this.axisElement.attr("transform", "translate(" + this._width + ", 0)");
      } else if (this.orient() === "right") {
        this.axisElement.attr("transform", "");
      }

      var tickTextLabels = this.axisElement.selectAll("text");
      if (tickTextLabels[0].length > 0) { // at least one tick label
        if (this.tickLabelPosition() !== "middle") {
          tickTextLabels.attr("x", "0px");

          if (this.orient() === "left") {
            tickTextLabels.attr("dx", "-0.25em");
          } else {
            tickTextLabels.attr("dx", "0.25em");
          }

          if (this.tickLabelPosition() === "top") {
            tickTextLabels.attr("dy", "-0.3em");
          } else if (this.tickLabelPosition() === "bottom") {
            tickTextLabels.attr("dy", "1em");
          }
        }

        if ((<Scale.Ordinal> this._axisScale).rangeType != null) { // ordinal scale
          var scaleRange = this._axisScale.range();
          var tickLengthWithPadding = Math.abs(parseFloat(d3.select(tickTextLabels[0][0]).attr("x")));
          var availableWidth = this.availableWidth - tickLengthWithPadding;
          var availableHeight = this.availableHeight;
          if (tickTextLabels[0].length > 1) { // more than one label
            var tickValues = tickTextLabels.data();
            var tickPositions = tickValues.map((v: any) => this._axisScale.scale(v));
            tickPositions.forEach((p: number, i: number) => {
              var spacing = Math.abs(tickPositions[i + 1] - p);
              availableHeight = (spacing < availableHeight) ? spacing : availableHeight;
            });
          }

          var tickLabelPosition = this.tickLabelPosition();
          tickTextLabels.each(function(t: any, i: number) {
            var textEl = d3.select(this);
            var currentText = textEl.text();
            var measure = Util.Text.getTextMeasure(textEl);
            var wrappedLines = Util.WordWrap.breakTextToFitRect(currentText, availableWidth, availableHeight, measure).lines;
            if (wrappedLines.length === 1) {
              textEl.text(Util.Text.getTruncatedText(currentText, availableWidth, measure));
            } else {
              var baseY = 0; // measured in ems
              if (tickLabelPosition === "top") {
                baseY = -(wrappedLines.length - 1);
              } else if (tickLabelPosition === "middle") {
                baseY = -(wrappedLines.length - 1) / 2;
              }

              textEl.text("");
              var tspans = textEl.selectAll("tspan").data(wrappedLines);
              tspans.enter().append("tspan");
              tspans.text((line: string) => line)
                    .attr( {
                      "dy": textEl.attr("dy"),
                      "x": textEl.attr("x"),
                      "y": (line: string, i: number) => (baseY + i) + "em" // shift each line down one relative to the previous line
                    })
                    .style("text-anchor", textEl.style("text-anchor"));
            }
          });
        } else {
          this._hideOverlappingTickLabels();
        }
      }

      if (!this.showEndTickLabels()) {
        this._hideCutOffTickLabels();
      }
      return this;
    }
  }
}
}
