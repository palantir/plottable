///<reference path="reference.ts" />

class Legend extends Component {
  private static CSS_CLASS = "legend";

  private colorScale: ColorScale;
  private maxWidth: number;

  private static RECT_MARGIN = 5;
  private static TEXT_X_DISPLACEMENT = 5;

  constructor(colorScale?: ColorScale) {
    super();
    this.colMinimum(120); // the default width
    this.colorScale = colorScale;
    this.xAlign("RIGHT").yAlign("TOP");
    // this.xOffset(5).yOffset(5);
  }

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
      var fakeLegendEl = this.element.append("g").classed(Legend.CSS_CLASS, true);
      var textHeight = Utils.getTextHeight(fakeLegendEl.append("text"));
      fakeLegendEl.remove();
      return this.colorScale.domain().length * textHeight;
    }
  }

  public render() {
    super.render();
    var domain = this.colorScale.domain();

    var fakeLegendEl = this.element.append("g").classed(Legend.CSS_CLASS, true);
    var textHeight = Utils.getTextHeight(fakeLegendEl.append("text"));
    fakeLegendEl.remove();

    var availableWidth = this.colMinimum() - textHeight - Legend.RECT_MARGIN;


    var legend: D3.EnterSelection = this.element.selectAll(Legend.CSS_CLASS).data(domain)
      .enter()
        .append("g").classed(Legend.CSS_CLASS, true)
        .attr("transform", (d, i) => "translate(0," + i * textHeight + ")");
    legend.append("rect")
        .attr("x", Legend.RECT_MARGIN)
        .attr("y", Legend.RECT_MARGIN)
        .attr("width",  textHeight - Legend.RECT_MARGIN * 2)
        .attr("height", textHeight - Legend.RECT_MARGIN * 2)
        .attr("fill", this.colorScale.scale);
    legend.append("text")
        .attr("x", textHeight)
        .attr("y", Legend.RECT_MARGIN + textHeight / 2)
        // .attr("dy", ".35em")
        .text(function(d, i) {return Utils.truncateTextToLength(d, availableWidth, d3.select(this));});
    return this;
  }
}
