///<reference path="../reference.ts" />

module Plottable {
export module Axes {
  export class RadialAxis extends Axis<number> {

    /**
     * Constructs a Radial Axis.
     *
     * A Radial Axis is a visual representation of a QuantitativeScale in polar system.
     *
     * @constructor
     * @param {QuantitativeScale} scale
     * @param {string} orientation One of "left"/"right"
     */
    constructor(scale: QuantitativeScale<number>, orientation: string) {
      super(scale, orientation);
      this.formatter(Formatters.general());
      this.tickLabelPadding(5);
      this.removeClass("x-axis");
      this.removeClass("y-axis");
      this.addClass("r-axis");
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      let range = this._scale.range();
      super.computeLayout(origin, availableWidth, availableHeight);
      this._scale.range(range);
      this.content().attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");
      return this;
    }

    public fixedHeight() {
      return false;
    }

    public fixedWidth() {
      return false;
    }

    public renderImmediately() {
      super.renderImmediately();
      let tickMarkValues = this._getTickValues();

      let tickLabelTextAnchor = this.orientation() === "left" ? "start" : "end";
      let tickLabels = this._tickLabelContainer
                           .selectAll("." + Axis.TICK_LABEL_CLASS)
                           .data(tickMarkValues);
      tickLabels.enter().append("text").classed(Axis.TICK_LABEL_CLASS, true);
      tickLabels.exit().remove();

      tickLabels.style("text-anchor", tickLabelTextAnchor)
                .style("visibility", "inherit")
                .attr(this._generateTickLabelAttrHash())
                .text((s: any) => this.formatter()(s));

      if (!this.showEndTickLabels()) {
        this._hideEndTickLabels();
      }
      this._hideOverlappingTickLabels();
      this._hideOverflowingTickLabels();
      return this;
    }

    public orientation(orientation?: string): any {
    if (orientation == null) {
      return this._orientation;
    } else {
      let newOrientationLC = orientation.toLowerCase();
      if (newOrientationLC !== "left" &&
          newOrientationLC !== "right") {
        throw new Error("unsupported orientation");
      }
      this._orientation = newOrientationLC;
      this.redraw();
      return this;
    }
  }

    protected _generateTickLabelAttrHash() {
      let padding = this.tickLabelPadding() + this._maxLabelTickLength();
      let tickLabelAttrHash: { [key: string]: number | string | ((d: any) => number) } = {
        x: 0,
        y: this._scaledPosition(),
        dx:  (this.orientation() === "left" ? 1 : -1) * padding,
        dy: "0.3em"
      };

      return tickLabelAttrHash;
    }

    protected _generateBaselineAttrHash() {
      let radiusLimit = Math.min(this.height(), this.width()) / 2;
      let baselineAttrHash: { [key: string]: number } = {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: -1 * radiusLimit
      };
      return baselineAttrHash;
    }

    protected _generateTickMarkAttrHash(isEndTickMark = false) {
      let tickMarkAttrHash: { [key: string]: number | ((d: any) => number) } = {
        x1: 0,
        y1: this._scaledPosition(),
        x2: (this.orientation() === "left" ? 1 : -1) * this._maxLabelTickLength(),
        y2: this._scaledPosition()
      };

      return tickMarkAttrHash;
    }

    protected _getTickValues() {
      let scale = (<QuantitativeScale<number>> this._scale);
      let domain = scale.domain();
      let min = domain[0] <= domain[1] ? domain[0] : domain[1];
      let max = domain[0] >= domain[1] ? domain[0] : domain[1];
      if (min === domain[0]) {
        return scale.ticks().filter((i: number) => i >= min && i <= max);
      } else {
        return scale.ticks().filter((i: number) => i >= min && i <= max).reverse();
      }
    }

    protected _scaledPosition() {
      return (d: any) => -1 * this._scale.scale(d);
    }

    private _hideEndTickLabels() {
      let tickLabels = this._tickLabelContainer.selectAll("." + Axis.TICK_LABEL_CLASS);
      if (tickLabels[0].length === 0) {
        return;
      }
      let firstTickLabel = <Element> tickLabels[0][0];
      let lastTickLabel = <Element> tickLabels[0][tickLabels[0].length - 1];
      d3.select(firstTickLabel).style("visibility", "hidden");
      d3.select(lastTickLabel).style("visibility", "hidden");
    }

    private _hideOverlappingTickLabels() {
      let visibleTickLabels = this._tickLabelContainer
                                    .selectAll("." + Axis.TICK_LABEL_CLASS)
                                    .filter(function(d: any, i: number) {
                                      let visibility = d3.select(this).style("visibility");
                                      return (visibility === "inherit") || (visibility === "visible");
                                    });

      let visibleTickLabelRects = visibleTickLabels[0].map((label: HTMLScriptElement) => label.getBoundingClientRect());
      let interval = 1;

      while (this._hasOverlapWithInterval(interval, visibleTickLabelRects) && interval < visibleTickLabelRects.length) {
        interval += 1;
      }

      visibleTickLabels.each(function (d: string, i: number) {
        let tickLabel = d3.select(this);
        if (i % interval !== 0) {
          tickLabel.style("visibility", "hidden");
        }
      });
    }

    /**
     * The method is responsible for evenly spacing the labels on the axis.
     * @return test to see if taking every `interval` recrangle from `rects`
     *         will result in labels not overlapping
     *
     */
    private _hasOverlapWithInterval(interval: number, rects: ClientRect[]): boolean {

      let padding = this.tickLabelPadding();

      for (let i = 0; i < rects.length - (interval); i += interval) {
        let currRect = rects[i];
        let nextRect = rects[i + interval];
        if (currRect.top - padding <= nextRect.bottom) {
          return true;
        }
      }
      return false;
    }

    private _hideOverflowingTickLabels() {
      let boundingBox = (<Element> this._boundingBox.node()).getBoundingClientRect();
      let tickLabels = this._tickLabelContainer.selectAll("." + Axis.TICK_LABEL_CLASS);
      if (tickLabels.empty()) {
        return;
      }
      tickLabels.each(function(d: any, i: number) {
        if (!Utils.DOM.clientRectInside(this.getBoundingClientRect(), boundingBox)) {
          d3.select(this).style("visibility", "hidden");
        }
      });
    }
  }
}
}
