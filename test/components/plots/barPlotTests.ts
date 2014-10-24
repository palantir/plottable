///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("Bar Plot", () => {
    describe("Vertical Bar Plot in points mode", () => {
      var svg: D3.Selection;
      var dataset: Plottable.Dataset;
      var xScale: Plottable.Scale.Ordinal;
      var yScale: Plottable.Scale.Linear;
      var barPlot: Plottable.Plot.VerticalBar<string>;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;

      beforeEach(() => {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scale.Ordinal().domain(["A", "B"]).rangeType("points");
        yScale = new Plottable.Scale.Linear();
        var data = [
          {x: "A", y: 1},
          {x: "B", y: -1.5},
          {x: "B", y: 1} // duplicate X-value
        ];
        dataset = new Plottable.Dataset(data);
        barPlot = new Plottable.Plot.VerticalBar(xScale, yScale);
        barPlot.addDataset(dataset);
        barPlot.animate(false);
        barPlot.baseline(0);
        yScale.domain([-2, 2]);
        barPlot.renderTo(svg);
      });

      it("renders correctly", () => {
        var renderArea = barPlot._renderArea;
        var bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(numAttr(bar0, "width"), 150, "bar0 width is correct");
        assert.equal(numAttr(bar1, "width"), 150, "bar1 width is correct");
        assert.equal(bar0.attr("height"), "100", "bar0 height is correct");
        assert.equal(bar1.attr("height"), "150", "bar1 height is correct");
        assert.equal(bar0.attr("x"), "75", "bar0 x is correct");
        assert.equal(bar1.attr("x"), "375", "bar1 x is correct");
        assert.equal(bar0.attr("y"), "100", "bar0 y is correct");
        assert.equal(bar1.attr("y"), "200", "bar1 y is correct");

        var baseline = renderArea.select(".baseline");
        assert.equal(baseline.attr("y1"), "200", "the baseline is in the correct vertical position");
        assert.equal(baseline.attr("y2"), "200", "the baseline is in the correct vertical position");
        assert.equal(baseline.attr("x1"), "0", "the baseline starts at the edge of the chart");
        assert.equal(baseline.attr("x2"), SVG_WIDTH, "the baseline ends at the edge of the chart");
        svg.remove();
      });

      it("baseline value can be changed; barPlot updates appropriately", () => {
        barPlot.baseline(-1);

        var renderArea = barPlot._renderArea;
        var bars = renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(bar0.attr("height"), "200", "bar0 height is correct");
        assert.equal(bar1.attr("height"), "50", "bar1 height is correct");
        assert.equal(bar0.attr("y"), "100", "bar0 y is correct");
        assert.equal(bar1.attr("y"), "300", "bar1 y is correct");

        var baseline = renderArea.select(".baseline");
        assert.equal(baseline.attr("y1"), "300", "the baseline is in the correct vertical position");
        assert.equal(baseline.attr("y2"), "300", "the baseline is in the correct vertical position");
        assert.equal(baseline.attr("x1"), "0", "the baseline starts at the edge of the chart");
        assert.equal(baseline.attr("x2"), SVG_WIDTH, "the baseline ends at the edge of the chart");
        svg.remove();
      });

      it("bar alignment can be changed; barPlot updates appropriately", () => {
        barPlot.barAlignment("center");
        var renderArea = barPlot._renderArea;
        var bars = renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(numAttr(bar0, "width"), 150, "bar0 width is correct");
        assert.equal(numAttr(bar1, "width"), 150, "bar1 width is correct");
        assert.equal(numAttr(bar0, "x"), 75, "bar0 x is correct");
        assert.equal(numAttr(bar1, "x"), 375, "bar1 x is correct");

        barPlot.barAlignment("right");
        renderArea = barPlot._renderArea;
        bars = renderArea.selectAll("rect");
        bar0 = d3.select(bars[0][0]);
        bar1 = d3.select(bars[0][1]);
        assert.equal(numAttr(bar0, "width"), 150, "bar0 width is correct");
        assert.equal(numAttr(bar1, "width"), 150, "bar1 width is correct");
        assert.equal(numAttr(bar0, "x"), 0, "bar0 x is correct");
        assert.equal(numAttr(bar1, "x"), 300, "bar1 x is correct");

        assert.throws(() => barPlot.barAlignment("blargh"), Error);
        assert.equal(barPlot._barAlignmentFactor, 1, "the bad barAlignment didnt break internal state");
        svg.remove();
      });

      it("can select and deselect bars", () => {
        var selectedBar: D3.Selection = barPlot.selectBar(155, 150); // in the middle of bar 0

        assert.isNotNull(selectedBar, "clicked on a bar");
        assert.equal(selectedBar.data()[0], dataset.data()[0], "the data in the bar matches the datasource");
        assert.isTrue(selectedBar.classed("selected"), "the bar was classed \"selected\"");

        barPlot.deselectAll();
        assert.isFalse(selectedBar.classed("selected"), "the bar is no longer selected");

        selectedBar = barPlot.selectBar(-1, -1); // no bars here
        assert.isNull(selectedBar, "returns null if no bar was selected");

        selectedBar = barPlot.selectBar(200, 50); // between the two bars
        assert.isNull(selectedBar, "returns null if no bar was selected");

        selectedBar = barPlot.selectBar(155, 10); // above bar 0
        assert.isNull(selectedBar, "returns null if no bar was selected");

        // the bars are now (140,100),(150,300) and (440,300),(450,350) - the
        // origin is at the top left!

        selectedBar = barPlot.selectBar({min: 155, max: 455}, {min: 150, max: 150}, true);
        assert.isNotNull(selectedBar, "line between middle of two bars");
        assert.lengthOf(selectedBar.data(), 2, "selected 2 bars (not the negative one)");
        assert.equal(selectedBar.data()[0], dataset.data()[0], "the data in bar 0 matches the datasource");
        assert.equal(selectedBar.data()[1], dataset.data()[2], "the data in bar 1 matches the datasource");
        assert.isTrue(selectedBar.classed("selected"), "the bar was classed \"selected\"");

        selectedBar = barPlot.selectBar({min: 155, max: 455}, {min: 150, max: 350}, true);
        assert.isNotNull(selectedBar, "square between middle of two bars, & over the whole area");
        assert.lengthOf(selectedBar.data(), 3, "selected all the bars");
        assert.equal(selectedBar.data()[0], dataset.data()[0], "the data in bar 0 matches the datasource");
        assert.equal(selectedBar.data()[1], dataset.data()[1], "the data in bar 1 matches the datasource");
        assert.equal(selectedBar.data()[2], dataset.data()[2], "the data in bar 2 matches the datasource");
        assert.isTrue(selectedBar.classed("selected"), "the bar was classed \"selected\"");

        // the runtime parameter validation should be strict, so no strings or
        // mangled objects
        assert.throws(() => barPlot.selectBar(<any> "blargh", <any> 150), Error);
        assert.throws(() => barPlot.selectBar(<any> {min: 150}, <any> 150), Error);

        svg.remove();
      });

      it("shouldn't blow up if members called before the first render", () => {
        var brandNew = new Plottable.Plot.VerticalBar(xScale, yScale);
        brandNew.addDataset(dataset);

        assert.isNotNull(brandNew.deselectAll(), "deselects return self");
        assert.isNull(brandNew.selectBar(0, 0), "selects return empty");

        brandNew._anchor(d3.select(document.createElement("svg"))); // calls `_setup()`

        assert.isNotNull(brandNew.deselectAll(), "deselects return self after setup");
        assert.isNull(brandNew.selectBar(0, 0), "selects return empty after setup");

        svg.remove();
      });
    });

    describe("Vertical Bar Plot modified log scale", () => {
      var svg: D3.Selection;
      var dataset: Plottable.Dataset;
      var xScale: Plottable.Scale.ModifiedLog;
      var yScale: Plottable.Scale.Linear;
      var barPlot: Plottable.Plot.VerticalBar<number>;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;

      beforeEach(() => {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scale.ModifiedLog();
        yScale = new Plottable.Scale.Linear();
        var data = [
          {x: 2, y: 1},
          {x: 10, y: -1.5},
          {x: 100, y: 1}
        ];
        dataset = new Plottable.Dataset(data);
        barPlot = new Plottable.Plot.VerticalBar(xScale, yScale);
        barPlot.addDataset(dataset);
        barPlot.animate(false);
        barPlot.baseline(0);
        yScale.domain([-2, 2]);
        barPlot.renderTo(svg);
      });

      it("barPixelWidth calculated appropriately", () => {
        assert.strictEqual(barPlot._getBarPixelWidth(), (xScale.scale(10) - xScale.scale(2)) * 0.95);
        svg.remove();
      });

      it("bar widths are equal to barPixelWidth", () => {
        var renderArea = barPlot._renderArea;
        var bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");

        var barPixelWidth = barPlot._getBarPixelWidth();
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        var bar2 = d3.select(bars[0][2]);
        assert.closeTo(numAttr(bar0, "width"), barPixelWidth, 0.1, "bar0 width is correct");
        assert.closeTo(numAttr(bar1, "width"), barPixelWidth, 0.1, "bar1 width is correct");
        assert.closeTo(numAttr(bar2, "width"), barPixelWidth, 0.1, "bar2 width is correct");
        svg.remove();
      });

      it("bar-min, bar-max extents deregistered when old scale replaced", () => {
        var newScale = new Plottable.Scale.ModifiedLog();
        barPlot.project("x", "x", newScale);
        var oldDomain = xScale.domain();
        assert.closeTo(oldDomain[0], 0, 0.1, "bar-min extent removed");
        assert.closeTo(oldDomain[1], 1, 0.1, "bar-max extent removed");
        svg.remove();
      });

      it("extent updated to account for bar width", () => {
        var domain = xScale.domain();
        assert.closeTo(domain[0], 0.34, 0.1, "min extent accounted");
        assert.closeTo(domain[1], 206.32, 0.1, "max extent accounted");
        svg.remove();
      });
    });

    describe("Vertical Bar Plot linear scale", () => {
      var svg: D3.Selection;
      var dataset: Plottable.Dataset;
      var xScale: Plottable.Scale.Linear;
      var yScale: Plottable.Scale.Linear;
      var barPlot: Plottable.Plot.VerticalBar<number>;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;

      beforeEach(() => {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scale.Linear();
        yScale = new Plottable.Scale.Linear();
        var data = [
          {x: 2, y: 1},
          {x: 10, y: -1.5},
          {x: 100, y: 1}
        ];
        dataset = new Plottable.Dataset(data);
        barPlot = new Plottable.Plot.VerticalBar(xScale, yScale);
        barPlot.addDataset(dataset);
        barPlot.baseline(0);
        barPlot.renderTo(svg);
      });

      it("bar width takes an appropriate value", () => {
        assert.strictEqual(barPlot._getBarPixelWidth(), (xScale.scale(10) - xScale.scale(2)) * 0.95);
        svg.remove();
      });

      it("bar widths are equal to barPixelWidth", () => {
        var renderArea = barPlot._renderArea;
        var bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");

        var barPixelWidth = barPlot._getBarPixelWidth();
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        var bar2 = d3.select(bars[0][2]);
        assert.closeTo(numAttr(bar0, "width"), barPixelWidth, 0.1, "bar0 width is correct");
        assert.closeTo(numAttr(bar1, "width"), barPixelWidth, 0.1, "bar1 width is correct");
        assert.closeTo(numAttr(bar2, "width"), barPixelWidth, 0.1, "bar2 width is correct");
        svg.remove();
      });

      it("extent updated to account for bar width", () => {
        var domain = xScale.domain();
        assert.closeTo(domain[0], -10, 0.1, "min extent accounted");
        assert.closeTo(domain[1], 110, 0.1, "max extent accounted");
        svg.remove();
      });

      it("sensible bar width one datum", () => {
        barPlot.removeDataset(dataset);
        barPlot.addDataset([{x: 10, y: 2}]);
        assert.closeTo(barPlot._getBarPixelWidth(), 228, 0.1, "sensible bar width for only one datum");
        svg.remove();
      });
    });

    describe("Horizontal Bar Plot in Points Mode", () => {
      var svg: D3.Selection;
      var dataset: Plottable.Dataset;
      var yScale: Plottable.Scale.Ordinal;
      var xScale: Plottable.Scale.Linear;
      var barPlot: Plottable.Plot.HorizontalBar<string>;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;
      beforeEach(() => {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        yScale = new Plottable.Scale.Ordinal().domain(["A", "B"]).rangeType("points");
        xScale = new Plottable.Scale.Linear();
        xScale.domain([-3, 3]);

        var data = [
          {y: "A", x: 1},
          {y: "B", x: -1.5},
          {y: "B", x: 1} // duplicate Y-value
        ];
        dataset = new Plottable.Dataset(data);

        barPlot = new Plottable.Plot.HorizontalBar(xScale, yScale);
        barPlot.addDataset(dataset);
        barPlot.animate(false);
        barPlot.baseline(0);
        barPlot.renderTo(svg);
      });

      it("renders correctly", () => {
        var renderArea = barPlot._renderArea;
        var bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(numAttr(bar0, "height"), 100, "bar0 height is correct");
        assert.equal(numAttr(bar1, "height"), 100, "bar1 height is correct");
        assert.equal(bar0.attr("width"), "100", "bar0 width is correct");
        assert.equal(bar1.attr("width"), "150", "bar1 width is correct");
        assert.equal(bar0.attr("y"), "250", "bar0 y is correct");
        assert.equal(bar1.attr("y"), "50", "bar1 y is correct");
        assert.equal(bar0.attr("x"), "300", "bar0 x is correct");
        assert.equal(bar1.attr("x"), "150", "bar1 x is correct");

        var baseline = renderArea.select(".baseline");
        assert.equal(baseline.attr("x1"), "300", "the baseline is in the correct horizontal position");
        assert.equal(baseline.attr("x2"), "300", "the baseline is in the correct horizontal position");
        assert.equal(baseline.attr("y1"), "0", "the baseline starts at the top of the chart");
        assert.equal(baseline.attr("y2"), SVG_HEIGHT, "the baseline ends at the bottom of the chart");
        svg.remove();
      });

      it("baseline value can be changed; barPlot updates appropriately", () => {
        barPlot.baseline(-1);

        var renderArea = barPlot._renderArea;
        var bars = renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(bar0.attr("width"), "200", "bar0 width is correct");
        assert.equal(bar1.attr("width"), "50", "bar1 width is correct");
        assert.equal(bar0.attr("x"), "200", "bar0 x is correct");
        assert.equal(bar1.attr("x"), "150", "bar1 x is correct");

        var baseline = renderArea.select(".baseline");
        assert.equal(baseline.attr("x1"), "200", "the baseline is in the correct horizontal position");
        assert.equal(baseline.attr("x2"), "200", "the baseline is in the correct horizontal position");
        assert.equal(baseline.attr("y1"), "0", "the baseline starts at the top of the chart");
        assert.equal(baseline.attr("y2"), SVG_HEIGHT, "the baseline ends at the bottom of the chart");
        svg.remove();
      });

      it("bar alignment can be changed; barPlot updates appropriately", () => {
        barPlot.barAlignment("center");
        var renderArea = barPlot._renderArea;
        var bars = renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(numAttr(bar0, "height"), 100, "bar0 height is correct");
        assert.equal(numAttr(bar1, "height"), 100, "bar1 height is correct");
        assert.equal(numAttr(bar0, "y"), 250, "bar0 y is correct");
        assert.equal(numAttr(bar1, "y"), 50, "bar1 y is correct");

        barPlot.barAlignment("bottom");
        renderArea = barPlot._renderArea;
        bars = renderArea.selectAll("rect");
        bar0 = d3.select(bars[0][0]);
        bar1 = d3.select(bars[0][1]);
        assert.equal(numAttr(bar0, "height"), 100, "bar0 height is correct");
        assert.equal(numAttr(bar1, "height"), 100, "bar1 height is correct");
        assert.equal(numAttr(bar0, "y"), 200, "bar0 y is correct");
        assert.equal(numAttr(bar1, "y"), 0, "bar1 y is correct");

        assert.throws(() => barPlot.barAlignment("blargh"), Error);

        svg.remove();
      });
    });

    describe("Horizontal Bar Plot in Bands mode", () => {
      var svg: D3.Selection;
      var dataset: Plottable.Dataset;
      var yScale: Plottable.Scale.Ordinal;
      var xScale: Plottable.Scale.Linear;
      var barPlot: Plottable.Plot.HorizontalBar<string>;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;
      var axisWidth = 0;
      var bandWidth = 0;

      beforeEach(() => {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        yScale = new Plottable.Scale.Ordinal().domain(["A", "B"]);
        xScale = new Plottable.Scale.Linear();

        var data = [
          {y: "A", x: 1},
          {y: "B", x: 2},
        ];
        dataset = new Plottable.Dataset(data);

        barPlot = new Plottable.Plot.HorizontalBar(xScale, yScale);
        barPlot.addDataset(dataset);
        barPlot.baseline(0);
        barPlot.animate(false);
        var yAxis = new Plottable.Axis.Category(yScale, "left");
        var table = new Plottable.Component.Table([[yAxis, barPlot]]).renderTo(svg);
        axisWidth = yAxis.width();
        bandWidth = yScale.rangeBand();
        xScale.domainer(xScale.domainer().pad(0));
      });

      it("renders correctly", () => {
        var bars = barPlot._renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        var bar0y = bar0.data()[0].y;
        var bar1y = bar1.data()[0].y;
        assert.closeTo(numAttr(bar0, "height"), 104, 2);
        assert.closeTo(numAttr(bar1, "height"), 104, 2);
        assert.closeTo(numAttr(bar0, "width"), (600 - axisWidth) / 2, 0.01, "width is correct for bar0");
        assert.closeTo(numAttr(bar1, "width"), 600 - axisWidth, 0.01, "width is correct for bar1");
        // check that bar is aligned on the center of the scale
        assert.closeTo(numAttr(bar0, "y") + numAttr(bar0, "height") / 2, yScale.scale(bar0y) + bandWidth / 2, 0.01
                    , "y pos correct for bar0");
        assert.closeTo(numAttr(bar1, "y") + numAttr(bar1, "height") / 2, yScale.scale(bar1y) + bandWidth / 2, 0.01
                    , "y pos correct for bar1");
        svg.remove();
      });

      it("width projector may be overwritten, and calling project queues rerender", () => {
        var bars = barPlot._renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        var bar0y = bar0.data()[0].y;
        var bar1y = bar1.data()[0].y;
        barPlot.project("width", 10);
        assert.closeTo(numAttr(bar0, "height"), 10, 0.01, "bar0 height");
        assert.closeTo(numAttr(bar1, "height"), 10, 0.01, "bar1 height");
        assert.closeTo(numAttr(bar0, "width"), (600 - axisWidth) / 2, 0.01, "bar0 width");
        assert.closeTo(numAttr(bar1, "width"), 600 - axisWidth, 0.01, "bar1 width");
        assert.closeTo(numAttr(bar0, "y") + numAttr(bar0, "height") / 2, yScale.scale(bar0y) + bandWidth / 2, 0.01, "bar0 ypos");
        assert.closeTo(numAttr(bar1, "y") + numAttr(bar1, "height") / 2, yScale.scale(bar1y) + bandWidth / 2, 0.01, "bar1 ypos");
        svg.remove();
      });
    });
  });
});
