///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("PiePlot", () => {
    // HACKHACK #1798: beforeEach being used below
    it("renders correctly with no data", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var plot = new Plottable.Plots.Pie();
      plot.sectorValue((d) => d.value);
      assert.doesNotThrow(() => plot.renderTo(svg), Error);
      assert.strictEqual(plot.width(), 400, "was allocated width");
      assert.strictEqual(plot.height(), 400, "was allocated height");
      svg.remove();
    });

    it("updates slices when data changes", () => {
      var svg = TestMethods.generateSVG(500, 500);
      var piePlot = new Plottable.Plots.Pie();
      piePlot.sectorValue((d) => d.value);
      var fourSliceData = [
        { value: 1 },
        { value: 1 },
        { value: 1 },
        { value: 1 }
      ];
      var dataset = new Plottable.Dataset(fourSliceData);
      piePlot.addDataset(dataset);
      piePlot.renderTo(svg);
      var fourSlicePathStrings: String[] = [];
      piePlot.content().selectAll("path").each(function() { fourSlicePathStrings.push(d3.select(this).attr("d")); });
      assert.lengthOf(fourSlicePathStrings, fourSliceData.length, "one path per datum");

      var twoSliceData = [
        { value: 1 },
        { value: 1 }
      ];
      dataset.data(twoSliceData);
      var twoSlicePathStrings: String[] = [];
      piePlot.content().selectAll("path").each(function() { twoSlicePathStrings.push(d3.select(this).attr("d")); });
      assert.lengthOf(twoSlicePathStrings, twoSliceData.length, "one path per datum");

      twoSlicePathStrings.forEach((pathString, index) => {
        assert.notStrictEqual(pathString, fourSlicePathStrings[index], "slices were updated when data changed");
      });
      svg.remove();
    });

    describe("Labels", () => {
      var svg: d3.Selection<void>;
      var piePlot: Plottable.Plots.Pie;

      beforeEach(() => {
        svg = TestMethods.generateSVG(500, 500);
        piePlot = new Plottable.Plots.Pie();
        piePlot.sectorValue((d) => d.value);
        piePlot.labelsEnabled(true);
      });

      it("rendering twice does not erase or add labels", () => {
        var data = [
          { value: 1 },
          { value: 2 },
          { value: 3 }
        ];
        var dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(svg);
        var labels = piePlot.content().selectAll("text");
        assert.strictEqual(labels.size(), data.length, "one label per slice");
        piePlot.render();
        labels = piePlot.content().selectAll("text");
        assert.strictEqual(labels.size(), data.length, "one label per slice after re-render()ing");
        svg.remove();
      });

      it("updates labels when data changes", () => {
        var data1 = [
          { value: 1 },
          { value: 1 },
          { value: 1 }
        ];
        var dataset = new Plottable.Dataset(data1);
        piePlot.addDataset(dataset);
        piePlot.renderTo(svg);
        var labels = piePlot.content().selectAll("text");
        assert.strictEqual(labels.size(), data1.length, "one label per datum");
        labels.each(function() {
          var labelText = d3.select(this).text();
          assert.strictEqual(labelText, "1", "label has correct text");
        });
        var data2 = [
          { value: 2 },
          { value: 2 }
        ];
        dataset.data(data2);
        labels = piePlot.content().selectAll("text");
        assert.strictEqual(labels.size(), data2.length, "one label per datum");
        labels.each(function() {
          var labelText = d3.select(this).text();
          assert.strictEqual(labelText, "2", "label text was updated");
        });
        svg.remove();
      });

      it("removes labels when they are disabled after rendering", () => {
        var data1 = [
          { value: 1 },
          { value: 1 },
          { value: 1 }
        ];
        var dataset = new Plottable.Dataset(data1);
        piePlot.addDataset(dataset);
        piePlot.renderTo(svg);
        var labels = piePlot.content().selectAll("text");
        assert.strictEqual(labels.size(), data1.length, "one label per datum");
        piePlot.labelsEnabled(false);
        labels = piePlot.content().selectAll("text");
        assert.strictEqual(labels.size(), 0, "labels were removed");
        svg.remove();
      });

      it("hides labels if slices are too small", () => {
        var data = [
          { key: "A", value: 1 }, { key: "B", value: 50 },
          { key: "C", value: 1 }, { key: "D", value: 50 },
          { key: "E", value: 1 }, { key: "F", value: 50 }
        ];
        var dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(svg);
        var labelGs = piePlot.content().select(".label-area").selectAll(".label-area > g");
        labelGs.each(function(d, i) {
          var visibility = d3.select(this).style("visibility");
          if (data[i].value === 1) {
            assert.strictEqual(visibility, "hidden", "label hidden when slice is too small");
          } else {
            assert.include(["visible", "inherit"], visibility, "label shown when slice is appropriately sized");
          }
        });
        svg.remove();
      });

      it("formatters are used properly", () => {
        var data = [
          { value: 5 },
          { value: 15 }
        ];
        var dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.labelFormatter((n: number) => n + " m");
        piePlot.renderTo(svg);
        var texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "both labels are drawn");
        assert.strictEqual(texts[0], "5 m", "The formatter was used to format the first label");
        assert.strictEqual(texts[1], "15 m", "The formatter was used to format the second label");
        svg.remove();
      });

      it("labels are shown and hidden appropriately", () => {
        var data = [
          { value: 1 }, { value: 50 },
          { value: 1 }, { value: 50 },
          { value: 1 }, { value: 50 }
        ];
        var dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(svg);

        var texts = svg.selectAll("text");
        assert.strictEqual(texts.size(), data.length, "One label is rendered for each piece of data");

        texts.each(function(d, i) {
          var visibility = d3.select(this).style("visibility");
          if (i % 2 === 0) {
            assert.strictEqual(visibility, "hidden", "label hidden when slice is too small");
          } else {
            assert.include(["visible", "inherit"], visibility, "label shown when slice is appropriately sized");
          }
        });

        svg.remove();
      });

      it("labels outside of the render area are hidden", () => {
        var data = [
          { value: 5000 },
          { value: 5000 },
          { value: 5000 }];
        var dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset).outerRadius(500);
        piePlot.renderTo(svg);

        var texts = svg.selectAll("text");
        assert.strictEqual(texts.size(), data.length, "One label is rendered for each piece of data");

        texts.each(function(d, i) {
          var visibility = d3.select(this).style("visibility");
          if (i === 1) {
            assert.strictEqual(visibility, "hidden", "label hidden when cut off by the lower margin");
          } else {
            assert.include(["visible", "inherit"], visibility, "label shown when in the renderArea");
          }
        });
        svg.remove();
      });

      it("does not show label for invalid data", () => {
        var data = [
          { value: 1 },
          { value: "value" },
          { value: 2 }];
        var dataset = new Plottable.Dataset(data);
        piePlot.addDataset(dataset);
        piePlot.renderTo(svg);

        var texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "One label is rendered for each valid of data");
        assert.strictEqual(texts[0], "1", "Label for the first valid data is shown");
        assert.strictEqual(texts[1], "2", "Label for the second valid data is shown");
        svg.remove();
      });
    });
  });

  describe("PiePlot", () => {
    var svg: d3.Selection<void>;
    var simpleDataset: Plottable.Dataset;
    var simpleData: any[];
    var piePlot: Plottable.Plots.Pie;
    var renderArea: d3.Selection<void>;

    beforeEach(() => {
      svg = TestMethods.generateSVG(500, 500);
      simpleData = [{value: 5, value2: 10, type: "A"}, {value: 15, value2: 10, type: "B"}];
      simpleDataset = new Plottable.Dataset(simpleData);
      piePlot = new Plottable.Plots.Pie();
      piePlot.addDataset(simpleDataset);
      piePlot.sectorValue((d) => d.value);
      piePlot.renderTo(svg);
      renderArea = (<any> piePlot)._renderArea;
    });

    it("sectors divided evenly", () => {
      var arcPaths = renderArea.selectAll(".arc");
      assert.lengthOf(arcPaths[0], 2, "only has two sectors");
      var arcPath0 = d3.select(arcPaths[0][0]);
      var pathPoints0 = TestMethods.normalizePath(arcPath0.attr("d")).split(/[A-Z]/).slice(1, 4);

      var firstPathPoints0 = pathPoints0[0].split(",");
      assert.closeTo(parseFloat(firstPathPoints0[0]), 0, 1, "draws line vertically at beginning");
      assert.operator(parseFloat(firstPathPoints0[1]), "<", 0, "draws line upwards");

      var arcDestPoint0 = pathPoints0[1].split(",").slice(5);
      assert.operator(parseFloat(arcDestPoint0[0]), ">", 0, "arcs line to the right");
      assert.closeTo(parseFloat(arcDestPoint0[1]), 0, 1, "ends on same level of svg");

      var secondPathPoints0 = pathPoints0[2].split(",");
      assert.closeTo(parseFloat(secondPathPoints0[0]), 0, 1, "draws line to origin");
      assert.closeTo(parseFloat(secondPathPoints0[1]), 0, 1, "draws line to origin");

      var arcPath1 = d3.select(arcPaths[0][1]);
      var pathPoints1 = TestMethods.normalizePath(arcPath1.attr("d")).split(/[A-Z]/).slice(1, 4);

      var firstPathPoints1 = pathPoints1[0].split(",");
      assert.operator(parseFloat(firstPathPoints1[0]), ">", 0, "draws line to the right");
      assert.closeTo(parseFloat(firstPathPoints1[1]), 0, 1, "draws line horizontally");

      var arcDestPoint1 = pathPoints1[1].split(",").slice(5);
      assert.closeTo(parseFloat(arcDestPoint1[0]), 0, 1, "ends at x origin");
      assert.operator(parseFloat(arcDestPoint1[1]), "<", 0, "ends above 0");

      var secondPathPoints1 = pathPoints1[2].split(",");
      assert.closeTo(parseFloat(secondPathPoints1[0]), 0, 1, "draws line to origin");
      assert.closeTo(parseFloat(secondPathPoints1[1]), 0, 1, "draws line to origin");
      svg.remove();
    });

    it("project value onto different attribute", () => {
      piePlot.sectorValue((d) => d.value2);

      var arcPaths = renderArea.selectAll(".arc");
      assert.lengthOf(arcPaths[0], 2, "only has two sectors");
      var arcPath0 = d3.select(arcPaths[0][0]);
      var pathPoints0 = TestMethods.normalizePath(arcPath0.attr("d")).split(/[A-Z]/).slice(1, 4);

      var firstPathPoints0 = pathPoints0[0].split(",");
      assert.closeTo(parseFloat(firstPathPoints0[0]), 0, 1, "draws line vertically at beginning");
      assert.operator(parseFloat(firstPathPoints0[1]), "<", 0, "draws line upwards");

      var arcDestPoint0 = pathPoints0[1].split(",").slice(5);
      assert.closeTo(parseFloat(arcDestPoint0[0]), 0, 1, "ends on a line vertically from beginning");
      assert.operator(parseFloat(arcDestPoint0[1]), ">", 0, "ends below the center");

      var arcPath1 = d3.select(arcPaths[0][1]);
      var pathPoints1 = TestMethods.normalizePath(arcPath1.attr("d")).split(/[A-Z]/).slice(1, 4);

      var firstPathPoints1 = pathPoints1[0].split(",");
      assert.closeTo(parseFloat(firstPathPoints1[0]), 0, 1, "draws line vertically at beginning");
      assert.operator(parseFloat(firstPathPoints1[1]), ">", 0, "draws line downwards");

      var arcDestPoint1 = pathPoints1[1].split(",").slice(5);
      assert.closeTo(parseFloat(arcDestPoint1[0]), 0, 1, "ends on a line vertically from beginning");
      assert.operator(parseFloat(arcDestPoint1[1]), "<", 0, "ends above the center");

      piePlot.sectorValue((d) => d.value);
      svg.remove();
    });

    it("innerRadius", () => {
      piePlot.innerRadius(5);
      var arcPaths = renderArea.selectAll(".arc");
      assert.lengthOf(arcPaths[0], 2, "only has two sectors");

      var pathPoints0 = TestMethods.normalizePath(d3.select(arcPaths[0][0]).attr("d")).split(/[A-Z]/).slice(1, 5);

      var radiusPath0 = pathPoints0[2].split(",").map((coordinate: string) => parseFloat(coordinate));
      assert.closeTo(radiusPath0[0], 5, 1, "stops line at innerRadius point");
      assert.closeTo(radiusPath0[1], 0, 1, "stops line at innerRadius point");

      var innerArcPath0 = pathPoints0[3].split(",").map((coordinate: string) => parseFloat(coordinate));
      assert.closeTo(innerArcPath0[0], 5, 1, "makes inner arc of radius 5");
      assert.closeTo(innerArcPath0[1], 5, 1, "makes inner arc of radius 5");
      assert.closeTo(innerArcPath0[5], 0, 1, "make inner arc to center");
      assert.closeTo(innerArcPath0[6], -5, 1, "makes inner arc to top of inner circle");

      piePlot.innerRadius(0);
      svg.remove();
    });

    it("outerRadius", () => {
      piePlot.outerRadius(() => 150);
      var arcPaths = renderArea.selectAll(".arc");
      assert.lengthOf(arcPaths[0], 2, "only has two sectors");

      var pathPoints0 = TestMethods.normalizePath(d3.select(arcPaths[0][0]).attr("d")).split(/[A-Z]/).slice(1, 5);

      var radiusPath0 = pathPoints0[0].split(",").map((coordinate: string) => parseFloat(coordinate));
      assert.closeTo(radiusPath0[0], 0, 1, "starts at outerRadius point");
      assert.closeTo(radiusPath0[1], -150, 1, "starts at outerRadius point");

      var outerArcPath0 = pathPoints0[1].split(",").map((coordinate: string) => parseFloat(coordinate));
      assert.closeTo(outerArcPath0[0], 150, 1, "makes outer arc of radius 150");
      assert.closeTo(outerArcPath0[1], 150, 1, "makes outer arc of radius 150");
      assert.closeTo(outerArcPath0[5], 150, 1, "makes outer arc to right edge");
      assert.closeTo(outerArcPath0[6], 0, 1, "makes outer arc to right edge");

      piePlot.outerRadius(() => 250);
      svg.remove();
    });

    describe("selections", () => {
      it("retrieves all dataset selections with no args", () => {
        var allSectors = piePlot.selections();
        assert.strictEqual(allSectors.size(), 2, "all sectors retrieved");

        svg.remove();
      });

      it("retrieves correct selections", () => {
        var allSectors = piePlot.selections([simpleDataset]);
        assert.strictEqual(allSectors.size(), 2, "all sectors retrieved");
        assert.includeMembers(allSectors.data(), simpleData, "dataset data in selection data");

        svg.remove();
      });

      it("skips invalid Datsets", () => {
        var allSectors = piePlot.selections([new Plottable.Dataset([])]);
        assert.strictEqual(allSectors.size(), 0, "no sectors retrieved");

        svg.remove();
      });

      it("retrieves entities under a point with entitiesAt()", () => {
        var data = [
          {value: 500},
          {value: 5},
          {value: 5},
          {value: 5},
          {value: 5}
        ];

        var clicks =  [
          { x: 260, y: 25 },
          { x: 200, y: 25 },
          { x: 215, y: 25 },
          { x: 230, y: 25 },
          { x: 245, y: 25 }
        ];
        piePlot.removeDataset(simpleDataset);
        piePlot.addDataset(new Plottable.Dataset(data));
        clicks.forEach((point: Plottable.Point, i: number) => {
          var entity = piePlot.entitiesAt(point);
          assert.strictEqual(entity.length, 1, "exactly one entity is selected");
          TestMethods.assertPlotEntitiesEqual(entity[0], piePlot.entities()[i], "the correct entity is selcted");
        });

        var entity = piePlot.entitiesAt( { x: 0, y: 0 } );
        assert.strictEqual(entity.length, 0, "no entities returned");

        svg.remove();
      });

      it("points within innerRadius() and outside of outerRadius() don't return entities", () => {
        piePlot.innerRadius(100).render();
        var click1 = { x: 200, y: 201 };
        var entity1 = piePlot.entitiesAt(click1);
        assert.strictEqual(entity1.length, 0, "no entities returned");
        piePlot.outerRadius(150).render();
        var click2 = { x: 200, y: 350 };
        var entity2 = piePlot.entitiesAt(click2);
        TestMethods.assertPlotEntitiesEqual(entity2[0], piePlot.entities()[1], "entities are equal");
        var click3 = { x: 200, y: 399 };
        var entity3 = piePlot.entitiesAt(click3);
        assert.strictEqual(entity3.length, 0, "no entities returned");
        svg.remove();
      });

    });

    describe("Fill", () => {

      it("sectors are filled in according to defaults", () => {
        var arcPaths = renderArea.selectAll(".arc");

        var arcPath0 = d3.select(arcPaths[0][0]);
        assert.strictEqual(arcPath0.attr("fill"), "#5279c7", "first sector filled appropriately");

        var arcPath1 = d3.select(arcPaths[0][1]);
        assert.strictEqual(arcPath1.attr("fill"), "#fd373e", "second sector filled appropriately");
        svg.remove();
      });

      it("project fill", () => {
        piePlot.attr("fill", (d: any, i: number) => String(i), new Plottable.Scales.Color("10"));

        var arcPaths = renderArea.selectAll(".arc");

        var arcPath0 = d3.select(arcPaths[0][0]);
        assert.strictEqual(arcPath0.attr("fill"), "#1f77b4", "first sector filled appropriately");

        var arcPath1 = d3.select(arcPaths[0][1]);
        assert.strictEqual(arcPath1.attr("fill"), "#ff7f0e", "second sector filled appropriately");

        piePlot.attr("fill", (d) => d.type, new Plottable.Scales.Color("20"));

        arcPaths = renderArea.selectAll(".arc");

        arcPath0 = d3.select(arcPaths[0][0]);
        assert.strictEqual(arcPath0.attr("fill"), "#1f77b4", "first sector filled appropriately");

        arcPath1 = d3.select(arcPaths[0][1]);
        assert.strictEqual(arcPath1.attr("fill"), "#aec7e8", "second sector filled appropriately");
        svg.remove();
      });

    });

    it("throws warnings on negative data", () => {
      var message: String;
      var oldWarn = Plottable.Utils.Window.warn;
      Plottable.Utils.Window.warn = (warn) => message = warn;
      piePlot.removeDataset(simpleDataset);
      var negativeDataset = new Plottable.Dataset([{value: -5}, {value: 15}]);
      piePlot.addDataset(negativeDataset);
      assert.strictEqual(message, "Negative values will not render correctly in a Pie Plot.");
      Plottable.Utils.Window.warn = oldWarn;
      svg.remove();
    });
  });

  describe("fail safe tests", () => {
    it("undefined, NaN and non-numeric strings not be represented in a Pie Chart", () => {
      var svg = TestMethods.generateSVG();

      var data1 = [
        { v: 1 },
        { v: undefined },
        { v: 1 },
        { v: NaN },
        { v: 1 },
        { v: "Bad String" },
        { v: 1 },
      ];

      var plot = new Plottable.Plots.Pie();
      plot.addDataset(new Plottable.Dataset(data1));
      plot.sectorValue((d) => d.v);

      plot.renderTo(svg);

      var elementsDrawnSel = (<any> plot)._element.selectAll(".arc");

      assert.strictEqual(elementsDrawnSel.size(), 4,
        "There should be exactly 4 slices in the pie chart, representing the valid values");

      svg.remove();

    });
  });
});
