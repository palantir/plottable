///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("ErrorBar Plot", () => {
    var svg: D3.Selection;
    var data = [
      { key: "Otter", value: 9, lower: 8, upper: 10 },
      { key: "Stoat", value: 3, lower: 2, upper: 5 },
      { key: "Mink",  value: 5, lower: 1, upper: 6 }
    ];
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    describe("Vertical ErrorBar Plot", () => {
      var xScale: Plottable.Scale.Category;
      var yScale: Plottable.Scale.Linear;
      var barPlot: Plottable.Plot.Bar<string, number>;
      var errorBarPlot: Plottable.Plot.ErrorBar<string, number>;
      beforeEach(() => {
        var dataset = new Plottable.Dataset(data);
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scale.Category();
        yScale = new Plottable.Scale.Linear();
        barPlot = new Plottable.Plot.Bar(xScale, yScale);
        barPlot.addDataset(dataset);
        barPlot.project("x", "key", xScale);
        barPlot.project("y", "value", yScale);

        errorBarPlot = new Plottable.Plot.ErrorBar(xScale, yScale);
        errorBarPlot.addDataset(dataset);
        errorBarPlot.project("x", "key", xScale);
        errorBarPlot.project("y", "value", yScale);
        errorBarPlot.project("lower", "lower", yScale);
        errorBarPlot.project("upper", "upper", yScale);

        var plot = barPlot.merge(errorBarPlot);
        plot.renderTo(svg);
      });

      it("renders error bars in the vertical direction", () => {
        var errorBarRenderArea = (<any> errorBarPlot)._renderArea;
        var errorBars = errorBarRenderArea.selectAll("g.error-bar");
        assert.lengthOf(errorBars[0], data.length, "One errorBar was created per data point");
        errorBars.each(function() {
          var errorBar = d3.select(this);
          var errorBarUpper = errorBar.select("line.error-bar-upper");
          var errorBarMiddle = errorBar.select("line.error-bar-middle");
          var errorBarLower = errorBar.select("line.error-bar-lower");
          assert.equal(errorBarUpper.attr("y1"), errorBarUpper.attr("y2"), "error-bar-upper is vertical");
          assert.equal(errorBarMiddle.attr("x1"), errorBarMiddle.attr("x2"), "error-bar-middle is horizontal");
          assert.equal(errorBarLower.attr("y1"), errorBarLower.attr("y2"), "error-bar-lower is vertical");
          assert.equal(+errorBarUpper.attr("x1") + (+errorBarUpper.attr("x2") - +errorBarUpper.attr("x1")) / 2, errorBarMiddle.attr("x1"),
              "error-bar-middle is properly positioned relative to error-bar-upper");
          assert.equal(+errorBarLower.attr("x1") + (+errorBarLower.attr("x2") - +errorBarLower.attr("x1")) / 2, errorBarMiddle.attr("x1"),
              "error-bar-middle is properly positioned relative to error-bar-lower");
        });
        svg.remove();
      });
    });

    describe("Horizontal ErrorBar Plot", () => {
      var xScale: Plottable.Scale.Linear;
      var yScale: Plottable.Scale.Category;
      var barPlot: Plottable.Plot.Bar<number, string>;
      var errorBarPlot: Plottable.Plot.ErrorBar<number, string>;
      beforeEach(() => {
        var dataset = new Plottable.Dataset(data);
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scale.Linear();
        yScale = new Plottable.Scale.Category();

        barPlot = new Plottable.Plot.Bar(xScale, yScale, false);
        barPlot.addDataset(dataset);
        barPlot.project("x", "value", xScale);
        barPlot.project("y", "key", yScale);

        errorBarPlot = new Plottable.Plot.ErrorBar(xScale, yScale, false);
        errorBarPlot.addDataset(dataset);
        errorBarPlot.project("x", "value", xScale);
        errorBarPlot.project("y", "key", yScale);
        errorBarPlot.project("lower", "lower", xScale);
        errorBarPlot.project("upper", "upper", xScale);

        var plot = barPlot.merge(errorBarPlot);
        plot.renderTo(svg);
      });
      it("renders error bars in the horizontal direction", () => {
        var errorBarRenderArea = (<any> errorBarPlot)._renderArea;
        var errorBars = errorBarRenderArea.selectAll("g.error-bar");
        assert.lengthOf(errorBars[0], data.length, "One errorBar was created per data point");
        errorBars.each(function() {
          var errorBar = d3.select(this);
          var errorBarUpper = errorBar.select("line.error-bar-upper");
          var errorBarMiddle = errorBar.select("line.error-bar-middle");
          var errorBarLower = errorBar.select("line.error-bar-lower");
          assert.equal(errorBarUpper.attr("x1"), errorBarUpper.attr("x2"), "error-bar-upper is vertical");
          assert.equal(errorBarMiddle.attr("y1"), errorBarMiddle.attr("y2"), "error-bar-middle is horizontal");
          assert.equal(errorBarLower.attr("x1"), errorBarLower.attr("x2"), "error-bar-lower is vertical");
          assert.equal(+errorBarUpper.attr("y1") + (+errorBarUpper.attr("y2") - +errorBarUpper.attr("y1")) / 2, errorBarMiddle.attr("y1"),
              "error-bar-middle is properly positioned relative to error-bar-upper");
          assert.equal(+errorBarLower.attr("y1") + (+errorBarLower.attr("y2") - +errorBarLower.attr("y1")) / 2, errorBarMiddle.attr("y1"),
              "error-bar-middle is properly positioned relative to error-bar-lower");
        });
        svg.remove();
      });
    });
  });
});
