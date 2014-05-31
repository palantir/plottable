///<reference path="../reference.ts" />

module Plottable {
  export class Legend extends Component {
    public static _SUBELEMENT_CLASS = "legend-row";
    private static MARGIN = 5;

    private colorScale: ColorScale;
    private maxWidth: number;
    private legendBox: D3.Selection;
    private nRowsDrawn: number;

    /**
     * Creates a Legend.
     *
     * @constructor
     * @param {ColorScale} colorScale
     */
    constructor(colorScale?: ColorScale) {
      super();
      this.classed("legend", true);
      this.scale(colorScale);
      this.xAlign("RIGHT").yAlign("TOP");
      this.xOffset(5).yOffset(5);
    }

    public _setup() {
      super._setup();
      this.legendBox = this.content.append("rect").classed("legend-box", true);
      return this;
    }

    /**
     * Assigns a new ColorScale to the Legend.
     *
     * @param {ColorScale} scale
     * @returns {Legend} The calling Legend.
     */
    public scale(scale: ColorScale): Legend;
    public scale(): ColorScale;
    public scale(scale?: ColorScale): any {
      if (scale != null) {
        if (this.colorScale != null) {
          this._deregisterFromBroadcaster(this.colorScale);
        }
        this.colorScale = scale;
        this._registerToBroadcaster(this.colorScale, () => this._invalidateLayout());
        return this;
      } else {
        return this.colorScale;
      }
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
      var maxWidth = d3.max(this.colorScale.domain(), (d: string) => TextUtils.getTextWidth(fakeText, d));
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
      var textHeight = TextUtils.getTextHeight(fakeLegendEl.append("text"));
      fakeLegendEl.remove();
      return textHeight;
    }

    public _doRender(): Legend {
      super._doRender();
      var domain = this.colorScale.domain().slice(0, this.nRowsDrawn);
      var textHeight = this.measureTextHeight();
      var availableWidth  = this.availableWidth  - textHeight - Legend.MARGIN;
      var r = textHeight - Legend.MARGIN * 2 - 2;
      this.content.selectAll("." + Legend._SUBELEMENT_CLASS).remove(); // hackhack to ensure it always rerenders properly
      var legend: D3.UpdateSelection = this.content.selectAll("." + Legend._SUBELEMENT_CLASS).data(domain);
      var legendEnter = legend.enter()
          .append("g").classed(Legend._SUBELEMENT_CLASS, true)
          .attr("transform", (d: any, i: number) => "translate(0," + i * textHeight + ")");
      legendEnter.append("circle")
          .attr("cx", Legend.MARGIN + r/2)
          .attr("cy", Legend.MARGIN + r/2)
          .attr("r",  r);
      legendEnter.append("text")
          .attr("x", textHeight)
          .attr("y", Legend.MARGIN + textHeight / 2);
      legend.selectAll("circle").attr("fill", this.colorScale._d3Scale);
      legend.selectAll("text")
            .text(function(d: any, i: number) {return TextUtils.getTruncatedText(d, availableWidth , d3.select(this));});
      return this;
    }
  }
}
