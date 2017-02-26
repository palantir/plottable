import { SimpleSelection } from "../../src/core/interfaces";
import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";
import { getTranslateValues, getScaleValues } from "../../src/utils/domUtils";

describe("Plots", () => {
  describe("XY Plot", () => {
    describe("autoranging on the x and y scales", () => {
      let svg: SimpleSelection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.XYPlot<number, number>;
      let xAccessor = (d: any) => d.x;
      let yAccessor = (d: any) => d.y;
      const yTransform = (d: number) => Math.pow(d, 2);
      const xTransform = (d: number) => Math.pow(d, 0.5);

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.XYPlot<number, number>();
        const simpleDataset = new Plottable.Dataset(generateYTransformData(5));
        plot.addDataset(simpleDataset);
        plot.x(xAccessor, xScale)
            .y(yAccessor, yScale)
            .anchor(svg);
        xScale.padProportion(0);
        yScale.padProportion(0);
      });

      function generateYTransformData(count: number) {
        return Plottable.Utils.Math.range(0, count).map((datumNumber: number) => {
          return {
            x: datumNumber,
            y: yTransform(datumNumber),
          };
        });
      };

      it("can set the autorange mode", () => {
        assert.strictEqual(plot.autorangeMode(), "none", "defaults to no autoranging");
        assert.strictEqual(plot.autorangeMode("x"), plot, "setting autorange mode returns plot");
        assert.strictEqual(plot.autorangeMode(), "x", "autorange mode set to x");
        plot.autorangeMode("y");
        assert.strictEqual(plot.autorangeMode(), "y", "autorange mode set to y");
        plot.autorangeMode("none");
        assert.strictEqual(plot.autorangeMode(), "none", "autorange mode set to none");
        svg.remove();
      });

      it("throws an error on setting an invalid autorange mode", () => {
        (<any> assert).throws(() => plot.autorangeMode("foobar"), "Invalid scale", "cannot set an invalid mode");
        svg.remove();
      });

      it("automatically adjusts Y domain over visible points", () => {
        let oldYDomain = yScale.domain();
        const newXDomain = [2, 3];
        xScale.domain(newXDomain);
        assert.deepEqual(yScale.domain(), oldYDomain, "domain not adjusted to visible points");
        plot.autorangeMode("y");
        assert.deepEqual(yScale.domain(), newXDomain.map(yTransform), "domain has been adjusted to visible points");
        svg.remove();
      });

      it("automatically adjusts Y domain to the default when no points are visible", () => {
        plot.autorangeMode("y");
        const newXDomain = [-2, -1];
        xScale.domain(newXDomain);
        assert.deepEqual(yScale.domain(), [0, 1], "scale uses default domain");
        svg.remove();
      });

      it("automatically adjusts Y domain when X scale is replaced", () => {
        plot.autorangeMode("y");
        const newXScaleDomain = [0, 3];
        const newXScale = new Plottable.Scales.Linear().domain(newXScaleDomain);
        plot.x(xAccessor, newXScale);
        assert.deepEqual(yScale.domain(), newXScaleDomain.map(yTransform), "domain adjusted to visible points on new X scale domain");
        xScale.domain([-2, 2]);
        assert.deepEqual(yScale.domain(), newXScaleDomain.map(yTransform), "y scale domain does not change");
        svg.remove();
      });

      it("automatically adjusts X domain over visible points", () => {
        const oldXDomain = xScale.domain();
        yScale.domain([0, 1]);
        assert.deepEqual(xScale.domain(), oldXDomain, "domain has not been adjusted to visible points");
        plot.autorangeMode("x");
        assert.deepEqual(xScale.domain(), yScale.domain().map(xTransform), "domain has been adjusted to visible points");
        svg.remove();
      });

      it("automatically adjusts X domain to the default when no points are visible", () => {
        plot.autorangeMode("x");
        yScale.domain([-2, -1]);
        assert.deepEqual(xScale.domain(), [0, 1], "scale uses default domain");
        svg.remove();
      });

      it("automatically adjusts X domain when Y scale is replaced", () => {
        plot.autorangeMode("x");
        const newYScaleDomain = [0, 1];
        const newYScale = new Plottable.Scales.Linear().domain(newYScaleDomain);
        plot.y(yAccessor, newYScale);
        assert.deepEqual(xScale.domain(), newYScaleDomain.map(xTransform), "domain adjusted to visible points on new Y scale domain");
        yScale.domain([-2, 2]);
        assert.deepEqual(xScale.domain(), newYScaleDomain.map(xTransform), "x scale domain does not change");
        svg.remove();
      });

      it("can show all of the data regardless of autoranging", () => {
        plot.autorangeMode("y");
        xScale.domain([-0.5, 0.5]);
        plot.showAllData();
        assert.deepEqual(yScale.domain(), [0, 16], "y domain adjusted to show all data");
        assert.deepEqual(xScale.domain(), [0, 4], "x domain adjusted to show all data");
        svg.remove();
      });

      it("stops autoranging after the plot is destroyed", () => {
        plot.autorangeMode("y");
        plot.destroy();

        xScale.domain([0, 2]);

        assert.deepEqual(yScale.domain(), [0, 1], "autoranging no longer occurs");

        svg.remove();
      });
    });

    describe("deferred rendering", () => {
      let plot: Plottable.XYPlot<number, number>;

      beforeEach(() => {
        plot = new Plottable.XYPlot<number, number>();
      });

      it("can set if rendering is deferred", () => {
        assert.strictEqual(plot.deferredRendering(), false, "deferred rendering is false by default");
        assert.strictEqual(plot.deferredRendering(true), plot, "setting the deferred rendering option returns the plot");
        assert.strictEqual(plot.deferredRendering(), true, "deferred rendering can be turned on");
        plot.deferredRendering(false);
        assert.strictEqual(plot.deferredRendering(), false, "deferred rendering can be turned off");
      });

      it("immediately translates the render area when the scale domain is translated", () => {
        plot.deferredRendering(true);
        const svg = TestMethods.generateSVG();
        plot.anchor(svg);

        const xScale = new Plottable.Scales.Linear();
        plot.x(0, xScale);

        const translateAmount = 1;
        xScale.domain(xScale.domain().map((d) => d + translateAmount));
        const renderAreaTranslate = getTranslateValues(plot.content().select(".render-area"));
        assert.deepEqual(renderAreaTranslate[0], -translateAmount, "translates with the same amount as domain shift");

        svg.remove();
      });

      it("immediately scales the render area when the scale domain is scaled", () => {
        const svg = TestMethods.generateSVG();
        plot.anchor(svg);

        const xScale = new Plottable.Scales.Linear();
        plot.x(0, xScale);
        plot.deferredRendering(true);
        plot.computeLayout();

        const magnifyAmount = 2;
        xScale.domain(xScale.domain().map((d) => d * magnifyAmount));
        const renderAreaScale = getScaleValues(plot.content().select(".render-area"));
        assert.deepEqual(renderAreaScale[0], 1 / magnifyAmount, "translates with the same amount as domain shift");

        svg.remove();
      });
    });

    describe("computing the layout", () => {
      let svg: SimpleSelection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
      });

      it("extends the x scale range to the component width", () => {
        const xScale = new Plottable.Scales.Linear();
        const plot = new Plottable.XYPlot<number, number>();
        plot.x(0, xScale);
        plot.anchor(svg);
        plot.computeLayout();

        assert.deepEqual(xScale.range(), [0, plot.width()], "range extends to the width");

        svg.remove();
      });

      it("sets the y scale range to start from the bottom for non-Category scales", () => {
        const yScale = new Plottable.Scales.Linear();
        const plot = new Plottable.XYPlot<number, number>();
        plot.y(0, yScale);
        plot.anchor(svg);
        plot.computeLayout();

        assert.deepEqual(yScale.range(), [plot.height(), 0], "range extends from the height");

        svg.remove();
      });

      it("sets the y scale range to start from the top if it is a Category scale", () => {
        const yScale = new Plottable.Scales.Category();
        const plot = new Plottable.XYPlot<number, string>();
        plot.y("one", yScale);
        plot.anchor(svg);
        plot.computeLayout();

        assert.deepEqual(yScale.range(), [0, plot.height()], "range extends to the height");

        svg.remove();
      });
    });

    describe("managing the x property", () => {
      let plot: Plottable.XYPlot<number, number>;

      beforeEach(() => {
        plot = new Plottable.XYPlot<number, number>();

        // HACKHACK: Must install y scale https://github.com/palantir/plottable/issues/2934
        plot.y(0, new Plottable.Scales.Linear());
      });

      afterEach(() => {
        plot.destroy();
      });

      it("can set the x property to a constant value", () => {
        const constantX = 10;
        assert.strictEqual(plot.x(constantX), plot, "setting the x property returns the plot");
        assert.strictEqual(plot.x().accessor(null, 0, null), constantX, "returns an accessor returning the constant value");
      });

      it("can set the x property be based on data", () => {
        const accessor = (d: any) => d * 10;
        assert.strictEqual(plot.x(accessor), plot, "setting the x property returns the plot");

        const testData = [4, 2, 3, 5, 6];
        const dataset = new Plottable.Dataset(testData);
        dataset.data().forEach((d, i) => {
          assert.strictEqual(plot.x().accessor(d, i, dataset), accessor(d), "returns the input accessor");
        });
      });

      it("can set the x property be based on scaled data", () => {
        const accessor = (d: any) => d * 10;
        const scale = new Plottable.Scales.Linear();
        assert.strictEqual(plot.x(accessor, scale), plot, "setting the x property returns the plot");

        const testData = [4, 2, 3, 5, 6];
        const dataset = new Plottable.Dataset(testData);
        dataset.data().forEach((d, i) => {
          const bindingAccessor = plot.x().accessor;
          const bindingScale = plot.x().scale;
          assert.strictEqual(bindingScale.scale(bindingAccessor(d, i, dataset)),
            scale.scale(accessor(d)), "returns the input accessor and scale");
        });
      });

      it("sets the range on the input scale if the plot has a width", () => {
        const svg = TestMethods.generateSVG();
        plot.anchor(svg);
        plot.computeLayout();

        const scale = new Plottable.Scales.Linear();
        assert.strictEqual(plot.x(0, scale), plot, "setting the x property returns the plot");

        assert.deepEqual(scale.range(), [0, plot.width()], "range goes to width on scale");

        svg.remove();
      });

      it("can install its extent onto the input scale", () => {
        const svg = TestMethods.generateSVG();
        const data = [0, 1, 2, 3, 4];
        plot.addDataset(new Plottable.Dataset(data));

        plot.anchor(svg);

        const scale = new Plottable.Scales.Linear();
        scale.padProportion(0);
        assert.strictEqual(plot.x((d) => d, scale), plot, "setting the x property returns the plot");

        const mathUtils = Plottable.Utils.Math;
        assert.deepEqual(scale.domain(), [mathUtils.min(data, 0), mathUtils.max(data, 0)], "range goes to width on scale");

        svg.remove();
      });
    });

    describe("managing the y property", () => {
      let plot: Plottable.XYPlot<number, any>;

      beforeEach(() => {
        plot = new Plottable.XYPlot<number, any>();

        // HACKHACK: Must install x scale https://github.com/palantir/plottable/issues/2934
        plot.x(0, new Plottable.Scales.Linear());
      });

      afterEach(() => {
        plot.destroy();
      });

      it("can set the y property to a constant value", () => {
        const constantY = 10;
        assert.strictEqual(plot.y(constantY), plot, "setting the y property returns the plot");
        assert.strictEqual(plot.y().accessor(null, 0, null), constantY, "returns an accessor returning the constant value");
      });

      it("can set the y property be based on data", () => {
        const accessor = (d: any) => d * 10;
        assert.strictEqual(plot.y(accessor), plot, "setting the y property returns the plot");

        const testData = [4, 2, 3, 5, 6];
        const dataset = new Plottable.Dataset(testData);
        dataset.data().forEach((d, i) => {
          assert.strictEqual(plot.y().accessor(d, i, dataset), accessor(d), "returns the input accessor");
        });
      });

      it("can set the y property be based on scaled data", () => {
        const accessor = (d: any) => d * 10;
        const scale = new Plottable.Scales.Linear();
        assert.strictEqual(plot.y(accessor, scale), plot, "setting the y property returns the plot");

        const testData = [4, 2, 3, 5, 6];
        const dataset = new Plottable.Dataset(testData);
        dataset.data().forEach((d, i) => {
          const bindingAccessor = plot.y().accessor;
          const bindingScale = plot.y().scale;
          assert.strictEqual(bindingScale.scale(bindingAccessor(d, i, dataset)),
            scale.scale(accessor(d)), "returns the input accessor and scale");
        });
      });

      it("sets the range on the input scale if the plot has a height", () => {
        const svg = TestMethods.generateSVG();
        plot.anchor(svg);
        plot.computeLayout();

        const scale = new Plottable.Scales.Linear();
        assert.strictEqual(plot.y(0, scale), plot, "setting the y property returns the plot");

        assert.deepEqual(scale.range(), [plot.height(), 0], "range goes from height on scale");

        svg.remove();
      });

      it("sets the range to be reversed on the input Category scale if the plot has a height", () => {
        const svg = TestMethods.generateSVG();
        plot.anchor(svg);
        plot.computeLayout();

        const scale = new Plottable.Scales.Category();
        assert.strictEqual(plot.y(0, scale), plot, "setting the y property returns the plot");

        assert.deepEqual(scale.range(), [0, plot.height()], "range goes to height on scale");

        svg.remove();
      });

      it("can install its extent onto the input scale", () => {
        const svg = TestMethods.generateSVG();
        const data = [0, 1, 2, 3, 4];
        plot.addDataset(new Plottable.Dataset(data));

        plot.anchor(svg);

        const scale = new Plottable.Scales.Linear();
        scale.padProportion(0);
        assert.strictEqual(plot.y((d: number) => d, scale), plot, "setting the y property returns the plot");

        const mathUtils = Plottable.Utils.Math;
        assert.deepEqual(scale.domain(), [mathUtils.min(data, 0), mathUtils.max(data, 0)], "range goes to width on scale");

        svg.remove();
      });
    });
  });
});
