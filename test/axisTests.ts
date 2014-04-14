///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Axes", () => {
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

    xAxis.tickLabelPosition("left");
    xAxis._render();
    tickMarks = xAxis.axisElement.selectAll(".tick").select("line")[0];
    tickLabels = xAxis.axisElement.selectAll(".tick").select("text")[0];
    for (i=0; i< tickMarks.length; i++) {
      markRect = tickMarks[i].getBoundingClientRect();
      labelRect = tickLabels[i].getBoundingClientRect();
      assert.operator(labelRect.right, "<=", markRect.left, "tick label is to the left of the mark");
    }

    xAxis.tickLabelPosition("right");
    xAxis._render();
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

    yAxis.tickLabelPosition("top");
    yAxis._render();
    tickMarks = yAxis.axisElement.selectAll(".tick").select("line")[0];
    tickLabels = yAxis.axisElement.selectAll(".tick").select("text")[0];
    for (i=0; i< tickMarks.length; i++) {
      markRect = tickMarks[i].getBoundingClientRect();
      labelRect = tickLabels[i].getBoundingClientRect();
      assert.operator(labelRect.bottom, "<=", markRect.top + 1,
        "tick label above the mark"); // +1 for off-by-one on some browsers
    }

    yAxis.tickLabelPosition("bottom");
    yAxis._render();
    tickMarks = yAxis.axisElement.selectAll(".tick").select("line")[0];
    tickLabels = yAxis.axisElement.selectAll(".tick").select("text")[0];
    for (i=0; i< tickMarks.length; i++) {
      markRect = tickMarks[i].getBoundingClientRect();
      labelRect = tickLabels[i].getBoundingClientRect();
      assert.operator(markRect.bottom, "<=", labelRect.top, "tick label is below the mark");
    }
    svg.remove();
  });

  it("render relative dates", () => {
    var svg = generateSVG(500, 100);
    var startDate = new Date(2000, 0, 1);
    var endDate = new Date(2001, 0, 1);
    var timeScale = new Plottable.QuantitiveScale(d3.scale.linear());
    timeScale.domain([startDate, endDate]);
    timeScale.nice();
    var xAxis = new Plottable.XAxis(timeScale, "bottom");

    Plottable.AxisUtils.setRelativeDateAxis(xAxis);
    xAxis.renderTo(svg);
    var tickLabels = $(".tick").children("text");
    assert.equal(tickLabels.first().text(), "0");
    assert.isTrue(parseInt(tickLabels.last().text(), 10) >= 365);
    svg.remove();

    svg = generateSVG(100, 500);
    endDate = new Date(2010, 0, 1);
    timeScale.domain([startDate, endDate]);
    var yAxis = new Plottable.YAxis(timeScale, "left");
    var oneYear = 365 * Plottable.Utils.ONE_DAY;
    var baseDate = new Date(1990, 0, 1);

    Plottable.AxisUtils.setRelativeDateAxis(yAxis, oneYear, "y", baseDate.valueOf());
    yAxis.renderTo(svg);
    tickLabels = $(".tick").children("text");
    assert.equal(tickLabels.text().slice(-1), "y");
    assert.isTrue(parseInt(tickLabels.first().text(), 10) <= 10);
    assert.isTrue(parseInt(tickLabels.last().text(), 10) >= 20);
    svg.remove();
  });
});
