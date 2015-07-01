///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("Bar Plot", () => {

    // HACKHACK #1798: beforeEach being used below
    it("renders correctly with no data", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      var plot = new Plottable.Plots.Bar<number, number>();
      plot.x((d: any) => d.x, xScale);
      plot.y((d: any) => d.y, yScale);
      assert.doesNotThrow(() => plot.renderTo(svg), Error);
      assert.strictEqual(plot.width(), 400, "was allocated width");
      assert.strictEqual(plot.height(), 400, "was allocated height");
      svg.remove();
    });

    it("rejects invalid orientations", () => {
      assert.throws(() => new Plottable.Plots.Bar("diagonal"), Error);
    });

    it("orientation() works as expected", () => {
      var defaultPlot = new Plottable.Plots.Bar<number, number>();
      assert.strictEqual(defaultPlot.orientation(), "vertical", "default Plots.Bar() are vertical");

      var verticalPlot = new Plottable.Plots.Bar<number, number>("vertical");
      assert.strictEqual(verticalPlot.orientation(), "vertical", "vertical Plots.Bar()");

      var horizontalPlot = new Plottable.Plots.Bar<number, number>("horizontal");
      assert.strictEqual(horizontalPlot.orientation(), "horizontal", "horizontal Plots.Bar()");
    });

    describe("Vertical Bar Plot", () => {
      var svg: d3.Selection<void>;
      var dataset: Plottable.Dataset;
      var xScale: Plottable.Scales.Category;
      var yScale: Plottable.Scales.Linear;
      var barPlot: Plottable.Plots.Bar<string, number>;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scales.Category().domain(["A", "B"]);
        yScale = new Plottable.Scales.Linear();
        var data = [
          {x: "A", y: 1},
          {x: "B", y: -1.5},
          {x: "B", y: 1} // duplicate X-value
        ];
        dataset = new Plottable.Dataset(data);
        barPlot = new Plottable.Plots.Bar<string, number>();
        barPlot.addDataset(dataset);
        barPlot.animated(false);
        barPlot.baselineValue(0);
        yScale.domain([-2, 2]);
        barPlot.x((d) => d.x, xScale);
        barPlot.y((d) => d.y, yScale);
        barPlot.renderTo(svg);
      });

      it("renders correctly", () => {
        var renderArea = (<any> barPlot)._renderArea;
        var bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.closeTo(TestMethods.numAttr(bar0, "width"), xScale.rangeBand(), 1, "bar0 width is correct");
        assert.closeTo(TestMethods.numAttr(bar1, "width"), xScale.rangeBand(), 1, "bar1 width is correct");
        assert.strictEqual(bar0.attr("height"), "100", "bar0 height is correct");
        assert.strictEqual(bar1.attr("height"), "150", "bar1 height is correct");
        assert.closeTo(TestMethods.numAttr(bar0, "x"), 111, 1, "bar0 x is correct");
        assert.closeTo(TestMethods.numAttr(bar1, "x"), 333, 1, "bar1 x is correct");
        assert.strictEqual(bar0.attr("y"), "100", "bar0 y is correct");
        assert.strictEqual(bar1.attr("y"), "200", "bar1 y is correct");

        var baseline = renderArea.select(".baseline");
        assert.strictEqual(baseline.attr("y1"), "200", "the baseline is in the correct vertical position");
        assert.strictEqual(baseline.attr("y2"), "200", "the baseline is in the correct vertical position");
        assert.strictEqual(baseline.attr("x1"), "0", "the baseline starts at the edge of the chart");
        assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH), "the baseline ends at the edge of the chart");
        svg.remove();
      });

      it("baseline value can be changed; barPlot updates appropriately", () => {
        barPlot.baselineValue(-1);

        var renderArea = (<any> barPlot)._renderArea;
        var bars = renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.strictEqual(bar0.attr("height"), "200", "bar0 height is correct");
        assert.strictEqual(bar1.attr("height"), "50", "bar1 height is correct");
        assert.strictEqual(bar0.attr("y"), "100", "bar0 y is correct");
        assert.strictEqual(bar1.attr("y"), "300", "bar1 y is correct");

        var baseline = renderArea.select(".baseline");
        assert.strictEqual(baseline.attr("y1"), "300", "the baseline is in the correct vertical position");
        assert.strictEqual(baseline.attr("y2"), "300", "the baseline is in the correct vertical position");
        assert.strictEqual(baseline.attr("x1"), "0", "the baseline starts at the edge of the chart");
        assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH), "the baseline ends at the edge of the chart");
        svg.remove();
      });

      it("don't show points from outside of domain", () => {
        xScale.domain(["C"]);
        var bars = (<any> barPlot)._renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 0, "no bars have been rendered");
        svg.remove();
      });

      it("entitiesAt()", () => {
        var bars = barPlot.entitiesAt({x: 155, y: 150}); // in the middle of bar 0

        assert.lengthOf(bars, 1, "entitiesAt() returns an Entity for the bar at the given location");
        assert.strictEqual(bars[0].datum, dataset.data()[0], "the data in the bar matches the data from the datasource");

        bars = barPlot.entitiesAt({x: -1, y: -1}); // no bars here
        assert.lengthOf(bars, 0, "returns empty array if no bars at query point");

        bars = barPlot.entitiesAt({x: 200, y: 50}); // between the two bars
        assert.lengthOf(bars, 0, "returns empty array if no bars at query point");

        bars = barPlot.entitiesAt({x: 155, y: 10}); // above bar 0
        assert.lengthOf(bars, 0, "returns empty array if no bars at query point");
        svg.remove();
      });

      it("entitiesIn()", () => {
        // the bars are now (140,100),(150,300) and (440,300),(450,350) - the
        // origin is at the top left!

        var bars = barPlot.entitiesIn({min: 155, max: 455}, {min: 150, max: 150});
        assert.lengthOf(bars, 2, "selected 2 bars (not the negative one)");
        assert.strictEqual(bars[0].datum, dataset.data()[bars[0].index], "the data in bar 0 matches the datasource");
        assert.strictEqual(bars[1].datum, dataset.data()[bars[1].index], "the data in bar 1 matches the datasource");

        bars = barPlot.entitiesIn({min: 155, max: 455}, {min: 150, max: 350});
        assert.lengthOf(bars, 3, "selected all the bars");
        assert.strictEqual(bars[0].datum, dataset.data()[bars[0].index], "the data in bar 0 matches the datasource");
        assert.strictEqual(bars[1].datum, dataset.data()[bars[1].index], "the data in bar 1 matches the datasource");
        assert.strictEqual(bars[2].datum, dataset.data()[bars[2].index], "the data in bar 2 matches the datasource");

        svg.remove();
      });

      describe("entities()", () => {
        describe("position", () => {
          it("entities() pixel points corrected for negative-valued bars", () => {
            var entities = barPlot.entities();
            entities.forEach((entity) => {
              var barSelection = entity.selection;
              var pixelPointY = entity.position.y;
              if (entity.datum.y < 0) {
                assert.strictEqual(pixelPointY, +barSelection.attr("y") + +barSelection.attr("height"), "negative on bottom");
              } else {
                assert.strictEqual(pixelPointY, +barSelection.attr("y"), "positive on top");
              }
            });
            svg.remove();
          });

        });

      });

      describe("entityNearest()", () => {
        var bars: d3.Selection<void>;
        var zeroY: number;
        var d0: any, d1: any;
        var d0Px: Plottable.Point, d1Px: Plottable.Point;

        beforeEach(() => {
          bars = barPlot.selections();
          zeroY = yScale.scale(0);

          d0 = dataset.data()[0];
          d0Px = {
            x: xScale.scale(d0.x),
            y: yScale.scale(d0.y)
          };
          d1 = dataset.data()[1];
          d1Px = {
            x: xScale.scale(d1.x),
            y: yScale.scale(d1.y)
          };
        });

        it("returns nearest Entity", () => {
          var expected: Plottable.Plots.PlotEntity = {
            datum: d0,
            index: 0,
            dataset: dataset,
            position: d0Px,
            selection: d3.selectAll([bars[0][0]]),
            component: barPlot
          };

          var closest = barPlot.entityNearest({ x: d0Px.x, y: d0Px.y + 1 });
          TestMethods.assertPlotEntitiesEqual(closest, expected, "if inside a bar, it is closest");

          closest = barPlot.entityNearest({ x: d0Px.x, y: d0Px.y - 1 });
          TestMethods.assertPlotEntitiesEqual(closest, expected, "if above a positive bar, it is closest");

          closest = barPlot.entityNearest({ x: d0Px.x, y: zeroY + 1 });
          TestMethods.assertPlotEntitiesEqual(closest, expected, "if below a positive bar, it is closest");

          closest = barPlot.entityNearest({ x: 0, y: d0Px.y });
          TestMethods.assertPlotEntitiesEqual(closest, expected, "if to the right of the first bar, it is closest");

          expected = {
            datum: d1,
            index: 1,
            dataset: dataset,
            position: d1Px,
            selection: d3.selectAll([bars[0][1]]),
            component: barPlot
          };
          closest = barPlot.entityNearest({ x: d1Px.x, y: d1Px.y - 1 });
          TestMethods.assertPlotEntitiesEqual(closest, expected, "if inside a negative bar, it is closest");

          closest = barPlot.entityNearest({ x: d1Px.x, y: d1Px.y + 1 });
          TestMethods.assertPlotEntitiesEqual(closest, expected, "if below a negative bar, it is closest");

          svg.remove();
        });

        it("considers only in-view bars", () => {
          // set the domain such that the first bar is out of view
          yScale.domain([-2, -0.1]);
          d1Px = {
            x: xScale.scale(d1.x),
            y: yScale.scale(d1.y)
          };

          var expected: Plottable.Plots.PlotEntity = {
            datum: d1,
            index: 1,
            dataset: dataset,
            position: d1Px,
            selection: d3.selectAll([bars[0][1]]),
            component: barPlot
          };

          var closest = barPlot.entityNearest({ x: d0Px.x, y: zeroY + 1 });
          TestMethods.assertPlotEntitiesEqual(closest, expected, "nearest Entity is the visible one");

          svg.remove();
        });

        it("returns undefined if no Entities are visible", () => {
          barPlot = new Plottable.Plots.Bar<string, number>();
          var closest = barPlot.entityNearest({ x: d0Px.x, y: d0Px.y });
          assert.isUndefined(closest, "returns undefined if no Entity can be found");
          svg.remove();
        });
      });
    });

    describe("Vertical Bar Plot modified log scale", () => {
      var svg: d3.Selection<void>;
      var dataset: Plottable.Dataset;
      var xScale: Plottable.Scales.ModifiedLog;
      var yScale: Plottable.Scales.Linear;
      var barPlot: Plottable.Plots.Bar<number, number>;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scales.ModifiedLog();
        yScale = new Plottable.Scales.Linear();
        var data = [
          {x: 2, y: 1},
          {x: 10, y: -1.5},
          {x: 100, y: 1}
        ];
        dataset = new Plottable.Dataset(data);
        barPlot = new Plottable.Plots.Bar<number, number>();
        barPlot.addDataset(dataset);
        barPlot.animated(false);
        barPlot.baselineValue(0);
        yScale.domain([-2, 2]);
        barPlot.x((d) => d.x, xScale);
        barPlot.y((d) => d.y, yScale);
        barPlot.renderTo(svg);
      });

      it("barPixelWidth calculated appropriately", () => {
        assert.strictEqual((<any> barPlot)._barPixelWidth, xScale.scale(2) * 2 * 0.95);
        svg.remove();
      });

      it("bar widths are equal to barPixelWidth", () => {
        var renderArea = (<any> barPlot)._renderArea;
        var bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");

        var barPixelWidth = (<any> barPlot)._barPixelWidth;
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        var bar2 = d3.select(bars[0][2]);
        assert.closeTo(TestMethods.numAttr(bar0, "width"), barPixelWidth, 0.1, "bar0 width is correct");
        assert.closeTo(TestMethods.numAttr(bar1, "width"), barPixelWidth, 0.1, "bar1 width is correct");
        assert.closeTo(TestMethods.numAttr(bar2, "width"), barPixelWidth, 0.1, "bar2 width is correct");
        svg.remove();
      });
    });

    describe("Vertical Bar Plot linear scale", () => {
      var svg: d3.Selection<void>;
      var dataset: Plottable.Dataset;
      var xScale: Plottable.Scales.Linear;
      var yScale: Plottable.Scales.Linear;
      var barPlot: Plottable.Plots.Bar<number, number>;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        var data = [
          {x: 2, y: 1},
          {x: 10, y: -1.5},
          {x: 100, y: 1}
        ];
        barPlot = new Plottable.Plots.Bar<number, number>();
        dataset = new Plottable.Dataset(data);
        barPlot.addDataset(dataset);
        barPlot.baselineValue(0);
        barPlot.x((d) => d.x, xScale);
        barPlot.y((d) => d.y, yScale);
        barPlot.renderTo(svg);
      });

      it("calculating width does not crash if handed invalid values", () => {
        var errMsg = /TypeError: Cannot read property \'valueOf\' of undefined/;
        assert.doesNotThrow(() => barPlot.x((d) => d.a, xScale), errMsg, "barPixelWidth does not crash on invalid values");
        svg.remove();
      });

      it("bar width takes an appropriate value", () => {
        assert.strictEqual((<any> barPlot)._barPixelWidth, (xScale.scale(10) - xScale.scale(2)) * 0.95);
        svg.remove();
      });

      it("bar widths are equal to barPixelWidth", () => {
        var renderArea = (<any> barPlot)._renderArea;
        var bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");

        var barPixelWidth = (<any> barPlot)._barPixelWidth;
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        var bar2 = d3.select(bars[0][2]);
        assert.closeTo(TestMethods.numAttr(bar0, "width"), barPixelWidth, 0.1, "bar0 width is correct");
        assert.closeTo(TestMethods.numAttr(bar1, "width"), barPixelWidth, 0.1, "bar1 width is correct");
        assert.closeTo(TestMethods.numAttr(bar2, "width"), barPixelWidth, 0.1, "bar2 width is correct");
        svg.remove();
      });

      it("sensible bar width one datum", () => {
        barPlot.removeDataset(dataset);
        barPlot.addDataset(new Plottable.Dataset([{x: 10, y: 2}]));
        assert.closeTo((<any> barPlot)._barPixelWidth, 228, 0.1, "sensible bar width for only one datum");
        svg.remove();
      });

      it("sensible bar width same datum", () => {
        barPlot.removeDataset(dataset);
        barPlot.addDataset(new Plottable.Dataset([{x: 10, y: 2}, {x: 10, y: 2}]));
        assert.closeTo((<any> barPlot)._barPixelWidth, 228, 0.1, "uses the width sensible for one datum");
        svg.remove();
      });

      it("sensible bar width unsorted data", () => {
        barPlot.removeDataset(dataset);
        barPlot.addDataset(new Plottable.Dataset([{x: 2, y: 2}, {x: 20, y: 2}, {x: 5, y: 2}]));
        var expectedBarPixelWidth = (xScale.scale(5) - xScale.scale(2)) * 0.95;
        assert.closeTo((<any> barPlot)._barPixelWidth, expectedBarPixelWidth, 0.1, "bar width uses closest sorted x values");
        svg.remove();
      });
    });

    describe("Vertical Bar Plot time scale", () => {
      var svg: d3.Selection<void>;
      var barPlot: Plottable.Plots.Bar<Date, number>;
      var xScale: Plottable.Scales.Time;

      beforeEach(() => {
        svg = TestMethods.generateSVG(600, 400);
        var data = [{ x: "12/01/92", y: 0, type: "a" },
          { x: "12/01/93", y: 1, type: "a" },
          { x: "12/01/94", y: 1, type: "a" },
          { x: "12/01/95", y: 2, type: "a" },
          { x: "12/01/96", y: 2, type: "a" },
          { x: "12/01/97", y: 2, type: "a" }];
        xScale = new Plottable.Scales.Time();
        var yScale = new Plottable.Scales.Linear();
        barPlot = new Plottable.Plots.Bar<Date, number>();
        barPlot.addDataset(new Plottable.Dataset(data));
        barPlot.x((d: any) => d3.time.format("%m/%d/%y").parse(d.x), xScale)
               .y((d) => d.y, yScale)
               .renderTo(svg);
      });

      it("bar width takes an appropriate value", () => {
        var timeFormatter = d3.time.format("%m/%d/%y");
        var expectedBarWidth = (xScale.scale(timeFormatter.parse("12/01/94")) - xScale.scale(timeFormatter.parse("12/01/93"))) * 0.95;
        assert.closeTo((<any> barPlot)._barPixelWidth, expectedBarWidth, 0.1, "width is difference between two dates");
        svg.remove();
      });

    });

    describe("Horizontal Bar Plot", () => {
      var svg: d3.Selection<void>;
      var dataset: Plottable.Dataset;
      var yScale: Plottable.Scales.Category;
      var xScale: Plottable.Scales.Linear;
      var barPlot: Plottable.Plots.Bar<number, string>;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;
      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        yScale = new Plottable.Scales.Category().domain(["A", "B"]);
        xScale = new Plottable.Scales.Linear();
        xScale.domain([-3, 3]);

        var data = [
          {y: "A", x: 1},
          {y: "B", x: -1.5},
          {y: "B", x: 1} // duplicate Y-value
        ];
        dataset = new Plottable.Dataset(data);
        barPlot = new Plottable.Plots.Bar<number, string>(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
        barPlot.addDataset(dataset);
        barPlot.animated(false);
        barPlot.baselineValue(0);
        barPlot.x((d) => d.x, xScale);
        barPlot.y((d) => d.y, yScale);
        barPlot.renderTo(svg);
      });

      it("renders correctly", () => {
        var renderArea = (<any> barPlot)._renderArea;
        var bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.closeTo(TestMethods.numAttr(bar0, "height"), yScale.rangeBand(), 1, "bar0 height is correct");
        assert.closeTo(TestMethods.numAttr(bar1, "height"), yScale.rangeBand(), 1, "bar1 height is correct");
        assert.strictEqual(bar0.attr("width"), "100", "bar0 width is correct");
        assert.strictEqual(bar1.attr("width"), "150", "bar1 width is correct");
        assert.closeTo(TestMethods.numAttr(bar0, "y"), 74, 1, "bar0 y is correct");
        assert.closeTo(TestMethods.numAttr(bar1, "y"), 222, 1, "bar1 y is correct");
        assert.strictEqual(bar0.attr("x"), "300", "bar0 x is correct");
        assert.strictEqual(bar1.attr("x"), "150", "bar1 x is correct");

        var baseline = renderArea.select(".baseline");
        assert.strictEqual(baseline.attr("x1"), "300", "the baseline is in the correct horizontal position");
        assert.strictEqual(baseline.attr("x2"), "300", "the baseline is in the correct horizontal position");
        assert.strictEqual(baseline.attr("y1"), "0", "the baseline starts at the top of the chart");
        assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT), "the baseline ends at the bottom of the chart");
        svg.remove();
      });

      it("baseline value can be changed; barPlot updates appropriately", () => {
        barPlot.baselineValue(-1);

        var renderArea = (<any> barPlot)._renderArea;
        var bars = renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.strictEqual(bar0.attr("width"), "200", "bar0 width is correct");
        assert.strictEqual(bar1.attr("width"), "50", "bar1 width is correct");
        assert.strictEqual(bar0.attr("x"), "200", "bar0 x is correct");
        assert.strictEqual(bar1.attr("x"), "150", "bar1 x is correct");

        var baseline = renderArea.select(".baseline");
        assert.strictEqual(baseline.attr("x1"), "200", "the baseline is in the correct horizontal position");
        assert.strictEqual(baseline.attr("x2"), "200", "the baseline is in the correct horizontal position");
        assert.strictEqual(baseline.attr("y1"), "0", "the baseline starts at the top of the chart");
        assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT), "the baseline ends at the bottom of the chart");
        svg.remove();
      });

      it("width projector may be overwritten, and calling project queues rerender", () => {
        var bars = (<any> barPlot)._renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        var bar0y = bar0.data()[0].y;
        var bar1y = bar1.data()[0].y;
        barPlot.attr("width", 10);
        assert.closeTo(TestMethods.numAttr(bar0, "height"), 10, 0.01, "bar0 height");
        assert.closeTo(TestMethods.numAttr(bar1, "height"), 10, 0.01, "bar1 height");
        assert.closeTo(TestMethods.numAttr(bar0, "width"), 100, 0.01, "bar0 width");
        assert.closeTo(TestMethods.numAttr(bar1, "width"), 150, 0.01, "bar1 width");
        assert.closeTo(TestMethods.numAttr(bar0, "y"), yScale.scale(bar0y) - TestMethods.numAttr(bar0, "height") / 2, 0.01, "bar0 ypos");
        assert.closeTo(TestMethods.numAttr(bar1, "y"), yScale.scale(bar1y) - TestMethods.numAttr(bar1, "height") / 2, 0.01, "bar1 ypos");
        svg.remove();
      });

      describe("entities()", () => {
        describe("position", () => {
          it("entities() pixel points corrected for negative-valued bars", () => {
            var entities = barPlot.entities();
            entities.forEach((entity) => {
              var barSelection = entity.selection;
              var pixelPointX = entity.position.x;
              if (entity.datum.x < 0) {
                assert.strictEqual(pixelPointX, +barSelection.attr("x"), "negative on left");
              } else {
                assert.strictEqual(pixelPointX, +barSelection.attr("x") + +barSelection.attr("width"), "positive on right");
              }
            });
            svg.remove();
          });

        });

      });

      describe("entityNearest()", () => {
        var bars: d3.Selection<void>;
        var zeroX: number;
        var d0: any, d1: any;
        var d0Px: Plottable.Point, d1Px: Plottable.Point;

        beforeEach(() => {
          bars = barPlot.selections();
          zeroX = xScale.scale(0);

          d0 = dataset.data()[0];
          d0Px = {
            x: xScale.scale(d0.x),
            y: yScale.scale(d0.y)
          };
          d1 = dataset.data()[1];
          d1Px = {
            x: xScale.scale(d1.x),
            y: yScale.scale(d1.y)
          };
        });

        it("returns nearest Entity", () => {
          var expected: Plottable.Plots.PlotEntity = {
            datum: d0,
            index: 0,
            dataset: dataset,
            position: d0Px,
            selection: d3.selectAll([bars[0][0]]),
            component: barPlot
          };

          var closest = barPlot.entityNearest({ x: d0Px.x - 1, y: d0Px.y });
          TestMethods.assertPlotEntitiesEqual(closest, expected, "if inside a bar, it is closest");

          closest = barPlot.entityNearest({ x: d0Px.x + 1, y: d0Px.y });
          TestMethods.assertPlotEntitiesEqual(closest, expected, "if right of a positive bar, it is closest");

          closest = barPlot.entityNearest({ x: zeroX - 1, y: d0Px.y });
          TestMethods.assertPlotEntitiesEqual(closest, expected, "if left of a positive bar, it is closest");

          closest = barPlot.entityNearest({ x: d0Px.x, y: 0 });
          TestMethods.assertPlotEntitiesEqual(closest, expected, "if above the first bar, it is closest");

          expected = {
            datum: d1,
            index: 1,
            dataset: dataset,
            position: d1Px,
            selection: d3.selectAll([bars[0][1]]),
            component: barPlot
          };

          closest = barPlot.entityNearest({ x: d1Px.x + 1, y: d1Px.y });
          TestMethods.assertPlotEntitiesEqual(closest, expected, "if inside a negative bar, it is closest");

          closest = barPlot.entityNearest({ x: d1Px.x - 1, y: d1Px.y });
          TestMethods.assertPlotEntitiesEqual(closest, expected, "if left of a negative bar, it is closest");

          svg.remove();
        });

        it("considers only in-view bars", () => {
          // set the domain such that the first bar is out of view
          xScale.domain([-2, -0.1]);
          d1 = dataset.data()[1];
          d1Px = {
            x: xScale.scale(d1.x),
            y: yScale.scale(d1.y)
          };
          var expected: Plottable.Plots.PlotEntity = {
            datum: d1,
            index: 1,
            dataset: dataset,
            position: d1Px,
            selection: d3.selectAll([bars[0][1]]),
            component: barPlot
          };

          var closest = barPlot.entityNearest({ x: zeroX - 1, y: d0Px.y });
          TestMethods.assertPlotEntitiesEqual(expected, closest, "closest plot data is on-plot data");

          svg.remove();
        });

      });
    });

    describe("Vertical Bar Plot With Bar Labels", () => {
      var plot: Plottable.Plots.Bar<string, number>;
      var data: any[];
      var dataset: Plottable.Dataset;
      var xScale: Plottable.Scales.Category;
      var yScale: Plottable.Scales.Linear;
      var svg: d3.Selection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        data = [{x: "foo", y: 5}, {x: "bar", y: 640}, {x: "zoo", y: 12345}];
        xScale = new Plottable.Scales.Category();
        yScale = new Plottable.Scales.Linear();
        dataset = new Plottable.Dataset(data);
        plot = new Plottable.Plots.Bar<string, number>();
        plot.addDataset(dataset);
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
      });

      it("bar labels disabled by default", () => {
        plot.renderTo(svg);
        var texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 0, "by default, no texts are drawn");
        svg.remove();
      });

      it("bar labels render properly", () => {
        plot.renderTo(svg);
        plot.labelsEnabled(true);
        var texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "both texts drawn");
        assert.strictEqual(texts[0], "640", "first label is 640");
        assert.strictEqual(texts[1], "12345", "first label is 12345");
        svg.remove();
      });

      it("bar labels hide if bars too skinny", () => {
        plot.labelsEnabled(true);
        plot.renderTo(svg);
        plot.labelFormatter((n: number) => n.toString() + (n === 12345 ? "looong" : ""));
        var texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 0, "no text drawn");
        svg.remove();
      });

      it("formatters are used properly", () => {
        plot.labelsEnabled(true);
        plot.labelFormatter((n: number) => n.toString() + "%");
        plot.renderTo(svg);
        var texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "both texts drawn");
        assert.strictEqual(texts[0], "640%", "first label is 640%");
        assert.strictEqual(texts[1], "12345%", "first label is 12345%");
        svg.remove();
      });

      it("labels are rendered correctly across platforms", () => {
        plot.removeDataset(dataset);
        plot.addDataset(new Plottable.Dataset([{ x: "foo", y: 5 }, { x: "bar", y: 64000000 }, { x: "zoo", y: 12345678 }]));
        plot.labelsEnabled(true);
        plot.renderTo(svg);
        var texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "both texts drawn");
        svg.remove();
      });

      it("bar labels are removed instantly on dataset change", (done) => {
        plot.labelsEnabled(true);
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

    describe("selections()", () => {
      var verticalBarPlot: Plottable.Plots.Bar<string, number>;
      var dataset: Plottable.Dataset;
      var svg: d3.Selection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        dataset = new Plottable.Dataset();
        var xScale = new Plottable.Scales.Category();
        var yScale = new Plottable.Scales.Linear();
        verticalBarPlot = new Plottable.Plots.Bar<string, number>();
        verticalBarPlot.x((d) => d.x, xScale);
        verticalBarPlot.y((d) => d.y, yScale);
      });

      it("retrieves all dataset selections with no args", () => {
        var barData = [{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }];
        verticalBarPlot.addDataset(new Plottable.Dataset(barData));
        verticalBarPlot.renderTo(svg);

        var allBars = verticalBarPlot.selections();
        assert.strictEqual(allBars.size(), 3, "retrieved all bars");

        svg.remove();
      });

      it("retrieves correct selections for supplied Datasets", () => {
        var dataset1 = new Plottable.Dataset([{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }]);
        var dataset2 = new Plottable.Dataset([{ x: "one", y: 5 }, { x: "two", y: 640 }, { x: "three", y: 12345 }]);
        verticalBarPlot.addDataset(dataset1);
        verticalBarPlot.addDataset(dataset2);
        verticalBarPlot.renderTo(svg);

        var allBars = verticalBarPlot.selections([dataset1]);
        assert.strictEqual(allBars.size(), 3, "all bars retrieved");
        var selectionData = allBars.data();
        assert.includeMembers(selectionData, dataset1.data(), "first dataset data in selection data");

        svg.remove();
      });

      it("skips invalid Datasets", () => {
        var dataset1 = new Plottable.Dataset([{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }]);
        var notAddedDataset = new Plottable.Dataset([{ x: "one", y: 5 }, { x: "two", y: 640 }, { x: "three", y: 12345 }]);
        verticalBarPlot.addDataset(dataset1);
        verticalBarPlot.renderTo(svg);

        var allBars = verticalBarPlot.selections([dataset1, notAddedDataset]);
        assert.strictEqual(allBars.size(), 3, "all bars retrieved");
        var selectionData = allBars.data();
        assert.includeMembers(selectionData, dataset1.data(), "first dataset data in selection data");

        svg.remove();
      });

    });

    it("plot auto domain scale to visible points on Category scale", () => {
      var svg = TestMethods.generateSVG(500, 500);
      var xAccessor = (d: any, i: number, dataset: Plottable.Dataset) => d.a;
      var yAccessor = (d: any, i: number, dataset: Plottable.Dataset) => d.b + dataset.metadata().foo;
      var simpleDataset = new Plottable.Dataset([{a: "a", b: 6}, {a: "b", b: 2}, {a: "c", b: -2}, {a: "d", b: -6}], {foo: 0});
      var xScale = new Plottable.Scales.Category();
      var yScale = new Plottable.Scales.Linear();
      var plot = new Plottable.Plots.Bar<string, number>();
      plot.addDataset(simpleDataset);
      plot.x(xAccessor, xScale)
          .y(yAccessor, yScale)
          .renderTo(svg);
      xScale.domain(["b", "c"]);
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has not been adjusted to visible points");
      plot.autorangeMode("y");
      assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points");
      svg.remove();
    });
  });
});
