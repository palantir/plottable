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

          it("entities().position returns the position of data point", () => {
            let entities = barPlot.entities();
            entities.forEach((entity) => {
              let dataX = barPlot.x().scale.scale(entity.datum.x);
              let dataY = barPlot.y().scale.scale(entity.datum.y);
              assert.strictEqual(dataX, entity.position.x, "entities().position.x should equal to scaled x value");
              assert.strictEqual(dataY, entity.position.y, "entities().position.y should equal to scaled y value");
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
      let DEFAULT_DOMAIN = [-5, 5];
      let barPlot: Plottable.Plots.Bar<number, number>;
      let dataset: Plottable.Dataset;

      let getCenterOfText = (textNode: SVGElement) => {
        let plotBoundingClientRect = (<SVGElement> barPlot.background().node()).getBoundingClientRect();
        let labelBoundingClientRect = textNode.getBoundingClientRect();

        return {
          x: (labelBoundingClientRect.left + labelBoundingClientRect.right) / 2 - plotBoundingClientRect.left,
          y: (labelBoundingClientRect.top + labelBoundingClientRect.bottom) / 2 - plotBoundingClientRect.top
        };
      };

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        yScale = new Plottable.Scales.Linear();
        yScale.domain(DEFAULT_DOMAIN);
        xScale = new Plottable.Scales.Linear();
        xScale.domain(DEFAULT_DOMAIN);

        let data = [
          { y: -4, x: -4 },
          { y: -2, x: -0.1},
          { y: 0, x: 0 },
          { y: 2, x: 0.1 },
          { y: 4, x: 4 }
        ];

        barPlot = new Plottable.Plots.Bar<number, number>(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
        dataset = new Plottable.Dataset(data);
        barPlot.addDataset(dataset);
        barPlot.x((d) => d.x, xScale);
        barPlot.y((d) => d.y, yScale);
        barPlot.labelsEnabled(true);
        barPlot.renderTo(svg);
      });

      it("shows labels inside or outside the bar as appropriate", () => {
        barPlot.renderTo(svg);

        let labels = barPlot.content().selectAll(".on-bar-label, .off-bar-label");
        assert.strictEqual(labels.size(), dataset.data().length, "one label drawn per datum");

        let bars = barPlot.content().select(".bar-area").selectAll("rect");
        labels.each((d, i) => {
          let labelBoundingClientRect = (<SVGElement> labels[0][i]).getBoundingClientRect();
          let barBoundingClientRect = (<SVGElement> bars[0][i]).getBoundingClientRect();
          if (labelBoundingClientRect.width > barBoundingClientRect.width) {
            assert.isTrue(d3.select(labels[0][i]).classed("off-bar-label"),
              `label with index ${i} doesn't fit and carries the off-bar class`);
          } else {
            assert.isTrue(d3.select(labels[0][i]).classed("on-bar-label"),
              `label with index ${i} fits and carries the on-bar class`);
          }
        });

        svg.remove();
      });

      it("hides labels cut off by the right edge", () => {
        barPlot.labelsEnabled(true);
        let labels = barPlot.content().selectAll(".on-bar-label, .off-bar-label");
        let centerXValues = labels.select("text")[0].map((textNode) => xScale.invert(getCenterOfText(<SVGElement> textNode).x));
        let wasOriginallyOnBar = labels[0].map((label) => d3.select(label).classed("on-bar-label"));

        dataset.data().forEach((d, i) => {
          let centerXValue = centerXValues[i];
          xScale.domain([centerXValue - (DEFAULT_DOMAIN[1] - DEFAULT_DOMAIN[0]), centerXValue]);
          labels = barPlot.content().selectAll(".on-bar-label, .off-bar-label"); // re-select after rendering
          if (wasOriginallyOnBar[i] && d.x < 0) {
            assert.isTrue(d3.select(labels[0][i]).classed("off-bar-label"),
              `cut off on-bar label was switched to off-bar (index ${i})`);
          } else {
            let textNode = labels.select("text")[0][i];
            assert.strictEqual(d3.select(textNode).style("visibility"), "hidden", `label for bar with index ${i} is hidden`);
          }
        });
        svg.remove();
      });

      it("hides labels cut off by the left edge", () => {
        barPlot.labelsEnabled(true);
        let labels = barPlot.content().selectAll(".on-bar-label, .off-bar-label");
        let centerXValues = labels.select("text")[0].map((textNode) => xScale.invert(getCenterOfText(<SVGElement> textNode).x));
        let wasOriginallyOnBar = labels[0].map((label) => d3.select(label).classed("on-bar-label"));

        dataset.data().forEach((d, i) => {
          let centerXValue = centerXValues[i];
          xScale.domain([centerXValue, centerXValue + (DEFAULT_DOMAIN[1] - DEFAULT_DOMAIN[0])]);
          labels = barPlot.content().selectAll(".on-bar-label, .off-bar-label"); // re-select after rendering
          if (wasOriginallyOnBar[i] && d.x > 0) {
            assert.isTrue(d3.select(labels[0][i]).classed("off-bar-label"),
              `cut off on-bar label was switched to off-bar (index ${i})`);
          } else {
            let textNode = labels.select("text")[0][i];
            assert.strictEqual(d3.select(textNode).style("visibility"), "hidden", `label for bar with index ${i} is hidden`);
          }
        });
        svg.remove();
      });

      it("hides labels cut off by the top edge", () => {
        dataset.data().forEach((d, i) => {
          let texts = svg.selectAll("text");
          let centerOfText = getCenterOfText(<SVGElement> texts[0][i]);
          let centerYValue = yScale.invert(centerOfText.y);
          yScale.domain([centerYValue - (DEFAULT_DOMAIN[1] - DEFAULT_DOMAIN[0]), centerYValue]);

          texts = svg.selectAll("text"); // re-select after rendering
          assert.strictEqual(d3.select(texts[0][i]).style("visibility"), "hidden", `label for bar with index ${i} is hidden`);
        });
        svg.remove();
      });

      it("hides labels cut off by the bottom edge", () => {
        dataset.data().forEach((d, i) => {
          let texts = svg.selectAll("text");
          let centerOfText = getCenterOfText(<SVGElement> texts[0][i]);
          let centerYValue = yScale.invert(centerOfText.y);
          yScale.domain([centerYValue, centerYValue + (DEFAULT_DOMAIN[1] - DEFAULT_DOMAIN[0])]);

          texts = svg.selectAll("text"); // re-select after rendering
          assert.strictEqual(d3.select(texts[0][i]).style("visibility"), "hidden", `label for bar with index ${i} is hidden`);
        });
        svg.remove();
      });

      it("shows labels for bars with value = baseline on the \"positive\" side of the baseline", () => {
        let zeroOnlyData = [ { x: 0, y: 0 } ];
        dataset.data(zeroOnlyData);
        barPlot.labelsEnabled(true);
        barPlot.renderTo(svg);

        let labels = barPlot.content().selectAll("text");
        assert.strictEqual(labels.size(), 1, "one label drawn for data point");
        let labelPosition = (<SVGElement> labels.node()).getBoundingClientRect().left + window.Pixel_CloseTo_Requirement;
        let linePosition = (<SVGElement> barPlot.content().select(".baseline").node()).getBoundingClientRect().right;
        assert.operator(labelPosition, ">=", linePosition, "label with value=baseline is drawn to the right of the baseline");
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
      let svg: d3.Selection<void>;
      let yScale: Plottable.Scales.Linear;
      let xScale: Plottable.Scales.Linear;
      let DEFAULT_DOMAIN = [-5, 5];
      let barPlot: Plottable.Plots.Bar<number, number>;
      let dataset: Plottable.Dataset;

      let getCenterOfText = (textNode: SVGElement) => {
        let plotBoundingClientRect = (<SVGElement> barPlot.background().node()).getBoundingClientRect();
        let labelBoundingClientRect = textNode.getBoundingClientRect();

        return {
          x: (labelBoundingClientRect.left + labelBoundingClientRect.right) / 2 - plotBoundingClientRect.left,
          y: (labelBoundingClientRect.top + labelBoundingClientRect.bottom) / 2 - plotBoundingClientRect.top
        };
      };

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        yScale = new Plottable.Scales.Linear();
        yScale.domain(DEFAULT_DOMAIN);
        xScale = new Plottable.Scales.Linear();
        xScale.domain(DEFAULT_DOMAIN);

        let data = [
          { x: -4, y: -4 },
          { x: -2, y: -0.1},
          { x: 0, y: 0 },
          { x: 2, y: 0.1 },
          { x: 4, y: 4 }
        ];

        barPlot = new Plottable.Plots.Bar<number, number>(Plottable.Plots.Bar.ORIENTATION_VERTICAL);
        dataset = new Plottable.Dataset(data);
        barPlot.addDataset(dataset);
        barPlot.x((d) => d.x, xScale);
        barPlot.y((d) => d.y, yScale);
        barPlot.renderTo(svg);
      });

      it("bar labels disabled by default", () => {
        barPlot.renderTo(svg);
        let texts = barPlot.content().selectAll("text");
        assert.strictEqual(texts.size(), 0, "by default, no texts are drawn");
        svg.remove();
      });

      it("bar labels render properly", () => {
        barPlot.renderTo(svg);
        barPlot.labelsEnabled(true);
        let texts = barPlot.content().selectAll("text");
        let data = dataset.data();
        assert.strictEqual(texts.size(), data.length, "one label drawn per datum");
        texts.each(function(d, i) {
          assert.strictEqual(d3.select(this).text(), data[i].y.toString(), `by default, label text is the bar's value (index ${i})`);
        });
        svg.remove();
      });

      it("bar labels hide if bars too skinny", () => {
        svg.attr("width", 100);
        barPlot.labelsEnabled(true);
        barPlot.renderTo(svg);
        let texts = barPlot.content().selectAll("text");
        assert.strictEqual(texts.size(), 0, "no labels drawn");
        svg.remove();
      });

      it("formatters are used properly", () => {
        barPlot.labelsEnabled(true);
        let formatter = (n: number) => `${n}%`;
        barPlot.labelFormatter(formatter);
        barPlot.renderTo(svg);
        let texts = barPlot.content().selectAll("text");
        assert.strictEqual(texts.size(), dataset.data().length, "one label drawn per datum");
        let expectedTexts = dataset.data().map((d) => formatter(d.y));
        texts.each(function(d, i) {
          assert.strictEqual(d3.select(this).text(), expectedTexts[i], `formatter is applied to the displayed value (index ${i})`);
        });
        svg.remove();
      });

      it("shows labels inside or outside the bar as appropriate", () => {
        barPlot.labelsEnabled(true);
        barPlot.renderTo(svg);

        let labels = barPlot.content().selectAll(".on-bar-label, .off-bar-label");
        assert.strictEqual(labels.size(), dataset.data().length, "one label drawn per datum");

        let bars = barPlot.content().select(".bar-area").selectAll("rect");
        labels.each((d, i) => {
          let labelBoundingClientRect = (<SVGElement> labels[0][i]).getBoundingClientRect();
          let barBoundingClientRect = (<SVGElement> bars[0][i]).getBoundingClientRect();
          if (labelBoundingClientRect.height > barBoundingClientRect.height) {
            assert.isTrue(d3.select(labels[0][i]).classed("off-bar-label"),
              `label with index ${i} doesn't fit and carries the off-bar class`);
          } else {
            assert.isTrue(d3.select(labels[0][i]).classed("on-bar-label"),
              `label with index ${i} fits and carries the on-bar class`);
          }
        });

        svg.remove();
      });

      it("shows labels for bars with value = baseline on the \"positive\" side of the baseline", () => {
        let zeroOnlyData = [ { x: 0, y: 0 }];
        dataset.data(zeroOnlyData);
        barPlot.labelsEnabled(true);
        barPlot.renderTo(svg);

        let labels = barPlot.content().selectAll("text");
        assert.strictEqual(labels.size(), 1, "one label drawn for data point");
        let labelPosition = (<SVGElement> labels.node()).getBoundingClientRect().bottom - window.Pixel_CloseTo_Requirement;
        let linePosition = (<SVGElement> barPlot.content().select(".baseline").node()).getBoundingClientRect().top;
        assert.operator(labelPosition, "<=", linePosition, "label with value=baseline is drawn above the baseline");
        svg.remove();
      });

      it("bar labels are removed instantly on dataset change", (done) => {
        barPlot.labelsEnabled(true);
        barPlot.renderTo(svg);
        let texts = barPlot.content().selectAll("text");
        assert.strictEqual(texts.size(), dataset.data().length, "one label drawn per datum");
        let originalDrawLabels = (<any> barPlot)._drawLabels;
        let called = false;
        (<any> barPlot)._drawLabels = () => {
          if (!called) {
            originalDrawLabels.apply(barPlot);
            texts = barPlot.content().selectAll("text");
            assert.strictEqual(texts.size(), dataset.data().length, "texts were repopulated by drawLabels after the update");
            svg.remove();
            called = true; // for some reason, in phantomJS, `done` was being called multiple times and this caused the test to fail.
            done();
          }
        };
        dataset.data(dataset.data());
        texts = barPlot.content().selectAll("text");
        assert.strictEqual(texts.size(), 0, "texts were immediately removed");
      });

      it("hides labels cut off by the right edge", () => {
        barPlot.labelsEnabled(true);
        dataset.data().forEach((d, i) => {
          let texts = svg.selectAll("text");
          let centerOfText = getCenterOfText(<SVGElement> texts[0][i]);
          let centerXValue = xScale.invert(centerOfText.x);
          xScale.domain([centerXValue - (DEFAULT_DOMAIN[1] - DEFAULT_DOMAIN[0]), centerXValue]);

          texts = svg.selectAll("text"); // re-select after rendering
          assert.strictEqual(d3.select(texts[0][i]).style("visibility"), "hidden", `label for bar with index ${i} is hidden`);
        });
        svg.remove();
      });

      it("hides labels cut off by the left edge", () => {
        barPlot.labelsEnabled(true);
        dataset.data().forEach((d, i) => {
          let texts = svg.selectAll("text");
          let centerOfText = getCenterOfText(<SVGElement> texts[0][i]);
          let centerXValue = xScale.invert(centerOfText.x);
          xScale.domain([centerXValue, centerXValue + (DEFAULT_DOMAIN[1] - DEFAULT_DOMAIN[0])]);

          texts = svg.selectAll("text"); // re-select after rendering
          assert.strictEqual(d3.select(texts[0][i]).style("visibility"), "hidden", `label for bar with index ${i} is hidden`);
        });
        svg.remove();
      });

      it("hides or shifts labels cut off by the top edge", () => {
        barPlot.labelsEnabled(true);
        let labels = barPlot.content().selectAll(".on-bar-label, .off-bar-label");
        let centerYValues = labels.select("text")[0].map((textNode) => yScale.invert(getCenterOfText(<SVGElement> textNode).y));
        let wasOriginallyOnBar = labels[0].map((label) => d3.select(label).classed("on-bar-label"));

        dataset.data().forEach((d, i) => {
          let centerYValue = centerYValues[i];
          yScale.domain([centerYValue - (DEFAULT_DOMAIN[1] - DEFAULT_DOMAIN[0]), centerYValue]);
          labels = barPlot.content().selectAll(".on-bar-label, .off-bar-label"); // re-select after rendering
          if (wasOriginallyOnBar[i] && d.y < 0) {
            assert.isTrue(d3.select(labels[0][i]).classed("off-bar-label"),
              `cut off on-bar label was switched to off-bar (index ${i})`);
          } else {
            let textNode = labels.select("text")[0][i];
            assert.strictEqual(d3.select(textNode).style("visibility"), "hidden", `label for bar with index ${i} is hidden`);
          }
        });
        svg.remove();
      });

      it("hides labels cut off by the bottom edge", () => {
        barPlot.labelsEnabled(true);
        let labels = barPlot.content().selectAll(".on-bar-label, .off-bar-label");
        let centerYValues = labels.select("text")[0].map((textNode) => yScale.invert(getCenterOfText(<SVGElement> textNode).y));
        let wasOriginallyOnBar = labels[0].map((label) => d3.select(label).classed("on-bar-label"));

        dataset.data().forEach((d, i) => {
          let centerYValue = centerYValues[i];
          yScale.domain([centerYValue, centerYValue + (DEFAULT_DOMAIN[1] - DEFAULT_DOMAIN[0])]);
          labels = barPlot.content().selectAll(".on-bar-label, .off-bar-label"); // re-select after rendering
          if (wasOriginallyOnBar[i] && d.y > 0) {
            assert.isTrue(d3.select(labels[0][i]).classed("off-bar-label"),
              `cut off on-bar label was switched to off-bar (index ${i})`);
          } else {
            let textNode = labels.select("text")[0][i];
            assert.strictEqual(d3.select(textNode).style("visibility"), "hidden", `label for bar with index ${i} is hidden`);
          }
        });
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

    it("updates the scale extent correctly when there is one bar (vertical)", () => {
      let svg = TestMethods.generateSVG();

      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      let xPoint = Math.max(xScale.domain()[0], xScale.domain()[1]) + 10;
      let data = [{x: xPoint, y: 10}];
      let dataset = new Plottable.Dataset(data);

      let barPlot = new Plottable.Plots.Bar();
      barPlot.datasets([dataset]);
      barPlot.x(function(d) { return d.x; }, xScale);
      barPlot.y(function(d) { return d.y; }, yScale);

      barPlot.renderTo(svg);
      let xScaleDomain = xScale.domain();
      assert.operator(xPoint, ">=", xScaleDomain[0], "x value greater than new domain min");
      assert.operator(xPoint, "<=", xScaleDomain[1], "x value less than new domain max");
      svg.remove();
    });

    it("updates the scale extent correctly when there is one bar (horizontal)", () => {
      let svg = TestMethods.generateSVG();

      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      let yPoint = Math.max(yScale.domain()[0], yScale.domain()[1]) + 10;
      let data = [{x: 10, y: yPoint}];
      let dataset = new Plottable.Dataset(data);

      let barPlot = new Plottable.Plots.Bar(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
      barPlot.datasets([dataset]);
      barPlot.x(function(d) { return d.x; }, xScale);
      barPlot.y(function(d) { return d.y; }, yScale);

      barPlot.renderTo(svg);
      let yScaleDomain = yScale.domain();
      assert.operator(yPoint, ">=", yScaleDomain[0], "y value greater than new domain min");
      assert.operator(yPoint, "<=", yScaleDomain[1], "y value less than new domain max");
      svg.remove();
    });
  });
});
