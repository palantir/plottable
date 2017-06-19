import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Plots", () => {
  describe("PiePlot", () => {
    describe("Rendering", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let dataset: Plottable.Dataset;
      let data: any[];
      let piePlot: Plottable.Plots.Pie;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        data = [{value: 5}, {value: 15}];
        dataset = new Plottable.Dataset(data);
        piePlot = new Plottable.Plots.Pie();
        piePlot.addDataset(dataset);
        piePlot.sectorValue((d) => d.value);
        piePlot.renderTo(div);
      });

      it("draws a fill path and a stroke path for each slice", () => {
        const arcPaths = piePlot.content().selectAll<Element, any>(".arc");
        const arcFillPaths = piePlot.content().selectAll<Element, any>(".arc.fill");
        const arcOutlinePaths = piePlot.content().selectAll<Element, any>(".arc.outline");
        assert.strictEqual(arcPaths.size(), data.length * 2, "2 paths per datum");
        assert.strictEqual(arcFillPaths.size(), data.length, "1 fill path per datum");
        assert.strictEqual(arcOutlinePaths.size(), data.length, "1 outline path per datum");
        assert.strictEqual(arcFillPaths.style("stroke"), "none", "fill paths have no stroke");
        assert.strictEqual(arcOutlinePaths.style("fill"), "none", "outline paths have no fill");
        div.remove();
      });

      it("draws slices proportional in angle to their value", () => {
        const arcPaths = piePlot.content().selectAll<Element, any>(".arc.fill");
        assert.strictEqual(arcPaths.size(), 2, "has two sectors");

        const pathString0 = d3.select(arcPaths.node()).attr("d");
        const decomposedPath0 = TestMethods.decomposePath(TestMethods.normalizePath(pathString0));

        const moveCommand0 = decomposedPath0[0];
        assert.closeTo(moveCommand0.arguments[0], 0, 1, "starts first arc at top of circle (x)");
        assert.operator(moveCommand0.arguments[1], "<", 0, "starts first arc at top of circle (x)");

        const arcCommand0 = decomposedPath0[1];
        assert.operator(arcCommand0.arguments[5], ">", 0, "arc ends on the right side of the circle (x)");
        assert.closeTo(arcCommand0.arguments[6], 0, 1, "arc ends on the right side of the circle (y)");

        const lineCommand0 = decomposedPath0[2];
        assert.closeTo(lineCommand0.arguments[0], 0, 1, "draws line to origin (x)");
        assert.closeTo(lineCommand0.arguments[1], 0, 1, "draws line to origin (y)");

        const pathString1 = d3.select(arcPaths.nodes()[1]).attr("d");
        const decomposedPath1 = TestMethods.decomposePath(TestMethods.normalizePath(pathString1));

        const moveCommand1 = decomposedPath1[0];
        assert.operator(moveCommand1.arguments[0], ">", 0, "draws line to the right");
        assert.closeTo(moveCommand1.arguments[1], 0, 1, "draws line horizontally");

        const arcCommand1 = decomposedPath1[1];
        assert.closeTo(arcCommand1.arguments[5], 0, 1, "ends at x origin");
        assert.operator(arcCommand1.arguments[6], "<", 0, "ends above 0");

        const lineCommand1 = decomposedPath1[2];
        assert.closeTo(lineCommand1.arguments[0], 0, 1, "draws line to origin (x)");
        assert.closeTo(lineCommand1.arguments[1], 0, 1, "draws line to origin (y)");

        div.remove();
      });

      it("uses Plottable colors for sectors by default", () => {
        const arcPaths = piePlot.content().selectAll<Element, any>(".arc.fill");
        const plottableColors = new Plottable.Scales.Color().range();

        arcPaths.each(function(d, i) {
          assert.deepEqual(d3.color(d3.select(this).attr("fill")), d3.color(plottableColors[i]), `sector with index ${i} has the correct fill color`);
        });
        div.remove();
      });

      it("updates slices when data changes", () => {
        const originalPathStrings: String[] = [];
        piePlot.content().selectAll<Element, any>("path").each(function() {
          originalPathStrings.push(d3.select(this).attr("d"));
        });
        assert.lengthOf(originalPathStrings, data.length * 2, "2 paths per datum");

        const oneMoreSliceData = data.slice();
        oneMoreSliceData.push({ value: 5 });
        dataset.data(oneMoreSliceData);

        const oneMoreSlicePathStrings: String[] = [];
        piePlot.content().selectAll<Element, any>("path").each(function() {
          oneMoreSlicePathStrings.push(d3.select(this).attr("d"));
        });
        assert.lengthOf(oneMoreSlicePathStrings, oneMoreSliceData.length * 2, "2 paths per datum");

        originalPathStrings.forEach((pathString, index) => {
          assert.notStrictEqual(pathString, oneMoreSlicePathStrings[index], "slices were updated when data changed");
        });
        div.remove();
      });

      it("can set innerRadius()", () => {
        const expectedInnerRadius = 5;
        assert.strictEqual(piePlot.innerRadius(expectedInnerRadius), piePlot, "setter returns the calling pie plot");
        const arcPaths = piePlot.content().selectAll<Element, any>(".arc.fill");
        assert.strictEqual(arcPaths.size(), 2, "has two sectors");

        const decomposedPath0 = TestMethods.decomposePath(TestMethods.normalizePath(d3.select(arcPaths.node()).attr("d")));

        const lineBeforeInnerArcCommand0 = decomposedPath0[2];
        assert.closeTo(lineBeforeInnerArcCommand0.arguments[0], expectedInnerRadius, 1, "inner arc starts at correct x");
        assert.closeTo(lineBeforeInnerArcCommand0.arguments[1], 0, 1, "inner arc starts at correct y");

        const innerArcCommand0 = decomposedPath0[3];
        assert.closeTo(innerArcCommand0.arguments[0], expectedInnerRadius, 1, "inner arc has correct rx");
        assert.closeTo(innerArcCommand0.arguments[1], expectedInnerRadius, 1, "inner arc has correct ry");
        assert.closeTo(innerArcCommand0.arguments[5], 0, 1, "inner arc ends at correct position (x)");
        assert.closeTo(innerArcCommand0.arguments[6], -expectedInnerRadius, 1, "inner arc ends at correct position (y)");

        div.remove();
      });

      it("can set outerRadius()", () => {
        const expectedOuterRadius = 150;
        assert.strictEqual(piePlot.outerRadius(() => expectedOuterRadius), piePlot, "setter returns the calling pie plot");
        const arcPaths = piePlot.content().selectAll<Element, any>(".arc.fill");
        assert.strictEqual(arcPaths.size(), 2, "has two sectors");

        const decomposedPath0 = TestMethods.decomposePath(TestMethods.normalizePath(d3.select(arcPaths.node()).attr("d")));

        const lineCommand0 = decomposedPath0[0];
        assert.closeTo(lineCommand0.arguments[0], 0, 1, "starts outer arc at correct position (x)");
        assert.closeTo(lineCommand0.arguments[1], -expectedOuterRadius, 1, "starts outer arc at correct position (y)");

        const outerArcCommand0 = decomposedPath0[1];
        assert.closeTo(outerArcCommand0.arguments[0], expectedOuterRadius, 1, "outer arc has correct rx");
        assert.closeTo(outerArcCommand0.arguments[1], expectedOuterRadius, 1, "outer arc has correct ry");
        assert.closeTo(outerArcCommand0.arguments[5], expectedOuterRadius, 1, "outer arc ends at correct position (x)");
        assert.closeTo(outerArcCommand0.arguments[6], 0, 1, "outer arc ends at correct position (y)");

        div.remove();
      });

      it("can set startAngle()", () => {
        const expectedStartAngle = Math.PI;
        assert.strictEqual(piePlot.startAngle(expectedStartAngle), piePlot, "setter returns the calling pie plot");
        const arcPaths = piePlot.content().selectAll<Element, any>(".arc.fill");
        assert.strictEqual(arcPaths.size(), 2, "has two sectors");

        const pathString0 = d3.select(arcPaths.node()).attr("d");
        const decomposedPath0 = TestMethods.decomposePath(TestMethods.normalizePath(pathString0));

        const moveCommand0 = decomposedPath0[0];
        assert.closeTo(moveCommand0.arguments[0], 0, 1, "starts first arc at the bottom of the circle (x)");
        assert.isAbove(moveCommand0.arguments[1], 0, "starts first arc at the bottom of circle (y)");

        const arcCommand0 = decomposedPath0[1];
        assert.isBelow(arcCommand0.arguments[5], 0, "arc ends on the left side of the circle (x)");
        assert.isAbove(arcCommand0.arguments[6], 0, "arc ends on the bottom side of the circle (y)");

        const lineCommand0 = decomposedPath0[2];
        assert.closeTo(lineCommand0.arguments[0], 0, 1, "draws line to origin (x)");
        assert.closeTo(lineCommand0.arguments[1], 0, 1, "draws line to origin (y)");

        const pathString1 = d3.select(arcPaths.nodes()[1]).attr("d");
        const decomposedPath1 = TestMethods.decomposePath(TestMethods.normalizePath(pathString1));

        const moveCommand1 = decomposedPath1[0];
        assert.isBelow(moveCommand1.arguments[0], 0, "starts second arc at the end of the first arc");
        assert.isAbove(moveCommand1.arguments[1], 0, "starts secnond arc at the end of the first arc");

        const arcCommand1 = decomposedPath1[1];
        assert.closeTo(arcCommand1.arguments[5], 0, 1, "ends second arc at x origin");
        assert.isBelow(arcCommand1.arguments[6], 0, "ends second arc below 0");

        const lineCommand1 = decomposedPath1[2];
        assert.closeTo(lineCommand1.arguments[0], 0, 1, "draws line to origin (x)");
        assert.closeTo(lineCommand1.arguments[1], 0, 1, "draws line to origin (y)");

        div.remove();
      });

      it("can set endAngle()", () => {
        const expectedEndAngle = Math.PI;
        assert.strictEqual(piePlot.endAngle(expectedEndAngle), piePlot, "setter returns the calling pie plot");
        const arcPaths = piePlot.content().selectAll<Element, any>(".arc.fill");
        assert.strictEqual(arcPaths.size(), 2, "has two sectors");

        const pathString0 = d3.select(arcPaths.node()).attr("d");
        const decomposedPath0 = TestMethods.decomposePath(TestMethods.normalizePath(pathString0));

        const moveCommand0 = decomposedPath0[0];
        assert.closeTo(moveCommand0.arguments[0], 0, 1, "starts first arc at the top of the circle (x)");
        assert.isBelow(moveCommand0.arguments[1], 0, "starts first arc at the top of circle (y)");

        const arcCommand0 = decomposedPath0[1];
        assert.isAbove(arcCommand0.arguments[5], 0, "arc ends on the right side of the circle (x)");
        assert.isBelow(arcCommand0.arguments[6], 0, "arc ends on the right side of the circle (y)");

        const lineCommand0 = decomposedPath0[2];
        assert.closeTo(lineCommand0.arguments[0], 0, 1, "draws line to origin (x)");
        assert.closeTo(lineCommand0.arguments[1], 0, 1, "draws line to origin (y)");

        const pathString1 = d3.select(arcPaths.nodes()[1]).attr("d");
        const decomposedPath1 = TestMethods.decomposePath(TestMethods.normalizePath(pathString1));

        const moveCommand1 = decomposedPath1[0];
        assert.isAbove(moveCommand1.arguments[0], 0, "starts second arc at the top right of the circle");
        assert.isBelow(moveCommand1.arguments[1], 0, "starts second arc at the top right of the circle");

        const arcCommand1 = decomposedPath1[1];
        assert.closeTo(arcCommand1.arguments[5], 0, 1, "ends second arc at the bottom of the circle (x origin)");
        assert.isAbove(arcCommand1.arguments[6], 0, "ends second arc at the bottom of the circle");

        const lineCommand1 = decomposedPath1[2];
        assert.closeTo(lineCommand1.arguments[0], 0, 1, "draws line to origin (x)");
        assert.closeTo(lineCommand1.arguments[1], 0, 1, "draws line to origin (y)");

        div.remove();
      });

      it("updates slices when data changes and render correctly w.r.t. scale changes", () => {
        const newDataset = new Plottable.Dataset([{ value: 500 }, { value: 600 }]);
        // reset database for this test's sake
        piePlot.datasets([newDataset]);

        const originalStringPaths: String[] = [];
        piePlot.content().selectAll<Element, any>("path").each(function() {
          const pathString = d3.select(this).attr("d");
          assert.notInclude(pathString, "NaN", "original pathString should not contain NaN");
          originalStringPaths.push(pathString);
        });

        const newData = [{value: 10}, {value: 20}];
        newDataset.data(newData);

        piePlot.content().selectAll<Element, any>("path").each(function(path, index) {
          const pathString = d3.select(this).attr("d");
          assert.notInclude(pathString, "NaN", "new pathString should not contain NaN");
          assert.notStrictEqual(pathString, originalStringPaths[index], "new pathString should not equal old one");
        });
        div.remove();
      });

    });

    describe("Labels", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let piePlot: Plottable.Plots.Pie;

      beforeEach(() => {
        div = TestMethods.generateDiv(500, 500);
        piePlot = new Plottable.Plots.Pie();
        piePlot.sectorValue((d) => d.value);
        piePlot.labelsEnabled(true);
      });

      it("does not erase or add labels when rendered twice", () => {
        const data = [
          { value: 1 },
          { value: 2 },
          { value: 3 },
        ];
        const dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(div);
        let labels = piePlot.content().selectAll<Element, any>("text");
        assert.strictEqual(labels.size(), data.length, "one label per slice");
        piePlot.render();
        labels = piePlot.content().selectAll<Element, any>("text");
        assert.strictEqual(labels.size(), data.length, "one label per slice after re-render()ing");
        div.remove();
      });

      it("updates labels when data changes", () => {
        const data1 = [
          { value: 1 },
          { value: 1 },
          { value: 1 },
        ];
        const dataset = new Plottable.Dataset(data1);
        piePlot.addDataset(dataset);
        piePlot.renderTo(div);
        let labels = piePlot.content().selectAll<Element, any>("text");
        assert.strictEqual(labels.size(), data1.length, "one label per datum");
        labels.each(function() {
          const labelText = d3.select(this).text();
          assert.strictEqual(labelText, "1", "label has correct text");
        });
        const data2 = [
          { value: 2 },
          { value: 2 },
        ];
        dataset.data(data2);
        labels = piePlot.content().selectAll<Element, any>("text");
        assert.strictEqual(labels.size(), data2.length, "one label per datum");
        labels.each(function() {
          const labelText = d3.select(this).text();
          assert.strictEqual(labelText, "2", "label text was updated");
        });
        div.remove();
      });

      it("removes labels when they are disabled after rendering", () => {
        const data = [
          { value: 1 },
          { value: 1 },
          { value: 1 },
        ];
        const dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(div);
        let labels = piePlot.content().selectAll<Element, any>("text");
        assert.strictEqual(labels.size(), data.length, "one label per datum");
        piePlot.labelsEnabled(false);
        labels = piePlot.content().selectAll<Element, any>("text");
        assert.strictEqual(labels.size(), 0, "labels were removed");
        div.remove();
      });

      it("hides labels if slices are too small", () => {
        const data = [
          { key: "A", value: 1 },
          { key: "B", value: 50 },
          { key: "C", value: 1 },
          { key: "D", value: 50 },
          { key: "E", value: 1 },
          { key: "F", value: 50 },
        ];
        const dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(div);
        const labelGs = piePlot.content().select(".label-area").selectAll<Element, any>(".label-area > g");
        labelGs.each(function(d, i) {
          const visibility = d3.select(this).style("visibility");
          if (data[i].value === 1) {
            assert.strictEqual(visibility, "hidden", `label ${i} hidden when slice is too small`);
          } else {
            assert.include(["visible", "inherit"], visibility, `label with index ${i} shown when slice is appropriately sized`);
          }
        });
        div.remove();
      });

      it("uses its formatter to format labels", () => {
        const data = [
          { value: 5, name: "a" },
          { value: 15, name: "b" },
        ];
        const dataset = new Plottable.Dataset(data).metadata("foo");
        piePlot.addDataset(dataset);
        piePlot.labelFormatter((n: number, datum, index, dataset) => `${n}, ${datum.name}, ${index}, ${dataset.metadata()}`);
        piePlot.renderTo(div);
        const texts = div.selectAll<Element, any>("text").nodes().map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "both labels are drawn");
        assert.strictEqual(texts[0], "5, a, 0, foo", "The formatter was used to format the label for slice index 0");
        assert.strictEqual(texts[1], "15, b, 1, foo", "The formatter was used to format the label for slice index 1");
        div.remove();
      });

      it("hides labels if they don't fit", () => {
        const data = [
          { value: 1 },
          { value: 50 },
          { value: 1 },
          { value: 50 },
          { value: 1 },
          { value: 50 },
        ];
        const dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(div);

        const texts = div.selectAll<Element, any>("text");
        assert.strictEqual(texts.size(), data.length, "One label is rendered for each piece of data");

        texts.each(function(d, i) {
          const visibility = d3.select(this).style("visibility");
          if (i % 2 === 0) {
            assert.strictEqual(visibility, "hidden", `label ${i} hidden when slice is too small`);
          } else {
            assert.include(["visible", "inherit"], visibility, `label ${i} shown when slice is appropriately sized`);
          }
        });

        div.remove();
      });

      it("hides labels outside of the render area", () => {
        const data = [
          { value: 5000 },
          { value: 5000 },
          { value: 5000 },
        ];
        const dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset).outerRadius(500);
        piePlot.renderTo(div);

        const texts = div.selectAll<Element, any>("text");
        assert.strictEqual(texts.size(), data.length, "One label is rendered for each piece of data");

        texts.each(function(d, i) {
          const visibility = d3.select(this).style("visibility");
          if (i === 1) {
            assert.strictEqual(visibility, "hidden", `label ${i} hidden when cut off by the lower margin`);
          } else {
            assert.include(["visible", "inherit"], visibility, `label ${i} shown when in the renderArea`);
          }
        });
        div.remove();
      });

      it("does not show labels for invalid data", () => {
        const data = [
          { value: 1 },
          { value: "value" },
          { value: 2 },
        ];
        const dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(div);

        const texts = div.selectAll<Element, any>("text").nodes().map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "One label is rendered for each valid datum");
        assert.strictEqual(texts[0], "1", "Label for the first valid datum is shown");
        assert.strictEqual(texts[1], "2", "Label for the second valid datum is shown");
        div.remove();
      });
    });

    describe("Selections", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let dataset: Plottable.Dataset;
      let data: any[];
      let piePlot: Plottable.Plots.Pie;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        data = [{value: 5}, {value: 15}];
        dataset = new Plottable.Dataset(data);
        piePlot = new Plottable.Plots.Pie();
        piePlot.addDataset(dataset);
        piePlot.sectorValue((d) => d.value);
        piePlot.renderTo(div);
      });

      it("retrieves all dataset selections when no arguments are specified", () => {
        const allSectors = piePlot.selections();
        assert.strictEqual(allSectors.size(), data.length * 2, "all sectors retrieved");
        assert.strictEqual(allSectors.filter(".fill").size(), 2, "each sector has a fill path");
        assert.strictEqual(allSectors.filter(".outline").size(), 2, "each sector has an outline path");
        div.remove();
      });

      it("retrieves correct selections", () => {
        const allSectors = piePlot.selections([dataset]);
        assert.strictEqual(allSectors.size(), data.length * 2, "all sectors retrieved");
        assert.strictEqual(allSectors.filter(".fill").size(), 2, "each sector has a fill path");
        assert.strictEqual(allSectors.filter(".outline").size(), 2, "each sector has an outline path");
        assert.includeMembers(allSectors.data(), data, "dataset data in selection data");

        div.remove();
      });

      it("skips invalid Datasets", () => {
        const allSectors = piePlot.selections([new Plottable.Dataset([])]);
        assert.strictEqual(allSectors.size(), 0, "no sectors retrieved");

        div.remove();
      });
    });

    describe("Entities", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let dataset: Plottable.Dataset;
      const data = [{value: 5}, {value: 15}];
      let piePlot: Plottable.Plots.Pie;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        dataset = new Plottable.Dataset();
        piePlot = new Plottable.Plots.Pie();
        dataset.data(data);
        piePlot.addDataset(dataset);
        piePlot.sectorValue((d) => d.value);
        piePlot.renderTo(div);
      });

      it("returns both a fill path and a stroke path in each Entity's selection", () => {
        const entities = piePlot.entities();
        assert.lengthOf(entities, data.length, "returned one Entity per datum");
        entities.forEach((entity) => {
          assert.isNotNull(entity.selection, "entity has a fill selection");
          assert.isNotNull(entity.strokeSelection, "entity has a stroke selection");
        });
        div.remove();
      });

      it("retrieves the entity under each given point with entitiesAt()", () => {
        const OUTER_RADIUS = 200;
        piePlot.outerRadius(OUTER_RADIUS);
        /* tslint:disable no-shadowed-variable */
        const data = [
          {value: 500},
          {value: 5},
          {value: 5},
          {value: 5},
          {value: 5},
        ];
        /* tslint:enable no-shadowed-variable */
        dataset.data(data);

        const totalValue = data.map((d) => d.value).reduce((previous, current) => previous + current);
        let runningTotal = 0;
        const clickAngles = data.map((d) => {
          const angle = (runningTotal + d.value / 2) / totalValue * 2 * Math.PI;
          runningTotal += d.value;
          return angle;
        });

        const clicks = clickAngles.map((angle) => {
          return {
            x: OUTER_RADIUS + Math.sin(angle),
            y: OUTER_RADIUS - Math.cos(angle),
          };
        });

        clicks.forEach((point: Plottable.Point, i: number) => {
          const entities = piePlot.entitiesAt(point);
          assert.lengthOf(entities, 1, "exactly one entity is selected");
          TestMethods.assertPlotEntitiesEqual(entities[0], piePlot.entities()[i],
            `the Entity with index ${i} is selected when clicking at [${point.x}, ${point.y}]`);
        });

        const entities = piePlot.entitiesAt( { x: 0, y: 0 } );
        assert.lengthOf(entities, 0, "no entities returned");

        div.remove();
      });

      it("returns nothing for points within innerRadius() or outside of outerRadius() with entitiesAt()", () => {
        const INNER_RADIUS = 100;
        piePlot.innerRadius(INNER_RADIUS);

        const clickInCenter = {
          x: 200,
          y: 200,
        };
        const entitiesInCenter = piePlot.entitiesAt(clickInCenter);
        assert.lengthOf(entitiesInCenter, 0, "no entities returned when clicking inside innerRadius()");

        const OUTER_RADIUS = 150;
        piePlot.outerRadius(OUTER_RADIUS);
        const clickBetweenRadii = {
          x: 200,
          y: 200 + (INNER_RADIUS + OUTER_RADIUS) / 2,
        };
        const entitiesBetweenRadii = piePlot.entitiesAt(clickBetweenRadii);
        TestMethods.assertPlotEntitiesEqual(entitiesBetweenRadii[0], piePlot.entities()[1], "retrieved the correct entity");

        const clickOutsideOuterRadius = {
          x: 200,
          y: 200 + OUTER_RADIUS + 1,
        };
        const entitiesOutsideOuterRadius = piePlot.entitiesAt(clickOutsideOuterRadius);
        assert.lengthOf(entitiesOutsideOuterRadius, 0, "no entities returned when clicking outside outerRadius()");
        div.remove();
      });

      it("retrieves undefined for entitiesNearest when no entities rendered", () => {
        piePlot.datasets([new Plottable.Dataset([])]);
        piePlot.renderTo(div);
        const closest = piePlot.entityNearest({
          x: piePlot.width() / 2,
          y: piePlot.height() / 2,
        });
        assert.strictEqual(closest, undefined, "no datum has been retrieved");
        div.remove();
      });
    });

    describe("Fail safe tests", () => {
      it("renders correctly with no Datasets", () => {
        const DIV_WIDTH = 400;
        const DIV_HEIGHT = 400;
        const div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
        const piePlot = new Plottable.Plots.Pie();
        piePlot.sectorValue((d) => d.value);
        assert.doesNotThrow(() => piePlot.renderTo(div), Error);
        assert.strictEqual(piePlot.width(), DIV_WIDTH, "was allocated width");
        assert.strictEqual(piePlot.height(), DIV_HEIGHT, "was allocated height");
        div.remove();
      });

      it("does not render slices for undefined, NaN, strings, or negative numbers", () => {
        const div = TestMethods.generateDiv();

        const dataWithBadValue = [
          { v: 1 },
          { v: undefined },
          { v: 1 },
          { v: NaN },
          { v: 1 },
          { v: "Bad String" },
          { v: 1 },
          { v: -100 },
        ];

        const piePlot = new Plottable.Plots.Pie();
        piePlot.addDataset(new Plottable.Dataset(dataWithBadValue));
        piePlot.sectorValue((d) => d.v);

        piePlot.renderTo(div);

        const elementsDrawnSel = piePlot.content().selectAll<Element, any>(".arc.fill");

        assert.strictEqual(elementsDrawnSel.size(), 4,
          "There should be exactly 4 slices in the pie chart, representing the valid values");
        assert.lengthOf(piePlot.entities(), 4, "there should be exactly 4 entities, representing the valid values");

        for (let i = 0; i < 4; i++) {
          const startAngle = (<any> piePlot)._startAngles[i];
          const endAngle = (<any> piePlot)._endAngles[i];
          assert.closeTo(endAngle - startAngle, Math.PI / 2, 0.001, `slice with index ${i} is a quarter of the pie`);
        }

        div.remove();
      });
    });
  });
});
