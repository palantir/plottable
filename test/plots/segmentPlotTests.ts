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
  });
});
