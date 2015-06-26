///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("SegmentPlot", () => {
	var svg: d3.Selection<void>;
	var xScale: Plottable.Scales.Linear;
	var yScale: Plottable.Scales.Linear;
	var renderArea: d3.Selection<void>;
	var data = [
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
	  var plot = new Plottable.Plots.Segment();
	  plot.x(function(d) { return d.x; }, xScale);
	  plot.x2(function(d) { return d.x2; });
	  plot.y(function(d) { return d.y; }, yScale);
	  plot.y2(function(d) { return d.y2; });
  	  plot.addDataset(new Plottable.Dataset([data[0]])).renderTo(svg);
 	  renderArea = (<any> plot)._renderArea;
  	  var lineSelection = d3.select(renderArea.selectAll("line")[0][0]);
	  assert.strictEqual(+lineSelection.attr("x1"), 62.5, "x1 is correct");
	  assert.strictEqual(+lineSelection.attr("x2"), 437.5, "x2 is correct");
	  assert.strictEqual(+lineSelection.attr("y1"), 437.5, "y1 is correct");
	  assert.strictEqual(+lineSelection.attr("y2"), 62.5, "y2 is correct");
	  svg.remove();
	});
	it("renders vertical lines when x2 is not set", () => {
	  var plot = new Plottable.Plots.Segment();
	  plot.x(function(d) { return d.x; }, xScale);
	  plot.y(function(d) { return d.y; }, yScale);
	  plot.y2(function(d) { return d.y2; });
	  plot.addDataset(new Plottable.Dataset(data)).renderTo(svg);
 	  renderArea = (<any> plot)._renderArea;
	  renderArea.selectAll("line")[0].forEach((line) => {
		var lineSelection = d3.select(line);
		assert.strictEqual(lineSelection.attr("x1"), lineSelection.attr("x2"), "line is vertical");
	  });
	  svg.remove();
	});
	it ("renders horizontal lines when y2 is not set", () => {
	  var plot = new Plottable.Plots.Segment();
	  plot.x(function(d) { return d.x; }, xScale);
	  plot.x2(function(d) { return d.x2; });
	  plot.y(function(d) { return d.y; }, yScale);
	  plot.addDataset(new Plottable.Dataset(data)).renderTo(svg);
 	  renderArea = (<any> plot)._renderArea;
	  renderArea.selectAll("line")[0].forEach((line) => {
		var lineSelection = d3.select(line);
		assert.strictEqual(lineSelection.attr("y1"), lineSelection.attr("y2"), "line is horizontal");
	  });
	  svg.remove();
	});
  });
});
