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
    for (var i = 0; i< tickMarks.length; i++) {
      var markRect = tickMarks[i].getBoundingClientRect();
      var labelRect = tickLabels[i].getBoundingClientRect();
      assert.isTrue( (labelRect.left <= markRect.left && markRect.right <= labelRect.right),
        "tick label position defaults to centered");
    }

    xAxis.tickLabelPosition("left");
    xAxis._render();
    tickMarks = xAxis.axisElement.selectAll(".tick").select("line")[0];
    tickLabels = xAxis.axisElement.selectAll(".tick").select("text")[0];
    for (i = 0; i< tickMarks.length; i++) {
      markRect = tickMarks[i].getBoundingClientRect();
      labelRect = tickLabels[i].getBoundingClientRect();
      assert.operator(labelRect.right, "<=", markRect.left + 1,
          "tick label is to the left of the mark"); // +1 for off-by-one on some browsers
    }

    xAxis.tickLabelPosition("right");
    xAxis._render();
    tickMarks = xAxis.axisElement.selectAll(".tick").select("line")[0];
    tickLabels = xAxis.axisElement.selectAll(".tick").select("text")[0];
    for (i = 0; i< tickMarks.length; i++) {
      markRect = tickMarks[i].getBoundingClientRect();
      labelRect = tickLabels[i].getBoundingClientRect();
      assert.operator(markRect.right, "<=", labelRect.left + 1,
          "tick label is to the right of the mark"); // +1 for off-by-one on some browsers
    }
    svg.remove();
  });

  it("X Axis height can be changed", () => {
    var svg = generateSVG(500, 100);
    var xScale = new Plottable.LinearScale();
    xScale.domain([0, 10]);
    xScale.range([0, 500]);
    var xAxis = new Plottable.XAxis(xScale, "top"); // not a common position, but needed to test that things get shifted
    xAxis.renderTo(svg);

    var oldHeight = xAxis.minimumHeight();
    var axisBBoxBefore = (<any> xAxis.element.node()).getBBox();
    var baselineClientRectBefore = xAxis.element.select("path").node().getBoundingClientRect();
    assert.equal(axisBBoxBefore.height, oldHeight, "axis height matches minimum height (before)");

    var newHeight = 60;
    xAxis.minimumHeight(newHeight);
    xAxis.renderTo(svg);
    var axisBBoxAfter = (<any> xAxis.element.node()).getBBox();
    var baselineClientRectAfter = xAxis.element.select("path").node().getBoundingClientRect();
    assert.equal(axisBBoxAfter.height, newHeight, "axis height updated to match new minimum");
    assert.equal( (baselineClientRectAfter.bottom - baselineClientRectBefore.bottom),
                  (newHeight - oldHeight),
                  "baseline has shifted down as a consequence" );
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
    for (var i = 0; i< tickMarks.length; i++) {
      var markRect = tickMarks[i].getBoundingClientRect();
      var labelRect = tickLabels[i].getBoundingClientRect();
      assert.isTrue( (labelRect.top <= markRect.top && markRect.bottom <= labelRect.bottom),
        "tick label position defaults to middle");
    }

    yAxis.tickLabelPosition("top");
    yAxis._render();
    tickMarks = yAxis.axisElement.selectAll(".tick").select("line")[0];
    tickLabels = yAxis.axisElement.selectAll(".tick").select("text")[0];
    for (i = 0; i< tickMarks.length; i++) {
      markRect = tickMarks[i].getBoundingClientRect();
      labelRect = tickLabels[i].getBoundingClientRect();
      assert.operator(labelRect.bottom, "<=", markRect.top + 2,
        "tick label above the mark"); // +2 for off-by-two on some browsers
    }

    yAxis.tickLabelPosition("bottom");
    yAxis._render();
    tickMarks = yAxis.axisElement.selectAll(".tick").select("line")[0];
    tickLabels = yAxis.axisElement.selectAll(".tick").select("text")[0];
    for (i = 0; i< tickMarks.length; i++) {
      markRect = tickMarks[i].getBoundingClientRect();
      labelRect = tickLabels[i].getBoundingClientRect();
      assert.operator(markRect.bottom, "<=", labelRect.top, "tick label is below the mark");
    }
    svg.remove();
  });

  it("Y Axis width can be changed", () => {
    var svg = generateSVG(100, 500);
    var yScale = new Plottable.LinearScale();
    yScale.domain([0, 10]);
    yScale.range([500, 0]);
    var yAxis = new Plottable.YAxis(yScale, "left");
    yAxis.renderTo(svg);

    var oldWidth = yAxis.minimumWidth();
    var axisBBoxBefore = (<any> yAxis.element.node()).getBBox();
    var baselineClientRectBefore = yAxis.element.select("path").node().getBoundingClientRect();
    assert.equal(axisBBoxBefore.width, oldWidth, "axis width matches minimum width (before)");

    var newWidth = 80;
    yAxis.minimumWidth(newWidth);
    yAxis.renderTo(svg);
    var axisBBoxAfter = (<any> yAxis.element.node()).getBBox();
    var baselineClientRectAfter = yAxis.element.select("path").node().getBoundingClientRect();
    assert.equal(axisBBoxAfter.width, newWidth, "axis width updated to match new minimum");
    assert.equal( (baselineClientRectAfter.right - baselineClientRectBefore.right),
                  (newWidth - oldWidth),
                  "baseline has shifted over as a consequence" );
    svg.remove();
  });

  it("generate relative date formatter", () => {
    var baseDate = new Date(2000, 0, 1);
    var testDate = new Date(2001, 0, 1);
    var formatter = Plottable.AxisUtils.generateRelativeDateFormatter(baseDate.valueOf());
    assert.equal(formatter(testDate), "366"); // leap year

    formatter = Plottable.AxisUtils.generateRelativeDateFormatter(baseDate.valueOf(), Plottable.AxisUtils.ONE_DAY, "d");
    assert.equal(formatter(testDate), "366d");
  });

  it("render relative dates", () => {
    var svg = generateSVG(500, 100);
    var startDate = new Date(2000, 0, 1);
    var endDate = new Date(2001, 0, 1);
    var timeScale = new Plottable.LinearScale();
    timeScale.domain([startDate, endDate]);
    timeScale.range([0, 500]);
    timeScale.nice();
    var xAxis = new Plottable.XAxis(timeScale, "bottom");
    var baseDate = d3.min(timeScale.domain());

    var formatter = Plottable.AxisUtils.generateRelativeDateFormatter(baseDate);
    xAxis.tickFormat(formatter);
    xAxis.renderTo(svg);
    var tickLabels = $(".tick").children("text");
    assert.equal(parseInt(tickLabels.first().text(), 10), 0);
    assert.isTrue(parseInt(tickLabels.last().text(), 10) >= 365);
    xAxis.remove();
    svg.remove();

    svg = generateSVG(100, 500);
    endDate = new Date(2010, 0, 1);
    timeScale.domain([startDate, endDate]);
    var yAxis = new Plottable.YAxis(timeScale, "left");
    var oneYear = 365 * Plottable.AxisUtils.ONE_DAY;
    baseDate = new Date(1990, 0, 1);

    formatter = Plottable.AxisUtils.generateRelativeDateFormatter(baseDate, oneYear, "y");
    yAxis.tickFormat(formatter);
    yAxis.renderTo(svg);
    tickLabels = $(".tick").children("text");
    assert.equal(tickLabels.text().slice(-1), "y");
    assert.isTrue(parseInt(tickLabels.first().text(), 10) <= 10);
    assert.isTrue(parseInt(tickLabels.last().text(), 10) >= 20);
    svg.remove();
  });

  it("XAxis wraps long tick label texts so they don't overlap", () => {
    var svg = generateSVG(300, 60);
    var ordinalScale = new Plottable.OrdinalScale();
    ordinalScale.domain(["Aliens", "Time Travellers", "Espers", "Save the World By Overloading It With Fun Brigade"]);
    ordinalScale.range([0, 300]);

    var xAxis = new Plottable.XAxis(ordinalScale, "bottom");
    xAxis.minimumHeight(60);
    xAxis.renderTo(svg);

    var tickTexts = svg.selectAll(".tick text");
    assert.equal(tickTexts[0].length, 4, "4 ticks were drawn");

    var clientRects = tickTexts[0].map((t) => t.getBoundingClientRect());
    var labelsOverlap = false;
    clientRects.forEach((rect, i) => {
      if (i > 0) {
        if (rect.left < clientRects[i-1].left) {
          labelsOverlap = true;
        }
      }
    });
    assert.isFalse(labelsOverlap, "labels don't overlap");

    var allTopsEqual = clientRects.map((r) => r.top).every((t: number) => t === clientRects[0].top);
    assert.isTrue(allTopsEqual, "tops of labels align");

    assert.isTrue(clientRects.every((rect) => rect.height < xAxis.minimumHeight() - xAxis.tickSize()),
                  "all labels fit within the available space");
    svg.remove();
  });

  it("Yaxis wraps long tick label texts so they don't overlap", () => {
    var svg = generateSVG(100, 300);
    var ordinalScale = new Plottable.OrdinalScale();
    ordinalScale.domain(["Aliens", "Time Travellers", "Espers", "Save the World By Overloading It With Fun Brigade"]);
    ordinalScale.range([0, 300]);

    var yAxis = new Plottable.YAxis(ordinalScale, "left");
    yAxis.minimumWidth(100);
    yAxis.renderTo(svg);

    var tickTexts = svg.selectAll(".tick text");
    assert.equal(tickTexts[0].length, 4, "4 ticks were drawn");

    var clientRects = tickTexts[0].map((t) => t.getBoundingClientRect());
    var labelsOverlap = false;
    clientRects.forEach((rect, i) => {
      if (i > 0) {
        if (rect.top < clientRects[i-1].bottom) {
          labelsOverlap = true;
        }
      }
    });
    assert.isFalse(labelsOverlap, "labels don't overlap");

    var allTopsEqual = clientRects.map((r) => r.right).every((t: number) => t === clientRects[0].right);
    assert.isTrue(allTopsEqual, "right edges of labels align");

    assert.isTrue(clientRects.every((rect) => rect.width < yAxis.minimumWidth() - yAxis.tickSize()),
                  "all labels fit within the available space");
    svg.remove();
  });
});
