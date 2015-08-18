///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("RectanglePlot", () => {
    let SVG_WIDTH = 300;
    let SVG_HEIGHT = 300;
    let DATA = [
      { x: 0, y: 0, x2: 1, y2: 1 },
      { x: 1, y: 1, x2: 2, y2: 2 },
      { x: 2, y: 2, x2: 3, y2: 3 },
      { x: 3, y: 3, x2: 4, y2: 4 },
      { x: 4, y: 4, x2: 5, y2: 5 }
    ];
    let VERIFY_CELLS = (cells: d3.Selection<any>) => {
      assert.strictEqual(cells[0].length, 5);
      cells.each(function(d: any, i: number) {
        let cell = d3.select(this);
        assert.closeTo(+cell.attr("height"), 50, 0.5, "Cell height is correct");
        assert.closeTo(+cell.attr("width"), 50, 0.5, "Cell width is correct");
        assert.closeTo(+cell.attr("x"), 25 + 50 * i, 0.5, "Cell x coordinate is correct");
        assert.closeTo(+cell.attr("y"), 25 + 50 * (cells[0].length - i - 1), 0.5, "Cell y coordinate is correct");
      });
    };

    it("renders correctly", () => {
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let rectanglePlot = new Plottable.Plots.Rectangle();
      rectanglePlot.addDataset(new Plottable.Dataset(DATA));
      rectanglePlot.x((d) => d.x, xScale)
                   .y((d) => d.y, yScale)
                   .x2((d) => d.x2)
                   .y2((d) => d.y2)
                   .renderTo(svg);
      VERIFY_CELLS((<any> rectanglePlot)._renderArea.selectAll("rect"));
      svg.remove();
    });

    it("retrieves the correct entity under a point", () => {
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dataset = new Plottable.Dataset(DATA);
      let plot = new Plottable.Plots.Rectangle()
        .x((d) => d.x, xScale).x2((d) => d.x2)
        .y((d) => d.y, yScale).y2((d) => d.y2);
      plot.addDataset(dataset).renderTo(svg);
      let entities = plot.entitiesAt({ x: xScale.scale(2.5), y: yScale.scale(2.5) });
      assert.lengthOf(entities, 1, "found only one entity when querying a point inside the third rectangle");
      assert.strictEqual(entities[0].index, 2, "entity retrieved is at index 2");
      svg.remove();
    });

    it("retrieves correct entities under a point", () => {
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dataset = new Plottable.Dataset([
        { x: 1, y: 1, x2: 3, y2: 3 },
        { x: 4, y: 2, x2: 2, y2: 4 }
      ]);
      let plot = new Plottable.Plots.Rectangle()
        .x((d) => d.x, xScale).x2((d) => d.x2)
        .y((d) => d.y, yScale).y2((d) => d.y2);
      plot.addDataset(dataset).renderTo(svg);
      let entities = plot.entitiesAt({ x: xScale.scale(2), y: xScale.scale(2) });
      assert.lengthOf(entities, 2, "two entities when querying a point in both");
      assert.strictEqual(entities[0].index, 0, "entity retrieved is at index 0");
      assert.strictEqual(entities[1].index, 1, "entity retrieved is at index 1");
      entities = plot.entitiesAt({ x: xScale.scale(4), y: yScale.scale(4) });
      assert.lengthOf(entities, 1, "found only one entity when querying a point inside the second rectangle");
      assert.strictEqual(entities[0].index, 1, "entity retrieved is at index 1");
      entities = plot.entitiesAt({ x: xScale.scale(1), y: yScale.scale(1) });
      assert.lengthOf(entities, 1, "found only one entity when querying a point inside the first rectangle");
      assert.strictEqual(entities[0].index, 0, "entity retrieved is at index 0");
      svg.remove();
    });

    it("retrieves the entities that intersect with the bounding box", () => {
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dataset = new Plottable.Dataset(DATA);
      let plot = new Plottable.Plots.Rectangle()
        .x((d) => d.x, xScale).x2((d) => d.x2)
        .y((d) => d.y, yScale).y2((d) => d.y2);
      plot.addDataset(dataset).renderTo(svg);

      let entities = plot.entitiesIn({
        topLeft: { x: xScale.scale(1.5), y: yScale.scale(2.5) },
        bottomRight: { x: xScale.scale(2.5), y: yScale.scale(1.5) } });
      assert.lengthOf(entities, 2, "retrieved 2 entities intersect with the box");
      assert.strictEqual(entities[0].index, 1, "the entity of index 1 is retrieved");
      assert.strictEqual(entities[1].index, 2, "the entity of index 2 is retrieved");
      svg.remove();
    });

    it("retrieves the entities that intersect with the given ranges", () => {
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dataset = new Plottable.Dataset(DATA);
      let plot = new Plottable.Plots.Rectangle()
        .x((d) => d.x, xScale).x2((d) => d.x2)
        .y((d) => d.y, yScale).y2((d) => d.y2);
      plot.addDataset(dataset).renderTo(svg);

      let entities = plot.entitiesIn(
        {min: xScale.scale(1.5), max: xScale.scale(2.5)},
        {min: yScale.scale(2.5), max: yScale.scale(1.5)});
      assert.lengthOf(entities, 2, "retrieved 2 entities intersect with the box");
      assert.strictEqual(entities[0].index, 1, "the entity of index 1 is retrieved");
      assert.strictEqual(entities[1].index, 2, "the entity of index 2 is retrieved");
      svg.remove();
    });

    it("autorangeMode(\"x\")", () => {
      let staggeredData = [
        { y: "A", x: 0, x2: 1 },
        { y: "B", x: 1, x2: 2 }
      ];

      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Category();
      xScale.padProportion(0);

      let plot = new Plottable.Plots.Rectangle();
      plot.x(function(d) { return d.x; }, xScale);
      plot.x2(function(d) { return d.x2; });
      plot.y(function(d) { return d.y; }, yScale);
      plot.addDataset(new Plottable.Dataset(staggeredData));
      plot.autorangeMode("x");
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      plot.renderTo(svg);

      assert.deepEqual(xScale.domain(), [0, 2], "y domain includes both visible segments");

      yScale.domain(["A"]);
      assert.deepEqual(xScale.domain(), [0, 1], "y domain includes only the visible segment (first)");

      yScale.domain(["B"]);
      assert.deepEqual(xScale.domain(), [1, 2], "y domain includes only the visible segment (second)");

      svg.remove();
    });

    it("autorangeMode(\"y\")", () => {
      let staggeredData = [
        { x: "A", y: 0, y2: 1 },
        { x: "B", y: 1, y2: 2 }
      ];

      let xScale = new Plottable.Scales.Category();
      let yScale = new Plottable.Scales.Linear();
      yScale.padProportion(0);

      let plot = new Plottable.Plots.Rectangle();
      plot.x(function(d) { return d.x; }, xScale);
      plot.y(function(d) { return d.y; }, yScale);
      plot.y2(function(d) { return d.y2; });
      plot.addDataset(new Plottable.Dataset(staggeredData));
      plot.autorangeMode("y");
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      plot.renderTo(svg);

      assert.deepEqual(yScale.domain(), [0, 2], "y domain includes both visible segments");

      xScale.domain(["A"]);
      assert.deepEqual(yScale.domain(), [0, 1], "y domain includes only the visible segment (first)");

      xScale.domain(["B"]);
      assert.deepEqual(yScale.domain(), [1, 2], "y domain includes only the visible segment (second)");

      svg.remove();
    });

  });

  describe("fail safe tests", () => {
    it("illegal rectangles don't get displayed", () => {
      let svg = TestMethods.generateSVG();

      let data1 = [
        { x: "A", y: 1, y2: 2, v: 1 },
        { x: "B", y: 2, y2: 3, v: 2 },
        { x: "C", y: 3, y2: NaN, v: 3 },
        { x: "D", y: 4, y2: 5, v: 4 },
        { x: "E", y: 5, y2: 6, v: 5 },
        { x: "F", y: 6, y2: 7, v: 6 }
      ];

      let xScale = new Plottable.Scales.Category();
      let yScale = new Plottable.Scales.Linear();

      let plot = new Plottable.Plots.Rectangle();
      plot
        .x((d: any) => d.x, xScale)
        .y((d: any) => d.y, yScale)
        .y2((d: any) => d.y2);
      plot.addDataset(new Plottable.Dataset(data1));

      plot.renderTo(svg);

      let rectanglesSelection = plot.selections();

      assert.strictEqual(rectanglesSelection.size(), 5,
        "only 5 rectangles should be displayed");

      rectanglesSelection.each(function(d: any, i: number) {
        let sel = d3.select(this);
        assert.isFalse(Plottable.Utils.Math.isNaN(+sel.attr("x")),
          "x attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("x"));
        assert.isFalse(Plottable.Utils.Math.isNaN(+sel.attr("y")),
          "y attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("y"));
        assert.isFalse(Plottable.Utils.Math.isNaN(+sel.attr("height")),
          "height attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("height"));
        assert.isFalse(Plottable.Utils.Math.isNaN(+sel.attr("width")),
          "width attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("width"));
      });

      svg.remove();
    });
  });

  describe("RectanglePlot - Grids", () => {
    let SVG_WIDTH = 400;
    let SVG_HEIGHT = 200;
    let DATA = [
      {x: "A", y: "U", magnitude: 0},
      {x: "B", y: "U", magnitude: 2},
      {x: "A", y: "V", magnitude: 16},
      {x: "B", y: "V", magnitude: 8},
    ];

    let VERIFY_CELLS = (cells: any[]) => {
      assert.strictEqual(cells.length, 4);

      let cellAU = d3.select(cells[0]);
      let cellBU = d3.select(cells[1]);
      let cellAV = d3.select(cells[2]);
      let cellBV = d3.select(cells[3]);

      assert.strictEqual(cellAU.attr("height"), "100", "cell 'AU' height is correct");
      assert.strictEqual(cellAU.attr("width"), "200", "cell 'AU' width is correct");
      assert.strictEqual(cellAU.attr("x"), "0", "cell 'AU' x coord is correct");
      assert.strictEqual(cellAU.attr("y"), "0", "cell 'AU' y coord is correct");
      assert.strictEqual(cellAU.attr("fill"), "#000000", "cell 'AU' color is correct");

      assert.strictEqual(cellBU.attr("height"), "100", "cell 'BU' height is correct");
      assert.strictEqual(cellBU.attr("width"), "200", "cell 'BU' width is correct");
      assert.strictEqual(cellBU.attr("x"), "200", "cell 'BU' x coord is correct");
      assert.strictEqual(cellBU.attr("y"), "0", "cell 'BU' y coord is correct");
      assert.strictEqual(cellBU.attr("fill"), "#212121", "cell 'BU' color is correct");

      assert.strictEqual(cellAV.attr("height"), "100", "cell 'AV' height is correct");
      assert.strictEqual(cellAV.attr("width"), "200", "cell 'AV' width is correct");
      assert.strictEqual(cellAV.attr("x"), "0", "cell 'AV' x coord is correct");
      assert.strictEqual(cellAV.attr("y"), "100", "cell 'AV' y coord is correct");
      assert.strictEqual(cellAV.attr("fill"), "#ffffff", "cell 'AV' color is correct");

      assert.strictEqual(cellBV.attr("height"), "100", "cell 'BV' height is correct");
      assert.strictEqual(cellBV.attr("width"), "200", "cell 'BV' width is correct");
      assert.strictEqual(cellBV.attr("x"), "200", "cell 'BV' x coord is correct");
      assert.strictEqual(cellBV.attr("y"), "100", "cell 'BV' y coord is correct");
      assert.strictEqual(cellBV.attr("fill"), "#777777", "cell 'BV' color is correct");
    };

    it("renders correctly", () => {
      let xScale = new Plottable.Scales.Category();
      let yScale = new Plottable.Scales.Category();
      let colorScale = new Plottable.Scales.InterpolatedColor();
      colorScale.range(["black", "white"]);
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let gridPlot = new Plottable.Plots.Rectangle();
      gridPlot.addDataset(new Plottable.Dataset(DATA))
              .attr("fill", (d) => d.magnitude, colorScale);
      gridPlot.x((d: any) => d.x, xScale)
              .y((d: any) => d.y, yScale);
      gridPlot.renderTo(svg);
      VERIFY_CELLS((<any> gridPlot)._renderArea.selectAll("rect")[0]);
      svg.remove();
    });

    it("renders correctly when data is set after construction", () => {
      let xScale = new Plottable.Scales.Category();
      let yScale = new Plottable.Scales.Category();
      let colorScale = new Plottable.Scales.InterpolatedColor();
      colorScale.range(["black", "white"]);
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dataset = new Plottable.Dataset();
      let gridPlot = new Plottable.Plots.Rectangle();
      gridPlot.addDataset(dataset)
              .attr("fill", (d) => d.magnitude, colorScale);
      gridPlot.x((d: any) => d.x, xScale)
              .y((d: any) => d.y, yScale)
              .renderTo(svg);
      dataset.data(DATA);
      VERIFY_CELLS((<any> gridPlot)._renderArea.selectAll("rect")[0]);
      svg.remove();
    });

    it("renders correctly when there isn't data for every spot", () => {
      let CELL_HEIGHT = 50;
      let CELL_WIDTH = 100;
      let xScale = new Plottable.Scales.Category();
      let yScale = new Plottable.Scales.Category();
      let colorScale = new Plottable.Scales.InterpolatedColor();
      colorScale.range(["black", "white"]);
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dataset = new Plottable.Dataset();
      let gridPlot = new Plottable.Plots.Rectangle();
      gridPlot.addDataset(dataset)
              .attr("fill", (d) => d.magnitude, colorScale);
      gridPlot.x((d: any) => d.x, xScale)
              .y((d: any) => d.y, yScale)
              .renderTo(svg);
      let data = [
        {x: "A", y: "W", magnitude: 0},
        {x: "B", y: "X", magnitude: 8},
        {x: "C", y: "Y", magnitude: 16},
        {x: "D", y: "Z", magnitude: 24}
      ];
      dataset.data(data);
      let cells = (<any> gridPlot)._renderArea.selectAll("rect")[0];
      assert.strictEqual(cells.length, data.length);
      for (let i = 0; i < cells.length; i++) {
        let cell = d3.select(cells[i]);
        assert.strictEqual(cell.attr("x"), String(i * CELL_WIDTH), "Cell x coord is correct");
        assert.strictEqual(cell.attr("y"), String(i * CELL_HEIGHT), "Cell y coord is correct");
        assert.strictEqual(cell.attr("width"), String(CELL_WIDTH), "Cell width is correct");
        assert.strictEqual(cell.attr("height"), String(CELL_HEIGHT), "Cell height is correct");
      }
      svg.remove();
    });

    it("can invert y axis correctly", () => {
      let xScale = new Plottable.Scales.Category();
      let yScale = new Plottable.Scales.Category();
      let colorScale = new Plottable.Scales.InterpolatedColor();
      colorScale.range(["black", "white"]);
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let gridPlot = new Plottable.Plots.Rectangle();
      gridPlot.addDataset(new Plottable.Dataset(DATA))
              .attr("fill", (d) => d.magnitude, colorScale);
      gridPlot.x((d: any) => d.x, xScale)
              .y((d: any) => d.y, yScale)
              .renderTo(svg);

      yScale.domain(["U", "V"]);

      let cells = (<any> gridPlot)._renderArea.selectAll("rect")[0];
      let cellAU = d3.select(cells[0]);
      let cellAV = d3.select(cells[2]);
      cellAU.attr("fill", "#000000");
      cellAU.attr("x", "0");
      cellAU.attr("y", "100");

      cellAV.attr("fill", "#ffffff");
      cellAV.attr("x", "0");
      cellAV.attr("y", "0");

      yScale.domain(["V", "U"]);
      cells = (<any> gridPlot)._renderArea.selectAll("rect")[0];
      cellAU = d3.select(cells[0]);
      cellAV = d3.select(cells[2]);
      cellAU.attr("fill", "#000000");
      cellAU.attr("x", "0");
      cellAU.attr("y", "0");

      cellAV.attr("fill", "#ffffff");
      cellAV.attr("x", "0");
      cellAV.attr("y", "100");

      svg.remove();
    });

    describe("selections()", () => {

      it("retrieves all selections with no args", () => {
        let xScale = new Plottable.Scales.Category();
        let yScale = new Plottable.Scales.Category();
        let colorScale = new Plottable.Scales.InterpolatedColor();
        colorScale.range(["black", "white"]);
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let gridPlot = new Plottable.Plots.Rectangle();
        let dataset = new Plottable.Dataset(DATA);
        gridPlot.addDataset(dataset)
                .attr("fill", (d) => d.magnitude, colorScale);
        gridPlot.x((d: any) => d.x, xScale)
                .y((d: any) => d.y, yScale);
        gridPlot.renderTo(svg);

        let allCells = gridPlot.selections();
        assert.strictEqual(allCells.size(), 4, "all cells retrieved");

        svg.remove();
      });

      it("retrieves correct selections", () => {
        let xScale = new Plottable.Scales.Category();
        let yScale = new Plottable.Scales.Category();
        let colorScale = new Plottable.Scales.InterpolatedColor();
        colorScale.range(["black", "white"]);
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let gridPlot = new Plottable.Plots.Rectangle();
        let dataset = new Plottable.Dataset(DATA);
        gridPlot.addDataset(dataset)
                .attr("fill", (d) => d.magnitude, colorScale);
        gridPlot.x((d: any) => d.x, xScale)
                .y((d: any) => d.y, yScale);
        gridPlot.renderTo(svg);

        let allCells = gridPlot.selections([dataset]);
        assert.strictEqual(allCells.size(), 4, "all cells retrieved");
        let selectionData = allCells.data();
        assert.includeMembers(selectionData, DATA, "data in selection data");

        svg.remove();
      });

      it("skips invalid Datasets", () => {
        let xScale = new Plottable.Scales.Category();
        let yScale = new Plottable.Scales.Category();
        let colorScale = new Plottable.Scales.InterpolatedColor();
        colorScale.range(["black", "white"]);
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let gridPlot = new Plottable.Plots.Rectangle();
        let dataset = new Plottable.Dataset(DATA);
        gridPlot.addDataset(dataset)
          .attr("fill", (d) => d.magnitude, colorScale);
         gridPlot.x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale);
        gridPlot.renderTo(svg);

        let dummyDataset = new Plottable.Dataset([]);
        let allCells = gridPlot.selections([dataset, dummyDataset]);
        assert.strictEqual(allCells.size(), 4, "all cells retrieved");
        let selectionData = allCells.data();
        assert.includeMembers(selectionData, DATA, "data in selection data");

        svg.remove();
      });

    });

    describe("Rectangle Plot With Labels", () => {
      let svg: d3.Selection<void>;
      let rectanglePlot: Plottable.Plots.Rectangle<number, number>;
      let DATA: [any];
      let dataset: Plottable.Dataset;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      beforeEach(() => {
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        svg = TestMethods.generateSVG(SVG_WIDTH / 2, SVG_HEIGHT);
        rectanglePlot = new Plottable.Plots.Rectangle<number, number>();
        DATA = [
          { x: 0, y: 0, x2: 1, y2: 1, val: "1" },
          { x: 0, y: 1, x2: 1, y2: 2, val: "2" }
        ];
        dataset = new Plottable.Dataset(DATA);
        rectanglePlot.addDataset(dataset);
        rectanglePlot.x((d: any) => d.x, xScale)
                     .y((d: any) => d.y, yScale)
                     .x2((d: any) => d.x2)
                     .y2((d: any) => d.y2)
                     .label((d: any) => d.val)
                     .renderTo(svg);
      });

      it("rectangle labels disabled by default", () => {
        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 0, "by default, no labels are drawn");
        svg.remove();
      });

      it("rectangle labels render properly", () => {
        rectanglePlot.labelsEnabled(true);
        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "all labels are drawn");
        texts.forEach((text, i) => {
          assert.strictEqual(text, DATA[i].val, "label is drawn correctly");
        });
        svg.remove();
      });

      it("rectangle labels hide if rectangle is too skinny", () => {
        rectanglePlot.labelsEnabled(true);
        rectanglePlot.label((d: any, i: number) => d.val + ( i !== 0 ? "a really really really long string" : "" ));
        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 1, "the second label is too long to be drawn");
        assert.strictEqual(texts[0], "1");
        svg.remove();
      });

      it("rectangle labels hide if rectangle is too short", () => {
        rectanglePlot.labelsEnabled(true);
        svg.remove();
        svg = TestMethods.generateSVG(SVG_WIDTH / 2, 30);
        rectanglePlot.label((d: any) => d.val);
        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 0, "labels are not drawn when rectangles are too short");
        svg.remove();
      });

      it("rectangle labels are updated on dataset change", () => {
        rectanglePlot.labelsEnabled(true);
        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "all labels are drawn");

        let data2 = [{ x: 0, y: 0, x2: 1, y2: 1, val: "5" }];
        dataset.data(data2);
        texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 1, "new label is drawn");
        assert.strictEqual(texts[0], "5");
        svg.remove();
      });

      it("labels cut off by edges are not shown", () => {
        rectanglePlot.labelsEnabled(true);
        let data = [
          { x: 2, y: 2, x2: 3, y2: 3, val: "center" },
          { x: 0.5, y: 2, x2: 1.5, y2: 3, val: "left" },
          { x: 3.5, y: 2, x2: 4.5, y2: 3, val: "right" },
          { x: 2, y: 3.5, x2: 3, y2: 4.5, val: "top" },
          { x: 2, y: 0.5, x2: 3, y2: 1.5, val: "bottom" }];
        dataset.data(data);
        xScale.domain([1, 4]);
        yScale.domain([1, 4]);

        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 1, "only one label is drawn");
        assert.strictEqual(texts[0], "center");
        svg.remove();
      });

      it("labels cut off by other rectangels are not shown", () => {
        rectanglePlot.labelsEnabled(true);
        let data = [
          { x: 0, y: 0, x2: 2, y2: 2, val: "bottom" },
          { x: 1, y: 1, x2: 3, y2: 3, val: "middle" }];
        let data2 = [
          { x: 2, y: 2, x2: 4, y2: 4, val: "top" },
          { x: 4, y: 4, x2: 6, y2: 6, val: "other" }];
        dataset.data(data);
        let texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 1, "1 label is drawn");
        assert.strictEqual(texts[0], "middle");

        rectanglePlot.addDataset(new Plottable.Dataset(data2));

        texts = svg.selectAll("text")[0].map((n: any) => d3.select(n).text());
        assert.lengthOf(texts, 2, "2 labels are drawn");
        assert.strictEqual(texts[0], "top");
        assert.strictEqual(texts[1], "other");
        svg.remove();
      });
    });
  });
});
