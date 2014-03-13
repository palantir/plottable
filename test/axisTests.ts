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

  it("XAxis positions tick labels correctly", () => {
    var svg = generateSVG(500, 100);
    var xScale = new Plottable.LinearScale();
    xScale.domain([0, 10]);
    xScale.range([0, 500]);
    var xAxis = new Plottable.XAxis(xScale, "bottom");
    xAxis.renderTo(svg);
    var tickMarks = xAxis.axisElement.selectAll(".tick").select("line")[0];
    var tickLabels = xAxis.axisElement.selectAll(".tick").select("text")[0];
    for (var i=0; i< tickMarks.length; i++) {
      var markRect = tickMarks[i].getBoundingClientRect();
      var labelRect = tickLabels[i].getBoundingClientRect();
      assert.isTrue( (labelRect.left <= markRect.left && markRect.right <= labelRect.right),
        "tick label position defaults to centered");
    }

    xAxis.tickLabelPosition("LEFT");
    xAxis.render();
    tickMarks = xAxis.axisElement.selectAll(".tick").select("line")[0];
    tickLabels = xAxis.axisElement.selectAll(".tick").select("text")[0];
    for (i=0; i< tickMarks.length; i++) {
      markRect = tickMarks[i].getBoundingClientRect();
      labelRect = tickLabels[i].getBoundingClientRect();
      assert.operator(labelRect.right, "<=", markRect.left, "tick label is to the left of the mark");
    }

    xAxis.tickLabelPosition("RIGHT");
    xAxis.render();
    tickMarks = xAxis.axisElement.selectAll(".tick").select("line")[0];
    tickLabels = xAxis.axisElement.selectAll(".tick").select("text")[0];
    for (i=0; i< tickMarks.length; i++) {
      markRect = tickMarks[i].getBoundingClientRect();
      labelRect = tickLabels[i].getBoundingClientRect();
      assert.operator(markRect.right, "<=", labelRect.left, "tick label is to the right of the mark");
    }
    svg.remove();
  });

  it("YAxis positions tick labels correctly", () => {
    var svg = generateSVG(100, 500);
    var yScale = new Plottable.LinearScale();
    yScale.domain([0, 10]);
    yScale.range([500, 0]);
    var yAxis = new Plottable.YAxis(yScale, "left");
    yAxis.renderTo(svg);
    var tickMarks = yAxis.axisElement.selectAll(".tick").select("line")[0];
    var tickLabels = yAxis.axisElement.selectAll(".tick").select("text")[0];
    for (var i=0; i< tickMarks.length; i++) {
      var markRect = tickMarks[i].getBoundingClientRect();
      var labelRect = tickLabels[i].getBoundingClientRect();
      assert.isTrue( (labelRect.top <= markRect.top && markRect.bottom <= labelRect.bottom),
        "tick label position defaults to middle");
    }

    yAxis.tickLabelPosition("TOP");
    yAxis.render();
    tickMarks = yAxis.axisElement.selectAll(".tick").select("line")[0];
    tickLabels = yAxis.axisElement.selectAll(".tick").select("text")[0];
    for (i=0; i< tickMarks.length; i++) {
      markRect = tickMarks[i].getBoundingClientRect();
      labelRect = tickLabels[i].getBoundingClientRect();
      assert.operator(labelRect.bottom, "<=", markRect.top, "tick label above the mark");
    }

    yAxis.tickLabelPosition("BOTTOM");
    yAxis.render();
    tickMarks = yAxis.axisElement.selectAll(".tick").select("line")[0];
    tickLabels = yAxis.axisElement.selectAll(".tick").select("text")[0];
    for (i=0; i< tickMarks.length; i++) {
      markRect = tickMarks[i].getBoundingClientRect();
      labelRect = tickLabels[i].getBoundingClientRect();
      assert.operator(markRect.bottom, "<=", labelRect.top, "tick label is below the mark");
    }
    svg.remove();
  });
});
