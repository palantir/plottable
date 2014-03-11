///<reference path="reference.ts" />

module Plottable {
  export class Legend extends Component {
    private static CSS_CLASS = "legend";
    private static SUBELEMENT_CLASS = "legend-row";
    private static MARGIN = 5;

    private colorScale: ColorScale;
    private maxWidth: number;

    /**
     * Creates a Legend.
     *
     * @constructor
     * @param {ColorScale} colorScale
     */
    constructor(colorScale?: ColorScale) {
      super();
      this.classed(Legend.CSS_CLASS, true);
      this.colMinimum(120); // the default width
      this.colorScale = colorScale;
      this.xAlign("RIGHT").yAlign("TOP");
      this.xOffset(5).yOffset(5);
    }

    /**
     * Assigns a new ColorScale to the Legend.
     *
     * @param {ColorScale} scale
     * @returns {Legend} The calling Legend.
     */
    public scale(scale: ColorScale): Legend {
      this.colorScale = scale;
      return this;
    }

    public rowMinimum(): number;
    public rowMinimum(newVal: number): Legend;
    public rowMinimum(newVal?: number): any {
      if (newVal != null) {
        throw new Error("Row minimum cannot be directly set on Legend");
      } else {
        var textHeight = this.measureTextHeight();
        return this.colorScale.domain().length * textHeight;
      }
    }

    private measureTextHeight(): number {
      // note: can't be called before anchoring atm
      var fakeLegendEl = this.content.append("g").classed(Legend.SUBELEMENT_CLASS, true);
      var textHeight = Utils.getTextHeight(fakeLegendEl.append("text"));
      fakeLegendEl.remove();
      return textHeight;
    }

    public render(): Legend {
      super.render();
      var domain = this.colorScale.domain();
      var textHeight = this.measureTextHeight();
      var availableWidth = this.colMinimum() - textHeight - Legend.MARGIN;

      this.content.selectAll("." + Legend.SUBELEMENT_CLASS).remove(); // hackhack to ensure it always rerenders properly
      var legend: D3.UpdateSelection = this.content.selectAll("." + Legend.SUBELEMENT_CLASS).data(domain);
      var legendEnter = legend.enter()
          .append("g").classed(Legend.SUBELEMENT_CLASS, true)
          .attr("transform", (d: any, i: number) => "translate(0," + i * textHeight + ")");
      legendEnter.append("rect")
          .attr("x", Legend.MARGIN)
          .attr("y", Legend.MARGIN)
          .attr("width",  textHeight - Legend.MARGIN * 2)
          .attr("height", textHeight - Legend.MARGIN * 2);
      legendEnter.append("text")
          .attr("x", textHeight)
          .attr("y", Legend.MARGIN + textHeight / 2);
      legend.selectAll("rect").attr("fill", this.colorScale._internalScale);
      legend.selectAll("text")
            .text(function(d: any, i: number) {return Utils.truncateTextToLength(d, availableWidth, d3.select(this));});
      return this;
    }
  }
}
