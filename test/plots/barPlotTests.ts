///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("Bar Plot", () => {

    // HACKHACK #1798: beforeEach being used below
    it("renders correctly with no data", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      let plot = new Plottable.Plots.Bar<number, number>();
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
      let defaultPlot = new Plottable.Plots.Bar<number, number>();
      assert.strictEqual(defaultPlot.orientation(), "vertical", "default Plots.Bar() are vertical");

      let verticalPlot = new Plottable.Plots.Bar<number, number>("vertical");
      assert.strictEqual(verticalPlot.orientation(), "vertical", "vertical Plots.Bar()");

      let horizontalPlot = new Plottable.Plots.Bar<number, number>("horizontal");
      assert.strictEqual(horizontalPlot.orientation(), "horizontal", "horizontal Plots.Bar()");
    });

    it("gets the nearest Entity when any part of the bar is visible (vertical)", () => {
      let SVG_WIDTH = 600;
      let SVG_HEIGHT = 400;
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let xScale = new Plottable.Scales.Category();
      let yScale = new Plottable.Scales.Linear();
      let data = [
        {x: "A", y: 3},
        {x: "B", y: -3},
        {x: "C", y: 0}
      ];
      let dataset = new Plottable.Dataset(data);
      let barPlot = new Plottable.Plots.Bar<string, number>();
      barPlot.addDataset(dataset);
      yScale.domain([-1, 1]);
      barPlot.x((d) => d.x, xScale);
      barPlot.y((d) => d.y, yScale);
      barPlot.renderTo(svg);

      let positiveBar = barPlot.entities()[0];
      let negativeBar = barPlot.entities()[1];
      let baselineBar = barPlot.entities()[2];

      let pointPos = {
        x: xScale.scale("A"),
        y: yScale.scale(0)
      };
      let pointNeg = {
        x: xScale.scale("B"),
        y: yScale.scale(0)
      };
      let pointBaseline = {
        x: xScale.scale("C"),
        y: yScale.scale(0)
      };

      TestMethods.assertEntitiesEqual(barPlot.entityNearest(pointPos), positiveBar,
        "EntityNearest considers vertical bars that extend off the top of a plot");
      TestMethods.assertEntitiesEqual(barPlot.entityNearest(pointNeg), negativeBar,
        "EntityNearest considers vertical bars that extend off the bottom of a plot");
      TestMethods.assertEntitiesEqual(barPlot.entityNearest(pointBaseline), baselineBar,
        "EntityNearest considers vertical bars that don't extend off the baseline");
      svg.remove();
    });

    it("gets the nearest Entity when any part of the bar is visible (horizontal)", () => {
      let SVG_WIDTH = 600;
      let SVG_HEIGHT = 400;
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Category();
      let data = [
        {x: 3, y: "A"},
        {x: -3, y: "B"},
        {x: 0, y: "C"}
      ];
      let dataset = new Plottable.Dataset(data);
      let barPlot = new Plottable.Plots.Bar<number, string>("horizontal");
      barPlot.addDataset(dataset);
      xScale.domain([-1, 1]);
      barPlot.x((d) => d.x, xScale);
      barPlot.y((d) => d.y, yScale);
      barPlot.renderTo(svg);

      let positiveBar = barPlot.entities()[0];
      let negativeBar = barPlot.entities()[1];
      let baselineBar = barPlot.entities()[2];

      let pointPos = {
        x: xScale.scale(0),
        y: yScale.scale("A")
      };
      let pointNeg = {
        x: xScale.scale(0),
        y: yScale.scale("B")
      };
      let pointBaseline = {
        x: xScale.scale(0),
        y: yScale.scale("C")
      };

      TestMethods.assertEntitiesEqual(barPlot.entityNearest(pointPos), positiveBar,
        "EntityNearest considers horizontal bars that extend off the right of a plot");
      TestMethods.assertEntitiesEqual(barPlot.entityNearest(pointNeg), negativeBar,
        "EntityNearest considers horizontal bars that extend off the left of a plot");
      TestMethods.assertEntitiesEqual(barPlot.entityNearest(pointBaseline), baselineBar,
        "EntityNearest considers horizontal bars that don't extend off the baseline");
      svg.remove();
    });

    describe("Vertical Bar Plot", () => {
      let svg: d3.Selection<void>;
      let dataset: Plottable.Dataset;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Linear;
      let barPlot: Plottable.Plots.Bar<string, number>;
      let SVG_WIDTH = 600;
      let SVG_HEIGHT = 400;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scales.Category().domain(["A", "B"]);
        yScale = new Plottable.Scales.Linear();
        let data = [
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
        let renderArea = (<any> barPlot)._renderArea;
        let bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");
        let bar0 = d3.select(bars[0][0]);
        let bar1 = d3.select(bars[0][1]);
        assert.closeTo(TestMethods.numAttr(bar0, "width"), xScale.rangeBand(), 1, "bar0 width is correct");
        assert.closeTo(TestMethods.numAttr(bar1, "width"), xScale.rangeBand(), 1, "bar1 width is correct");
        assert.strictEqual(bar0.attr("height"), "100", "bar0 height is correct");
        assert.strictEqual(bar1.attr("height"), "150", "bar1 height is correct");
        assert.closeTo(TestMethods.numAttr(bar0, "x"), 111, 1, "bar0 x is correct");
        assert.closeTo(TestMethods.numAttr(bar1, "x"), 333, 1, "bar1 x is correct");
        assert.strictEqual(bar0.attr("y"), "100", "bar0 y is correct");
        assert.strictEqual(bar1.attr("y"), "200", "bar1 y is correct");

        let baseline = renderArea.select(".baseline");
        assert.strictEqual(baseline.attr("y1"), "200", "the baseline is in the correct vertical position");
        assert.strictEqual(baseline.attr("y2"), "200", "the baseline is in the correct vertical position");
        assert.strictEqual(baseline.attr("x1"), "0", "the baseline starts at the edge of the chart");
        assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH), "the baseline ends at the edge of the chart");
        svg.remove();
      });

      it("baseline value can be changed; barPlot updates appropriately", () => {
        barPlot.baselineValue(-1);

        let renderArea = (<any> barPlot)._renderArea;
        let bars = renderArea.selectAll("rect");
        let bar0 = d3.select(bars[0][0]);
        let bar1 = d3.select(bars[0][1]);
        assert.strictEqual(bar0.attr("height"), "200", "bar0 height is correct");
        assert.strictEqual(bar1.attr("height"), "50", "bar1 height is correct");
        assert.strictEqual(bar0.attr("y"), "100", "bar0 y is correct");
        assert.strictEqual(bar1.attr("y"), "300", "bar1 y is correct");

        let baseline = renderArea.select(".baseline");
        assert.strictEqual(baseline.attr("y1"), "300", "the baseline is in the correct vertical position");
        assert.strictEqual(baseline.attr("y2"), "300", "the baseline is in the correct vertical position");
        assert.strictEqual(baseline.attr("x1"), "0", "the baseline starts at the edge of the chart");
        assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH), "the baseline ends at the edge of the chart");
        svg.remove();
      });

      it("don't show points from outside of domain", () => {
        xScale.domain(["C"]);
        let bars = (<any> barPlot)._renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 0, "no bars have been rendered");
        svg.remove();
      });

      it("entitiesAt()", () => {
        let bars = barPlot.entitiesAt({x: 155, y: 150}); // in the middle of bar 0

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

        let bars = barPlot.entitiesIn({min: 155, max: 455}, {min: 150, max: 150});
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
            let entities = barPlot.entities();
            entities.forEach((entity) => {
              let barSelection = entity.selection;
              let pixelPointY = entity.position.y;
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
        let bars: d3.Selection<void>;
        let zeroY: number;
        let d0: any, d1: any;
        let d0Px: Plottable.Point, d1Px: Plottable.Point;

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
          let expected: Plottable.Plots.PlotEntity = {
            datum: d0,
            index: 0,
            dataset: dataset,
            position: d0Px,
            selection: d3.selectAll([bars[0][0]]),
            component: barPlot
          };

          let closest = barPlot.entityNearest({ x: d0Px.x, y: d0Px.y + 1 });
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

          let expected: Plottable.Plots.PlotEntity = {
            datum: d1,
            index: 1,
            dataset: dataset,
            position: d1Px,
            selection: d3.selectAll([bars[0][1]]),
            component: barPlot
          };

          let closest = barPlot.entityNearest({ x: d0Px.x, y: zeroY + 1 });
          TestMethods.assertPlotEntitiesEqual(closest, expected, "nearest Entity is the visible one");

          svg.remove();
        });

        it("returns undefined if no Entities are visible", () => {
          barPlot = new Plottable.Plots.Bar<string, number>();
          let closest = barPlot.entityNearest({ x: d0Px.x, y: d0Px.y });
          assert.isUndefined(closest, "returns undefined if no Entity can be found");
          svg.remove();
        });
      });
    });

    describe("Vertical Bar Plot modified log scale", () => {
      let svg: d3.Selection<void>;
      let dataset: Plottable.Dataset;
      let xScale: Plottable.Scales.ModifiedLog;
      let yScale: Plottable.Scales.Linear;
      let barPlot: Plottable.Plots.Bar<number, number>;
      let SVG_WIDTH = 600;
      let SVG_HEIGHT = 400;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scales.ModifiedLog();
        yScale = new Plottable.Scales.Linear();
        let data = [
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
        assert.strictEqual(
          (<any>barPlot)._barPixelWidth,
          (xScale.scale(10) - xScale.scale(2)) * (<any>Plottable.Plots.Bar)._BAR_WIDTH_RATIO,
          "the bar width is equal to the minimum distance between two bars minus the padding between bars"
        );
        svg.remove();
      });

      it("bar widths are equal to barPixelWidth", () => {
        let renderArea = (<any> barPlot)._renderArea;
        let bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");

        let barPixelWidth = (<any> barPlot)._barPixelWidth;
        let bar0 = d3.select(bars[0][0]);
        let bar1 = d3.select(bars[0][1]);
        let bar2 = d3.select(bars[0][2]);
        assert.closeTo(TestMethods.numAttr(bar0, "width"), barPixelWidth, 0.1, "bar0 width is correct");
        assert.closeTo(TestMethods.numAttr(bar1, "width"), barPixelWidth, 0.1, "bar1 width is correct");
        assert.closeTo(TestMethods.numAttr(bar2, "width"), barPixelWidth, 0.1, "bar2 width is correct");
        svg.remove();
      });

      it("autodomaining takes into account the barPixelWidth", () => {
        xScale.autoDomain();
        yScale.autoDomain();
        xScale.padProportion(0);
        yScale.padProportion(0);

        let barPixelWidth = (<any>barPlot)._barPixelWidth;

        let left = xScale.invert(xScale.scale(2) - barPixelWidth / 2);
        let right = xScale.invert(xScale.scale(100) + barPixelWidth / 2);

        assert.closeTo(xScale.domain()[0], left, 0.0001, "Left side domain includes the first bar");
        assert.closeTo(xScale.domain()[1], right, 0.0001, "Right side includes the entire third bar");

        svg.remove();
      });
    });

    describe("Vertical Bar Plot linear scale", () => {
      let svg: d3.Selection<void>;
      let dataset: Plottable.Dataset;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let barPlot: Plottable.Plots.Bar<number, number>;
      let SVG_WIDTH = 600;
      let SVG_HEIGHT = 400;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        let data = [
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
        let errMsg = /TypeError: Cannot read property \'valueOf\' of undefined/;
        (<any> assert).doesNotThrow(() => barPlot.x((d) => d.a, xScale), errMsg, "barPixelWidth does not crash on invalid values");
        svg.remove();
      });

      it("bar width takes an appropriate value", () => {
        assert.strictEqual((<any> barPlot)._barPixelWidth, (xScale.scale(10) - xScale.scale(2)) * 0.95);
        svg.remove();
      });

      it("bar widths are equal to barPixelWidth", () => {
        let renderArea = (<any> barPlot)._renderArea;
        let bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");

        let barPixelWidth = (<any> barPlot)._barPixelWidth;
        let bar0 = d3.select(bars[0][0]);
        let bar1 = d3.select(bars[0][1]);
        let bar2 = d3.select(bars[0][2]);
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
        let expectedBarPixelWidth = (xScale.scale(5) - xScale.scale(2)) * 0.95;
        assert.closeTo((<any> barPlot)._barPixelWidth, expectedBarPixelWidth, 0.1, "bar width uses closest sorted x values");
        svg.remove();
      });
    });

    describe("Vertical Bar Plot time scale", () => {
      let svg: d3.Selection<void>;
      let barPlot: Plottable.Plots.Bar<Date, number>;
      let xScale: Plottable.Scales.Time;

      beforeEach(() => {
        svg = TestMethods.generateSVG(600, 400);
        let data = [{ x: "12/01/92", y: 0, type: "a" },
          { x: "12/01/93", y: 1, type: "a" },
          { x: "12/01/94", y: 1, type: "a" },
          { x: "12/01/95", y: 2, type: "a" },
          { x: "12/01/96", y: 2, type: "a" },
          { x: "12/01/97", y: 2, type: "a" }];
        xScale = new Plottable.Scales.Time();
        let yScale = new Plottable.Scales.Linear();
        barPlot = new Plottable.Plots.Bar<Date, number>();
        barPlot.addDataset(new Plottable.Dataset(data));
        barPlot.x((d: any) => d3.time.format("%m/%d/%y").parse(d.x), xScale)
               .y((d) => d.y, yScale)
               .renderTo(svg);
      });

      it("bar width takes an appropriate value", () => {
        let timeFormatter = d3.time.format("%m/%d/%y");
        let expectedBarWidth = (xScale.scale(timeFormatter.parse("12/01/94")) - xScale.scale(timeFormatter.parse("12/01/93"))) * 0.95;
        assert.closeTo((<any> barPlot)._barPixelWidth, expectedBarWidth, 0.1, "width is difference between two dates");
        svg.remove();
      });

    });

    describe("Horizontal Bar Plot", () => {
      let svg: d3.Selection<void>;
      let dataset: Plottable.Dataset;
      let yScale: Plottable.Scales.Category;
      let xScale: Plottable.Scales.Linear;
      let barPlot: Plottable.Plots.Bar<number, string>;
      let SVG_WIDTH = 600;
      let SVG_HEIGHT = 400;
      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        yScale = new Plottable.Scales.Category().domain(["A", "B"]);
        xScale = new Plottable.Scales.Linear();
        xScale.domain([-3, 3]);

        let data = [
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
        let renderArea = (<any> barPlot)._renderArea;
        let bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");
        let bar0 = d3.select(bars[0][0]);
        let bar1 = d3.select(bars[0][1]);
        assert.closeTo(TestMethods.numAttr(bar0, "height"), yScale.rangeBand(), 1, "bar0 height is correct");
        assert.closeTo(TestMethods.numAttr(bar1, "height"), yScale.rangeBand(), 1, "bar1 height is correct");
        assert.strictEqual(bar0.attr("width"), "100", "bar0 width is correct");
        assert.strictEqual(bar1.attr("width"), "150", "bar1 width is correct");
        assert.closeTo(TestMethods.numAttr(bar0, "y"), 74, 1, "bar0 y is correct");
        assert.closeTo(TestMethods.numAttr(bar1, "y"), 222, 1, "bar1 y is correct");
        assert.strictEqual(bar0.attr("x"), "300", "bar0 x is correct");
        assert.strictEqual(bar1.attr("x"), "150", "bar1 x is correct");

        let baseline = renderArea.select(".baseline");
        assert.strictEqual(baseline.attr("x1"), "300", "the baseline is in the correct horizontal position");
        assert.strictEqual(baseline.attr("x2"), "300", "the baseline is in the correct horizontal position");
        assert.strictEqual(baseline.attr("y1"), "0", "the baseline starts at the top of the chart");
        assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT), "the baseline ends at the bottom of the chart");
        svg.remove();
      });

      it("baseline value can be changed; barPlot updates appropriately", () => {
        barPlot.baselineValue(-1);

        let renderArea = (<any> barPlot)._renderArea;
        let bars = renderArea.selectAll("rect");
        let bar0 = d3.select(bars[0][0]);
        let bar1 = d3.select(bars[0][1]);
        assert.strictEqual(bar0.attr("width"), "200", "bar0 width is correct");
        assert.strictEqual(bar1.attr("width"), "50", "bar1 width is correct");
        assert.strictEqual(bar0.attr("x"), "200", "bar0 x is correct");
        assert.strictEqual(bar1.attr("x"), "150", "bar1 x is correct");

        let baseline = renderArea.select(".baseline");
        assert.strictEqual(baseline.attr("x1"), "200", "the baseline is in the correct horizontal position");
        assert.strictEqual(baseline.attr("x2"), "200", "the baseline is in the correct horizontal position");
        assert.strictEqual(baseline.attr("y1"), "0", "the baseline starts at the top of the chart");
        assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT), "the baseline ends at the bottom of the chart");
        svg.remove();
      });

      it("width projector may be overwritten, and calling project queues rerender", () => {
        let bars = (<any> barPlot)._renderArea.selectAll("rect");
        let bar0 = d3.select(bars[0][0]);
        let bar1 = d3.select(bars[0][1]);
        let bar0y = bar0.data()[0].y;
        let bar1y = bar1.data()[0].y;
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
            let entities = barPlot.entities();
            entities.forEach((entity) => {
              let barSelection = entity.selection;
              let pixelPointX = entity.position.x;
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
        let bars: d3.Selection<void>;
        let zeroX: number;
        let d0: any, d1: any;
        let d0Px: Plottable.Point, d1Px: Plottable.Point;

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
          let expected: Plottable.Plots.PlotEntity = {
            datum: d0,
            index: 0,
            dataset: dataset,
            position: d0Px,
            selection: d3.selectAll([bars[0][0]]),
            component: barPlot
          };

          let closest = barPlot.entityNearest({ x: d0Px.x - 1, y: d0Px.y });
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
          let expected: Plottable.Plots.PlotEntity = {
            datum: d1,
            index: 1,
            dataset: dataset,
            position: d1Px,
            selection: d3.selectAll([bars[0][1]]),
            component: barPlot
          };

          let closest = barPlot.entityNearest({ x: zeroX - 1, y: d0Px.y });
          TestMethods.assertPlotEntitiesEqual(expected, closest, "closest plot data is on-plot data");

          svg.remove();
        });
      });
    });

    describe("Horizontal Bar Plot With Bar Labels", () => {
      let svg: d3.Selection<void>;
      let yScale: Plottable.Scales.Linear;
      let xScale: Plottable.Scales.Linear;
      let barPlot: Plottable.Plots.Bar<number, number>;
      beforeEach(() => {
        svg = TestMethods.generateSVG(600, 400);
        yScale = new Plottable.Scales.Linear();
        xScale = new Plottable.Scales.Linear();

        let data = [
          {y: 1, x: -1.5},
          {y: 2, x: 100}
        ];

        barPlot = new Plottable.Plots.Bar<number, number>(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
        barPlot.addDataset(new Plottable.Dataset(data));
        barPlot.x((d) => d.x, xScale);
        barPlot.y((d) => d.y, yScale);
        barPlot.labelsEnabled(true);
        barPlot.renderTo(svg);
      });

      it("hides labels properly on the right", () => {
        xScale.domainMax(0.95);
        let texts = svg.selectAll("text");

        assert.strictEqual(texts.size(), 2, "There should be two labels rendered");

        let label1 = d3.select(texts[0][0]);
        let label2 = d3.select(texts[0][1]);

        assert.include(["visible", "inherit"], label1.style("visibility"), "label 1 is visible");
        assert.strictEqual(label2.style("visibility"), "hidden", "label 2 is not visible");

        svg.remove();
      });

      it("hides labels properly on the left", () => {
        xScale.domainMin(-1.4);
        let texts = svg.selectAll("text");

        assert.strictEqual(texts.size(), 2, "There should be two labels rendered");

        let label1 = d3.select(texts[0][0]);
        let label2 = d3.select(texts[0][1]);

        assert.strictEqual(label1.style("visibility"), "hidden", "label 2 is not visible");
        assert.include(["visible", "inherit"], label2.style("visibility"), "label 1 is visible");

        svg.remove();
      });

      it("shows both inner and outer labels", () => {
        barPlot.renderTo(svg);

        let texts = svg.selectAll("text");
        assert.strictEqual(texts.size(), 2, "There should be two labels rendered");

        let offBarLabelCount = d3.selectAll(".off-bar-label")[0].length;
        assert.strictEqual(offBarLabelCount, 1, "There should be 1 labels rendered outside the bar");

        let onBarLabelCount = d3.selectAll(".on-bar-label")[0].length;
        assert.strictEqual(onBarLabelCount, 1, "There should be 1 labels rendered inside the bar");
        svg.remove();
      });

      it("hides labels that are partially cut off in y", () => {
        yScale.domain([1, 2]);
        let texts = barPlot.content().selectAll("text");

        assert.strictEqual(texts.size(), 2, "There should be two labels rendered");

        texts.each(function(d, i) {
          let textBounding = (<Element> this).getBoundingClientRect();
          let svgBounding = (<Element> barPlot.background().node()).getBoundingClientRect();
          let isLabelCutOff = (textBounding.top < svgBounding.top && textBounding.bottom > svgBounding.top)
            || (textBounding.top < svgBounding.bottom && textBounding.bottom > svgBounding.bottom);
          assert.isTrue(isLabelCutOff, `label ${i} is partially cut off`);
          assert.strictEqual(d3.select(this).style("visibility"), "hidden", `label ${i} is not visible`);
        });
        svg.remove();
      });
    });

    describe("Horizontal Bar Plot extent calculation", () => {

      let svg: d3.Selection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Bar<number, number>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();

        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();

        plot = new Plottable.Plots.Bar<number, number>(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
      });

      it("pads the domain in the correct direction", () => {
        let data = Array.apply(null, Array(10)).map((d: any, i: number) => {
          return { x: i + 1, y: i + 1 };
        });
        plot.addDataset(new Plottable.Dataset(data));
        plot.renderTo(svg);

        assert.operator(yScale.domain()[0], "<", data[0].y, "lower end of the domain is padded");
        assert.operator(yScale.domain()[1], ">", data[data.length - 1].y, "higher end of the domain is padded");

        svg.remove();
      });

      it("computes the correct extent when autoDomain()-ing right after render", () => {
        let data = Array.apply(null, Array(10)).map((d: any, i: number) => {
          return { x: i + 1, y: i + 1 };
        });
        plot.addDataset(new Plottable.Dataset(data));
        plot.renderTo(svg);

        let initialYScaleDomain = yScale.domain();
        yScale.autoDomain();
        assert.deepEqual(initialYScaleDomain, yScale.domain(), "The domain did not change");

        svg.remove();
      });
    });

    describe("Vertical Bar Plot With Bar Labels", () => {
      let plot: Plottable.Plots.Bar<string, number>;
      let data: any[];
      let dataset: Plottable.Dataset;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Linear;
      let svg: d3.Selection<void>;

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
        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 0, "by default, no texts are drawn");
        svg.remove();
      });

      it("bar labels render properly", () => {
        plot.renderTo(svg);
        plot.labelsEnabled(true);
        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 3, "all texts drawn");
        assert.strictEqual(texts[0], "5", "first label is 5");
        assert.strictEqual(texts[1], "640", "first label is 640");
        assert.strictEqual(texts[2], "12345", "first label is 12345");
        svg.remove();
      });

      it("bar labels hide if bars too skinny", () => {
        plot.labelsEnabled(true);
        plot.renderTo(svg);
        plot.labelFormatter((n: number) => n.toString() + (n === 12345 ? "looong" : ""));
        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 0, "no text drawn");
        svg.remove();
      });

      it("formatters are used properly", () => {
        plot.labelsEnabled(true);
        plot.labelFormatter((n: number) => n.toString() + "%");
        plot.renderTo(svg);
        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 3, "all texts drawn");
        assert.strictEqual(texts[0], "5%", "first label is 5%");
        assert.strictEqual(texts[1], "640%", "first label is 640%");
        assert.strictEqual(texts[2], "12345%", "first label is 12345%");
        svg.remove();
      });

      it("bar labels are shown inside or outside the bar as appropriate", () => {
        plot.labelsEnabled(true);
        plot.renderTo(svg);

        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 3, "both texts drawn");

        let offBarLabelCount = d3.selectAll(".off-bar-label")[0].length;
        assert.strictEqual(offBarLabelCount, 1, "There should be 1 label rendered outside the bar");

        let onBarLabelCount = d3.selectAll(".on-bar-label")[0].length;
        assert.strictEqual(onBarLabelCount, 2, "There should be 2 labels rendered inside the bar");
        svg.remove();
      });

      it("bar labels are removed instantly on dataset change", (done) => {
        plot.labelsEnabled(true);
        plot.renderTo(svg);
        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 3, "all texts drawn");
        let originalDrawLabels = (<any> plot)._drawLabels;
        let called = false;
        (<any> plot)._drawLabels = () => {
          if (!called) {
            originalDrawLabels.apply(plot);
            texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
            assert.lengthOf(texts, 3, "texts were repopulated by drawLabels after the update");
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

    describe("Vertical Bar Plot label visibility", () => {
      let svg: d3.Selection<void>;
      let plot: Plottable.Plots.Bar<number, number>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        let data = [
          { x: 1, y: 10.1 },
          { x: 2, y: 5.3 },
          { x: 3, y: 2.8 }
        ];
        plot = new Plottable.Plots.Bar<number, number>();
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
        plot.addDataset(new Plottable.Dataset(data));
        plot.labelsEnabled(true);
        plot.renderTo(svg);
      });

      it("hides labels outside of the visible render area (horizontal)", () => {
        xScale.domain([1, 3]);

        let texts = svg.selectAll("text");
        assert.strictEqual(texts.size(), plot.datasets()[0].data().length, "One label rendered for each piece of data");

        let label1 = d3.select(texts[0][0]);
        let label2 = d3.select(texts[0][1]);
        let label3 = d3.select(texts[0][2]);

        assert.strictEqual(label1.style("visibility"), "hidden", "Left label is cut off by the margin");
        assert.include(["visible", "inherit"], label2.style("visibility"), "Middle label should still show");
        assert.strictEqual(label3.style("visibility"), "hidden", "Right label is cut off by the margin");

        svg.remove();
      });

      it("hides labels outside of the visible render area (vertical)", () => {
        yScale.domain([2.5, 11]);

        let texts = svg.selectAll("text");
        assert.strictEqual(texts.size(), plot.datasets()[0].data().length, "One label rendered for each piece of data");

        let label1 = d3.select(texts[0][0]);
        let label2 = d3.select(texts[0][1]);
        let label3 = d3.select(texts[0][2]);

        assert.include(["visible", "inherit"], label1.style("visibility"), "Left label should still show");
        assert.include(["visible", "inherit"], label2.style("visibility"), "Middle label should still show");
        assert.strictEqual(label3.style("visibility"), "hidden", "Right label is cut off. bar is too short");
        svg.remove();
      });
    });

    describe("selections()", () => {
      let verticalBarPlot: Plottable.Plots.Bar<string, number>;
      let dataset: Plottable.Dataset;
      let svg: d3.Selection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        dataset = new Plottable.Dataset();
        let xScale = new Plottable.Scales.Category();
        let yScale = new Plottable.Scales.Linear();
        verticalBarPlot = new Plottable.Plots.Bar<string, number>();
        verticalBarPlot.x((d) => d.x, xScale);
        verticalBarPlot.y((d) => d.y, yScale);
      });

      it("retrieves all dataset selections with no args", () => {
        let barData = [{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }];
        verticalBarPlot.addDataset(new Plottable.Dataset(barData));
        verticalBarPlot.renderTo(svg);

        let allBars = verticalBarPlot.selections();
        assert.strictEqual(allBars.size(), 3, "retrieved all bars");

        svg.remove();
      });

      it("retrieves correct selections for supplied Datasets", () => {
        let dataset1 = new Plottable.Dataset([{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }]);
        let dataset2 = new Plottable.Dataset([{ x: "one", y: 5 }, { x: "two", y: 640 }, { x: "three", y: 12345 }]);
        verticalBarPlot.addDataset(dataset1);
        verticalBarPlot.addDataset(dataset2);
        verticalBarPlot.renderTo(svg);

        let allBars = verticalBarPlot.selections([dataset1]);
        assert.strictEqual(allBars.size(), 3, "all bars retrieved");
        let selectionData = allBars.data();
        assert.includeMembers(selectionData, dataset1.data(), "first dataset data in selection data");

        svg.remove();
      });

      it("skips invalid Datasets", () => {
        let dataset1 = new Plottable.Dataset([{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }]);
        let notAddedDataset = new Plottable.Dataset([{ x: "one", y: 5 }, { x: "two", y: 640 }, { x: "three", y: 12345 }]);
        verticalBarPlot.addDataset(dataset1);
        verticalBarPlot.renderTo(svg);

        let allBars = verticalBarPlot.selections([dataset1, notAddedDataset]);
        assert.strictEqual(allBars.size(), 3, "all bars retrieved");
        let selectionData = allBars.data();
        assert.includeMembers(selectionData, dataset1.data(), "first dataset data in selection data");

        svg.remove();
      });

    });

    it("plot auto domain scale to visible points on Category scale", () => {
      let svg = TestMethods.generateSVG(500, 500);
      let xAccessor = (d: any, i: number, dataset: Plottable.Dataset) => d.a;
      let yAccessor = (d: any, i: number, dataset: Plottable.Dataset) => d.b + dataset.metadata().foo;
      let simpleDataset = new Plottable.Dataset([{a: "a", b: 6}, {a: "b", b: 2}, {a: "c", b: -2}, {a: "d", b: -6}], {foo: 0});
      let xScale = new Plottable.Scales.Category();
      let yScale = new Plottable.Scales.Linear();
      let plot = new Plottable.Plots.Bar<string, number>();
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
