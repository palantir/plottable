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

      describe(`autodomaining when ${orientation}`, () => {
        let svg: d3.Selection<void>;
        let baseScale: Plottable.Scales.Linear;
        let valueScale: Plottable.Scales.Linear;
        let barPlot: Plottable.Plots.Bar<number, number>;
        let dataset: Plottable.Dataset;

        const baseAccessor = (d: any) => d.base;
        const valueAccessor = (d: any) => d.value;

        beforeEach(() => {
          svg = TestMethods.generateSVG();
          barPlot = new Plottable.Plots.Bar<number, number>(orientation);
          baseScale = new Plottable.Scales.Linear();
          valueScale = new Plottable.Scales.Linear();
          if (orientation === Plottable.Plots.Bar.ORIENTATION_VERTICAL) {
            barPlot.x(baseAccessor, baseScale);
            barPlot.y(valueAccessor, valueScale);
          } else {
            barPlot.y(baseAccessor, baseScale);
            barPlot.x(valueAccessor, valueScale);
          }
        });

        it("computes the base scale domain correctly when there is only one data point", () => {
          const singlePointData = [
            { base: baseScale.domain()[1] + 10, value: 5 }
          ];
          barPlot.addDataset(new Plottable.Dataset(singlePointData));
          barPlot.renderTo(svg);
          const baseScaleDomain = baseScale.domain();
          assert.operator(baseScaleDomain[0], "<=", singlePointData[0].base, "lower end of base domain is less than the value");
          assert.operator(baseScaleDomain[1], ">=", singlePointData[0].base, "upper end of base domain is greater than the value");
        });

        it("base scale domain does not change when autoDomain is called more than once", () => {
          const data = [
            { base: 0, value: 1 },
            { base: 1, value: 2 }
          ];
          barPlot.addDataset(new Plottable.Dataset(data));
          barPlot.renderTo(svg);

          const baseDomainAfterRendering = baseScale.domain();
          baseScale.autoDomain();
          const baseDomainAfterAutoDomaining = baseScale.domain();
          assert.deepEqual(baseDomainAfterRendering, baseDomainAfterAutoDomaining, "calling autoDomain() again does not change the domain");
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

        it("shows labels for bars with value = baseline on the \"positive\" side of the baseline", () => {
          const zeroOnlyData = [ { base: 0, value: 0 } ];
          dataset.data(zeroOnlyData);
          barPlot.labelsEnabled(true);

          const label = barPlot.content().select("text");
          const labelBoundingRect = (<SVGElement> label.node()).getBoundingClientRect();
          const lineBoundingRect = (<SVGElement> barPlot.content().select(".baseline").node()).getBoundingClientRect();
          if (isVertical) {
            const labelPosition = labelBoundingRect.bottom - window.Pixel_CloseTo_Requirement;
            const linePosition = lineBoundingRect.top;
            assert.operator(labelPosition, "<=", linePosition, "label with value = baseline is drawn above the baseline");
          } else {
            const labelPosition = labelBoundingRect.left + window.Pixel_CloseTo_Requirement;
            const linePosition = lineBoundingRect.right;
            assert.operator(labelPosition, ">=", linePosition, "label with value = baseline is drawn to the right of the baseline");
          }
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

        it("hides or shifts labels cut off by lower end of value scale", () => {
          barPlot.labelsEnabled(true);
          let labels = barPlot.content().selectAll(".on-bar-label, .off-bar-label");
          const centerValues = labels.select("text")[0].map((textNode) => {
            const centerOfText = getCenterOfText(<SVGElement> textNode);
            return valueScale.invert(isVertical ? centerOfText.y : centerOfText.x);
          });
          const wasOriginallyOnBar = labels[0].map((label) => d3.select(label).classed("on-bar-label"));

          data.forEach((d, i) => {
            const centerValue = centerValues[i];
            valueScale.domain([centerValue, centerValue + (DEFAULT_DOMAIN[1] - DEFAULT_DOMAIN[0])]);
            labels = barPlot.content().selectAll(".on-bar-label, .off-bar-label"); // re-select after rendering
            if (wasOriginallyOnBar[i] && d.value > 0) {
              assert.isTrue(d3.select(labels[0][i]).classed("off-bar-label"),
                `cut off on-bar label was switched to off-bar (index ${i})`);
            } else {
              const textNode = labels.select("text")[0][i];
              assert.strictEqual(d3.select(textNode).style("visibility"), "hidden", `label for bar with index ${i} is hidden`);
            }
          });
          svg.remove();
        });

        it("hides or shifts labels cut off by upper end of value scale", () => {
          barPlot.labelsEnabled(true);
          let labels = barPlot.content().selectAll(".on-bar-label, .off-bar-label");
          const centerValues = labels.select("text")[0].map((textNode) => {
            const centerOfText = getCenterOfText(<SVGElement> textNode);
            return valueScale.invert(isVertical ? centerOfText.y : centerOfText.x);
          });
          const wasOriginallyOnBar = labels[0].map((label) => d3.select(label).classed("on-bar-label"));

          data.forEach((d, i) => {
            const centerValue = centerValues[i];
            valueScale.domain([centerValue - (DEFAULT_DOMAIN[1] - DEFAULT_DOMAIN[0]), centerValue]);
            labels = barPlot.content().selectAll(".on-bar-label, .off-bar-label"); // re-select after rendering
            if (wasOriginallyOnBar[i] && d.value < 0) {
              assert.isTrue(d3.select(labels[0][i]).classed("off-bar-label"),
                `cut-off on-bar label was switched to off-bar (index ${i})`);
            } else {
              const textNode = labels.select("text")[0][i];
              assert.strictEqual(d3.select(textNode).style("visibility"), "hidden", `label for bar with index ${i} is hidden`);
            }
          });
        });

        // HACKHACK: This test is a bit hacky, but it seems to be testing for a bug fixed in
        // https://github.com/palantir/plottable/pull/1240 . Leaving it until we find a better way to test for it.
        it("removes labels instantly on dataset change", (done) => {
          barPlot.labelsEnabled(true);
          let texts = barPlot.content().selectAll("text");
          assert.strictEqual(texts.size(), dataset.data().length, "one label drawn per datum");
          const originalDrawLabels = (<any> barPlot)._drawLabels;
          let called = false;
          (<any> barPlot)._drawLabels = () => {
            if (!called) {
              originalDrawLabels.apply(barPlot);
              texts = barPlot.content().selectAll("text");
              assert.strictEqual(texts.size(), dataset.data().length, "texts were repopulated by drawLabels after the update");
              called = true; // for some reason, in phantomJS, `done` was being called multiple times and this caused the test to fail.
              done();
            }
          };
          dataset.data(dataset.data());
          texts = barPlot.content().selectAll("text");
          assert.strictEqual(texts.size(), 0, "texts were immediately removed");
        });

        afterEach(function() {
          if (this.currentTest.state === "passed") {
            barPlot.destroy();
            svg.remove();
          }
        });
      });

      describe(`retrieving Entities when ${orientation}`, () => {
        const data = [
          { base: -1, value: -1 },
          { base: 0, value: 0 },
          { base: 1, value: 1 }
        ];
        const DEFAULT_DOMAIN = [-2, 2];

        let svg: d3.Selection<void>;
        let barPlot: Plottable.Plots.Bar<number, number>;
        let baseScale: Plottable.Scales.Linear;
        let valueScale: Plottable.Scales.Linear;
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

        it("returns the correct position for each Entity", () => {
          const entities = barPlot.entities();
          entities.forEach((entity, index) => {
            const xBinding = barPlot.x();
            const yBinding = barPlot.y();
            const scaledDataX = xBinding.scale.scale(xBinding.accessor(entity.datum, index, dataset));
            const scaledDataY = yBinding.scale.scale(yBinding.accessor(entity.datum, index, dataset));
            assert.strictEqual(scaledDataX, entity.position.x, "entities().position.x is equal to scaled x value");
            assert.strictEqual(scaledDataY, entity.position.y, "entities().position.y is equal to scaled y value");
          });
        });

        function getPointFromBaseAndValuePositions(basePosition: number, valuePosition: number) {
          return {
            x: isVertical ? basePosition : valuePosition,
            y: isVertical ? valuePosition : basePosition
          };
        }

        function expectedEntityForIndex(index: number) {
          const datum = data[index];
          const basePosition = baseScale.scale(datum.base);
          const valuePosition = valueScale.scale(datum.value);
          return {
            datum: datum,
            index: index,
            dataset: dataset,
            position: getPointFromBaseAndValuePositions(basePosition, valuePosition),
            selection: d3.select(barPlot.content().selectAll("rect")[0][index]),
            component: barPlot
          };
        }

        describe("retrieving the nearest Entity", () => {
          function testEntityNearest() {
            data.forEach((datum, index) => {
              const expectedEntity = expectedEntityForIndex(index);

              const barBasePosition = baseScale.scale(datum.base);

              const halfwayValuePosition = valueScale.scale((barPlot.baselineValue() + datum.value) / 2);
              const pointInsideBar = getPointFromBaseAndValuePositions(barBasePosition, halfwayValuePosition);
              const nearestInsideBar = barPlot.entityNearest(pointInsideBar);
              TestMethods.assertPlotEntitiesEqual(nearestInsideBar, expectedEntity, "retrieves the Entity for a bar if inside the bar");

              const abovePosition = valueScale.scale(2 * datum.value);
              const pointAboveBar = getPointFromBaseAndValuePositions(barBasePosition, abovePosition);
              const nearestAboveBar = barPlot.entityNearest(pointAboveBar);
              TestMethods.assertPlotEntitiesEqual(nearestAboveBar, expectedEntity, "retrieves the Entity for a bar if beyond the end of the bar");

              const belowPosition = valueScale.scale(-datum.value);
              const pointBelowBar = getPointFromBaseAndValuePositions(barBasePosition, belowPosition);
              const nearestBelowBar = barPlot.entityNearest(pointBelowBar);
              TestMethods.assertPlotEntitiesEqual(nearestBelowBar, expectedEntity,
                "retrieves the Entity for a bar if on the other side of the baseline from the bar");
            });
          }

          it("returns the closest by base, then by value", () => {
            testEntityNearest();
          });

          it("returns the closest visible bar", () => {
            const baseValuebetweenBars = (data[0].base + data[1].base) / 2;
            baseScale.domain([baseValuebetweenBars , DEFAULT_DOMAIN[1]]); // cuts off bar 0
            const bar0BasePosition = baseScale.scale(data[0].base);
            const baselineValuePosition = valueScale.scale(barPlot.baselineValue());

            const nearestEntity = barPlot.entityNearest(getPointFromBaseAndValuePositions(bar0BasePosition, baselineValuePosition));
            const expectedEntity = expectedEntityForIndex(1); // nearest visible bar
            TestMethods.assertPlotEntitiesEqual(nearestEntity, expectedEntity, "returned Entity for nearest in-view bar");
          });

          it("considers bars cut off by the value scale", () => {
            valueScale.domain([-0.5, 0.5]);
            testEntityNearest();
          });

          it("considers bars cut off by the base scale", () => {
            baseScale.domain([-0.8, 0.8]);
            testEntityNearest();
          });

          it("returns undefined if no bars are visible", () => {
            baseScale.domain([100, 200]);
            const centerOfPlot = {
              x: barPlot.width() / 2,
              y: barPlot.height() / 2
            };
            const nearestEntity = barPlot.entityNearest(centerOfPlot);
            assert.isUndefined(nearestEntity, "returns undefined when no bars are in view");
          });
        });

        describe("retrieving the Entities at a given point", () => {
          it("returns the Entity at a given point, or an empty array if no bars are there", () => {
            data.forEach((datum, index) => {
              if (datum.value === barPlot.baselineValue()) {
                return; // bar has no height
              }
              const expectedEntity = expectedEntityForIndex(index);

              const barBasePosition = baseScale.scale(datum.base);

              const halfwayValuePosition = valueScale.scale((barPlot.baselineValue() + datum.value) / 2);
              const pointInsideBar = getPointFromBaseAndValuePositions(barBasePosition, halfwayValuePosition);
              const entitiesAtPointInside = barPlot.entitiesAt(pointInsideBar);
              assert.lengthOf(entitiesAtPointInside, 1, `exactly 1 Entity was returned (index ${index})`);
              TestMethods.assertPlotEntitiesEqual(entitiesAtPointInside[0], expectedEntity,
                `retrieves the Entity for a bar if inside the bar (index ${index})`);
            });

            const pointOutsideBars = { x: -1, y: -1 };
            const entitiesAtPointOutside = barPlot.entitiesAt(pointOutsideBars);
            assert.lengthOf(entitiesAtPointOutside, 0, "no Entities returned if no bars at query point");
          });
        });

        describe("retrieving the Entities in a given range", () => {
          it("returns the Entities for any bars that intersect the range", () => {
            const bar0 = barPlot.content().select("rect");
            const bar0Edge = TestMethods.numAttr(bar0, basePositionAttr);
            const bar0FarEdge = TestMethods.numAttr(bar0, basePositionAttr) + TestMethods.numAttr(bar0, baseSizeAttr);
            const baseRange = {
              min: bar0Edge,
              max: bar0FarEdge
            };
            const fullSizeValueRange = {
              min: -Infinity,
              max: Infinity
            };

            const entitiesInRange = isVertical ? barPlot.entitiesIn(baseRange, fullSizeValueRange)
                                               : barPlot.entitiesIn(fullSizeValueRange, baseRange);
            assert.lengthOf(entitiesInRange, 1, "retrieved two Entities when range intersects one bar");
            TestMethods.assertPlotEntitiesEqual(entitiesInRange[0], expectedEntityForIndex(0), "Entity corresponds to bar 0");
          });

          it("returns the Entity if the range includes any part of the bar", () => {
            const quarterUpBar0 = valueScale.scale(data[0].value / 4);
            const halfUpBar0 = valueScale.scale(data[0].value / 2);
            const valueRange = {
              min: Math.min(quarterUpBar0, halfUpBar0),
              max: Math.max(quarterUpBar0, halfUpBar0)
            };
            const fullSizeBaseRange = {
              min: -Infinity,
              max: Infinity
            };
            const entitiesInRange = isVertical ? barPlot.entitiesIn(fullSizeBaseRange, valueRange)
                                               : barPlot.entitiesIn(valueRange, fullSizeBaseRange);
            assert.lengthOf(entitiesInRange, 1, "retrieved one entity when range intersects one bar");
            TestMethods.assertPlotEntitiesEqual(entitiesInRange[0], expectedEntityForIndex(0), "Entity corresponds to bar 0");
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
});
