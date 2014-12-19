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
        barPlot.project("x", "x", xScale);
        barPlot.project("y", "y", yScale);
        barPlot.renderTo(svg);
      });

      it("renders correctly", () => {
        var renderArea = (<any> barPlot)._renderArea;
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

        var renderArea = (<any> barPlot)._renderArea;
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
        var renderArea = (<any> barPlot)._renderArea;
        var bars = renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(numAttr(bar0, "width"), 150, "bar0 width is correct");
        assert.equal(numAttr(bar1, "width"), 150, "bar1 width is correct");
        assert.equal(numAttr(bar0, "x"), 75, "bar0 x is correct");
        assert.equal(numAttr(bar1, "x"), 375, "bar1 x is correct");

        barPlot.barAlignment("right");
        renderArea = (<any> barPlot)._renderArea;
        bars = renderArea.selectAll("rect");
        bar0 = d3.select(bars[0][0]);
        bar1 = d3.select(bars[0][1]);
        assert.equal(numAttr(bar0, "width"), 150, "bar0 width is correct");
        assert.equal(numAttr(bar1, "width"), 150, "bar1 width is correct");
        assert.equal(numAttr(bar0, "x"), 0, "bar0 x is correct");
        assert.equal(numAttr(bar1, "x"), 300, "bar1 x is correct");

        assert.throws(() => barPlot.barAlignment("blargh"), Error);
        assert.equal((<any> barPlot)._barAlignmentFactor, 1, "the bad barAlignment didnt break internal state");
        svg.remove();
      });

      it("getBar()", () => {
        var bar: D3.Selection = barPlot.getBars(155, 150); // in the middle of bar 0

        assert.lengthOf(bar[0], 1, "getBar returns a bar");
        assert.equal(bar.data()[0], dataset.data()[0], "the data in the bar matches the datasource");

        bar = barPlot.getBars(-1, -1); // no bars here
        assert.isTrue(bar.empty(), "returns empty selection if no bar was selected");

        bar = barPlot.getBars(200, 50); // between the two bars
        assert.isTrue(bar.empty(), "returns empty selection if no bar was selected");

        bar = barPlot.getBars(155, 10); // above bar 0
        assert.isTrue(bar.empty(), "returns empty selection if no bar was selected");

        // the bars are now (140,100),(150,300) and (440,300),(450,350) - the
        // origin is at the top left!

        bar = barPlot.getBars({min: 155, max: 455}, {min: 150, max: 150});
        assert.lengthOf(bar.data(), 2, "selected 2 bars (not the negative one)");
        assert.equal(bar.data()[0], dataset.data()[0], "the data in bar 0 matches the datasource");
        assert.equal(bar.data()[1], dataset.data()[2], "the data in bar 1 matches the datasource");

        bar = barPlot.getBars({min: 155, max: 455}, {min: 150, max: 350});
        assert.lengthOf(bar.data(), 3, "selected all the bars");
        assert.equal(bar.data()[0], dataset.data()[0], "the data in bar 0 matches the datasource");
        assert.equal(bar.data()[1], dataset.data()[1], "the data in bar 1 matches the datasource");
        assert.equal(bar.data()[2], dataset.data()[2], "the data in bar 2 matches the datasource");

        svg.remove();
      });

      it("don't show points from outside of domain", () => {
        xScale.domain(["C"]);
        var bars =  (<any> barPlot)._renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 0, "no bars have been rendered");
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
        barPlot.project("x", "x", xScale);
        barPlot.project("y", "y", yScale);
        barPlot.renderTo(svg);
      });

      it("barPixelWidth calculated appropriately", () => {
        assert.strictEqual((<any> barPlot)._getBarPixelWidth(), (xScale.scale(10) - xScale.scale(2)) * 0.95);
        svg.remove();
      });

      it("bar widths are equal to barPixelWidth", () => {
        var renderArea = (<any> barPlot)._renderArea;
        var bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");

        var barPixelWidth = (<any> barPlot)._getBarPixelWidth();
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        var bar2 = d3.select(bars[0][2]);
        assert.closeTo(numAttr(bar0, "width"), barPixelWidth, 0.1, "bar0 width is correct");
        assert.closeTo(numAttr(bar1, "width"), barPixelWidth, 0.1, "bar1 width is correct");
        assert.closeTo(numAttr(bar2, "width"), barPixelWidth, 0.1, "bar2 width is correct");
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
        barPlot.project("x", "x", xScale);
        barPlot.project("y", "y", yScale);
        barPlot.renderTo(svg);
      });

      it("bar width takes an appropriate value", () => {
        assert.strictEqual((<any> barPlot)._getBarPixelWidth(), (xScale.scale(10) - xScale.scale(2)) * 0.95);
        svg.remove();
      });

      it("bar widths are equal to barPixelWidth", () => {
        var renderArea = (<any> barPlot)._renderArea;
        var bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");

        var barPixelWidth = (<any> barPlot)._getBarPixelWidth();
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        var bar2 = d3.select(bars[0][2]);
        assert.closeTo(numAttr(bar0, "width"), barPixelWidth, 0.1, "bar0 width is correct");
        assert.closeTo(numAttr(bar1, "width"), barPixelWidth, 0.1, "bar1 width is correct");
        assert.closeTo(numAttr(bar2, "width"), barPixelWidth, 0.1, "bar2 width is correct");
        svg.remove();
      });

      it("sensible bar width one datum", () => {
        barPlot.removeDataset(dataset);
        barPlot.addDataset([{x: 10, y: 2}]);
        assert.closeTo((<any> barPlot)._getBarPixelWidth(), 228, 0.1, "sensible bar width for only one datum");
        svg.remove();
      });

      it("sensible bar width same datum", () => {
        barPlot.removeDataset(dataset);
        barPlot.addDataset([{x: 10, y: 2}, {x: 10, y: 2}]);
        assert.closeTo((<any> barPlot)._getBarPixelWidth(), 228, 0.1, "uses the width sensible for one datum");
        svg.remove();
      });

      it("sensible bar width unsorted data", () => {
        barPlot.removeDataset(dataset);
        barPlot.addDataset([{x: 2, y: 2}, {x: 20, y: 2}, {x: 5, y: 2}]);
        var expectedBarPixelWidth = (xScale.scale(5) - xScale.scale(2)) * 0.95;
        assert.closeTo((<any> barPlot)._getBarPixelWidth(), expectedBarPixelWidth, 0.1, "bar width uses closest sorted x values");
        svg.remove();
      });
    });

    describe("Vertical Bar Plot time scale", () => {
      var svg: D3.Selection;
      var barPlot: Plottable.Plot.VerticalBar<number>;
      var xScale: Plottable.Scale.Time;

      beforeEach(() => {
        svg = generateSVG(600, 400);
        var data = [{ x: "12/01/92", y: 0, type: "a" },
          { x: "12/01/93", y: 1, type: "a" },
          { x: "12/01/94", y: 1, type: "a" },
          { x: "12/01/95", y: 2, type: "a" },
          { x: "12/01/96", y: 2, type: "a" },
          { x: "12/01/97", y: 2, type: "a" }];
        xScale = new Plottable.Scale.Time();
        var yScale = new Plottable.Scale.Linear();
        barPlot = new Plottable.Plot.VerticalBar(xScale, yScale);
        barPlot.addDataset(data)
               .project("x", (d: any) => d3.time.format("%m/%d/%y").parse(d.x), xScale)
               .project("y", "y", yScale)
               .renderTo(svg);
      });

      it("bar width takes an appropriate value", () => {
        var timeFormatter = d3.time.format("%m/%d/%y");
        var expectedBarWidth = (xScale.scale(timeFormatter.parse("12/01/94")) - xScale.scale(timeFormatter.parse("12/01/93"))) * 0.95;
        assert.closeTo((<any> barPlot)._getBarPixelWidth(), expectedBarWidth, 0.1, "width is difference between two dates");
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
        barPlot.project("x", "x", xScale);
        barPlot.project("y", "y", yScale);
        barPlot.renderTo(svg);
      });

      it("renders correctly", () => {
        var renderArea = (<any> barPlot)._renderArea;
        var bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(numAttr(bar0, "height"), 100, "bar0 height is correct");
        assert.equal(numAttr(bar1, "height"), 100, "bar1 height is correct");
        assert.equal(bar0.attr("width"), "100", "bar0 width is correct");
        assert.equal(bar1.attr("width"), "150", "bar1 width is correct");
        assert.equal(bar0.attr("y"), "50", "bar0 y is correct");
        assert.equal(bar1.attr("y"), "250", "bar1 y is correct");
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

        var renderArea = (<any> barPlot)._renderArea;
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
        var renderArea = (<any> barPlot)._renderArea;
        var bars = renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(numAttr(bar0, "height"), 100, "bar0 height is correct");
        assert.equal(numAttr(bar1, "height"), 100, "bar1 height is correct");
        assert.equal(numAttr(bar0, "y"), 50, "bar0 y is correct");
        assert.equal(numAttr(bar1, "y"), 250, "bar1 y is correct");

        barPlot.barAlignment("bottom");
        renderArea = (<any> barPlot)._renderArea;
        bars = renderArea.selectAll("rect");
        bar0 = d3.select(bars[0][0]);
        bar1 = d3.select(bars[0][1]);
        assert.equal(numAttr(bar0, "height"), 100, "bar0 height is correct");
        assert.equal(numAttr(bar1, "height"), 100, "bar1 height is correct");
        assert.equal(numAttr(bar0, "y"), 0, "bar0 y is correct");
        assert.equal(numAttr(bar1, "y"), 200, "bar1 y is correct");

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
        barPlot.project("x", "x", xScale);
        barPlot.project("y", "y", yScale);
        new Plottable.Component.Table([[yAxis, barPlot]]).renderTo(svg);
        axisWidth = yAxis.width();
        bandWidth = yScale.rangeBand();
        xScale.domainer(xScale.domainer().pad(0));
      });

      it("renders correctly", () => {
        var bars = (<any> barPlot)._renderArea.selectAll("rect");
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
        var bars = (<any> barPlot)._renderArea.selectAll("rect");
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

    describe("Vertical Bar Plot With Bar Labels", () => {
      var plot: Plottable.Plot.VerticalBar<string>;
      var data: any[];
      var dataset: Plottable.Dataset;
      var xScale: Plottable.Scale.Ordinal;
      var yScale: Plottable.Scale.Linear;
      var svg: D3.Selection;

      beforeEach(() => {
        svg = generateSVG();
        data = [{x: "foo", y: 5}, {x: "bar", y: 640}, {x: "zoo", y: 12345}];
        dataset = new Plottable.Dataset(data);
        xScale = new Plottable.Scale.Ordinal();
        yScale = new Plottable.Scale.Linear();
        plot = new Plottable.Plot.VerticalBar<string>(xScale, yScale);
        plot.addDataset(dataset);
        plot.project("x", "x", xScale);
        plot.project("y", "y", yScale);
      });

      it("bar labels disabled by default", () => {
        plot.renderTo(svg);
        var texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 0, "by default, no texts are drawn");
        svg.remove();
      });


      it("bar labels render properly", () => {
        plot.renderTo(svg);
        plot.barLabelsEnabled(true);
        var texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "both texts drawn");
        assert.equal(texts[0], "640", "first label is 640");
        assert.equal(texts[1], "12345", "first label is 12345");
        svg.remove();
      });

      it("bar labels hide if bars too skinny", () => {
        plot.barLabelsEnabled(true);
        plot.renderTo(svg);
        plot.barLabelFormatter((n: number) => n.toString() + (n === 12345 ? "looong" : ""));
        var texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 0, "no text drawn");
        svg.remove();
      });

      it("formatters are used properly", () => {
        plot.barLabelsEnabled(true);
        plot.barLabelFormatter((n: number) => n.toString() + "%");
        plot.renderTo(svg);
        var texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "both texts drawn");
        assert.equal(texts[0], "640%", "first label is 640%");
        assert.equal(texts[1], "12345%", "first label is 12345%");
        svg.remove();
      });

      it("bar labels are removed instantly on dataset change", (done) => {
        plot.barLabelsEnabled(true);
        plot.renderTo(svg);
        var texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "both texts drawn");
        var originalDrawLabels = (<any> plot)._drawLabels;
        var called = false;
        (<any> plot)._drawLabels = () => {
          if (!called) {
            originalDrawLabels.apply(plot);
            texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
            assert.lengthOf(texts, 2, "texts were repopulated by drawLabels after the update");
            svg.remove();
            called = true; // for some reason, in phantomJS, `done` was being called multiple times and this caused the test to fail.
            done();
          }
        };
        dataset.data(data);
        texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 0, "texts were immediately removed");
      });
    });

    describe("getAllBars()", () => {
      var verticalBarPlot: Plottable.Plot.VerticalBar<string>;
      var dataset: Plottable.Dataset;
      var svg: D3.Selection;

      beforeEach(() => {
        svg = generateSVG();
        dataset = new Plottable.Dataset();
        var xScale = new Plottable.Scale.Ordinal();
        var yScale = new Plottable.Scale.Linear();
        verticalBarPlot = new Plottable.Plot.VerticalBar<string>(xScale, yScale);
        verticalBarPlot.project("x", "x", xScale);
        verticalBarPlot.project("y", "y", yScale);
      });

      it("getAllBars works in the normal case", () => {
        dataset.data([{x: "foo", y: 5}, {x: "bar", y: 640}, {x: "zoo", y: 12345}]);
        verticalBarPlot.addDataset(dataset);
        verticalBarPlot.renderTo(svg);
        var bars = verticalBarPlot.getAllBars();
        assert.lengthOf(bars[0], 3, "three bars in the bar plot");
        svg.remove();
      });


      it("getAllBars returns 0 bars if there are no bars", () => {
        verticalBarPlot.addDataset(dataset);
        verticalBarPlot.renderTo(svg);
        var bars = verticalBarPlot.getAllBars();
        assert.lengthOf(bars[0], 0, "zero bars in the bar plot");
        svg.remove();
      });

    });

    it("plot auto domain scale to visible points on ordinal scale", () => {
      var svg = generateSVG(500, 500);
      var xAccessor = (d: any, i: number, u: any) => d.a;
      var yAccessor = (d: any, i: number, u: any) => d.b + u.foo;
      var simpleDataset = new Plottable.Dataset([{a: "a", b: 6}, {a: "b", b: 2}, {a: "c", b: -2}, {a: "d", b: -6}], {foo: 0});
      var xScale = new Plottable.Scale.Ordinal();
      var yScale = new Plottable.Scale.Linear();
      var plot = new Plottable.Plot.Bar(xScale, yScale);
      plot.addDataset(simpleDataset)
          .project("x", xAccessor, xScale)
          .project("y", yAccessor, yScale)
          .renderTo(svg);
      xScale.domain(["b", "c"]);
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has not been adjusted to visible points");
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points");
      svg.remove();
    });
  });
});
