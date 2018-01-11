import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";
import { BarOrientation } from "../../src/plots/barPlot";
import { entityBounds } from "../../src/utils/domUtils";

import * as TestMethods from "../testMethods";

describe("Plots", () => {
  describe("Bar Plot", () => {
    describe ("setting orientation", () => {
      it("rejects invalid orientations", () => {
        assert.throws(() => new Plottable.Plots.Bar("diagonal" as any), Error);
      });

      it("defaults to vertical", () => {
        const defaultPlot = new Plottable.Plots.Bar<number, number>();
        assert.strictEqual(defaultPlot.orientation(), "vertical", "default Plots.Bar() are vertical");
      });

      it("sets orientation on construction", () => {
        const verticalPlot = new Plottable.Plots.Bar<number, number>("vertical");
        assert.strictEqual(verticalPlot.orientation(), "vertical", "vertical Plots.Bar()");

        const horizontalPlot = new Plottable.Plots.Bar<number, number>("horizontal");
        assert.strictEqual(horizontalPlot.orientation(), "horizontal", "horizontal Plots.Bar()");
      });
    });

    const orientations: BarOrientation[] = [BarOrientation.vertical, BarOrientation.horizontal];
    orientations.forEach((orientation) => {
      const isVertical = orientation === BarOrientation.vertical;
      const basePositionAttr = isVertical ? "x" : "y";
      const baseSizeAttr = isVertical ? "width" : "height";
      const getDivBaseSizeDimension = (div: d3.Selection<HTMLDivElement, any, any, any>) => {
        return isVertical ? Plottable.Utils.DOM.elementWidth(div) : Plottable.Utils.DOM.elementHeight(div);
      };
      const valuePositionAttr = isVertical ? "y" : "x";
      const valueSizeAttr = isVertical ? "height" : "width";

      describe(`rendering when ${orientation}`, () => {
        const data = [
          { base: "A", value: 1 },
          { base: "B", value: 0 },
          { base: "C", value: -1 },
        ];

        let div: d3.Selection<HTMLDivElement, any, any, any>;
        let barPlot: Plottable.Plots.Bar<string | number, number | string>;
        let baseScale: Plottable.Scales.Category;
        let valueScale: Plottable.Scales.Linear;
        let dataset: Plottable.Dataset;

        beforeEach(() => {
          div = TestMethods.generateDiv();
          barPlot = new Plottable.Plots.Bar<string | number, number | string>(orientation);
          baseScale = new Plottable.Scales.Category();
          valueScale = new Plottable.Scales.Linear();
          if (orientation === BarOrientation.vertical) {
            barPlot.x((d: any) => d.base, baseScale);
            barPlot.y((d: any) => d.value, valueScale);
          } else {
            barPlot.y((d: any) => d.base, baseScale);
            barPlot.x((d: any) => d.value, valueScale);
          }
          dataset = new Plottable.Dataset(data);
        });

        afterEach(function() {
          if (this.currentTest.state === "passed") {
            barPlot.destroy();
            div.remove();
          }
        });

        function assertCorrectRendering() {
          const baseline = barPlot.content().select(".baseline");
          const scaledBaselineValue = valueScale.scale(<number> barPlot.baselineValue());
          assert.strictEqual(TestMethods.numAttr(baseline, `${valuePositionAttr}1`), scaledBaselineValue,
            `baseline ${valuePositionAttr}1 is correct`);
          assert.strictEqual(TestMethods.numAttr(baseline, `${valuePositionAttr}2`), scaledBaselineValue,
            `baseline ${valuePositionAttr}2 is correct`);
          assert.strictEqual(TestMethods.numAttr(baseline, `${basePositionAttr}1`), 0,
            `baseline ${basePositionAttr}1 is correct`);
          assert.strictEqual(TestMethods.numAttr(baseline, `${basePositionAttr}2`), getDivBaseSizeDimension(div),
            `baseline ${basePositionAttr}2 is correct`);

          const bars = barPlot.content().selectAll<Element, any>("rect");
          assert.strictEqual(bars.size(), data.length, "One bar was created per data point");
          bars.each(function(datum, index) {
            const bar = d3.select(this);
            const baseSize = TestMethods.numAttr(bar, baseSizeAttr);
            assert.closeTo(baseSize, baseScale.rangeBand(), window.Pixel_CloseTo_Requirement,
              `bar ${baseSizeAttr} is correct (index ${index})`);

            const valueSize = TestMethods.numAttr(bar, valueSizeAttr);
            assert.closeTo(valueSize, Math.abs(valueScale.scale(datum.value) - scaledBaselineValue),
              window.Pixel_CloseTo_Requirement, `bar ${valueSizeAttr} is correct (index ${index})`);

            const basePosition = TestMethods.numAttr(bar, basePositionAttr);
            assert.closeTo(basePosition, baseScale.scale(datum.base) - 0.5 * baseSize, window.Pixel_CloseTo_Requirement,
              `bar ${basePositionAttr} is correct (index ${index})`);

            const valuePosition = TestMethods.numAttr(bar, valuePositionAttr);
            const isShifted = isVertical ? (datum.value > barPlot.baselineValue()) : (datum.value < barPlot.baselineValue());
            const expectedValuePosition = isShifted ? scaledBaselineValue - valueSize : scaledBaselineValue;
            assert.closeTo(valuePosition, expectedValuePosition, window.Pixel_CloseTo_Requirement,
              `bar ${valuePositionAttr} is correct (index ${index})`);
          });
        }

        it("renders with no data", () => {
          assert.doesNotThrow(() => barPlot.renderTo(div), Error);
          assert.strictEqual(barPlot.width(), Plottable.Utils.DOM.elementWidth(div), "was allocated width");
          assert.strictEqual(barPlot.height(), Plottable.Utils.DOM.elementHeight(div), "was allocated height");
        });

        it("draws bars and baseline in correct positions", () => {
          barPlot.addDataset(dataset);
          barPlot.renderTo(div);

          assertCorrectRendering();
        });

        it("rerenders correctly when the baseline value is changed", () => {
          barPlot.addDataset(dataset);
          barPlot.renderTo(div);

          barPlot.baselineValue(1);
          assertCorrectRendering();
        });

        it("can autorange value scale based on visible points on base scale", () => {
          const firstTwoBaseValues = [ data[0].base, data[1].base ];
          valueScale.padProportion(0);
          baseScale.domain(firstTwoBaseValues);
          barPlot.addDataset(dataset);
          barPlot.autorangeMode(valuePositionAttr);
          barPlot.renderTo(div);

          const valueScaleDomain = valueScale.domain();
          const expectedValueDomainMin = Math.min(data[0].value, data[1].value);
          const expectedValueDomainMax = Math.max(data[0].value, data[1].value);
          assert.strictEqual(valueScaleDomain[0], expectedValueDomainMin, "lower bound of domain set based on visible points");
          assert.strictEqual(valueScaleDomain[1], expectedValueDomainMax, "upper bound of domain set based on visible points");
        });

        it("doesn't show values from outside the base scale's domain", () => {
          baseScale.domain(["-A"]);
          barPlot.addDataset(dataset);
          barPlot.renderTo(div);

          assert.strictEqual(barPlot.content().selectAll<Element, any>("rect").size(), 0, "draws no bars when the domain contains no data points");
        });
      });

      describe(`autodomaining when ${orientation}`, () => {
        let div: d3.Selection<HTMLDivElement, any, any, any>;
        let baseScale: Plottable.Scales.Linear;
        let valueScale: Plottable.Scales.Linear;
        let barPlot: Plottable.Plots.Bar<number, number>;

        const baseAccessor = (d: any) => d.base;
        const valueAccessor = (d: any) => d.value;

        beforeEach(() => {
          div = TestMethods.generateDiv();
          barPlot = new Plottable.Plots.Bar<number, number>(orientation);
          baseScale = new Plottable.Scales.Linear();
          valueScale = new Plottable.Scales.Linear();
          if (orientation === BarOrientation.vertical) {
            barPlot.x(baseAccessor, baseScale);
            barPlot.y(valueAccessor, valueScale);
          } else {
            barPlot.y(baseAccessor, baseScale);
            barPlot.x(valueAccessor, valueScale);
          }
        });

        afterEach(function() {
          if (this.currentTest.state === "passed") {
            barPlot.destroy();
            div.remove();
          }
        });

        it("computes the base scale domain correctly when there is only one data point", () => {
          const singlePointData = [
            { base: baseScale.domain()[1] + 10, value: 5 },
          ];
          barPlot.addDataset(new Plottable.Dataset(singlePointData));
          barPlot.renderTo(div);
          const baseScaleDomain = baseScale.domain();
          assert.operator(baseScaleDomain[0], "<=", singlePointData[0].base, "lower end of base domain is less than the value");
          assert.operator(baseScaleDomain[1], ">=", singlePointData[0].base, "upper end of base domain is greater than the value");
        });

        it("base scale domain does not change when autoDomain is called more than once", () => {
          const data = [
            { base: 0, value: 1 },
            { base: 1, value: 2 },
          ];
          barPlot.addDataset(new Plottable.Dataset(data));
          barPlot.renderTo(div);

          const baseDomainAfterRendering = baseScale.domain();
          baseScale.autoDomain();
          const baseDomainAfterAutoDomaining = baseScale.domain();
          assert.deepEqual(baseDomainAfterRendering, baseDomainAfterAutoDomaining, "calling autoDomain() again does not change the domain");
        });
      });

      describe(`auto bar width calculation when ${orientation}`, () => {
        const scaleTypes = ["Linear", "ModifiedLog", "Time"];
        scaleTypes.forEach((scaleType) => {
          describe(`using a ${scaleType} base Scale`, () => {
            let div: d3.Selection<HTMLDivElement, any, any, any>;
            let barPlot: Plottable.Plots.Bar<number | Date, number | Date>;
            let baseScale: Plottable.QuantitativeScale<number | Date>;
            let valueScale: Plottable.Scales.Linear;
            let dataset: Plottable.Dataset;

            beforeEach(() => {
              div = TestMethods.generateDiv();
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

              const baseAccessor = scaleType === "Time" ? (d: any) => new Date(d.base) : (d: any) => d.base;
              const valueAccessor = (d: any) => d.value;
              if (orientation === BarOrientation.vertical) {
                barPlot.x(baseAccessor, baseScale);
                barPlot.y(valueAccessor, valueScale);
              } else {
                barPlot.y(baseAccessor, baseScale);
                barPlot.x(valueAccessor, valueScale);
              }
              dataset = new Plottable.Dataset();
              barPlot.addDataset(dataset);
              barPlot.renderTo(div);
            });

            afterEach(function() {
              if (this.currentTest.state === "passed") {
                barPlot.destroy();
                div.remove();
              }
            });

            it("computes a sensible width", () => {
              const data = [
                { base: 1, value: 5 },
                { base: 10, value: 2 },
                { base: 100, value: 4 },
              ];
              dataset.data(data);

              const closestSeparation = Math.abs(baseScale.scale(data[1].base) - baseScale.scale(data[0].base));
              const bars = barPlot.content().selectAll<Element, any>("rect");
              assert.strictEqual(bars.size(), data.length, "one bar was drawn per datum");
              bars.each(function() {
                const bar = d3.select(this);
                const barSize = TestMethods.numAttr(bar, baseSizeAttr);
                assert.operator(barSize, "<=", closestSeparation, "bar width is less than the closest distance between values");
                assert.operator(barSize, ">=", 0.5 * closestSeparation,
                  "bar width is greater than half the closest distance between values");
              });
            });

            it("accounts for the bar width when autoDomaining the base scale", () => {
              const data = [
                { base: 1, value: 5 },
                { base: 10, value: 2 },
                { base: 100, value: 4 },
              ];
              dataset.data(data);

              const bars = barPlot.content().selectAll<Element, any>("rect");
              assert.strictEqual(bars.size(), data.length, "one bar was drawn per datum");
              const divSize = getDivBaseSizeDimension(div);
              bars.each(function() {
                const bar = d3.select(this);
                const barPosition = TestMethods.numAttr(bar, basePositionAttr);
                const barSize = TestMethods.numAttr(bar, baseSizeAttr);
                assert.operator(barPosition, ">=", 0, `bar is within visible area (${basePositionAttr})`);
                assert.operator(barPosition, "<=", divSize, `bar is within visible area (${basePositionAttr})`);
                assert.operator(barPosition + barSize, ">=", 0, `bar is within visible area (${baseSizeAttr})`);
                assert.operator(barPosition + barSize, "<=", divSize, `bar is within visible area (${baseSizeAttr})`);
              });
            });

            it("does not crash when given bad data", () => {
              const badData: any = [
                {},
                { base: null, value: null },
              ];
              assert.doesNotThrow(() => dataset.data(badData), Error);
            });

            it("computes a sensible width when given only one datum", () => {
              const singleDatumData = [
                { base: 1, value: 5 },
              ];
              dataset.data(singleDatumData);

              const bar = barPlot.content().select("rect");
              const barSize = TestMethods.numAttr(bar, baseSizeAttr);
              const divSize = getDivBaseSizeDimension(div);
              assert.operator(barSize, ">=", divSize / 4, "bar is larger than 1/4 of the available space");
              assert.operator(barSize, "<=", divSize / 2, "bar is smaller than 1/2 of the available space");
            });

            it("computes a sensible width when given repeated base value", () => {
              const repeatedBaseData = [
                { base: 1, value: 5 },
                { base: 1, value: -5 },
              ];
              dataset.data(repeatedBaseData);

              const bars = barPlot.content().selectAll<Element, any>("rect");
              assert.strictEqual(bars.size(), repeatedBaseData.length, "one bar was drawn per datum");
              const divSize = getDivBaseSizeDimension(div);
              bars.each(function() {
                const bar = d3.select(this);
                const barSize = TestMethods.numAttr(bar, baseSizeAttr);
                assert.operator(barSize, ">=", divSize / 4, "bar is larger than 1/4 of the available space");
                assert.operator(barSize, "<=", divSize / 2, "bar is smaller than 1/2 of the available space");
              });
            });

            it("computes a sensible width when given unsorted data", () => {
              const unsortedData = [
                { base: 10, value: 2 },
                { base: 1, value: 5 },
                { base: 100, value: 4 },
              ];
              dataset.data(unsortedData);

              const closestSeparation = Math.abs(baseScale.scale(unsortedData[1].base) - baseScale.scale(unsortedData[0].base));
              const bars = barPlot.content().selectAll<Element, any>("rect");
              assert.strictEqual(bars.size(), unsortedData.length, "one bar was drawn per datum");
              bars.each(function() {
                const bar = d3.select(this);
                const barSize = TestMethods.numAttr(bar, baseSizeAttr);
                assert.operator(barSize, "<=", closestSeparation, "bar width is less than the closest distance between values");
                assert.operator(barSize, ">=", 0.5 * closestSeparation,
                  "bar width is greater than half the closest distance between values");
              });
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
          { base: 4, value: 4 },
        ];
        const DEFAULT_DOMAIN = [-5, 5];

        let div: d3.Selection<HTMLDivElement, any, any, any>;
        let baseScale: Plottable.Scales.Linear;
        let valueScale: Plottable.Scales.Linear;
        let barPlot: Plottable.Plots.Bar<number, number>;
        let dataset: Plottable.Dataset;

        beforeEach(() => {
          div = TestMethods.generateDiv();
          barPlot = new Plottable.Plots.Bar<number, number>(orientation);
          baseScale = new Plottable.Scales.Linear();
          baseScale.domain(DEFAULT_DOMAIN);
          valueScale = new Plottable.Scales.Linear();
          valueScale.domain(DEFAULT_DOMAIN);
          if (orientation === BarOrientation.vertical) {
            barPlot.x((d: any) => d.base, baseScale);
            barPlot.y((d: any) => d.value, valueScale);
          } else {
            barPlot.y((d: any) => d.base, baseScale);
            barPlot.x((d: any) => d.value, valueScale);
          }
          dataset = new Plottable.Dataset(data);
          barPlot.addDataset(dataset);
          barPlot.renderTo(div);
        });

        afterEach(function() {
          if (this.currentTest.state === "passed") {
            barPlot.destroy();
            div.remove();
          }
        });

        function getCenterOfText(textNode: SVGElement) {
          const plotBoundingClientRect = (<SVGElement> barPlot.background().node()).getBoundingClientRect();
          const labelBoundingClientRect = textNode.getBoundingClientRect();

          return {
            x: (labelBoundingClientRect.left + labelBoundingClientRect.right) / 2 - plotBoundingClientRect.left,
            y: (labelBoundingClientRect.top + labelBoundingClientRect.bottom) / 2 - plotBoundingClientRect.top,
          };
        }

        it("does not show labels by default", () => {
          const texts = barPlot.content().selectAll<Element, any>("text");
          assert.strictEqual(texts.size(), 0, "by default, no texts are drawn");
        });

        it("draws one label per datum", () => {
          barPlot.labelsEnabled(true);
          const texts = barPlot.content().selectAll<Element, any>("text");
          assert.strictEqual(texts.size(), data.length, "one label drawn per datum");
          texts.each(function(d, i) {
            assert.strictEqual(d3.select(this).text(), data[i].value.toString(), `by default, label text is the bar's value (index ${i})`);
          });
        });

        it("only draws labels for bars in the viewport", () => {
          barPlot.labelsEnabled(true);
          // center on the middle bar
          baseScale.domain([-0.1, 0.1]);
          const labels = barPlot.content().selectAll("text");
          assert.strictEqual(labels.size(), 1, "only one label");
        });

        it("hides the labels if bars are too thin to show them", () => {
          div.style(baseSizeAttr, getDivBaseSizeDimension(div) / 10 + "px");
          barPlot.redraw();
          barPlot.labelsEnabled(true);

          const texts = barPlot.content().selectAll<Element, any>("text");
          assert.strictEqual(texts.size(), 0, "no labels drawn");
        });

        it("can apply a formatter to the labels", () => {
          barPlot.labelsEnabled(true);
          const formatter = (n: number) => `${n}%`;
          barPlot.labelFormatter(formatter);

          const texts = barPlot.content().selectAll<Element, any>("text");
          assert.strictEqual(texts.size(), data.length, "one label drawn per datum");
          const expectedTexts = data.map((d) => formatter(d.value));
          texts.each(function(d, i) {
            assert.strictEqual(d3.select(this).text(), expectedTexts[i], `formatter is applied to the displayed value (index ${i})`);
          });
        });

        it("shows labels inside or outside the bar as appropriate", () => {
          barPlot.labelsEnabled(true);

          const labels = barPlot.content().selectAll<SVGElement, any>(".on-bar-label, .off-bar-label");
          assert.strictEqual(labels.size(), data.length, "one label drawn per datum");

          const bars = barPlot.content().select(".bar-area").selectAll<SVGElement, any>("rect");
          labels.each((d, i) => {
            const labelBoundingClientRect = labels.nodes()[i].getBoundingClientRect();
            const barBoundingClientRect = bars.nodes()[i].getBoundingClientRect();
            if ((<any> labelBoundingClientRect)[valueSizeAttr] > (<any> barBoundingClientRect)[valueSizeAttr]) {
              assert.isTrue(d3.select(labels.nodes()[i]).classed("off-bar-label"),
                `label with index ${i} doesn't fit and carries the off-bar class`);
            } else {
              assert.isTrue(d3.select(labels.nodes()[i]).classed("on-bar-label"),
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

        it("shifts on-bar-label to off-bar-label", () => {
          barPlot.labelsEnabled(true);
          const labels = barPlot.content().selectAll<Element, any>(".on-bar-label, .off-bar-label");
          const lastLabel = d3.select(labels.nodes()[4]);
          assert.isDefined(lastLabel.select(".off-bar-label"), "last bar starts on-bar");
          const centerOfText = getCenterOfText(<SVGElement> lastLabel.select("text").node());
          const centerValue = valueScale.invert(isVertical ? centerOfText.y : centerOfText.x);

          // shift the plot such that the last bar's on-bar label is cut off
          valueScale.domain([centerValue, centerValue + (DEFAULT_DOMAIN[1] - DEFAULT_DOMAIN[0])]);

          const newLabels = barPlot.content().selectAll<Element, any>(".on-bar-label, .off-bar-label");
          assert.strictEqual(newLabels.size(), 1, "only one label is drawn now");
          assert.isTrue(d3.select(newLabels.nodes()[0]).classed("off-bar-label"),
            "cut off on-bar label was switched to off-bar");
          div.remove();
        });

        // HACKHACK: This test is a bit hacky, but it seems to be testing for a bug fixed in
        // https://github.com/palantir/plottable/pull/1240 . Leaving it until we find a better way to test for it.
        it("removes labels instantly on dataset change", (done) => {
          barPlot.labelsEnabled(true);
          let texts = barPlot.content().selectAll<Element, any>("text");
          assert.strictEqual(texts.size(), dataset.data().length, "one label drawn per datum");
          const originalDrawLabels = (<any> barPlot)._drawLabels;
          let called = false;
          (<any> barPlot)._drawLabels = () => {
            if (!called) {
              originalDrawLabels.apply(barPlot);
              texts = barPlot.content().selectAll<Element, any>("text");
              assert.strictEqual(texts.size(), dataset.data().length, "texts were repopulated by drawLabels after the update");
              called = true; // for some reason, in phantomJS, `done` was being called multiple times and this caused the test to fail.
              done();
            }
          };
          dataset.data(dataset.data());
          texts = barPlot.content().selectAll<Element, any>("text");
          assert.strictEqual(texts.size(), 0, "texts were immediately removed");
        });
      });

      describe(`retrieving Entities when ${orientation}`, () => {
        const data = [
          { base: -1, value: -1 },
          { base: 0, value: 0 },
          { base: 1, value: 1 },
        ];
        const DEFAULT_DOMAIN = [-2, 2];

        let div: d3.Selection<HTMLDivElement, any, any, any>;
        let barPlot: Plottable.Plots.Bar<number, number>;
        let baseScale: Plottable.Scales.Linear;
        let valueScale: Plottable.Scales.Linear;
        let dataset: Plottable.Dataset;

        beforeEach(() => {
          div = TestMethods.generateDiv();
          barPlot = new Plottable.Plots.Bar<number, number>(orientation);
          baseScale = new Plottable.Scales.Linear();
          baseScale.domain(DEFAULT_DOMAIN);
          valueScale = new Plottable.Scales.Linear();
          valueScale.domain(DEFAULT_DOMAIN);
          if (orientation === BarOrientation.vertical) {
            barPlot.x((d: any) => d.base, baseScale);
            barPlot.y((d: any) => d.value, valueScale);
          } else {
            barPlot.y((d: any) => d.base, baseScale);
            barPlot.x((d: any) => d.value, valueScale);
          }
          dataset = new Plottable.Dataset(data);
          barPlot.addDataset(dataset);
          barPlot.renderTo(div);
        });

        afterEach(function() {
          if (this.currentTest.state === "passed") {
            barPlot.destroy();
            div.remove();
          }
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
            y: isVertical ? valuePosition : basePosition,
          };
        }

        function expectedEntityForIndex(sourceDataIndex: number, visibleElementIndex: number) {
          const datum = data[sourceDataIndex];
          const basePosition = baseScale.scale(datum.base);
          const valuePosition = valueScale.scale(datum.value);
          const element = barPlot.content().selectAll<Element, any>("rect").nodes()[visibleElementIndex];
          return {
            datum: datum,
            index: sourceDataIndex,
            dataset: dataset,
            datasetIndex: 0,
            position: getPointFromBaseAndValuePositions(basePosition, valuePosition),
            selection: d3.select(element),
            component: barPlot,
            bounds: entityBounds(element),
          };
        }

        describe("retrieving the nearest Entity", () => {
          function testEntityNearest() {
            data.forEach((datum, index) => {
              const expectedEntity = expectedEntityForIndex(index, index);

              const barBasePosition = baseScale.scale(datum.base);

              const halfwayValuePosition = valueScale.scale((barPlot.baselineValue() + datum.value) / 2);
              const pointInsideBar = getPointFromBaseAndValuePositions(barBasePosition, halfwayValuePosition);
              const nearestInsideBar = barPlot.entityNearest(pointInsideBar);
              TestMethods.assertPlotEntitiesEqual(nearestInsideBar, expectedEntity, "retrieves the Entity for a bar if inside the bar");

              const abovePosition = valueScale.scale(2 * datum.value);
              const pointAboveBar = getPointFromBaseAndValuePositions(barBasePosition, abovePosition);
              const nearestAboveBar = barPlot.entityNearest(pointAboveBar);
              TestMethods.assertPlotEntitiesEqual(nearestAboveBar, expectedEntity,
                "retrieves the Entity for a bar if beyond the end of the bar");

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
            const expectedEntity = expectedEntityForIndex(1, 0); // nearest visible bar
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
              y: barPlot.height() / 2,
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
              const expectedEntity = expectedEntityForIndex(index, index);

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
              max: bar0FarEdge,
            };
            const fullSizeValueRange = {
              min: -Infinity,
              max: Infinity,
            };

            const entitiesInRange = isVertical ? barPlot.entitiesIn(baseRange, fullSizeValueRange)
                                               : barPlot.entitiesIn(fullSizeValueRange, baseRange);
            assert.lengthOf(entitiesInRange, 1, "retrieved two Entities when range intersects one bar");
            TestMethods.assertPlotEntitiesEqual(entitiesInRange[0], expectedEntityForIndex(0, 0), "Entity corresponds to bar 0");
          });

          it("returns the Entity if the range includes any part of the bar", () => {
            const quarterUpBar0 = valueScale.scale(data[0].value / 4);
            const halfUpBar0 = valueScale.scale(data[0].value / 2);
            const valueRange = {
              min: Math.min(quarterUpBar0, halfUpBar0),
              max: Math.max(quarterUpBar0, halfUpBar0),
            };
            const fullSizeBaseRange = {
              min: -Infinity,
              max: Infinity,
            };
            const entitiesInRange = isVertical ? barPlot.entitiesIn(fullSizeBaseRange, valueRange)
                                               : barPlot.entitiesIn(valueRange, fullSizeBaseRange);
            assert.lengthOf(entitiesInRange, 1, "retrieved one entity when range intersects one bar");
            TestMethods.assertPlotEntitiesEqual(entitiesInRange[0], expectedEntityForIndex(0, 0), "Entity corresponds to bar 0");
          });
        });
      });
    });

    describe("Bar Alignment", () => {
      const data = [
        { x0: 0, x1: 10, y: 10 },
        { x0: 10, x1: 30, y: 20 },
        { x0: 30, x1: 100, y: 30 },
      ];

      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let plot: Plottable.Plots.Bar<number, number>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Linear().domain([0, 100]);
        yScale = new Plottable.Scales.Linear().domain([0, 30]);
        plot = new Plottable.Plots.Bar<number, number>()
          .addDataset(new Plottable.Dataset(data))
          .x((d) => d.x0, xScale)
          .y((d) => d.y, yScale)
          .renderTo(div);
      });

      afterEach(() => {
        plot.destroy();
        div.remove();
      });

      it("aligns middle by default", () => {
        const bars = plot.content().select(".bar-area").selectAll<SVGElement, any>("rect").nodes();
        assert.lengthOf(bars, 3);
        assert.equal(bars[0].getAttribute("width"), bars[1].getAttribute("width"));
        assert.equal(bars[1].getAttribute("width"), bars[2].getAttribute("width"));

        const domainWidth = xScale.invert(parseInt(bars[0].getAttribute("width")));
        assert.closeTo(parseInt(bars[0].getAttribute("x")), xScale.scale(-domainWidth/2), 2);
      });

      it("aligns at start", () => {
        plot.barAlignment("start");

        const bars = plot.content().select(".bar-area").selectAll<SVGElement, any>("rect").nodes();
        assert.lengthOf(bars, 3);
        assert.equal(bars[0].getAttribute("width"), bars[1].getAttribute("width"));
        assert.equal(bars[1].getAttribute("width"), bars[2].getAttribute("width"));

        assert.closeTo(parseInt(bars[0].getAttribute("x")), xScale.scale(0), 2);
      });

      it("aligns at end", () => {
        plot.barAlignment("end");

        const bars = plot.content().select(".bar-area").selectAll<SVGElement, any>("rect").nodes();
        assert.lengthOf(bars, 3);
        assert.equal(bars[0].getAttribute("width"), bars[1].getAttribute("width"));
        assert.equal(bars[1].getAttribute("width"), bars[2].getAttribute("width"));

        const domainWidth = xScale.invert(parseInt(bars[0].getAttribute("width")));
        assert.closeTo(parseInt(bars[0].getAttribute("x")), xScale.scale(-domainWidth), 2);
      });
    });

    describe("Bar End", () => {
      const data = [
        { x0: 0, x1: 10, y: 10 },
        { x0: 10, x1: 30, y: 20 },
        { x0: 30, x1: 100, y: 30 },
      ];

      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let plot: Plottable.Plots.Bar<number, number>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Linear().domain([0, 100]);
        yScale = new Plottable.Scales.Linear().domain([0, 30]);
        plot = new Plottable.Plots.Bar<number, number>()
          .addDataset(new Plottable.Dataset(data))
          .x((d) => d.x0, xScale)
          .y((d) => d.y, yScale)
          .barEnd((d) => d.x1)
          .renderTo(div);
      });

      afterEach(() => {
        plot.destroy();
        div.remove();
      });

      it("scales width between x and barEnd", () => {
        const bars = plot.content().select(".bar-area").selectAll<SVGElement, any>("rect").nodes();
        assert.lengthOf(bars, 3);
        assert.closeTo(parseInt(bars[0].getAttribute("width")), xScale.scale(10), 2);
        assert.closeTo(parseInt(bars[1].getAttribute("width")), xScale.scale(20), 2);
        assert.closeTo(parseInt(bars[2].getAttribute("width")), xScale.scale(70), 2);
      });
    });

  });
});
