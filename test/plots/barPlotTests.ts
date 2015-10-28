///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("Bar Plot", () => {
    describe ("orientations", () => {
      it("rejects invalid orientations", () => {
        assert.throws(() => new Plottable.Plots.Bar("diagonal"), Error);
      });

      it("defaults to vertical", () => {
        let defaultPlot = new Plottable.Plots.Bar<number, number>();
        assert.strictEqual(defaultPlot.orientation(), "vertical", "default Plots.Bar() are vertical");
      });

      it("sets orientation on construction", () => {
        let verticalPlot = new Plottable.Plots.Bar<number, number>("vertical");
        assert.strictEqual(verticalPlot.orientation(), "vertical", "vertical Plots.Bar()");

        let horizontalPlot = new Plottable.Plots.Bar<number, number>("horizontal");
        assert.strictEqual(horizontalPlot.orientation(), "horizontal", "horizontal Plots.Bar()");
      });
    });

    const orientations = [Plottable.Plots.Bar.ORIENTATION_VERTICAL, Plottable.Plots.Bar.ORIENTATION_HORIZONTAL];
    orientations.forEach((orientation) => {
      const isVertical = orientation === Plottable.Plots.Bar.ORIENTATION_VERTICAL;
      const basePositionAttr = isVertical ? "x" : "y";
      const baseSizeAttr = isVertical ? "width" : "height";
      const valuePositionAttr = isVertical ? "y" : "x";
      const valueSizeAttr = isVertical ? "height" : "width";

      describe(`rendering when ${orientation}`, () => {
        const data = [
          { base: "A", value: 1 },
          { base: "B", value: 0 },
          { base: "C", value: -1 }
        ];

        let svg: d3.Selection<void>;
        let barPlot: Plottable.Plots.Bar<string | number, number | string>;
        let baseScale: Plottable.Scales.Category;
        let valueScale: Plottable.Scales.Linear;
        let dataset: Plottable.Dataset;

        beforeEach(() => {
          svg = TestMethods.generateSVG();
          barPlot = new Plottable.Plots.Bar<string | number, number | string>(orientation);
          baseScale = new Plottable.Scales.Category();
          valueScale = new Plottable.Scales.Linear();
          if (orientation === Plottable.Plots.Bar.ORIENTATION_VERTICAL) {
            barPlot.x((d: any) => d.base, baseScale);
            barPlot.y((d: any) => d.value, valueScale);
          } else {
            barPlot.y((d: any) => d.base, baseScale);
            barPlot.x((d: any) => d.value, valueScale);
          }
          dataset = new Plottable.Dataset(data);
        });

        function assertCorrectRendering() {
          const baseline = barPlot.content().select(".baseline");
          const scaledBaselineValue = valueScale.scale(<number> barPlot.baselineValue());
          assert.strictEqual(TestMethods.numAttr(baseline, valuePositionAttr + "1"), scaledBaselineValue,
            `baseline ${valuePositionAttr + "1"} is correct`);
          assert.strictEqual(TestMethods.numAttr(baseline, valuePositionAttr + "2"), scaledBaselineValue,
            `baseline ${valuePositionAttr + "2"} is correct`);
          assert.strictEqual(TestMethods.numAttr(baseline, basePositionAttr + "1"), 0,
            `baseline ${basePositionAttr + "1"} is correct`);
          assert.strictEqual(TestMethods.numAttr(baseline, basePositionAttr + "2"), TestMethods.numAttr(svg, baseSizeAttr),
            `baseline ${basePositionAttr + "2"} is correct`);

          const bars = barPlot.content().selectAll("rect");
          assert.strictEqual(bars.size(), data.length, "One bar was created per data point");
          bars.each(function(datum, index) {
            const bar = d3.select(this);
            const baseSize = TestMethods.numAttr(bar, baseSizeAttr);
            assert.closeTo(baseSize, baseScale.rangeBand(), window.Pixel_CloseTo_Requirement, `bar ${baseSizeAttr} is correct (index ${index})`);

            const valueSize = TestMethods.numAttr(bar, valueSizeAttr);
            assert.closeTo(valueSize, Math.abs(valueScale.scale(datum.value) - scaledBaselineValue),
              window.Pixel_CloseTo_Requirement, `bar ${valueSizeAttr} is correct (index ${index})`);

            const basePosition = TestMethods.numAttr(bar, basePositionAttr);
            assert.closeTo(basePosition, baseScale.scale(datum.base) - 0.5 * baseSize, window.Pixel_CloseTo_Requirement,
              `bar ${basePositionAttr} is correct (index ${index})`);

            const valuePosition = TestMethods.numAttr(bar, valuePositionAttr);
            const isShifted = isVertical ? (datum.value > barPlot.baselineValue()) : (datum.value < barPlot.baselineValue());
            const expectedValuePosition = (isShifted) ? scaledBaselineValue - valueSize : scaledBaselineValue;
            assert.closeTo(valuePosition, expectedValuePosition, window.Pixel_CloseTo_Requirement,
              `bar ${valuePositionAttr} is correct (index ${index})`);
          });
        }

        it("renders with no data", () => {
          assert.doesNotThrow(() => barPlot.renderTo(svg), Error);
          assert.strictEqual(barPlot.width(), TestMethods.numAttr(svg, "width"), "was allocated width");
          assert.strictEqual(barPlot.height(), TestMethods.numAttr(svg, "height"), "was allocated height");
        });

        it("draws bars and baseline in correct positions", () => {
          barPlot.addDataset(dataset);
          barPlot.renderTo(svg);

          assertCorrectRendering();
        });

        it("rerenders correctly when the baseline value is changed", () => {
          barPlot.addDataset(dataset);
          barPlot.renderTo(svg);

          barPlot.baselineValue(1);
          assertCorrectRendering();
        });

        it("can autorange value scale based on visible points on base scale", () => {
          const firstTwoBaseValues = [data[0].base, data[1].base ];
          valueScale.padProportion(0);
          baseScale.domain(firstTwoBaseValues);
          barPlot.addDataset(dataset);
          barPlot.autorangeMode(valuePositionAttr);
          barPlot.renderTo(svg);

          const valueScaleDomain = valueScale.domain();
          const expectedValueDomainMin = Math.min(data[0].value, data[1].value);
          const expectedValueDomainMax = Math.max(data[0].value, data[1].value);
          assert.strictEqual(valueScaleDomain[0], expectedValueDomainMin, "lower bound of domain set based on visible points");
          assert.strictEqual(valueScaleDomain[1], expectedValueDomainMax, "upper bound of domain set based on visible points");
        });

        it("doesn't show values from outside the base scale's domain", () => {
          baseScale.domain(["-A"]);
          barPlot.addDataset(dataset);
          barPlot.renderTo(svg);

          assert.strictEqual(barPlot.content().selectAll("rect").size(), 0, "draws no bars when the domain contains no data points");
        });

        afterEach(function() {
          if (this.currentTest.state === "passed") {
            barPlot.destroy();
            svg.remove();
          }
        });
      });

      describe(`auto bar width calculation when ${orientation}`, () => {
        const scaleTypes = ["Linear", "ModifiedLog", "Time"];
        scaleTypes.forEach((scaleType) => {
          describe(`using a ${scaleType} base Scale`, () => {
            let svg: d3.Selection<void>;
            let barPlot: Plottable.Plots.Bar<number | Date, number | Date>;
            let baseScale: Plottable.QuantitativeScale<number | Date>;
            let valueScale: Plottable.Scales.Linear;
            let dataset: Plottable.Dataset;

            beforeEach(() => {
              svg = TestMethods.generateSVG();
              barPlot = new Plottable.Plots.Bar<number | Date, number | Date>(orientation);

              switch (scaleType) {
                case "Linear":
                  baseScale = new Plottable.Scales.Linear();
                  break;
                case "ModifiedLog":
                  baseScale = new Plottable.Scales.ModifiedLog();
                  break;
                case "Time":
                  baseScale = new Plottable.Scales.Time();
                  break;
                default:
                  throw new Error("unexpected base Scale type");
              }
              valueScale = new Plottable.Scales.Linear();

              const baseAccessor = (scaleType === "Time") ? (d: any) => new Date(d.base) : (d: any) => d.base;
              const valueAccessor = (d: any) => d.value;
              if (orientation === Plottable.Plots.Bar.ORIENTATION_VERTICAL) {
                barPlot.x(baseAccessor, baseScale);
                barPlot.y(valueAccessor, valueScale);
              } else {
                barPlot.y(baseAccessor, baseScale);
                barPlot.x(valueAccessor, valueScale);
              }
              dataset = new Plottable.Dataset();
              barPlot.addDataset(dataset);
              barPlot.renderTo(svg);
            });

            it("computes a sensible width", () => {
              const data = [
                { base: 1, value: 5 },
                { base: 10, value: 2 },
                { base: 100, value: 4 }
              ];
              dataset.data(data);

              const closestSeparation = Math.abs(baseScale.scale(data[1].base) - baseScale.scale(data[0].base));
              const bars = barPlot.content().selectAll("rect");
              assert.strictEqual(bars.size(), data.length, "one bar was drawn per datum");
              bars.each(function() {
                const bar = d3.select(this);
                const barSize = TestMethods.numAttr(bar, baseSizeAttr);
                assert.operator(barSize, "<=", closestSeparation, "bar width is less than the closest distance between values");
                assert.operator(barSize, ">=", 0.5 * closestSeparation, "bar width is greater than half the closest distance between values");
              });
            });

            it("accounts for the bar width when autoDomaining the base scale", () => {
              const data = [
                { base: 1, value: 5 },
                { base: 10, value: 2 },
                { base: 100, value: 4 }
              ];
              dataset.data(data);

              const bars = barPlot.content().selectAll("rect");
              assert.strictEqual(bars.size(), data.length, "one bar was drawn per datum");
              const svgSize = TestMethods.numAttr(svg, baseSizeAttr);
              bars.each(function() {
                const bar = d3.select(this);
                const barPosition = TestMethods.numAttr(bar, basePositionAttr);
                const barSize = TestMethods.numAttr(bar, baseSizeAttr);
                assert.operator(barPosition, ">=", 0, `bar is within visible area (${basePositionAttr})`);
                assert.operator(barPosition, "<=", svgSize, `bar is within visible area (${basePositionAttr})`);
                assert.operator(barPosition + barSize, ">=", 0, `bar is within visible area (${baseSizeAttr})`);
                assert.operator(barPosition + barSize, "<=", svgSize, `bar is within visible area (${baseSizeAttr})`);
              });
            });

            it("does not crash when given bad data", () => {
              const badData: any = [
                {},
                { base: null, value: null }
              ]
              assert.doesNotThrow(() => dataset.data(badData), Error);
            });

            it("computes a sensible width when given only one datum", () => {
              const singleDatumData = [
                { base: 1, value: 5 }
              ];
              dataset.data(singleDatumData);

              const bar = barPlot.content().select("rect");
              const barSize = TestMethods.numAttr(bar, baseSizeAttr);
              const svgSize = TestMethods.numAttr(svg, baseSizeAttr);
              assert.operator(barSize, ">=", svgSize / 4, "bar is larger than 1/4 of the available space");
              assert.operator(barSize, "<=", svgSize / 2, "bar is smaller than half the available space");
            });

            it("computes a sensible width when given repeated base value", () => {
              const repeatedBaseData = [
                { base: 1, value: 5 },
                { base: 1, value: -5 }
              ];
              dataset.data(repeatedBaseData);

              const bars = barPlot.content().selectAll("rect");
              assert.strictEqual(bars.size(), repeatedBaseData.length, "one bar was drawn per datum");
              const svgSize = TestMethods.numAttr(svg, baseSizeAttr);
              bars.each(function() {
                const bar = d3.select(this);
                const barSize = TestMethods.numAttr(bar, baseSizeAttr)
                assert.operator(barSize, ">=", svgSize / 4, "bar is larger than 1/4 of the available space");
                assert.operator(barSize, "<=", svgSize / 2, "bar is smaller than half the available space");
              });
            });

            it("computes a sensible width when given unsorted data", () => {
              const unsortedData = [
                { base: 10, value: 2 },
                { base: 1, value: 5 },
                { base: 100, value: 4 }
              ];
              dataset.data(unsortedData);

              const closestSeparation = Math.abs(baseScale.scale(unsortedData[1].base) - baseScale.scale(unsortedData[0].base));
              const bars = barPlot.content().selectAll("rect");
              assert.strictEqual(bars.size(), unsortedData.length, "one bar was drawn per datum");
              bars.each(function() {
                const bar = d3.select(this);
                const barSize = TestMethods.numAttr(bar, baseSizeAttr)
                assert.operator(barSize, "<=", closestSeparation, "bar width is less than the closest distance between values");
                assert.operator(barSize, ">=", 0.5 * closestSeparation, "bar width is greater than half the closest distance between values");
              });
            });

            afterEach(function() {
              if (this.currentTest.state === "passed") {
                barPlot.destroy();
                svg.remove();
              }
            });
          });
        });
      });

      describe(`labels when ${orientation}`, () => {
        const data = [
          { base: -4, value: -4 },
          { base: -2, value: -0.1},
          { base: 0, value: 0 },
          { base: 2, value: 0.1 },
          { base: 4, value: 4 }
        ];
        const DEFAULT_DOMAIN = [-5, 5];

        let svg: d3.Selection<void>;
        let baseScale: Plottable.Scales.Linear;
        let valueScale: Plottable.Scales.Linear;
        let barPlot: Plottable.Plots.Bar<number, number>;
        let dataset: Plottable.Dataset;

        beforeEach(() => {
          svg = TestMethods.generateSVG();
          barPlot = new Plottable.Plots.Bar<number, number>(orientation);
          baseScale = new Plottable.Scales.Linear();
          baseScale.domain(DEFAULT_DOMAIN);
          valueScale = new Plottable.Scales.Linear();
          valueScale.domain(DEFAULT_DOMAIN);
          if (orientation === Plottable.Plots.Bar.ORIENTATION_VERTICAL) {
            barPlot.x((d: any) => d.base, baseScale);
            barPlot.y((d: any) => d.value, valueScale);
          } else {
            barPlot.y((d: any) => d.base, baseScale);
            barPlot.x((d: any) => d.value, valueScale);
          }
          dataset = new Plottable.Dataset(data);
          barPlot.addDataset(dataset);
          barPlot.renderTo(svg);
        });

        function getCenterOfText(textNode: SVGElement) {
          const plotBoundingClientRect = (<SVGElement> barPlot.background().node()).getBoundingClientRect();
          const labelBoundingClientRect = textNode.getBoundingClientRect();

          return {
            x: (labelBoundingClientRect.left + labelBoundingClientRect.right) / 2 - plotBoundingClientRect.left,
            y: (labelBoundingClientRect.top + labelBoundingClientRect.bottom) / 2 - plotBoundingClientRect.top
          };
        };

        it("does not show labels by default", () => {
          const texts = barPlot.content().selectAll("text");
          assert.strictEqual(texts.size(), 0, "by default, no texts are drawn");
        });

        it("draws one label per datum", () => {
          barPlot.labelsEnabled(true);
          barPlot.labelsEnabled(true);
          const texts = barPlot.content().selectAll("text");
          assert.strictEqual(texts.size(), data.length, "one label drawn per datum");
          texts.each(function(d, i) {
            assert.strictEqual(d3.select(this).text(), data[i].value.toString(), `by default, label text is the bar's value (index ${i})`);
          });
        });

        it("hides the labels if bars are too thin to show them", () => {
          svg.attr(baseSizeAttr, TestMethods.numAttr(svg, baseSizeAttr) / 10);
          barPlot.redraw();
          barPlot.labelsEnabled(true);

          const texts = barPlot.content().selectAll("text");
          assert.strictEqual(texts.size(), 0, "no labels drawn");
        });

        it("can apply a formatter to the labels", () => {
          barPlot.labelsEnabled(true);
          const formatter = (n: number) => `${n}%`;
          barPlot.labelFormatter(formatter);

          const texts = barPlot.content().selectAll("text");
          assert.strictEqual(texts.size(), data.length, "one label drawn per datum");
          const expectedTexts = data.map((d) => formatter(d.value));
          texts.each(function(d, i) {
            assert.strictEqual(d3.select(this).text(), expectedTexts[i], `formatter is applied to the displayed value (index ${i})`);
          });
        });

        it("shows labels inside or outside the bar as appropriate", () => {
          barPlot.labelsEnabled(true);

          const labels = barPlot.content().selectAll(".on-bar-label, .off-bar-label");
          assert.strictEqual(labels.size(), data.length, "one label drawn per datum");

          const bars = barPlot.content().select(".bar-area").selectAll("rect");
          labels.each((d, i) => {
            const labelBoundingClientRect = <any> (<SVGElement> labels[0][i]).getBoundingClientRect();
            const barBoundingClientRect = <any> (<SVGElement> bars[0][i]).getBoundingClientRect();
            if (labelBoundingClientRect[valueSizeAttr] > barBoundingClientRect[valueSizeAttr]) {
              assert.isTrue(d3.select(labels[0][i]).classed("off-bar-label"),
                `label with index ${i} doesn't fit and carries the off-bar class`);
            } else {
              assert.isTrue(d3.select(labels[0][i]).classed("on-bar-label"),
                `label with index ${i} fits and carries the on-bar class`);
            }
          });
        });

        it("hides labels cut off by lower end of base scale", () => {
          barPlot.labelsEnabled(true);
          data.forEach((d, i) => {
            let texts = barPlot.content().selectAll("text");
            const centerOfText = getCenterOfText(<SVGElement> texts[0][i]);
            const centerValue = baseScale.invert(isVertical ? centerOfText.x : centerOfText.y);
            baseScale.domain([centerValue, centerValue + (DEFAULT_DOMAIN[1] - DEFAULT_DOMAIN[0])]);

            texts = barPlot.content().selectAll("text"); // re-select after rendering
            assert.strictEqual(d3.select(texts[0][i]).style("visibility"), "hidden", `label for bar with index ${i} is hidden`);
          });
          svg.remove();
        });

        it("hides labels cut off by upper end of base scale", () => {
          barPlot.labelsEnabled(true);
          data.forEach((d, i) => {
            let texts = barPlot.content().selectAll("text");
            const centerOfText = getCenterOfText(<SVGElement> texts[0][i]);
            const centerValue = baseScale.invert(isVertical ? centerOfText.x : centerOfText.y);
            baseScale.domain([centerValue - (DEFAULT_DOMAIN[1] - DEFAULT_DOMAIN[0]), centerValue]);

            texts = barPlot.content().selectAll("text"); // re-select after rendering
            assert.strictEqual(d3.select(texts[0][i]).style("visibility"), "hidden", `label for bar with index ${i} is hidden`);
          });
        });

        afterEach(function() {
          if (this.currentTest.state === "passed") {
            barPlot.destroy();
            svg.remove();
          }
        });
      });
    });

    // HACKHACK #1798: beforeEach being used below
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
