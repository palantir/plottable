///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("PiePlot", () => {
    describe("Rendering", () => {
      let svg: d3.Selection<void>;
      let dataset: Plottable.Dataset;
      let data: any[];
      let piePlot: Plottable.Plots.Pie;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        data = [{value: 5}, {value: 15}];
        dataset = new Plottable.Dataset(data);
        piePlot = new Plottable.Plots.Pie();
        piePlot.addDataset(dataset);
        piePlot.sectorValue((d) => d.value);
        piePlot.renderTo(svg);
      });

      it("draws a fill path and a stroke path for each slice", () => {
        let arcPaths = piePlot.content().selectAll(".arc");
        let arcFillPaths = piePlot.content().selectAll(".arc.fill");
        let arcOutlinePaths = piePlot.content().selectAll(".arc.outline");
        assert.strictEqual(arcPaths.size(), data.length * 2, "2 paths per datum");
        assert.strictEqual(arcFillPaths.size(), data.length, "1 fill path per datum");
        assert.strictEqual(arcOutlinePaths.size(), data.length, "1 outline path per datum");
        assert.strictEqual(arcFillPaths.style("stroke"), "none", "fill paths have no stroke");
        assert.strictEqual(arcOutlinePaths.style("fill"), "none", "outline paths have no fill");
        svg.remove();
      });

      it("draws slices proportional in angle to their value", () => {
        let arcPaths = piePlot.content().selectAll(".arc.fill");
        assert.strictEqual(arcPaths.size(), 2, "has two sectors");

        let pathString0 = d3.select(arcPaths[0][0]).attr("d");
        let decomposedPath0 = TestMethods.decomposePath(TestMethods.normalizePath(pathString0));

        let moveCommand0 = decomposedPath0[0];
        assert.closeTo(moveCommand0.arguments[0], 0, 1, "starts first arc at top of circle (x)");
        assert.operator(moveCommand0.arguments[1], "<", 0, "starts first arc at top of circle (x)");

        let arcCommand0 = decomposedPath0[1];
        assert.operator(arcCommand0.arguments[5], ">", 0, "arc ends on the right side of the circle (x)");
        assert.closeTo(arcCommand0.arguments[6], 0, 1, "arc ends on the right side of the circle (y)");

        let lineCommand0 = decomposedPath0[2];
        assert.closeTo(lineCommand0.arguments[0], 0, 1, "draws line to origin (x)");
        assert.closeTo(lineCommand0.arguments[1], 0, 1, "draws line to origin (y)");

        let pathString1 = d3.select(arcPaths[0][1]).attr("d");
        let decomposedPath1 = TestMethods.decomposePath(TestMethods.normalizePath(pathString1));

        let moveCommand1 = decomposedPath1[0];
        assert.operator(moveCommand1.arguments[0], ">", 0, "draws line to the right");
        assert.closeTo(moveCommand1.arguments[1], 0, 1, "draws line horizontally");

        let arcCommand1 = decomposedPath1[1];
        assert.closeTo(arcCommand1.arguments[5], 0, 1, "ends at x origin");
        assert.operator(arcCommand1.arguments[6], "<", 0, "ends above 0");

        let lineCommand1 = decomposedPath1[2];
        assert.closeTo(lineCommand1.arguments[0], 0, 1, "draws line to origin (x)");
        assert.closeTo(lineCommand1.arguments[1], 0, 1, "draws line to origin (y)");

        svg.remove();
      });

      it("uses Plottable colors for sectors by default", () => {
        let arcPaths = piePlot.content().selectAll(".arc.fill");
        let plottableColors = new Plottable.Scales.Color().range();

        arcPaths.each(function(d, i) {
          assert.strictEqual(d3.select(this).attr("fill"), plottableColors[i], `sector with index ${i} has the correct fill color`);
        });
        svg.remove();
      });

      it("updates slices when data changes", () => {
        let originalPathStrings: String[] = [];
        piePlot.content().selectAll("path").each(function() {
          originalPathStrings.push(d3.select(this).attr("d"));
        });
        assert.lengthOf(originalPathStrings, data.length * 2, "2 paths per datum");

        let oneMoreSliceData = data.slice();
        oneMoreSliceData.push({ value: 5 });
        dataset.data(oneMoreSliceData);

        let oneMoreSlicePathStrings: String[] = [];
        piePlot.content().selectAll("path").each(function() {
          oneMoreSlicePathStrings.push(d3.select(this).attr("d"));
        });
        assert.lengthOf(oneMoreSlicePathStrings, oneMoreSliceData.length * 2, "2 paths per datum");

        originalPathStrings.forEach((pathString, index) => {
          assert.notStrictEqual(pathString, oneMoreSlicePathStrings[index], "slices were updated when data changed");
        });
        svg.remove();
      });

      it("can set innerRadius()", () => {
        let expectedInnerRadius = 5;
        assert.strictEqual(piePlot.innerRadius(expectedInnerRadius), piePlot, "setter returns the calling pie plot");
        let arcPaths = piePlot.content().selectAll(".arc.fill");
        assert.strictEqual(arcPaths.size(), 2, "has two sectors");

        let decomposedPath0 = TestMethods.decomposePath(TestMethods.normalizePath(d3.select(arcPaths[0][0]).attr("d")));

        let lineBeforeInnerArcCommand0 = decomposedPath0[2];
        assert.closeTo(lineBeforeInnerArcCommand0.arguments[0], expectedInnerRadius, 1, "inner arc starts at correct x");
        assert.closeTo(lineBeforeInnerArcCommand0.arguments[1], 0, 1, "inner arc starts at correct y");

        let innerArcCommand0 = decomposedPath0[3];
        assert.closeTo(innerArcCommand0.arguments[0], expectedInnerRadius, 1, "inner arc has correct rx");
        assert.closeTo(innerArcCommand0.arguments[1], expectedInnerRadius, 1, "inner arc has correct ry");
        assert.closeTo(innerArcCommand0.arguments[5], 0, 1, "inner arc ends at correct position (x)");
        assert.closeTo(innerArcCommand0.arguments[6], -expectedInnerRadius, 1, "inner arc ends at correct position (y)");

        svg.remove();
      });

      it("can set outerRadius()", () => {
        let expectedOuterRadius = 150;
        assert.strictEqual(piePlot.outerRadius(() => expectedOuterRadius), piePlot, "setter returns the calling pie plot");
        let arcPaths = piePlot.content().selectAll(".arc.fill");
        assert.strictEqual(arcPaths.size(), 2, "has two sectors");

        let decomposedPath0 = TestMethods.decomposePath(TestMethods.normalizePath(d3.select(arcPaths[0][0]).attr("d")));

        let lineCommand0 = decomposedPath0[0];
        assert.closeTo(lineCommand0.arguments[0], 0, 1, "starts outer arc at correct position (x)");
        assert.closeTo(lineCommand0.arguments[1], -expectedOuterRadius, 1, "starts outer arc at correct position (y)");

        let outerArcCommand0 = decomposedPath0[1];
        assert.closeTo(outerArcCommand0.arguments[0], expectedOuterRadius, 1, "outer arc has correct rx");
        assert.closeTo(outerArcCommand0.arguments[1], expectedOuterRadius, 1, "outer arc has correct ry");
        assert.closeTo(outerArcCommand0.arguments[5], expectedOuterRadius, 1, "outer arc ends at correct position (x)");
        assert.closeTo(outerArcCommand0.arguments[6], 0, 1, "outer arc ends at correct position (y)");

        svg.remove();
      });

      it("updates slices when data changes and render correctly w.r.t. scale changes", () => {
        const newDataset = new Plottable.Dataset([{ value: 500 }, { value: 600 }]);
        // reset database for this test's sake
        piePlot.datasets([newDataset]);

        let originalStringPaths: String[] = [];
        piePlot.content().selectAll("path").each(function() {
          const pathString = d3.select(this).attr("d");
          assert.notInclude(pathString, "NaN", "original pathString should not contain NaN");
          originalStringPaths.push(pathString);
        });

        const newData = [{value: 10}, {value: 20}];
        newDataset.data(newData);

        piePlot.content().selectAll("path").each(function(path, index) {
          const pathString = d3.select(this).attr("d");
          assert.notInclude(pathString, "NaN", "new pathString should not contain NaN");
          assert.notStrictEqual(pathString, originalStringPaths[index], "new pathString should not equal old one");
        });
        svg.remove();
      });

    });

    describe("Labels", () => {
      let svg: d3.Selection<void>;
      let piePlot: Plottable.Plots.Pie;

      beforeEach(() => {
        svg = TestMethods.generateSVG(500, 500);
        piePlot = new Plottable.Plots.Pie();
        piePlot.sectorValue((d) => d.value);
        piePlot.labelsEnabled(true);
      });

      it("does not erase or add labels when rendered twice", () => {
        let data = [
          { value: 1 },
          { value: 2 },
          { value: 3 }
        ];
        let dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(svg);
        let labels = piePlot.content().selectAll("text");
        assert.strictEqual(labels.size(), data.length, "one label per slice");
        piePlot.render();
        labels = piePlot.content().selectAll("text");
        assert.strictEqual(labels.size(), data.length, "one label per slice after re-render()ing");
        svg.remove();
      });

      it("updates labels when data changes", () => {
        let data1 = [
          { value: 1 },
          { value: 1 },
          { value: 1 }
        ];
        let dataset = new Plottable.Dataset(data1);
        piePlot.addDataset(dataset);
        piePlot.renderTo(svg);
        let labels = piePlot.content().selectAll("text");
        assert.strictEqual(labels.size(), data1.length, "one label per datum");
        labels.each(function() {
          let labelText = d3.select(this).text();
          assert.strictEqual(labelText, "1", "label has correct text");
        });
        let data2 = [
          { value: 2 },
          { value: 2 }
        ];
        dataset.data(data2);
        labels = piePlot.content().selectAll("text");
        assert.strictEqual(labels.size(), data2.length, "one label per datum");
        labels.each(function() {
          let labelText = d3.select(this).text();
          assert.strictEqual(labelText, "2", "label text was updated");
        });
        svg.remove();
      });

      it("removes labels when they are disabled after rendering", () => {
        let data = [
          { value: 1 },
          { value: 1 },
          { value: 1 }
        ];
        let dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(svg);
        let labels = piePlot.content().selectAll("text");
        assert.strictEqual(labels.size(), data.length, "one label per datum");
        piePlot.labelsEnabled(false);
        labels = piePlot.content().selectAll("text");
        assert.strictEqual(labels.size(), 0, "labels were removed");
        svg.remove();
      });

      it("hides labels if slices are too small", () => {
        let data = [
          { key: "A", value: 1 },
          { key: "B", value: 50 },
          { key: "C", value: 1 },
          { key: "D", value: 50 },
          { key: "E", value: 1 },
          { key: "F", value: 50 }
        ];
        let dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(svg);
        let labelGs = piePlot.content().select(".label-area").selectAll(".label-area > g");
        labelGs.each(function(d, i) {
          let visibility = d3.select(this).style("visibility");
          if (data[i].value === 1) {
            assert.strictEqual(visibility, "hidden", `label ${i} hidden when slice is too small`);
          } else {
            assert.include(["visible", "inherit"], visibility, `label with index ${i} shown when slice is appropriately sized`);
          }
        });
        svg.remove();
      });

      it("uses its formatter to format labels", () => {
        let data = [
          { value: 5 },
          { value: 15 }
        ];
        let dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.labelFormatter((n: number) => n + " m");
        piePlot.renderTo(svg);
        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "both labels are drawn");
        assert.strictEqual(texts[0], "5 m", "The formatter was used to format the label for slice index 0");
        assert.strictEqual(texts[1], "15 m", "The formatter was used to format the label for slice index 1");
        svg.remove();
      });

      it("hides labels if they don't fit", () => {
        let data = [
          { value: 1 },
          { value: 50 },
          { value: 1 },
          { value: 50 },
          { value: 1 },
          { value: 50 }
        ];
        let dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(svg);

        let texts = svg.selectAll("text");
        assert.strictEqual(texts.size(), data.length, "One label is rendered for each piece of data");

        texts.each(function(d, i) {
          let visibility = d3.select(this).style("visibility");
          if (i % 2 === 0) {
            assert.strictEqual(visibility, "hidden", `label ${i} hidden when slice is too small`);
          } else {
            assert.include(["visible", "inherit"], visibility, `label ${i} shown when slice is appropriately sized`);
          }
        });

        svg.remove();
      });

      it("hides labels outside of the render area", () => {
        let data = [
          { value: 5000 },
          { value: 5000 },
          { value: 5000 }
        ];
        let dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset).outerRadius(500);
        piePlot.renderTo(svg);

        let texts = svg.selectAll("text");
        assert.strictEqual(texts.size(), data.length, "One label is rendered for each piece of data");

        texts.each(function(d, i) {
          let visibility = d3.select(this).style("visibility");
          if (i === 1) {
            assert.strictEqual(visibility, "hidden", `label ${i} hidden when cut off by the lower margin`);
          } else {
            assert.include(["visible", "inherit"], visibility, `label ${i} shown when in the renderArea`);
          }
        });
        svg.remove();
      });

      it("does not show labels for invalid data", () => {
        let data = [
          { value: 1 },
          { value: "value" },
          { value: 2 }
        ];
        let dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(svg);

        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "One label is rendered for each valid datum");
        assert.strictEqual(texts[0], "1", "Label for the first valid datum is shown");
        assert.strictEqual(texts[1], "2", "Label for the second valid datum is shown");
        svg.remove();
      });
    });

    describe("Selections", () => {
      let svg: d3.Selection<void>;
      let dataset: Plottable.Dataset;
      let data: any[];
      let piePlot: Plottable.Plots.Pie;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        data = [{value: 5}, {value: 15}];
        dataset = new Plottable.Dataset(data);
        piePlot = new Plottable.Plots.Pie();
        piePlot.addDataset(dataset);
        piePlot.sectorValue((d) => d.value);
        piePlot.renderTo(svg);
      });

      it("retrieves all dataset selections when no arguments are specified", () => {
        let allSectors = piePlot.selections();
        assert.strictEqual(allSectors.size(), data.length * 2, "all sectors retrieved");
        assert.strictEqual(allSectors.filter(".fill").size(), 2, "each sector has a fill path");
        assert.strictEqual(allSectors.filter(".outline").size(), 2, "each sector has an outline path");
        svg.remove();
      });

      it("retrieves correct selections", () => {
        let allSectors = piePlot.selections([dataset]);
        assert.strictEqual(allSectors.size(), data.length * 2, "all sectors retrieved");
        assert.strictEqual(allSectors.filter(".fill").size(), 2, "each sector has a fill path");
        assert.strictEqual(allSectors.filter(".outline").size(), 2, "each sector has an outline path");
        assert.includeMembers(allSectors.data(), data, "dataset data in selection data");

        svg.remove();
      });

      it("skips invalid Datasets", () => {
        let allSectors = piePlot.selections([new Plottable.Dataset([])]);
        assert.strictEqual(allSectors.size(), 0, "no sectors retrieved");

        svg.remove();
      });
    });

    describe("Entities", () => {
      let svg: d3.Selection<void>;
      let dataset: Plottable.Dataset;
      let data = [{value: 5}, {value: 15}];
      let piePlot: Plottable.Plots.Pie;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        dataset = new Plottable.Dataset();
        piePlot = new Plottable.Plots.Pie();
        dataset.data(data);
        piePlot.addDataset(dataset);
        piePlot.sectorValue((d) => d.value);
        piePlot.renderTo(svg);
      });

      it("returns both a fill path and a stroke path in each Entity's selection", () => {
        let entities = piePlot.entities();
        assert.lengthOf(entities, data.length, "returned one Entity per datum");
        entities.forEach((entity) => {
          assert.strictEqual(entity.selection.size(), 2, "each entity selection has 2 paths");
          assert.strictEqual(entity.selection.filter(".fill").size(), 1, "each entity selection has 1 fill path");
          assert.strictEqual(entity.selection.filter(".outline").size(), 1, "each entity selection has 1 stroke path");
        });
        svg.remove();
      });

      it("retrieves the entity under each given point with entitiesAt()", () => {
        let OUTER_RADIUS = 200;
        piePlot.outerRadius(OUTER_RADIUS);
        let data = [
          {value: 500},
          {value: 5},
          {value: 5},
          {value: 5},
          {value: 5}
        ];
        dataset.data(data);

        let totalValue = data.map((d) => d.value).reduce((previous, current) => previous + current);
        let runningTotal = 0;
        let clickAngles = data.map(function(d) {
          let angle = (runningTotal + d.value / 2) / totalValue * 2 * Math.PI;
          runningTotal += d.value;
          return angle;
        });

        let clicks = clickAngles.map((angle) => {
          return {
            x: OUTER_RADIUS + Math.sin(angle),
            y: OUTER_RADIUS - Math.cos(angle)
          };
        });

        clicks.forEach((point: Plottable.Point, i: number) => {
          let entities = piePlot.entitiesAt(point);
          assert.lengthOf(entities, 1, "exactly one entity is selected");
          TestMethods.assertPlotEntitiesEqual(entities[0], piePlot.entities()[i],
            `the Entity with index ${i} is selected when clicking at [${point.x}, ${point.y}]`);
        });

        let entities = piePlot.entitiesAt( { x: 0, y: 0 } );
        assert.lengthOf(entities, 0, "no entities returned");

        svg.remove();
      });

      it("returns nothing for points within innerRadius() or outside of outerRadius() with entitiesAt()", () => {
        let INNER_RADIUS = 100;
        piePlot.innerRadius(INNER_RADIUS);

        let clickInCenter = {
          x: 200,
          y: 200
        };
        let entitiesInCenter = piePlot.entitiesAt(clickInCenter);
        assert.lengthOf(entitiesInCenter, 0, "no entities returned when clicking inside innerRadius()");

        let OUTER_RADIUS = 150;
        piePlot.outerRadius(OUTER_RADIUS);
        let clickBetweenRadii = {
          x: 200,
          y: 200 + (INNER_RADIUS + OUTER_RADIUS) / 2
        };
        let entitiesBetweenRadii = piePlot.entitiesAt(clickBetweenRadii);
        TestMethods.assertPlotEntitiesEqual(entitiesBetweenRadii[0], piePlot.entities()[1], "retrieved the correct entity");

        let clickOutsideOuterRadius = {
          x: 200,
          y: 200 + OUTER_RADIUS + 1
        };
        let entitiesOutsideOuterRadius = piePlot.entitiesAt(clickOutsideOuterRadius);
        assert.lengthOf(entitiesOutsideOuterRadius, 0, "no entities returned when clicking outside outerRadius()");
        svg.remove();
      });

      it("retrieves undefined for entitiesNearest when no entities rendered", () => {
        piePlot.datasets([new Plottable.Dataset([])]);
        piePlot.renderTo(svg);
        let closest = piePlot.entityNearest({
          x: piePlot.width() / 2,
          y: piePlot.height() / 2
        });
        assert.strictEqual(closest, undefined, "no datum has been retrieved");
        svg.remove();
      });
    });

    describe("Fail safe tests", () => {
      it("renders correctly with no Datasets", () => {
        let SVG_WIDTH = 400;
        let SVG_HEIGHT = 400;
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let piePlot = new Plottable.Plots.Pie();
        piePlot.sectorValue((d) => d.value);
        assert.doesNotThrow(() => piePlot.renderTo(svg), Error);
        assert.strictEqual(piePlot.width(), SVG_WIDTH, "was allocated width");
        assert.strictEqual(piePlot.height(), SVG_HEIGHT, "was allocated height");
        svg.remove();
      });

      it("does not render slices for undefined, NaN, strings, or negative numbers", () => {
        let svg = TestMethods.generateSVG();

        let dataWithBadValue = [
          { v: 1 },
          { v: undefined },
          { v: 1 },
          { v: NaN },
          { v: 1 },
          { v: "Bad String" },
          { v: 1 },
          { v: -100 }
        ];

        let piePlot = new Plottable.Plots.Pie();
        piePlot.addDataset(new Plottable.Dataset(dataWithBadValue));
        piePlot.sectorValue((d) => d.v);

        piePlot.renderTo(svg);

        let elementsDrawnSel = piePlot.content().selectAll(".arc.fill");

        assert.strictEqual(elementsDrawnSel.size(), 4,
          "There should be exactly 4 slices in the pie chart, representing the valid values");
        assert.lengthOf(piePlot.entities(), 4, "there should be exactly 4 entities, representing the valid values");

        for (let i = 0; i < 4; i++) {
          let startAngle = (<any> piePlot)._startAngles[i];
          let endAngle = (<any> piePlot)._endAngles[i];
          assert.closeTo(endAngle - startAngle, Math.PI / 2, 0.001, `slice with index ${i} is a quarter of the pie`);
        }

        svg.remove();
      });
    });
  });
});
