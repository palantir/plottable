///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Axes", () => {
  // TODO: Rewrite these tests when the Axis class gets refactored
  it("Renders ticks", () => {
    var svg = generateSVG(500, 100);
    var xScale = new Plottable.LinearScale();
    xScale.domain([0, 10]);
    xScale.range([0, 500]);
    var axis = new Plottable.XAxis(xScale, "bottom");
    axis.renderTo(svg);
    var ticks = svg.selectAll(".tick");
    assert.operator(ticks[0].length, ">=", 2, "There are at least two ticks.");
    svg.remove();
  });
});
