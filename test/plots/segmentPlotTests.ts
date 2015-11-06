///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("SegmentPlot", () => {
    describe("rendering", () => {
      let svg: d3.Selection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Segment<number, number>;

      beforeEach(() => {
        plot = new Plottable.Plots.Segment<number, number>();
        svg = TestMethods.generateSVG();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        const data = [
          { x: 1, y: 1, x2: 4, y2: 4 },
          { x: 2, y: 2, x2: 3, y2: 5 },
          { x: 3, y: 3, x2: 5, y2: 2 }
        ];
        plot.addDataset(new Plottable.Dataset(data));
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
      });

      it("renders a line properly", () => {
        plot.x2((d) => d.x2);
        plot.y2((d) => d.y2);
        plot.renderTo(svg);

        const lines = plot.content().selectAll("line");
        assert.strictEqual(lines.size(), plot.datasets()[0].data().length, "line for each datum");
        lines.each(function(d, i) {
          const line = d3.select(this);
          assert.closeTo(TestMethods.numAttr(line, "x1"), xScale.scale(d.x),
            window.Pixel_CloseTo_Requirement, `x1 for line ${i}`);
          assert.closeTo(TestMethods.numAttr(line, "x2"), xScale.scale(d.x2),
            window.Pixel_CloseTo_Requirement, `x2 for line ${i}`);
          assert.closeTo(TestMethods.numAttr(line, "y1"), yScale.scale(d.y),
            window.Pixel_CloseTo_Requirement, `y1 for line ${i}`);
          assert.closeTo(TestMethods.numAttr(line, "y2"), yScale.scale(d.y2),
            window.Pixel_CloseTo_Requirement, `y2 for line ${i}`);
        });
        svg.remove();
      });

      it("renders vertical lines when x2 is not set", () => {
        plot.y2((d) => d.y2);
        plot.renderTo(svg);

        const lines = plot.content().selectAll("line");
        assert.strictEqual(lines.size(), plot.datasets()[0].data().length, "line for each datum");
        lines.each(function(d, i) {
          const line = d3.select(this);
          assert.strictEqual(TestMethods.numAttr(line, "x1"), TestMethods.numAttr(line, "x2"), `same x for line ${i}`);
        });
        svg.remove();
      });

      it("renders horizontal lines when y2 is not set", () => {
        plot.x2((d) => d.x2);
        plot.renderTo(svg);

        const lines = plot.content().selectAll("line");
        assert.strictEqual(lines.size(), plot.datasets()[0].data().length, "line for each datum");
        lines.each(function(d, i) {
          const line = d3.select(this);
          assert.strictEqual(TestMethods.numAttr(line, "y1"), TestMethods.numAttr(line, "y2"), `same y for line ${i}`);
        });
        svg.remove();
      });
    });

    describe("autoranging", () => {
      let svg: d3.Selection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Segment<number, number>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        plot = new Plottable.Plots.Segment<number, number>();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        xScale.padProportion(0);
        yScale.padProportion(0);
      });

      it("adjusts the xScale domain with respect to the yScale domain when autorangeMode is set to x", () => {
        const staggeredData = [
          { y: 0, x: 0, x2: 1 },
          { y: 1, x: 1, x2: 2 }
        ];

        plot.x((d) => d.x, xScale);
        plot.x2((d) => d.x2);
        plot.y((d) => d.y, yScale);
        plot.addDataset(new Plottable.Dataset(staggeredData));
        plot.autorangeMode("x");

        plot.renderTo(svg);

        assert.deepEqual(xScale.domain(), [0, 2], "x domain includes both visible segments");

        yScale.domain([-0.5, 0.5]);
        assert.deepEqual(xScale.domain(), [0, 1], "x domain includes only the visible segment (first)");

        yScale.domain([0.5, 1.5]);
        assert.deepEqual(xScale.domain(), [1, 2], "x domain includes only the visible segment (second)");
        svg.remove();
      });

      it("adjusts the yScale domain with respect to the xScale domain when autorangeMode is set to y", () => {
        const staggeredData = [
          { x: 0, y: 0, y2: 1 },
          { x: 1, y: 1, y2: 2 }
        ];

        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
        plot.y2((d) => d.y2);
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
    });

    describe("retrieving the entities in a specified area", () => {
      let svg: d3.Selection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Segment<number, number>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Segment<number, number>()
          .x((d) => d.x, xScale).x2((d) => d.x2)
          .y((d) => d.y, yScale).y2((d) => d.y2);
        const data = [
          { x: 1, x2: 1, y: 1, y2: 4 },
          { x: 2, x2: 3, y: 4, y2: 3 },
          { x: 4, x2: 5, y: 2, y2: 4 },
          { x: 2, x2: 4, y: 1, y2: 1 }
        ];
        plot.addDataset(new Plottable.Dataset(data)).renderTo(svg);
      });

      it("retrieves the entities that intersect with the bounding box", () => {
        const entities = plot.entitiesIn({
          topLeft: { x: xScale.scale(0), y: yScale.scale(4.5) },
          bottomRight: { x: xScale.scale(2.5), y: yScale.scale(3) }
        });
        assert.lengthOf(entities, 2, "retrieved 2 entities intersect with the box");
        assert.strictEqual(entities[0].index, 0, "the entity of index 0 is retrieved");
        assert.strictEqual(entities[1].index, 1, "the entity of index 1 is retrieved");
        svg.remove();
      });

      it("retrieves the entities that intersect with given ranges", () => {
        const entities = plot.entitiesIn(
          { min: xScale.scale(2.5), max: xScale.scale(4.5) },
          { min: yScale.scale(4.5), max: yScale.scale(2.5) }
        );
        assert.lengthOf(entities, 2, "retrieved 2 entities intersect with the ranges");
        assert.strictEqual(entities[0].index, 1, "the entity of index 1 is retrieved");
        assert.strictEqual(entities[1].index, 2, "the entity of index 2 is retrieved");
        svg.remove();
      });

      it("retrieves the entity if exactly one of its endpoints is in the ranges", () => {
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
        const entities = plot.entitiesIn(
          { min: xScale.scale(1.5), max: xScale.scale(2.5) },
          { min: yScale.scale(2.5), max: yScale.scale(1.5) }
        );
        assert.lengthOf(entities, 0, "no entities intersects with the ranges");
        svg.remove();
      });

      it("retrieves undefined from entityNearest when no entities are rendered", () => {
        plot.datasets([new Plottable.Dataset([])]);
        plot.renderTo(svg);
        let closest = plot.entityNearest({
          x: plot.width()/2,
          y: plot.height()/2
        });
        assert.strictEqual(closest, undefined, "no datum has been retrieved");
        svg.remove();
      });

      function checkEntitiesInRange(plot: Plottable.Plots.Segment<any, any>, index: number,
                                    x1: number, x2: number, y1: number, y2: number) {
        const entities = plot.entitiesIn(
          { min: xScale.scale(x1), max: xScale.scale(x2) },
          { min: yScale.scale(y1), max: yScale.scale(y2) }
        );
        assert.lengthOf(entities, 1, "retrieved 1 entity that intersects with the box");
        assert.strictEqual(entities[0].index, index, `the entity of index ${index} is retrieved`);
      }
    });
  });
});
