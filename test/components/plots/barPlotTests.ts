///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("Bar Plot", () => {
    function assertPlotDataEqual(expected: Plottable.Plot.PlotData, actual: Plottable.Plot.PlotData,
        msg: string) {
      assert.deepEqual(expected.data, actual.data, msg);
      assert.closeTo(expected.pixelPoints[0].x, actual.pixelPoints[0].x, 0.01, msg);
      assert.closeTo(expected.pixelPoints[0].y, actual.pixelPoints[0].y, 0.01, msg);
      assert.deepEqual(expected.selection, actual.selection, msg);
    }

    describe("Vertical Bar Plot", () => {
      var svg: D3.Selection;
      var dataset: Plottable.Dataset;
      var xScale: Plottable.Scale.Category;
      var yScale: Plottable.Scale.Linear;
      var barPlot: Plottable.Plot.Bar<string, number>;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;

      beforeEach(() => {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scale.Category().domain(["A", "B"]);
        yScale = new Plottable.Scale.Linear();
        var data = [
          {x: "A", y: 1},
          {x: "B", y: -1.5},
          {x: "B", y: 1} // duplicate X-value
        ];
        dataset = new Plottable.Dataset(data);
        barPlot = new Plottable.Plot.Bar(xScale, yScale);
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
        assert.closeTo(numAttr(bar0, "width"), xScale.rangeBand(), 1, "bar0 width is correct");
        assert.closeTo(numAttr(bar1, "width"), xScale.rangeBand(), 1, "bar1 width is correct");
        assert.equal(bar0.attr("height"), "100", "bar0 height is correct");
        assert.equal(bar1.attr("height"), "150", "bar1 height is correct");
        assert.closeTo(numAttr(bar0, "x"), 111, 1, "bar0 x is correct");
        assert.closeTo(numAttr(bar1, "x"), 333, 1, "bar1 x is correct");
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

      it("getAllPlotData() pixel points corrected for negative-valued bars", () => {
        var plotData = barPlot.getAllPlotData();
        plotData.data.forEach((datum, i) => {
          var barSelection = d3.select(plotData.selection[0][i]);
          var pixelPointY = plotData.pixelPoints[i].y;
          if (datum.y < 0) {
            assert.strictEqual(pixelPointY, +barSelection.attr("y") + +barSelection.attr("height"), "negative on bottom");
          } else {
            assert.strictEqual(pixelPointY, +barSelection.attr("y"), "positive on top");
          }
        });
        svg.remove();
      });

      it("getAllPlotData() pixel points corrected for barAlignment left", () => {
        barPlot.barAlignment("left");
        var plotData = barPlot.getAllPlotData();
        plotData.data.forEach((datum, i) => {
          var barSelection = d3.select(plotData.selection[0][i]);
          var pixelPointX = plotData.pixelPoints[i].x;
          assert.strictEqual(pixelPointX, +barSelection.attr("x"), "barAlignment left x correct");
        });
        svg.remove();
      });

      it("getAllPlotData() pixel points corrected for barAlignment right", () => {
        barPlot.barAlignment("right");
        var plotData = barPlot.getAllPlotData();
        plotData.data.forEach((datum, i) => {
          var barSelection = d3.select(plotData.selection[0][i]);
          var pixelPointX = plotData.pixelPoints[i].x;
          assert.strictEqual(pixelPointX, +barSelection.attr("x") + +barSelection.attr("width"), "barAlignment right x correct");
        });
        svg.remove();
      });

      it("returns correct closest plot data",() => {
        var bars = d3.selectAll(".bar-area rect");
        var zeroY = yScale.scale(0);

        var d0 = dataset.data()[0];
        var d0Px = {
          x: xScale.scale(d0.x),
          y: yScale.scale(d0.y)
        };
        var d1 = dataset.data()[1];
        var d1Px = {
          x: xScale.scale(d1.x),
          y: yScale.scale(d1.y)
        };

        var expected = {
          data: [d0],
          pixelPoints: [d0Px],
          selection: d3.selectAll([bars[0][0]])
        };

        var closest = barPlot.getClosestPlotData({ x: d0Px.x, y: d0Px.y + 1 });
        assertPlotDataEqual(expected, closest, "if inside a bar, it is closest");

        closest = barPlot.getClosestPlotData({ x: d0Px.x, y: d0Px.y - 1 });
        assertPlotDataEqual(expected, closest, "if above a positive bar, it is closest");

        closest = barPlot.getClosestPlotData({ x: d0Px.x, y: zeroY + 1 });
        assertPlotDataEqual(expected, closest, "if below a positive bar, it is closest");

        closest = barPlot.getClosestPlotData({ x: 0, y: d0Px.y });
        assertPlotDataEqual(expected, closest, "if to the right of the first bar, it is closest");

        expected = {
          data: [d1],
          pixelPoints: [d1Px],
          selection: d3.selectAll([bars[0][1]])
        };

        closest = barPlot.getClosestPlotData({ x: d1Px.x, y: d1Px.y - 1 });
        assertPlotDataEqual(expected, closest, "if inside a negative bar, it is closest");

        closest = barPlot.getClosestPlotData({ x: d1Px.x, y: d1Px.y + 1 });
        assertPlotDataEqual(expected, closest, "if below a negative bar, it is closest");

        // set the domain such that the first bar is out of view
        yScale.domain([-2, -0.1]);
        expected.pixelPoints = [{
          x: xScale.scale(d1.x),
          y: yScale.scale(d1.y)
        }];

        closest = barPlot.getClosestPlotData({ x: d0Px.x, y: zeroY + 1 });
        assertPlotDataEqual(expected, closest, "only in-view bars are considered");

        barPlot = new Plottable.Plot.Bar(xScale, yScale);
        expected = {
          data: [],
          pixelPoints: [],
          selection: d3.selection()
        };

        var closest = barPlot.getClosestPlotData({ x: d0Px.x, y: d0Px.y });
        assert.lengthOf(closest.data, 0, "empty plots return empty data");
        assert.lengthOf(closest.pixelPoints, 0, "empty plots return empty pixelPoints");
        assert.isTrue(closest.selection.empty(), "empty plots return empty selection");

        svg.remove();
      });
    });

    describe("Vertical Bar Plot modified log scale", () => {
      var svg: D3.Selection;
      var dataset: Plottable.Dataset;
      var xScale: Plottable.Scale.ModifiedLog;
      var yScale: Plottable.Scale.Linear;
      var barPlot: Plottable.Plot.Bar<number, number>;
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
        barPlot = new Plottable.Plot.Bar(xScale, yScale);
        barPlot.addDataset(dataset);
        barPlot.animate(false);
        barPlot.baseline(0);
        yScale.domain([-2, 2]);
        barPlot.project("x", "x", xScale);
        barPlot.project("y", "y", yScale);
        barPlot.renderTo(svg);
      });

      it("barPixelWidth calculated appropriately", () => {
        assert.strictEqual((<any> barPlot)._getBarPixelWidth(), xScale.scale(2) * 2 * 0.95);
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
      var barPlot: Plottable.Plot.Bar<number, number>;
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
        barPlot = new Plottable.Plot.Bar(xScale, yScale);
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
      var barPlot: Plottable.Plot.Bar<number, number>;
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
        barPlot = new Plottable.Plot.Bar(xScale, yScale);
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

    describe("Horizontal Bar Plot", () => {
      var svg: D3.Selection;
      var dataset: Plottable.Dataset;
      var yScale: Plottable.Scale.Category;
      var xScale: Plottable.Scale.Linear;
      var barPlot: Plottable.Plot.Bar<number, string>;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;
      beforeEach(() => {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        yScale = new Plottable.Scale.Category().domain(["A", "B"]);
        xScale = new Plottable.Scale.Linear();
        xScale.domain([-3, 3]);

        var data = [
          {y: "A", x: 1},
          {y: "B", x: -1.5},
          {y: "B", x: 1} // duplicate Y-value
        ];
        dataset = new Plottable.Dataset(data);

        barPlot = new Plottable.Plot.Bar(xScale, yScale, false);
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
        assert.closeTo(numAttr(bar0, "height"), yScale.rangeBand(), 1, "bar0 height is correct");
        assert.closeTo(numAttr(bar1, "height"), yScale.rangeBand(), 1, "bar1 height is correct");
        assert.equal(bar0.attr("width"), "100", "bar0 width is correct");
        assert.equal(bar1.attr("width"), "150", "bar1 width is correct");
        assert.closeTo(numAttr(bar0, "y"), 74, 1, "bar0 y is correct");
        assert.closeTo(numAttr(bar1, "y"), 222, 1, "bar1 y is correct");
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

      it("width projector may be overwritten, and calling project queues rerender", () => {
        var bars = (<any> barPlot)._renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        var bar0y = bar0.data()[0].y;
        var bar1y = bar1.data()[0].y;
        barPlot.project("width", 10);
        assert.closeTo(numAttr(bar0, "height"), 10, 0.01, "bar0 height");
        assert.closeTo(numAttr(bar1, "height"), 10, 0.01, "bar1 height");
        assert.closeTo(numAttr(bar0, "width"), 100, 0.01, "bar0 width");
        assert.closeTo(numAttr(bar1, "width"), 150, 0.01, "bar1 width");
        assert.closeTo(numAttr(bar0, "y"), yScale.scale(bar0y) - numAttr(bar0, "height") / 2, 0.01, "bar0 ypos");
        assert.closeTo(numAttr(bar1, "y"), yScale.scale(bar1y) - numAttr(bar1, "height") / 2, 0.01, "bar1 ypos");
        svg.remove();
      });

      it("getAllPlotData() pixel points corrected for negative-valued bars", () => {
        var plotData = barPlot.getAllPlotData();
        plotData.data.forEach((datum, i) => {
          var barSelection = d3.select(plotData.selection[0][i]);
          var pixelPointX = plotData.pixelPoints[i].x;
          if (datum.x < 0) {
            assert.strictEqual(pixelPointX, +barSelection.attr("x"), "negative on left");
          } else {
            assert.strictEqual(pixelPointX, +barSelection.attr("x") + +barSelection.attr("width"), "positive on right");
          }
        });
        svg.remove();
      });

      it("getAllPlotData() pixel points corrected for barAlignment left", () => {
        barPlot.barAlignment("left");
        var plotData = barPlot.getAllPlotData();
        plotData.data.forEach((datum, i) => {
          var barSelection = d3.select(plotData.selection[0][i]);
          var pixelPointY = plotData.pixelPoints[i].y;
          assert.strictEqual(pixelPointY, +barSelection.attr("y"), "barAlignment left y correct");
        });
        svg.remove();
      });

      it("getAllPlotData() pixel points corrected for barAlignment right", () => {
        barPlot.barAlignment("right");
        var plotData = barPlot.getAllPlotData();
        plotData.data.forEach((datum, i) => {
          var barSelection = d3.select(plotData.selection[0][i]);
          var pixelPointY = plotData.pixelPoints[i].y;
          assert.strictEqual(pixelPointY, +barSelection.attr("y") + +barSelection.attr("height"), "barAlignment right y correct");
        });
        svg.remove();
      });

      it("returns correct closest plot data",() => {
        var bars = d3.selectAll(".bar-area rect");
        var zeroX = xScale.scale(0);

        var d0 = dataset.data()[0];
        var d0Px = {
          x: xScale.scale(d0.x),
          y: yScale.scale(d0.y)
        };
        var d1 = dataset.data()[1];
        var d1Px = {
          x: xScale.scale(d1.x),
          y: yScale.scale(d1.y)
        };

        var expected = {
          data: [d0],
          pixelPoints: [d0Px],
          selection: d3.selectAll([bars[0][0]])
        };

        var closest = barPlot.getClosestPlotData({ x: d0Px.x - 1, y: d0Px.y });
        assertPlotDataEqual(expected, closest, "if inside a bar, it is closest");

        closest = barPlot.getClosestPlotData({ x: d0Px.x + 1, y: d0Px.y });
        assertPlotDataEqual(expected, closest, "if right of a positive bar, it is closest");

        closest = barPlot.getClosestPlotData({ x: zeroX - 1, y: d0Px.y });
        assertPlotDataEqual(expected, closest, "if left of a positive bar, it is closest");

        closest = barPlot.getClosestPlotData({ x: d0Px.x, y: 0 });
        assertPlotDataEqual(expected, closest, "if above the first bar, it is closest");

        expected = {
          data: [d1],
          pixelPoints: [d1Px],
          selection: d3.selectAll([bars[0][1]])
        };

        closest = barPlot.getClosestPlotData({ x: d1Px.x + 1, y: d1Px.y });
        assertPlotDataEqual(expected, closest, "if inside a negative bar, it is closest");

        closest = barPlot.getClosestPlotData({ x: d1Px.x - 1, y: d1Px.y });
        assertPlotDataEqual(expected, closest, "if left of a negative bar, it is closest");

        // set the domain such that the first bar is out of view
        xScale.domain([-2, -0.1]);
        expected.pixelPoints = [{
          x: xScale.scale(d1.x),
          y: yScale.scale(d1.y)
        }];

        closest = barPlot.getClosestPlotData({ x: zeroX - 1, y: d0Px.y });
        assertPlotDataEqual(expected, closest, "only in-view bars are considered");

        svg.remove();
      });
    });

    describe("Vertical Bar Plot With Bar Labels", () => {
      var plot: Plottable.Plot.Bar<string, number>;
      var data: any[];
      var dataset: Plottable.Dataset;
      var xScale: Plottable.Scale.Category;
      var yScale: Plottable.Scale.Linear;
      var svg: D3.Selection;

      beforeEach(() => {
        svg = generateSVG();
        data = [{x: "foo", y: 5}, {x: "bar", y: 640}, {x: "zoo", y: 12345}];
        dataset = new Plottable.Dataset(data);
        xScale = new Plottable.Scale.Category();
        yScale = new Plottable.Scale.Linear();
        plot = new Plottable.Plot.Bar<string, number>(xScale, yScale);
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

    describe("getAllSelections", () => {
      var verticalBarPlot: Plottable.Plot.Bar<string, number>;
      var dataset: Plottable.Dataset;
      var svg: D3.Selection;

      beforeEach(() => {
        svg = generateSVG();
        dataset = new Plottable.Dataset();
        var xScale = new Plottable.Scale.Category();
        var yScale = new Plottable.Scale.Linear();
        verticalBarPlot = new Plottable.Plot.Bar<string, number>(xScale, yScale);
        verticalBarPlot.project("x", "x", xScale);
        verticalBarPlot.project("y", "y", yScale);
      });

      it("retrieves all dataset selections with no args", () => {
        var barData = [{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }];
        var barData2 = [{ x: "one", y: 5 }, { x: "two", y: 640 }, { x: "three", y: 12345 }];
        verticalBarPlot.addDataset("a", barData);
        verticalBarPlot.addDataset("b", barData2);
        verticalBarPlot.renderTo(svg);

        var allBars = verticalBarPlot.getAllSelections();
        var allBars2 = verticalBarPlot.getAllSelections((<any> verticalBarPlot)._datasetKeysInOrder);
        assert.deepEqual(allBars, allBars2, "both ways of getting all selections work");

        svg.remove();
      });

      it("retrieves correct selections (string arg)", () => {
        var barData = [{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }];
        var barData2 = [{ x: "one", y: 5 }, { x: "two", y: 640 }, { x: "three", y: 12345 }];
        verticalBarPlot.addDataset("a", barData);
        verticalBarPlot.addDataset(barData2);
        verticalBarPlot.renderTo(svg);

        var allBars = verticalBarPlot.getAllSelections("a");
        assert.strictEqual(allBars.size(), 3, "all bars retrieved");
        var selectionData = allBars.data();
        assert.includeMembers(selectionData, barData, "first dataset data in selection data");

        svg.remove();
      });

      it("retrieves correct selections (array arg)", () => {
        var barData = [{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }];
        var barData2 = [{ x: "one", y: 5 }, { x: "two", y: 640 }, { x: "three", y: 12345 }];
        verticalBarPlot.addDataset("a", barData);
        verticalBarPlot.addDataset("b", barData2);
        verticalBarPlot.renderTo(svg);

        var allBars = verticalBarPlot.getAllSelections(["a", "b"]);
        assert.strictEqual(allBars.size(), 6, "all bars retrieved");
        var selectionData = allBars.data();
        assert.includeMembers(selectionData, barData, "first dataset data in selection data");
        assert.includeMembers(selectionData, barData2, "second dataset data in selection data");

        svg.remove();
      });

      it("skips invalid keys", () => {
        var barData = [{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }];
        var barData2 = [{ x: "one", y: 5 }, { x: "two", y: 640 }, { x: "three", y: 12345 }];
        verticalBarPlot.addDataset("a", barData);
        verticalBarPlot.addDataset("b", barData2);
        verticalBarPlot.renderTo(svg);

        var allBars = verticalBarPlot.getAllSelections(["a", "c"]);
        assert.strictEqual(allBars.size(), 3, "all bars retrieved");
        var selectionData = allBars.data();
        assert.includeMembers(selectionData, barData, "first dataset data in selection data");

        svg.remove();
      });

    });

    it("plot auto domain scale to visible points on Category scale", () => {
      var svg = generateSVG(500, 500);
      var xAccessor = (d: any, i: number, u: any) => d.a;
      var yAccessor = (d: any, i: number, u: any) => d.b + u.foo;
      var simpleDataset = new Plottable.Dataset([{a: "a", b: 6}, {a: "b", b: 2}, {a: "c", b: -2}, {a: "d", b: -6}], {foo: 0});
      var xScale = new Plottable.Scale.Category();
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
