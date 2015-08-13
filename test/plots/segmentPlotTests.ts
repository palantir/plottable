///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("SegmentPlot", () => {
    let svg: d3.Selection<void>;
    let xScale: Plottable.Scales.Linear;
    let yScale: Plottable.Scales.Linear;
    let renderArea: d3.Selection<void>;
    let data = [
      { x: 1, y: 1, x2: 4, y2: 4 },
      { x: 2, y: 2, x2: 3, y2: 5 },
      { x: 3, y: 3, x2: 5, y2: 2 }
    ];

    beforeEach(() => {
      svg = TestMethods.generateSVG(500, 500);
      xScale = new Plottable.Scales.Linear();
      yScale = new Plottable.Scales.Linear();
    });

    it("renders a line properly", () => {
      let plot = new Plottable.Plots.Segment();
      plot.x(function(d) { return d.x; }, xScale);
      plot.x2(function(d) { return d.x2; });
      plot.y(function(d) { return d.y; }, yScale);
      plot.y2(function(d) { return d.y2; });
      plot.addDataset(new Plottable.Dataset([data[0]])).renderTo(svg);
      renderArea = (<any> plot)._renderArea;
      let lineSelection = d3.select(renderArea.selectAll("line")[0][0]);
      assert.strictEqual(+lineSelection.attr("x1"), 62.5, "x1 is correct");
      assert.strictEqual(+lineSelection.attr("x2"), 437.5, "x2 is correct");
      assert.strictEqual(+lineSelection.attr("y1"), 437.5, "y1 is correct");
      assert.strictEqual(+lineSelection.attr("y2"), 62.5, "y2 is correct");
      svg.remove();
    });

    it("renders vertical lines when x2 is not set", () => {
      let plot = new Plottable.Plots.Segment();
      plot.x(function(d) { return d.x; }, xScale);
      plot.y(function(d) { return d.y; }, yScale);
      plot.y2(function(d) { return d.y2; });
      plot.addDataset(new Plottable.Dataset(data)).renderTo(svg);
      renderArea = (<any> plot)._renderArea;
      renderArea.selectAll("line")[0].forEach((line) => {
      let lineSelection = d3.select(line);
      assert.strictEqual(lineSelection.attr("x1"), lineSelection.attr("x2"), "line is vertical");
      });
      svg.remove();
    });

    it("renders horizontal lines when y2 is not set", () => {
      let plot = new Plottable.Plots.Segment();
      plot.x(function(d) { return d.x; }, xScale);
      plot.x2(function(d) { return d.x2; });
      plot.y(function(d) { return d.y; }, yScale);
      plot.addDataset(new Plottable.Dataset(data)).renderTo(svg);
      renderArea = (<any> plot)._renderArea;
      renderArea.selectAll("line")[0].forEach((line) => {
      let lineSelection = d3.select(line);
      assert.strictEqual(lineSelection.attr("y1"), lineSelection.attr("y2"), "line is horizontal");
      });
      svg.remove();
    });

    it("autorangeMode(\"x\")", () => {
      let staggeredData = [
        { y: 0, x: 0, x2: 1 },
        { y: 1, x: 1, x2: 2 }
      ];
      xScale.padProportion(0);

      let plot = new Plottable.Plots.Segment();
      plot.x(function(d) { return d.x; }, xScale);
      plot.x2(function(d) { return d.x2; });
      plot.y(function(d) { return d.y; }, yScale);
      plot.addDataset(new Plottable.Dataset(staggeredData));
      plot.autorangeMode("x");
      plot.renderTo(svg);

      assert.deepEqual(xScale.domain(), [0, 2], "y domain includes both visible segments");

      yScale.domain([-0.5, 0.5]);
      assert.deepEqual(xScale.domain(), [0, 1], "y domain includes only the visible segment (first)");

      yScale.domain([0.5, 1.5]);
      assert.deepEqual(xScale.domain(), [1, 2], "y domain includes only the visible segment (second)");

      svg.remove();
    });

    it("autorangeMode(\"y\")", () => {
      let staggeredData = [
        { x: 0, y: 0, y2: 1 },
        { x: 1, y: 1, y2: 2 }
      ];
      yScale.padProportion(0);

      let plot = new Plottable.Plots.Segment();
      plot.x(function(d) { return d.x; }, xScale);
      plot.y(function(d) { return d.y; }, yScale);
      plot.y2(function(d) { return d.y2; });
      plot.addDataset(new Plottable.Dataset(staggeredData));
      plot.autorangeMode("y");
      plot.renderTo(svg);

      assert.deepEqual(yScale.domain(), [0, 2], "y domain includes both visible segments");

      xScale.domain([-0.5, 0.5]);
      assert.deepEqual(yScale.domain(), [0, 1], "y domain includes only the visible segment (first)");

      xScale.domain([0.5, 1.5]);
      assert.deepEqual(yScale.domain(), [1, 2], "y domain includes only the visible segment (second)");

      svg.remove();
    });

    describe("entitiesIn() returns segments that intersect with the given constraints", () => {
      let data = [
        { x: 1, x2: 1, y: 1, y2: 4 },
        { x: 2, x2: 3, y: 4, y2: 3 },
        { x: 4, x2: 5, y: 2, y2: 4 },
        { x: 2, x2: 4, y: 1, y2: 1 }];

      it("retrieves the entities that intersect with the bounding box", () => {
        let plot = new Plottable.Plots.Segment()
          .x((d) => d.x, xScale).x2((d) => d.x2)
          .y((d) => d.y, yScale).y2((d) => d.y2);
        plot.addDataset(new Plottable.Dataset(data)).renderTo(svg);
        let entities = plot.entitiesIn({
          topLeft: { x: xScale.scale(0), y: yScale.scale(4.5) },
          bottomRight: { x: xScale.scale(2.5), y: yScale.scale(3) } });
        assert.lengthOf(entities, 2, "retrieved 2 entities intersect with the box");
        assert.strictEqual(entities[0].index, 0, "the entity of index 0 is retrieved");
        assert.strictEqual(entities[1].index, 1, "the entity of index 1 is retrieved");
        svg.remove();
      });

      it("retrieves the entities that intersect with given ranges", () => {
        let plot = new Plottable.Plots.Segment()
          .x((d) => d.x, xScale).x2((d) => d.x2)
          .y((d) => d.y, yScale).y2((d) => d.y2);
        plot.addDataset(new Plottable.Dataset(data)).renderTo(svg);
        let entities = plot.entitiesIn(
          { min: xScale.scale(2.5), max: xScale.scale(4.5) },
          { min: yScale.scale(4.5), max: yScale.scale(2.5) });
        assert.lengthOf(entities, 2, "retrieved 2 entities intersect with the ranges");
        assert.strictEqual(entities[0].index, 1, "the entity of index 1 is retrieved");
        assert.strictEqual(entities[1].index, 2, "the entity of index 2 is retrieved");
        svg.remove();
      });

      it("retrieves the entity if exactly one of its endpoints is in the ranges", () => {
        let plot = new Plottable.Plots.Segment()
          .x((d) => d.x, xScale).x2((d) => d.x2)
          .y((d) => d.y, yScale).y2((d) => d.y2);
        plot.addDataset(new Plottable.Dataset(data)).renderTo(svg);

        // vertial segment
        checkEntitiesInRange(plot, 0, 0.5, 1.5, 1.5, 0.5);
        checkEntitiesInRange(plot, 0, 0.5, 1.5, 4.5, 3.5);

        // diagonal segment with negative slope
        checkEntitiesInRange(plot, 1, 1.5, 2.5, 4.5, 3.5);
        checkEntitiesInRange(plot, 1, 2.5, 3.5, 3.5, 2.5);

       // diagonal segment with positive slope
        checkEntitiesInRange(plot, 2, 4.5, 5.5, 4.5, 3.5);
        checkEntitiesInRange(plot, 2, 3.5, 4.5, 2.5, 1.5);

        // horizontal segment
        checkEntitiesInRange(plot, 3, 1.5, 2.5, 1.5, 0.5);
        checkEntitiesInRange(plot, 3, 3.5, 4.5, 1.5, 0.5);

        svg.remove();
      });

      it("retrieves the entity if both of its endpoints are in the ranges", () => {
        let plot = new Plottable.Plots.Segment()
          .x((d) => d.x, xScale).x2((d) => d.x2)
          .y((d) => d.y, yScale).y2((d) => d.y2);
        plot.addDataset(new Plottable.Dataset(data)).renderTo(svg);

        // vertial segment
        checkEntitiesInRange(plot, 0, 0.5, 1.5, 4.5, 0.5);

        // diagonal segment with negative slope
        checkEntitiesInRange(plot, 1, 1.5, 3.5, 4.5, 2.5);

       // diagonal segment with positive slope
        checkEntitiesInRange(plot, 2, 3.5, 5.5, 4.5, 1.5);

        // horizontal segment
        checkEntitiesInRange(plot, 3, 1.5, 4.5, 1.5, 0.5);

        svg.remove();
      });

      it("retrieves the entity if it intersects with the ranges with no endpoints inside", () => {
        let plot = new Plottable.Plots.Segment()
          .x((d) => d.x, xScale).x2((d) => d.x2)
          .y((d) => d.y, yScale).y2((d) => d.y2);
        plot.addDataset(new Plottable.Dataset(data)).renderTo(svg);

        // vertial segment
        checkEntitiesInRange(plot, 0, 0.5, 1.5, 3.5, 1.5);

        // diagonal segment with negative slope
        checkEntitiesInRange(plot, 1, 2.4, 2.6, 3.6, 3.4);

       // diagonal segment with positive slope
        checkEntitiesInRange(plot, 2, 4.4, 4.6, 3.5, 2.5);

        // horizontal segment
        checkEntitiesInRange(plot, 3, 2.5, 3.5, 1.5, 0.5);

        svg.remove();
      });

      it("returns empty array when no entities intersect with the ranges", () => {
        let plot = new Plottable.Plots.Segment()
          .x((d) => d.x, xScale).x2((d) => d.x2)
          .y((d) => d.y, yScale).y2((d) => d.y2);
        plot.addDataset(new Plottable.Dataset(data)).renderTo(svg);

        let entities = plot.entitiesIn(
          { min: xScale.scale(1.5), max: xScale.scale(2.5) },
          { min: yScale.scale(2.5), max: yScale.scale(1.5) });
        assert.lengthOf(entities, 0, "no entities intersects with the ranges");

        svg.remove();
      });

      function checkEntitiesInRange(plot: Plottable.Plots.Segment<any, any>, index: number,
                                    x1: number, x2: number, y1: number, y2: number) {
        let entities = plot.entitiesIn(
          { min: xScale.scale(x1), max: xScale.scale(x2) },
          { min: yScale.scale(y1), max: yScale.scale(y2) });
        assert.lengthOf(entities, 1, "retrieved 1 entity that intersects with the box");
        assert.strictEqual(entities[0].index, index, `the entity of index ${index} is retrieved`);
      }
    });
  });
});
