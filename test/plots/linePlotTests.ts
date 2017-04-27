import * as d3 from "d3";

import { assert } from "chai";
import * as sinon from "sinon";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Plots", () => {
  describe("LinePlot", () => {
    describe("Basic Usage", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let linePlot: Plottable.Plots.Line<number>;
      const data = [{x: 0, y: 0}, {x: 1, y: 1}];
      let dataset: Plottable.Dataset;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        linePlot = new Plottable.Plots.Line<number>();
        linePlot.x((d: any) => d.x, xScale);
        linePlot.y((d: any) => d.y, yScale);
        dataset = new Plottable.Dataset(data);
      });

      it("does not throw error when given NaN values", () => {
        const dataWithNaN = [
          { x: 0.0, y: 0.0 },
          { x: 0.2, y: 0.2 },
          { x: 0.4, y: NaN },
          { x: 0.6, y: 0.6 },
          { x: 0.8, y: 0.8 },
        ];

        linePlot.addDataset(new Plottable.Dataset(dataWithNaN));
        assert.doesNotThrow(() => linePlot.renderTo(div), Error, "does not throw error with NaN data");

        const entities = linePlot.entities();
        const expectedLength = dataWithNaN.length - 1;
        assert.lengthOf(entities, expectedLength, "NaN data was not returned");

        div.remove();
      });

      it("does not throw error when rendering without data", () => {
        assert.doesNotThrow(() => linePlot.renderTo(div), Error, "does not throw error rendering without data");
        div.remove();
      });

      it("retains original classes when setting class with attr", () => {
        const cssClass = "pink";
        linePlot.attr("class", cssClass);
        linePlot.renderTo(div);
        linePlot.addDataset(dataset);

        const linePath = linePlot.content().select(".line");
        assert.isTrue(linePath.classed(cssClass), "custom class is applied");
        assert.isTrue(linePath.classed("line"), "default class is retained");
        div.remove();
      });

      it("draws a line with correct data points and fill and stroke settings", () => {
        linePlot.addDataset(dataset);
        linePlot.attr("stroke", (d, i, m) => d3.rgb(d.x, d.y, i).toString());
        linePlot.renderTo(div);

        const linePath = linePlot.content().select(".line");
        TestMethods.assertPathEqualToDataPoints(linePath.attr("d"), data, xScale, yScale);
        assert.strictEqual(linePath.style("fill"), "none", "line fill renders as \"none\"");
        assert.strictEqual(linePath.attr("stroke"), "rgb(0, 0, 0)", "stroke set correctly");
        div.remove();
      });

      it("can set attributes and render accordingly", () => {
        linePlot.addDataset(dataset);
        linePlot.renderTo(div);

        const newColor = "pink";
        linePlot.attr("stroke", newColor);
        linePlot.render();
        const linePath = linePlot.content().select(".line");
        assert.strictEqual(linePath.attr("stroke"), newColor, "stroke changed correctly");
        div.remove();
      });

      it("skips NaN and undefined x and y values", () => {
        const lineData = [
          { x: 0.0, y: 0.0 },
          { x: 0.2, y: 0.2 },
          { x: 0.4, y: 0.4 },
          { x: 0.6, y: 0.6 },
          { x: 0.8, y: 0.8 },
        ];
        const mutableDataset = new Plottable.Dataset(lineData);
        linePlot.addDataset(mutableDataset);
        linePlot.renderTo(div);

        const linePath = linePlot.content().select(".line");
        const validPoints = lineData.slice(0, 2).concat(lineData.slice(3, 5));
        const dataWithNaN = lineData.slice();

        dataWithNaN[2] = { x: 0.4, y: NaN };
        mutableDataset.data(dataWithNaN);
        linePlot.render();
        TestMethods.assertPathEqualToDataPoints(linePath.attr("d"), validPoints, xScale, yScale);

        dataWithNaN[2] = { x: NaN, y: 0.4 };
        mutableDataset.data(dataWithNaN);
        TestMethods.assertPathEqualToDataPoints(linePath.attr("d"), validPoints, xScale, yScale);

        const dataWithUndefined = lineData.slice();
        dataWithUndefined[2] = { x: 0.4, y: undefined };
        mutableDataset.data(dataWithUndefined);
        TestMethods.assertPathEqualToDataPoints(linePath.attr("d"), validPoints, xScale, yScale);

        dataWithUndefined[2] = { x: undefined, y: 0.4 };
        mutableDataset.data(dataWithUndefined);
        TestMethods.assertPathEqualToDataPoints(linePath.attr("d"), validPoints, xScale, yScale);

        div.remove();
      });
    });

    describe("Collapse Dense Vertical Lines", () => {
      const collapsableData = [
        // start
        [0, 10],
        // bucket 1
        [1,   7],
        [1.1, 5],
        [1,   7],
        [1.1, 5],
        [1,   7],
        [1.1, 5],
        [1,   7],
        [1.1, 5],
        // bucket 2
        [4,   8],
        [4.1, 2],
        [4,   8],
        [4.1, 2],
        [4,   8],
        [4.1, 2],
        // end
        [10, 10],
      ]; // data that should be collapsed

      it("can set line collapse flag", () => {
        const linePlot = new Plottable.Plots.Line<number>();
        linePlot.collapseDenseLinesEnabled(true);
        assert.isTrue(linePlot.collapseDenseLinesEnabled());

        linePlot.collapseDenseLinesEnabled(false);
        assert.isFalse(linePlot.collapseDenseLinesEnabled());
      });

      it("collapses lines when enabled", () => {
        const div = TestMethods.generateDiv();
        const linePlot = new Plottable.Plots.Line<number>();

        linePlot.x((d: any) => d[0]);
        linePlot.y((d: any) => d[1]);
        linePlot.addDataset(new Plottable.Dataset(collapsableData));
        linePlot.collapseDenseLinesEnabled(true);

        const spy = sinon.spy(linePlot, "_bucketByX");
        linePlot.renderTo(div);
        div.remove();

        assert.equal(spy.callCount, 1, "called once");
        assert.isDefined(spy.returnValues, "has returns");
        assert.isDefined(spy.returnValues[0], "returned valid");
        assert.equal(spy.returnValues[0].length, 8, "line was collapsed");
      });
    });

    describe("interpolation", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let linePlot: Plottable.Plots.Line<number>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        linePlot = new Plottable.Plots.Line<number>();
        linePlot.x((d: any) => d.x, xScale);
        linePlot.y((d: any) => d.y, yScale);
      });

      it("sets interploation correctly", () => {
        assert.strictEqual(linePlot.curve(), "linear", "the default interpolation mode is linear");
        assert.strictEqual(linePlot.curve("step"), linePlot, "setting an interpolation mode returns the plot");
        assert.strictEqual(linePlot.curve(), "step", "setting an interpolation mode works");

        div.remove();
      });

      it("draws step function when interpolator is set to step", () => {
        const data = [
          {x: 0.0, y: 0},
          {x: 0.8, y: 0.717},
          {x: 1.6, y: 0.999},
          {x: 2.4, y: 0.675},
          {x: 3.2, y: -0.058},
          {x: 4.0, y: -0.756},
          {x: 4.8, y: -0.996},
          {x: 5.6, y: -0.631},
        ];

        linePlot.addDataset(new Plottable.Dataset(data));
        linePlot.renderTo(div);

        let svgPath = linePlot.content().select("path").attr("d");
        TestMethods.assertPathEqualToDataPoints(svgPath, data, xScale, yScale);

        linePlot.curve("step");

        svgPath = linePlot.content().select("path").attr("d");
        const stepPoints = [data[0]];
        for (let i = 1; i < data.length; i ++ ) {
          const p1 = data[i - 1];
          const p2 = data[i];
          stepPoints.push({ x: (p1.x + p2.x) / 2, y: p1.y });
          stepPoints.push({ x: (p1.x + p2.x) / 2, y: p2.y });
        }
        stepPoints.push({ x: data[data.length - 1].x, y:  data[data.length - 1].y });
        TestMethods.assertPathEqualToDataPoints(svgPath, stepPoints, xScale, yScale);

        div.remove();
      });
    });

    describe("selections", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      const data = [{ x: 0, y: 0.75 }, { x: 1, y: 0.25 }];
      const data2 = [{ x: 0, y: 1 }, { x: 1, y: 0.95 }];
      let dataset: Plottable.Dataset;
      let dataset2: Plottable.Dataset;
      let linePlot: Plottable.Plots.Line<number>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        dataset = new Plottable.Dataset(data);
        dataset2 = new Plottable.Dataset(data2);
        linePlot = new Plottable.Plots.Line<number>();
        linePlot.x((d) => d.x, xScale);
        linePlot.y((d) => d.y, yScale);
        linePlot.addDataset(dataset);
        linePlot.renderTo(div);
      });

      afterEach(() => {
        div.remove();
      });

      it("can retrieve entities in a certain range", () => {
        linePlot.addDataset(dataset2);

        const entities = linePlot.entitiesIn({
            min: xScale.scale(0),
            max: xScale.scale(0),
          }, {
            min: yScale.scale(1),
            max: yScale.scale(0),
          });

        assert.lengthOf(entities, 2, "only two Entities have been retrieved");
        assert.deepEqual(entities[0].datum, { x: 0, y: 0.75 }, "correct datum has been retrieved");
        assert.deepEqual(entities[1].datum, { x: 0, y: 1 }, "correct datum has been retrieved");
      });

      it("can retrieve Entities in a certain bounds", () => {
        linePlot.addDataset(dataset2);

        const entities = linePlot.entitiesIn({
          topLeft: {
            x: xScale.scale(0),
            y: yScale.scale(1),
          },
          bottomRight: {
            x: xScale.scale(0),
            y: yScale.scale(0),
          },
        });

        assert.lengthOf(entities, 2, "only two Entities have been retrieved");
        assert.deepEqual(entities[0].datum, { x: 0, y: 0.75 }, "correct datum has been retrieved");
        assert.deepEqual(entities[1].datum, { x: 0, y: 1 }, "correct datum has been retrieved");
      });

      it("doesn't return entities outside of the bounds", () => {
        const entities = linePlot.entitiesIn({
          topLeft: {
            x: xScale.scale(0.01),
            y: yScale.scale(1),
          },
          bottomRight: {
            x: xScale.scale(0.01),
            y: yScale.scale(0),
          },
        });

        assert.lengthOf(entities, 0, "no entities have been retrieved");
      });

      it("retrieves all dataset selections with no args", () => {
        linePlot.addDataset(dataset2);
        const allLines = linePlot.selections();
        assert.strictEqual(allLines.size(), 2, "all lines retrieved");

        div.remove();
      });

      it("retrieves selections for selected dataset", () => {
        linePlot.addDataset(dataset2);
        const allLines = linePlot.selections([dataset]);
        assert.strictEqual(allLines.size(), 1, "all lines retrieved");
        const selectionData = allLines.data()[0];
        assert.deepEqual(selectionData, dataset.data(), "third dataset data in selection data");
      });

      it("skips invalid Dataset", () => {
        const dummyDataset = new Plottable.Dataset([]);

        const allLines = linePlot.selections([dataset, dummyDataset]);
        assert.strictEqual(allLines.size(), 1, "all lines retrieved");
        const selectionData = allLines.data()[0];
        assert.deepEqual(selectionData, dataset.data(), "third dataset data in selection data");
      });

      it("can retrieve the nearest Entity", () => {
        let px = xScale.scale(data[0].x);
        let py = yScale.scale(data[0].y);
        let closest = linePlot.entityNearest({x: px, y: py + 1});
        assert.strictEqual(closest.datum, data[0], "it retrieves the closest point from above");

        closest = linePlot.entityNearest({x: px, y: py - 1});
        assert.strictEqual(closest.datum, data[0], "it retrieves the closest point from below");

        px = xScale.scale(data[1].x);
        py = yScale.scale(data[1].y);

        closest = linePlot.entityNearest({x: px + 1, y: py});
        assert.strictEqual(closest.datum, data[1], "it retrieves the closest point from the right");

        closest = linePlot.entityNearest({x: px - 1, y: py});
        assert.strictEqual(closest.datum, data[1], "it retrieves the closest point from the left");
      });

      it("considers only in-view points for the nearest Entity", () => {
        xScale.domain([0.25, 1]);

        const closest = linePlot.entityNearest({ x: xScale.scale(data[0].x), y: yScale.scale(data[0].y) });
        assert.strictEqual(closest.datum, data[1], "it retrieves the closest point in-view");
      });

      it("returns undefined if no Entities are visible", () => {
        dataset.data([]);
        const closest = linePlot.entityNearest({ x: 0, y: 0 });
        assert.isUndefined(closest, "returns undefined if no Entity can be found");
      });
    });

    describe("smooth autoranging", () => {

      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      const data = [
        {x: 0.0, y: -1},
        {x: 1.8, y: -2},
      ];
      let dataset: Plottable.Dataset;
      let line: Plottable.Plots.Line<number>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        xScale.domain([0.1, 1.1]);

        line = new Plottable.Plots.Line<number>();
        line.x(function(d) { return d.x; }, xScale);
        line.y(function(d) { return d.y; }, yScale);
        dataset = new Plottable.Dataset(data);
      });

      it("handles autoranging smoothly ", () => {
        line.addDataset(dataset);
        line.autorangeMode("y");
        xScale.padProportion(0);
        yScale.padProportion(0);
        line.renderTo(div);

        assert.deepEqual(yScale.domain(), [0, 1], "when there are no visible points in the view, the y-scale domain defaults to [0, 1]");

        line.autorangeSmooth(true);

        const base = data[0].y;
        let x1 = xScale.domain()[1] - data[0].x;
        const x2 = data[1].x - data[0].x;
        const y2 = data[1].y - data[0].y;
        const expectedBottom = base + y2 * x1 / x2;

        x1 = xScale.domain()[0] - data[0].x;
        const expectedTop = base + y2 * x1 / x2;

        assert.closeTo(yScale.domain()[0], expectedBottom, 0.001, "smooth autoranging forces the domain to include the line (left)");
        assert.closeTo(yScale.domain()[1], expectedTop, 0.001, "smooth autoranging forces the domain to include the line (right)");

        line.autorangeSmooth(false);
        assert.deepEqual(yScale.domain(), [0, 1], "resetting the smooth autorange works");

        xScale.domain([data[0].x, data[1].x]);
        assert.deepEqual(yScale.domain(), [-2, -1], "no changes for autoranging smooth with same edge poitns (no smooth)");

        line.autorangeSmooth(true);
        assert.deepEqual(yScale.domain(), [-2, -1], "no changes for autoranging smooth with same edge points (smooth)");

        div.remove();
      });

      it("handles autoranging smoothly when autorangeSmooth set before accessors", () => {
        line = new Plottable.Plots.Line<number>();
        line.autorangeSmooth(true);
        line.x(function(d) { return d.x; }, xScale);
        line.y(function(d) { return d.y; }, yScale);
        line.addDataset(dataset);
        line.autorangeMode("y");
        line.renderTo(div);

        const base = data[0].y;
        let x1 = (xScale.domain()[1] - data[0].x) - (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        const x2 = data[1].x - data[0].x;
        const y2 = data[1].y - data[0].y;
        const expectedTop = base + y2 * x1 / x2;

        x1 = (xScale.domain()[0] - data[0].x) + (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        const expectedBottom = base + y2 * x1 / x2;

        assert.closeTo(yScale.domain()[0], expectedBottom, 0.001, "smooth autoranging forces the domain to include the line (left)");
        assert.closeTo(yScale.domain()[1], expectedTop, 0.001, "smooth autoranging forces the domain to include the line (right)");

        div.remove();
      });

      it("handles autoranging smoothly when autorangeSmooth set before autorangeMode", () => {
        line.addDataset(dataset);
        line.autorangeSmooth(true);
        line.autorangeMode("y");
        line.renderTo(div);

        const base = data[0].y;
        let x1 = (xScale.domain()[1] - data[0].x) - (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        const x2 = data[1].x - data[0].x;
        const y2 = data[1].y - data[0].y;
        const expectedTop = base + y2 * x1 / x2;

        x1 = (xScale.domain()[0] - data[0].x) + (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        const expectedBottom = base + y2 * x1 / x2;

        assert.closeTo(yScale.domain()[0], expectedBottom, 0.001, "smooth autoranging forces the domain to include the line (left)");
        assert.closeTo(yScale.domain()[1], expectedTop, 0.001, "smooth autoranging forces the domain to include the line (right)");

        div.remove();
      });

      it("handles autoranging smoothly when autorangeSmooth set before rendering", () => {
        line.addDataset(dataset);
        line.autorangeMode("y");
        line.autorangeSmooth(true);
        line.renderTo(div);

        const base = data[0].y;
        let x1 = (xScale.domain()[1] - data[0].x) - (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        const x2 = data[1].x - data[0].x;
        const y2 = data[1].y - data[0].y;
        const expectedTop = base + y2 * x1 / x2;

        x1 = (xScale.domain()[0] - data[0].x) + (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        const expectedBottom = base + y2 * x1 / x2;

        assert.closeTo(yScale.domain()[0], expectedBottom, 0.001, "smooth autoranging forces the domain to include the line (left)");
        assert.closeTo(yScale.domain()[1], expectedTop, 0.001, "smooth autoranging forces the domain to include the line (right)");

        div.remove();
      });

      it("handles autoranging smoothly when autorangeSmooth set after rendering", () => {
        line.addDataset(dataset);
        line.autorangeMode("y");
        line.renderTo(div);
        line.autorangeSmooth(true);

        const base = data[0].y;
        let x1 = (xScale.domain()[1] - data[0].x) - (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        const x2 = data[1].x - data[0].x;
        const y2 = data[1].y - data[0].y;
        const expectedTop = base + y2 * x1 / x2;

        x1 = (xScale.domain()[0] - data[0].x) + (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        const expectedBottom = base + y2 * x1 / x2;

        assert.closeTo(yScale.domain()[0], expectedBottom, 0.001, "smooth autoranging forces the domain to include the line (left)");
        assert.closeTo(yScale.domain()[1], expectedTop, 0.001, "smooth autoranging forces the domain to include the line (right)");

        div.remove();
      });

      it("handles autoranging smoothly when autorangeSmooth set after rendering, before autorangeMode", () => {
        line.addDataset(dataset);
        line.renderTo(div);

        line.autorangeSmooth(true);
        line.autorangeMode("y");

        const base = data[0].y;
        let x1 = (xScale.domain()[1] - data[0].x) - (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        const x2 = data[1].x - data[0].x;
        const y2 = data[1].y - data[0].y;
        const expectedTop = base + y2 * x1 / x2;

        x1 = (xScale.domain()[0] - data[0].x) + (xScale.domain()[1] - xScale.domain()[0]) * (1 + yScale.padProportion() / 2);
        const expectedBottom = base + y2 * x1 / x2;

        assert.closeTo(yScale.domain()[0], expectedBottom, 0.001, "smooth autoranging forces the domain to include the line (left)");
        assert.closeTo(yScale.domain()[1], expectedTop, 0.001, "smooth autoranging forces the domain to include the line (right)");

        div.remove();
      });

      it("handles autoDomain correcly with and without autorangeSmooth", () => {
        const expectedDomain = [-0.2, 2];
        xScale.domain([-0.2, 2]);
        line.addDataset(dataset);
        line.autorangeMode("y");

        line.autorangeSmooth(true);
        xScale.autoDomain();
        line.renderTo(div);

        assert.deepEqual(xScale.domain(), expectedDomain, "autoDomain works even when autoranging is done smoothly");

        line.autorangeSmooth(false);
        assert.deepEqual(xScale.domain(), expectedDomain, "autoDomain works when smooth autoranging is disabled back");

        div.remove();
      });

      it("handles autoDomain correcly with smooth autoranging set after rendering", () => {
        const expectedDomain = [-0.2, 2];
        xScale.domain([-0.2, 2]);
        line.addDataset(dataset);
        line.renderTo(div);

        line.autorangeSmooth(true);
        xScale.autoDomain();

        assert.deepEqual(xScale.domain(), expectedDomain, "autoDomain works even when autoranging is done smoothly");

        line.autorangeSmooth(false);
        assert.deepEqual(xScale.domain(), expectedDomain, "autoDomain works when smooth autoranging is disabled back");

        div.remove();
      });

      it("handles autorange smoothly for vertical lines", () => {
        yScale.domain([0.1, 1.1]);
        const verticalLinesData = [
          {x: -2, y: 1.8},
          {x: -1, y: 0.0},
        ];
        line.addDataset(new Plottable.Dataset(verticalLinesData));
        line.autorangeMode("x");

        xScale.padProportion(0);
        yScale.padProportion(0);
        line.renderTo(div);

        assert.deepEqual(xScale.domain(), [0, 1], "when there are no visible points in the view, the x-scale domain defaults to [0, 1]");

        line.autorangeSmooth(true);

        const base = verticalLinesData[0].x;
        let x1 = (yScale.domain()[1] - verticalLinesData[0].y);
        const x2 = verticalLinesData[1].y - verticalLinesData[0].y;
        const y2 = verticalLinesData[1].x - verticalLinesData[0].x;
        const expectedTop = base + y2 * x1 / x2;

        x1 = (yScale.domain()[0] - verticalLinesData[0].y);
        const expectedBottom = base + y2 * x1 / x2;

        assert.closeTo(xScale.domain()[0], expectedTop, 0.001, "smooth autoranging forces the domain to include the line (left)");
        assert.closeTo(xScale.domain()[1], expectedBottom, 0.001, "smooth autoranging forces the domain to include the line (right)");

        line.autorangeSmooth(false);
        assert.deepEqual(xScale.domain(), [0, 1], "resetting the smooth autorange works");

        yScale.domain([verticalLinesData[0].y, verticalLinesData[1].y]);
        assert.deepEqual(xScale.domain(), [-2, -1], "no changes for autoranging smooth with same edge poitns (no smooth)");

        line.autorangeSmooth(true);
        assert.deepEqual(xScale.domain(), [-2, -1], "no changes for autoranging smooth with same edge points (smooth)");

        div.remove();
      });
    });

    describe("Cropped Rendering Performance", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let plot: Plottable.Plots.Line<number>;

      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Line<number>();
        plot.x((d) => d.x, xScale).y((d) => d.y, yScale);
      });

      it("can set the croppedRendering option", () => {
        plot.renderTo(div);

        assert.isTrue(plot.croppedRenderingEnabled(), "croppedRendering is enabled by default");

        assert.strictEqual(plot.croppedRenderingEnabled(false), plot, "setting the croppedRendering option returns the plot");
        assert.isFalse(plot.croppedRenderingEnabled(), "can disable the croppedRendering option");

        assert.strictEqual(plot.croppedRenderingEnabled(true), plot, "setting the croppedRendering option returns the plot");
        assert.isTrue(plot.croppedRenderingEnabled(), "can enable the croppedRendering option");

        div.remove();
      });

      it("does not render lines that are outside the viewport", () => {
        const data = [
          {x: 1, y: 1},
          {x: 2, y: 2},
          {x: 3, y: 1},
          {x: 4, y: 2},
          {x: 5, y: 1},
        ];
        plot.addDataset(new Plottable.Dataset(data));

        // Only middle point is in viewport
        xScale.domain([2.5, 3.5]);

        plot.croppedRenderingEnabled(true);
        plot.renderTo(div);

        const path = plot.content().select("path.line").attr("d");
        const expectedRenderedData = [1, 2, 3].map((d) => data[d]);
        TestMethods.assertPathEqualToDataPoints(path, expectedRenderedData, xScale, yScale);

        div.remove();
      });

      it("works when the performance option is set after rendering to svg", () => {
        const data = [
          {x: 1, y: 1},
          {x: 2, y: 2},
          {x: 3, y: 1},
          {x: 4, y: 2},
          {x: 5, y: 1},
        ];
        plot.addDataset(new Plottable.Dataset(data));

        // Only middle point is in viewport
        xScale.domain([2.5, 3.5]);

        plot.renderTo(div);
        plot.croppedRenderingEnabled(true);

        const path = plot.content().select("path.line").attr("d");
        const expectedRenderedData = [1, 2, 3].map((d) => data[d]);
        TestMethods.assertPathEqualToDataPoints(path, expectedRenderedData, xScale, yScale);

        div.remove();
      });

      it("works for vertical line plots", () => {
        const data = [
          {x: 1, y: 1},
          {x: 2, y: 2},
          {x: 1, y: 3},
          {x: 2, y: 4},
          {x: 1, y: 5},
        ];
        plot.addDataset(new Plottable.Dataset(data));
        xScale.padProportion(0);

        // Only middle point is in viewport
        yScale.domain([2.5, 3.5]);

        plot.croppedRenderingEnabled(true);
        plot.renderTo(div);

        const path = plot.content().select("path.line").attr("d");
        const expectedRenderedData = [1, 2, 3].map((d) => data[d]);
        TestMethods.assertPathEqualToDataPoints(path, expectedRenderedData, xScale, yScale);

        div.remove();
      });

      it("adapts to scale changes", () => {
        const data = [
          {x: 1, y: 1},
          {x: 2, y: 2},
          {x: 3, y: 1},
          {x: 4, y: 2},
          {x: 5, y: 1},
        ];
        plot.addDataset(new Plottable.Dataset(data));

        plot.croppedRenderingEnabled(true);
        plot.renderTo(div);

        let path = plot.content().select("path.line").attr("d");
        TestMethods.assertPathEqualToDataPoints(path, [0, 1, 2, 3, 4].map((d) => data[d]), xScale, yScale);

        // Only middle point is in viewport
        xScale.domain([2.5, 3.5]);
        path = plot.content().select("path.line").attr("d");
        TestMethods.assertPathEqualToDataPoints(path, [1, 2, 3].map((d) => data[d]), xScale, yScale);

        // Only first point is in viewport
        xScale.domain([-0.5, 1.5]);
        path = plot.content().select("path.line").attr("d");
        TestMethods.assertPathEqualToDataPoints(path, [0, 1].map((d) => data[d]), xScale, yScale);

        div.remove();
      });
    });

    describe("Downsampling Performance", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let plot: Plottable.Plots.Line<number>;

      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;

      beforeEach(() => {
        div = TestMethods.generateDiv(50, 50);
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Line<number>();
        plot.x((d) => d.x, xScale).y((d) => d.y, yScale);
      });

      it("can set the downsampling option", () => {
        plot.renderTo(div);

        assert.isFalse(plot.downsamplingEnabled(), "downsampling is not enabled by default");

        assert.strictEqual(plot.downsamplingEnabled(true), plot, "enabling the downsampling option returns the plot");
        assert.isTrue(plot.downsamplingEnabled(), "can enable the downsampling option");

        plot.downsamplingEnabled(false);
        assert.isFalse(plot.downsamplingEnabled(), "can disable the downsampling option");

        div.remove();
      });

      it("does not render points that should be removed in downsampling in horizontal line plots" , () => {
        const data = [
          {x: -100, y: -1}, // last element in previous bucket
          {x: 0, y: 2}, // first element in current bucket
          {x: 0.5, y: 1.5}, // the point to be removed
          {x: 1, y: 1}, // minimum y in current bucket
          {x: 2, y: 4}, // maximum y in current bucket
          {x: 3, y: 3}, // last element in current bucket
          {x: 100, y: 2}, // first element in next bucket
        ];
        plot.addDataset(new Plottable.Dataset(data));
        xScale.domain([-100, 100]);

        plot.downsamplingEnabled(true);
        plot.renderTo(div);

        const lineScaledXValue = Math.floor(xScale.scale(data[1].x));
        assert.notStrictEqual(Math.floor(xScale.scale(data[0].x)), lineScaledXValue,
          `point(${data[0].x},${data[0].y}) should not have the same scaled x value as the horizontal line`);
        data.slice(1, 6).forEach((d, i) => {
          assert.strictEqual(Math.floor(xScale.scale(d.x)), lineScaledXValue,
            `point(${d.x},${d.y} should have the same scaled x value as the horizontal line`);
        });
        assert.notStrictEqual(Math.floor(xScale.scale(data[6].x)), lineScaledXValue,
          `point(${data[6].x},${data[6].y}) should not have the same scaled x value as the horizontal line`);

        const path = plot.content().select("path.line").attr("d");
        const expectedRenderedData = [0, 1, 4, 3, 5, 6].map((d) => data[d]);
        TestMethods.assertPathEqualToDataPoints(path, expectedRenderedData, xScale, yScale);

        div.remove();
      });

      it("does not render points that should be removed in downsampling in vertical line plots", () => {
        const data = [
          {x: -1, y: -50}, // last element in previous bucket
          {x: 2, y: 1}, // first element in current bucket
          {x: 1.5, y: 1.5}, // the point to be removed
          {x: 1, y: 2}, // minimum x in current bucket
          {x: 4, y: 3}, // maximum x in current bucket
          {x: 3, y: 4}, // last element in current bucket
          {x: 2, y: 100}, // first element in next bucket
        ];
        plot.addDataset(new Plottable.Dataset(data));

        yScale.domain([-200, 200]);

        plot.downsamplingEnabled(true);
        plot.renderTo(div);

        const lineScaledYValue = Math.floor(yScale.scale(data[1].y));
        assert.notStrictEqual(Math.floor(yScale.scale(data[0].y)), lineScaledYValue,
          `point(${data[0].x},${data[0].y}) should not have the same scaled y value as the vertical line`);
        data.slice(1, 6).forEach((d, i) => {
          assert.strictEqual(Math.floor(yScale.scale(d.y)), lineScaledYValue,
            `point(${d.x},${d.y}) should have the same scaled y value as the vertical line`);
        });
        assert.notStrictEqual(Math.floor(yScale.scale(data[6].y)), lineScaledYValue,
          `point(${data[6].x},${data[6].y}) should not have the same scaled y value as the vertical line`);

        const path = plot.content().select("path.line").attr("d");
        const expectedRenderedData = [0, 1, 3, 4, 5, 6].map((d) => data[d]);
        TestMethods.assertPathEqualToDataPoints(path, expectedRenderedData, xScale, yScale);

        div.remove();
      });

      it("does not render points that are on the same line except for the first, the last, the largest and the smallest points", () => {
        const data = [
          {x: 3, y: 1}, // last element in previous bucket
          {x: 2, y: 2}, // first element in the bucket
          {x: 1, y: 1}, // minimum element in the bucket
          {x: 10, y: 10}, // maximum element in the bucket
          {x: 2.5, y: 2.5}, // the point to be removed
          {x: 3, y: 3}, // last element in the bucket
          {x: 3, y: 1}, // first element in next bucket
        ];
        plot.addDataset(new Plottable.Dataset(data));

        const expectedYValue = (p1: any, p2: any, slope: number) => {
          return p1.y + (p2.x - p1.x) * slope;
        };

        const lineCurrentSlope = (data[2].y - data[1].y) / (data[2].x - data[1].x);
        assert.notStrictEqual(Math.floor(expectedYValue(data[1], data[0], lineCurrentSlope)), Math.floor(data[0].y),
          `point(${data[0].x},${data[0].y}) is not on the line with slope ${lineCurrentSlope}`);
        data.slice(1, 6).forEach((d, i) => {
          assert.strictEqual(Math.floor(expectedYValue(data[1], d, lineCurrentSlope)), Math.floor(d.y),
            `point(${d.x},${d.y}) is on the line with slope ${lineCurrentSlope}`);
        });
        assert.notStrictEqual(Math.floor(expectedYValue(data[1], data[6], lineCurrentSlope)), Math.floor(data[6].y),
          `point(${data[6].x},${data[6].y}) is not on the line with slope ${lineCurrentSlope}`);

        plot.downsamplingEnabled(true);
        plot.renderTo(div);

        const path = plot.content().select("path.line").attr("d");
        const expectedRenderedData = [0, 1, 2, 3, 5, 6].map((d) => data[d]);
        TestMethods.assertPathEqualToDataPoints(path, expectedRenderedData, xScale, yScale);

        div.remove();
      });
    });

    describe("canvas rendering", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let plot: Plottable.Plots.Line<number>;

      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Line<number>();
        plot.x((d) => d.x, xScale).y((d) => d.y, yScale);
        plot.renderer("canvas");
      });

      afterEach(() => {
        div.remove();
      });

      it("passes the right datum to the accessors", () => {
        const datum = {x: 1, y: 2};
        const dataset = new Plottable.Dataset([datum]);
        const attrSpy = sinon.spy();

        plot.datasets([dataset]);
        plot.attr("stroke", attrSpy);
        plot.renderTo(div);
        assert.isTrue(attrSpy.calledWith(datum, 0, dataset), "attr is passed individual datum");
      });
    });
  });
});
