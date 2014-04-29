///<reference path="../reference.ts" />

module Plottable {
  export class Legend extends Component {
    private static SUBELEMENT_CLASS = "legend-row";
    private static MARGIN = 5;

    private colorScale: ColorScale;
    private maxWidth: number;
    private legendBox: D3.Selection;

    /**
     * Creates a Legend.
     *
     * @constructor
     * @param {ColorScale} colorScale
     */
    constructor(colorScale?: ColorScale) {
      super();
      this.classed("legend", true);
      this.minimumWidth(120); // the default width
      this.colorScale = colorScale;
      this.xAlign("RIGHT").yAlign("TOP");
      this.xOffset(5).yOffset(5);
    }

    public _anchor(element: D3.Selection): Legend {
      super._anchor(element);
      this.legendBox = this.content.append("rect").classed("legend-box", true);
      return this;
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

    public minimumHeight(): number;
    public minimumHeight(newVal: number): Legend;
    public minimumHeight(newVal?: number): any {
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

    public _doRender(): Legend {
      super._doRender();
      this.legendBox.attr("height", this.minimumHeight()).attr("width", this.minimumWidth()); //HACKHACK #223
      var domain = this.colorScale.domain();
      var textHeight = this.measureTextHeight();
      var availableWidth = this.minimumWidth() - textHeight - Legend.MARGIN;
      var r = textHeight - Legend.MARGIN * 2 - 2;

      this.content.selectAll("." + Legend.SUBELEMENT_CLASS).remove(); // hackhack to ensure it always rerenders properly
      var legend: D3.UpdateSelection = this.content.selectAll("." + Legend.SUBELEMENT_CLASS).data(domain);
      var legendEnter = legend.enter()
          .append("g").classed(Legend.SUBELEMENT_CLASS, true)
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
            .text(function(d: any, i: number) {return Utils.truncateTextToLength(d, availableWidth, d3.select(this));});
      return this;
    }
  }
}
