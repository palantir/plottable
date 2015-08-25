///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("PiePlot", () => {
    // HACKHACK #1798: beforeEach being used below
    it("renders correctly with no data", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let plot = new Plottable.Plots.Pie();
      plot.sectorValue((d) => d.value);
      assert.doesNotThrow(() => plot.renderTo(svg), Error);
      assert.strictEqual(plot.width(), 400, "was allocated width");
      assert.strictEqual(plot.height(), 400, "was allocated height");
      svg.remove();
    });

    it("each slice consists of a fill path and a stroke path", () => {
      let svg = TestMethods.generateSVG(500, 500);
      let piePlot = new Plottable.Plots.Pie();
      piePlot.sectorValue((d) => d.value);
      let data = [
        { value: 1 },
        { value: 1 }
      ];
      let dataset = new Plottable.Dataset(data);
      piePlot.addDataset(dataset);
      piePlot.renderTo(svg);
      let renderArea = (<any> piePlot)._renderArea;
      let arcPaths = renderArea.selectAll(".arc");
      let arcFillPaths = renderArea.selectAll(".arc.fill");
      let arcOutlinePaths = renderArea.selectAll(".arc.outline");
      assert.strictEqual(arcPaths.size(), 4, "2 paths per datum");
      assert.strictEqual(arcFillPaths.size(), 2, "1 fill path per datum");
      assert.strictEqual(arcOutlinePaths.size(), 2, "1 outline path per datum");
      assert.strictEqual(arcFillPaths.style("stroke"), "none", "fill paths have no stroke");
      assert.strictEqual(arcOutlinePaths.style("fill"), "none", "outline paths have no fill");
      svg.remove();
    });

    it("each entity selection consists of a fill path and a stroke path", () => {
      let svg = TestMethods.generateSVG(500, 500);
      let piePlot = new Plottable.Plots.Pie();
      piePlot.sectorValue((d) => d.value);
      let data = [
        { value: 1 },
        { value: 1 }
      ];
      let dataset = new Plottable.Dataset(data);
      piePlot.addDataset(dataset);
      piePlot.renderTo(svg);

      let entities = piePlot.entities();
      entities.forEach((entity) => {
        assert.strictEqual(entity.selection.size(), 2, "each entity selection has 2 paths");
        assert.strictEqual(entity.selection.filter(".fill").size(), 1, "each entity selection has 1 fill path");
        assert.strictEqual(entity.selection.filter(".outline").size(), 1, "each entity selection has 1 stroke path");
      });

      svg.remove();
    });

    it("updates slices when data changes", () => {
      let svg = TestMethods.generateSVG(500, 500);
      let piePlot = new Plottable.Plots.Pie();
      piePlot.sectorValue((d) => d.value);
      let fourSliceData = [
        { value: 1 },
        { value: 1 },
        { value: 1 },
        { value: 1 }
      ];
      let dataset = new Plottable.Dataset(fourSliceData);
      piePlot.addDataset(dataset);
      piePlot.renderTo(svg);
      let fourSlicePathStrings: String[] = [];
      piePlot.content().selectAll("path").each(function() { fourSlicePathStrings.push(d3.select(this).attr("d")); });
      assert.lengthOf(fourSlicePathStrings, fourSliceData.length * 2, "2 paths per datum");

      let twoSliceData = [
        { value: 1 },
        { value: 1 }
      ];
      dataset.data(twoSliceData);
      let twoSlicePathStrings: String[] = [];
      piePlot.content().selectAll("path").each(function() { twoSlicePathStrings.push(d3.select(this).attr("d")); });
      assert.lengthOf(twoSlicePathStrings, twoSliceData.length * 2, "2 paths per datum");

      twoSlicePathStrings.forEach((pathString, index) => {
        assert.notStrictEqual(pathString, fourSlicePathStrings[index], "slices were updated when data changed");
      });
      svg.remove();
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

      it("rendering twice does not erase or add labels", () => {
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
        piePlot.labelsEnabled(false);
        labels = piePlot.content().selectAll("text");
        assert.strictEqual(labels.size(), 0, "labels were removed");
        svg.remove();
      });

      it("hides labels if slices are too small", () => {
        let data = [
          { key: "A", value: 1 }, { key: "B", value: 50 },
          { key: "C", value: 1 }, { key: "D", value: 50 },
          { key: "E", value: 1 }, { key: "F", value: 50 }
        ];
        let dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(svg);
        let labelGs = piePlot.content().select(".label-area").selectAll(".label-area > g");
        labelGs.each(function(d, i) {
          let visibility = d3.select(this).style("visibility");
          if (data[i].value === 1) {
            assert.strictEqual(visibility, "hidden", "label hidden when slice is too small");
          } else {
            assert.include(["visible", "inherit"], visibility, "label shown when slice is appropriately sized");
          }
        });
        svg.remove();
      });

      it("formatters are used properly", () => {
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
        assert.strictEqual(texts[0], "5 m", "The formatter was used to format the first label");
        assert.strictEqual(texts[1], "15 m", "The formatter was used to format the second label");
        svg.remove();
      });

      it("labels are shown and hidden appropriately", () => {
        let data = [
          { value: 1 }, { value: 50 },
          { value: 1 }, { value: 50 },
          { value: 1 }, { value: 50 }
        ];
        let dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(svg);

        let texts = svg.selectAll("text");
        assert.strictEqual(texts.size(), data.length, "One label is rendered for each piece of data");

        texts.each(function(d, i) {
          let visibility = d3.select(this).style("visibility");
          if (i % 2 === 0) {
            assert.strictEqual(visibility, "hidden", "label hidden when slice is too small");
          } else {
            assert.include(["visible", "inherit"], visibility, "label shown when slice is appropriately sized");
          }
        });

        svg.remove();
      });

      it("labels outside of the render area are hidden", () => {
        let data = [
          { value: 5000 },
          { value: 5000 },
          { value: 5000 }];
        let dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset).outerRadius(500);
        piePlot.renderTo(svg);

        let texts = svg.selectAll("text");
        assert.strictEqual(texts.size(), data.length, "One label is rendered for each piece of data");

        texts.each(function(d, i) {
          let visibility = d3.select(this).style("visibility");
          if (i === 1) {
            assert.strictEqual(visibility, "hidden", "label hidden when cut off by the lower margin");
          } else {
            assert.include(["visible", "inherit"], visibility, "label shown when in the renderArea");
          }
        });
        svg.remove();
      });

      it("does not show label for invalid data", () => {
        let data = [
          { value: 1 },
          { value: "value" },
          { value: 2 }];
        let dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(svg);

        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "One label is rendered for each valid of data");
        assert.strictEqual(texts[0], "1", "Label for the first valid data is shown");
        assert.strictEqual(texts[1], "2", "Label for the second valid data is shown");
        svg.remove();
      });
    });

    describe("Basic usage", () => {
      let svg: d3.Selection<void>;
      let simpleDataset: Plottable.Dataset;
      let simpleData: any[];
      let piePlot: Plottable.Plots.Pie;
      let renderArea: d3.Selection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG(500, 500);
        simpleData = [{value: 5}, {value: 15}];
        simpleDataset = new Plottable.Dataset(simpleData);
        piePlot = new Plottable.Plots.Pie();
        piePlot.addDataset(simpleDataset);
        piePlot.sectorValue((d) => d.value);
        piePlot.renderTo(svg);
        renderArea = (<any> piePlot)._renderArea;
      });

      it("sectors divided evenly", () => {
        let arcPaths = renderArea.selectAll(".arc.fill");
        assert.lengthOf(arcPaths[0], 2, "only has two sectors");
        let arcPath0 = d3.select(arcPaths[0][0]);
        let pathPoints0 = TestMethods.normalizePath(arcPath0.attr("d")).split(/[A-Z]/).slice(1, 4);

        let firstPathPoints0 = pathPoints0[0].split(",");
        assert.closeTo(parseFloat(firstPathPoints0[0]), 0, 1, "draws line vertically at beginning");
        assert.operator(parseFloat(firstPathPoints0[1]), "<", 0, "draws line upwards");

        let arcDestPoint0 = pathPoints0[1].split(",").slice(5);
        assert.operator(parseFloat(arcDestPoint0[0]), ">", 0, "arcs line to the right");
        assert.closeTo(parseFloat(arcDestPoint0[1]), 0, 1, "ends on same level of svg");

        let secondPathPoints0 = pathPoints0[2].split(",");
        assert.closeTo(parseFloat(secondPathPoints0[0]), 0, 1, "draws line to origin");
        assert.closeTo(parseFloat(secondPathPoints0[1]), 0, 1, "draws line to origin");

        let arcPath1 = d3.select(arcPaths[0][1]);
        let pathPoints1 = TestMethods.normalizePath(arcPath1.attr("d")).split(/[A-Z]/).slice(1, 4);

        let firstPathPoints1 = pathPoints1[0].split(",");
        assert.operator(parseFloat(firstPathPoints1[0]), ">", 0, "draws line to the right");
        assert.closeTo(parseFloat(firstPathPoints1[1]), 0, 1, "draws line horizontally");

        let arcDestPoint1 = pathPoints1[1].split(",").slice(5);
        assert.closeTo(parseFloat(arcDestPoint1[0]), 0, 1, "ends at x origin");
        assert.operator(parseFloat(arcDestPoint1[1]), "<", 0, "ends above 0");

        let secondPathPoints1 = pathPoints1[2].split(",");
        assert.closeTo(parseFloat(secondPathPoints1[0]), 0, 1, "draws line to origin");
        assert.closeTo(parseFloat(secondPathPoints1[1]), 0, 1, "draws line to origin");
        svg.remove();
      });

      it("sectors are filled in according to defaults", () => {
        let arcPaths = renderArea.selectAll(".arc");

        let arcPath0 = d3.select(arcPaths[0][0]);
        assert.strictEqual(arcPath0.attr("fill"), "#5279c7", "first sector filled appropriately");

        let arcPath1 = d3.select(arcPaths[0][1]);
        assert.strictEqual(arcPath1.attr("fill"), "#fd373e", "second sector filled appropriately");
        svg.remove();
      });

      it("innerRadius", () => {
        piePlot.innerRadius(5);
        let arcPaths = renderArea.selectAll(".arc.fill");
        assert.lengthOf(arcPaths[0], 2, "only has two sectors");

        let pathPoints0 = TestMethods.normalizePath(d3.select(arcPaths[0][0]).attr("d")).split(/[A-Z]/).slice(1, 5);

        let radiusPath0 = pathPoints0[2].split(",").map((coordinate: string) => parseFloat(coordinate));
        assert.closeTo(radiusPath0[0], 5, 1, "stops line at innerRadius point");
        assert.closeTo(radiusPath0[1], 0, 1, "stops line at innerRadius point");

        let innerArcPath0 = pathPoints0[3].split(",").map((coordinate: string) => parseFloat(coordinate));
        assert.closeTo(innerArcPath0[0], 5, 1, "makes inner arc of radius 5");
        assert.closeTo(innerArcPath0[1], 5, 1, "makes inner arc of radius 5");
        assert.closeTo(innerArcPath0[5], 0, 1, "make inner arc to center");
        assert.closeTo(innerArcPath0[6], -5, 1, "makes inner arc to top of inner circle");

        piePlot.innerRadius(0);
        svg.remove();
      });

      it("outerRadius", () => {
        piePlot.outerRadius(() => 150);
        let arcPaths = renderArea.selectAll(".arc.fill");
        assert.lengthOf(arcPaths[0], 2, "only has two sectors");

        let pathPoints0 = TestMethods.normalizePath(d3.select(arcPaths[0][0]).attr("d")).split(/[A-Z]/).slice(1, 5);

        let radiusPath0 = pathPoints0[0].split(",").map((coordinate: string) => parseFloat(coordinate));
        assert.closeTo(radiusPath0[0], 0, 1, "starts at outerRadius point");
        assert.closeTo(radiusPath0[1], -150, 1, "starts at outerRadius point");

        let outerArcPath0 = pathPoints0[1].split(",").map((coordinate: string) => parseFloat(coordinate));
        assert.closeTo(outerArcPath0[0], 150, 1, "makes outer arc of radius 150");
        assert.closeTo(outerArcPath0[1], 150, 1, "makes outer arc of radius 150");
        assert.closeTo(outerArcPath0[5], 150, 1, "makes outer arc to right edge");
        assert.closeTo(outerArcPath0[6], 0, 1, "makes outer arc to right edge");

        piePlot.outerRadius(() => 250);
        svg.remove();
      });
    });

    describe("selections", () => {
      let svg: d3.Selection<void>;
      let simpleDataset: Plottable.Dataset;
      let simpleData: any[];
      let piePlot: Plottable.Plots.Pie;
      let renderArea: d3.Selection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG(500, 500);
        simpleData = [{value: 5}, {value: 15}];
        simpleDataset = new Plottable.Dataset(simpleData);
        piePlot = new Plottable.Plots.Pie();
        piePlot.addDataset(simpleDataset);
        piePlot.sectorValue((d) => d.value);
        piePlot.renderTo(svg);
        renderArea = (<any> piePlot)._renderArea;
      });

      it("retrieves all dataset selections with no args", () => {
        let allSectors = piePlot.selections();
        assert.strictEqual(allSectors.size(), 2 * 2, "all sectors retrieved");
        assert.strictEqual(allSectors.filter(".fill").size(), 2, "each sector has a fill path");
        assert.strictEqual(allSectors.filter(".outline").size(), 2, "each sector has an outline path");
        svg.remove();
      });

      it("retrieves correct selections", () => {
        let allSectors = piePlot.selections([simpleDataset]);
        assert.strictEqual(allSectors.size(), 2 * 2, "all sectors retrieved");
        assert.strictEqual(allSectors.filter(".fill").size(), 2, "each sector has a fill path");
        assert.strictEqual(allSectors.filter(".outline").size(), 2, "each sector has an outline path");
        assert.includeMembers(allSectors.data(), simpleData, "dataset data in selection data");

        svg.remove();
      });

      it("skips invalid Datsets", () => {
        let allSectors = piePlot.selections([new Plottable.Dataset([])]);
        assert.strictEqual(allSectors.size(), 0, "no sectors retrieved");

        svg.remove();
      });

    });

    describe("entities", () => {
      let svg: d3.Selection<void>;
      let simpleDataset: Plottable.Dataset;
      let simpleData: any[];
      let piePlot: Plottable.Plots.Pie;
      let renderArea: d3.Selection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG(500, 500);
        simpleData = [{value: 5}, {value: 15}];
        simpleDataset = new Plottable.Dataset(simpleData);
        piePlot = new Plottable.Plots.Pie();
        piePlot.addDataset(simpleDataset);
        piePlot.sectorValue((d) => d.value);
        piePlot.renderTo(svg);
        renderArea = (<any> piePlot)._renderArea;
      });

      it("retrieves the entity under each given point", () => {
        let data = [
          {value: 500},
          {value: 5},
          {value: 5},
          {value: 5},
          {value: 5}
        ];

        let clicks =  [
          { x: 260, y: 25 },
          { x: 200, y: 25 },
          { x: 215, y: 25 },
          { x: 230, y: 25 },
          { x: 245, y: 25 }
        ];
        piePlot.removeDataset(simpleDataset);
        piePlot.addDataset(new Plottable.Dataset(data));
        clicks.forEach((point: Plottable.Point, i: number) => {
          let entity = piePlot.entitiesAt(point);
          assert.strictEqual(entity.length, 1, "exactly one entity is selected");
          TestMethods.assertPlotEntitiesEqual(entity[0], piePlot.entities()[i], "the correct entity is selcted");
        });

        let entity = piePlot.entitiesAt( { x: 0, y: 0 } );
        assert.strictEqual(entity.length, 0, "no entities returned");

        svg.remove();
      });

      it("returns nothing for points within innerRadius() or outside of outerRadius()", () => {
        piePlot.innerRadius(100).render();
        let click1 = { x: 200, y: 201 };
        let entity1 = piePlot.entitiesAt(click1);
        assert.strictEqual(entity1.length, 0, "no entities returned");
        piePlot.outerRadius(150).render();
        let click2 = { x: 200, y: 350 };
        let entity2 = piePlot.entitiesAt(click2);
        TestMethods.assertPlotEntitiesEqual(entity2[0], piePlot.entities()[1], "entities are equal");
        let click3 = { x: 200, y: 399 };
        let entity3 = piePlot.entitiesAt(click3);
        assert.strictEqual(entity3.length, 0, "no entities returned");
        svg.remove();
      });

    });

    describe("fail safe tests", () => {
      it("undefined, NaN, non-numeric strings, and negative number not be represented in a Pie Chart", () => {
        let svg = TestMethods.generateSVG();

        let data1 = [
          { v: 1 },
          { v: undefined },
          { v: 1 },
          { v: NaN },
          { v: 1 },
          { v: "Bad String" },
          { v: 1 },
          { v: -100 },
        ];

        let plot = new Plottable.Plots.Pie();
        plot.addDataset(new Plottable.Dataset(data1));
        plot.sectorValue((d) => d.v);

        plot.renderTo(svg);

        let elementsDrawnSel = (<any> plot)._element.selectAll(".arc.fill");

        assert.strictEqual(elementsDrawnSel.size(), 4,
          "There should be exactly 4 slices in the pie chart, representing the valid values");
        assert.lengthOf(plot.entities(), 4, "there should be exactly 4 entities, representing the valid values");

        for (let i = 0 ; i < 4 ; i ++ ) {
          let startAngle = (<any> plot)._startAngles[i];
          let endAngle = (<any> plot)._endAngles[i];
          assert.closeTo(endAngle - startAngle, Math.PI / 2, 0.001, "each slice is a quarter of the pie");
        }

        svg.remove();
      });
    });
  });
});
