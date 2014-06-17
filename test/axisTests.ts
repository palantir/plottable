///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Axes", () => {
  it("Renders ticks", () => {
    var svg = generateSVG(500, 100);
    var xScale = new Plottable.Scale.Linear();
    xScale.domain([0, 10]);
    xScale.range([0, 500]);
    var axis = new Plottable.Axis.XAxis(xScale, "bottom");
    axis.renderTo(svg);
    var ticks = svg.selectAll(".tick");
    assert.operator(ticks[0].length, ">=", 2, "There are at least two ticks.");

    var tickTexts = ticks.select("text")[0].map(function(t: HTMLElement) { return d3.select(t).text(); });
    var generatedTicks = xScale.ticks().map(axis.tickFormat());
    assert.deepEqual(tickTexts, generatedTicks, "The correct tick texts are displayed");
    svg.remove();
  });

  it("formatter can be changed", () => {
    var svg = generateSVG(500, 100);
    var xScale = new Plottable.Scale.Linear();
    xScale.domain([0, 10]);
    xScale.range([0, 500]);
    var axis = new Plottable.Axis.XAxis(xScale, "bottom");
    axis.renderTo(svg);

    var tickTexts = svg.selectAll(".tick text")[0].map(function(t: HTMLElement) { return d3.select(t).text(); });
    var generatedTicks = xScale.ticks().map(axis.tickFormat());
    assert.deepEqual(tickTexts, generatedTicks, "The correct tick texts are displayed");

    var blarghFormatter = (d: any) => "blargh";
    axis.tickFormat(blarghFormatter);
    tickTexts = svg.selectAll(".tick text")[0].map(function(t: HTMLElement) { return d3.select(t).text(); });
    generatedTicks = xScale.ticks().map(axis.tickFormat());
    assert.deepEqual(tickTexts, generatedTicks, "Tick texts updated based on new formatter");

    svg.remove();
  });

  it("Still displays tick labels if space is constrained.", () => {
    var svg = generateSVG(100, 100);
    var yScale = new Plottable.Scale.Linear()
                                .domain([0, 10])
                                .range([0, 100]);
    var yAxis = new Plottable.Axis.YAxis(yScale, "left");
    yAxis.renderTo(svg);
    var tickTexts = svg.selectAll(".tick text");
    var visibleTickTexts = tickTexts.filter(function() {
      return d3.select(this).style("visibility") === "visible";
    });
    assert.operator(visibleTickTexts[0].length, ">=", 2, "Two tick labels remain visible");
    yAxis.remove();

    var xScale = new Plottable.Scale.Linear()
                                .domain([0, 10])
                                .range([0, 100]);
    var xAxis = new Plottable.Axis.XAxis(yScale, "bottom");
    xAxis.renderTo(svg);
    tickTexts = svg.selectAll(".tick text");
    visibleTickTexts = tickTexts.filter(function() {
      return d3.select(this).style("visibility") === "visible";
    });
    assert.operator(visibleTickTexts[0].length, ">=", 2, "Two tick labels remain visible");
    svg.remove();
  });

  it("XAxis positions tick labels correctly", () => {
    var svg = generateSVG(500, 100);
    var xScale = new Plottable.Scale.Linear();
    xScale.domain([0, 10]);
    xScale.range([0, 500]);
    var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");
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
    var svg = generateSVG(500, 30);
    var xScale = new Plottable.Scale.Linear();
    xScale.domain([0, 10]);
    xScale.range([0, 500]);
    var xAxis = new Plottable.Axis.XAxis(xScale, "top"); // not a common position, but needed to test that things get shifted
    xAxis.renderTo(svg);

    var oldHeight = xAxis._requestedSpace(500, 30).height;
    var axisBBoxBefore = (<any> xAxis.element.node()).getBBox();
    var baselineClientRectBefore = xAxis.element.select("path").node().getBoundingClientRect();
    assert.equal(axisBBoxBefore.height, oldHeight, "axis height matches minimum height (before)");

    var newHeight = 60;
    xAxis.height(newHeight);
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
    var yScale = new Plottable.Scale.Linear();
    yScale.domain([0, 10]);
    yScale.range([500, 0]);
    var yAxis = new Plottable.Axis.YAxis(yScale, "left");
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
    var svg = generateSVG(50, 500);
    var yScale = new Plottable.Scale.Linear();
    yScale.domain([0, 10]);
    yScale.range([500, 0]);
    var yAxis = new Plottable.Axis.YAxis(yScale, "left");
    yAxis.renderTo(svg);

    var oldWidth = yAxis._requestedSpace(50, 500).width;
    var axisBBoxBefore = (<any> yAxis.element.node()).getBBox();
    var baselineClientRectBefore = yAxis.element.select("path").node().getBoundingClientRect();
    assert.equal(axisBBoxBefore.width, oldWidth, "axis width matches minimum width (before)");

    var newWidth = 80;
    yAxis.width(newWidth);
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
    var formatter = Plottable.Util.Axis.generateRelativeDateFormatter(baseDate.valueOf());
    assert.equal(formatter(testDate), "366"); // leap year

    formatter = Plottable.Util.Axis.generateRelativeDateFormatter(baseDate.valueOf(), Plottable.Util.Axis.ONE_DAY, "d");
    assert.equal(formatter(testDate), "366d");
  });

  it("render relative dates", () => {
    var svg = generateSVG(500, 100);
    var startDate = new Date(2000, 0, 1);
    var endDate = new Date(2001, 0, 1);
    var timeScale = new Plottable.Scale.Linear();
    timeScale.updateExtent(1, "x", [startDate, endDate]);
    timeScale.range([0, 500]);
    timeScale.domainer(new Plottable.Domainer().nice());
    var xAxis = new Plottable.Axis.XAxis(timeScale, "bottom");
    var baseDate = d3.min(timeScale.domain());

    var formatter = Plottable.Util.Axis.generateRelativeDateFormatter(baseDate);
    xAxis.tickFormat(formatter);
    xAxis.renderTo(svg);
    var tickLabels = $(".tick").children("text");
    assert.equal(parseInt(tickLabels.first().text(), 10), 0);
    assert.isTrue(parseInt(tickLabels.last().text(), 10) >= 365);
    xAxis.remove();
    svg.remove();

    svg = generateSVG(100, 500);
    endDate = new Date(2010, 0, 1);
    var timescaleY = new Plottable.Scale.Linear().domain([startDate, endDate])
                                                .range([0, 500]);
    var yAxis = new Plottable.Axis.YAxis(timescaleY, "left");
    var oneYear = 365 * Plottable.Util.Axis.ONE_DAY;
    baseDate = new Date(1990, 0, 1);

    formatter = Plottable.Util.Axis.generateRelativeDateFormatter(baseDate, oneYear, "y");
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
    var ordinalScale = new Plottable.Scale.Ordinal();
    ordinalScale.domain(["Aliens", "Time Travellers", "Espers", "Save the World By Overloading It With Fun Brigade"]);
    ordinalScale.range([0, 300]);

    var xAxis = new Plottable.Axis.XAxis(ordinalScale, "bottom");
    xAxis.height(60);
    xAxis.renderTo(svg);

    var tickTexts = svg.selectAll(".tick text");
    assert.equal(tickTexts[0].length, 4, "4 ticks were drawn");

    var clientRects = tickTexts[0].map((t: Element) => t.getBoundingClientRect());
    var labelsOverlap = false;
    clientRects.forEach((rect: ClientRect, i: number) => {
      if (i > 0) {
        if (rect.left < clientRects[i-1].left) {
          labelsOverlap = true;
        }
      }
    });
    assert.isFalse(labelsOverlap, "labels don't overlap");

    var allTopsEqual = clientRects.map((r: ClientRect) => r.top).every((t: number) => t === clientRects[0].top);
    assert.isTrue(allTopsEqual, "tops of labels align");

    assert.isTrue(clientRects.every((rect: ClientRect) => rect.height < (<any> xAxis)._height - xAxis.tickSize()),
                  "all labels fit within the available space");
    svg.remove();
  });

  it("Yaxis wraps long tick label texts so they don't overlap", () => {
    var svg = generateSVG(100, 300);
    var ordinalScale = new Plottable.Scale.Ordinal();
    ordinalScale.domain(["Aliens", "Time Travellers", "Espers", "Save the World By Overloading It With Fun Brigade"]);
    ordinalScale.range([0, 300]);

    var yAxis = new Plottable.Axis.YAxis(ordinalScale, "left");
    yAxis.width(100);
    yAxis.renderTo(svg);

    var tickTexts = svg.selectAll(".tick text");
    assert.equal(tickTexts[0].length, 4, "4 ticks were drawn");

    var clientRects = tickTexts[0].map((t: Element) => t.getBoundingClientRect());
    var labelsOverlap = false;
    clientRects.forEach((rect: ClientRect, i: number) => {
      if (i > 0) {
        if (rect.top < clientRects[i-1].bottom) {
          labelsOverlap = true;
        }
      }
    });
    assert.isFalse(labelsOverlap, "labels don't overlap");

    var allTopsEqual = clientRects.map((r: ClientRect) => r.right).every((t: number) => t === clientRects[0].right);
    assert.isTrue(allTopsEqual, "right edges of labels align");

    assert.isTrue(clientRects.every((rect: ClientRect) => rect.width < (<any> yAxis)._width - yAxis.tickSize()),
                  "all labels fit within the available space");
    svg.remove();
  });

  describe("Category Axes", () => {
    it("re-renders appropriately when data is changed", () => {
      var svg = generateSVG(400, 400);
      var xScale = new Plottable.Scale.Ordinal().domain(["foo", "bar", "baz"]).range([400, 0]);
      var ca = new Plottable.Axis.Category(xScale, "left");
      ca.renderTo(svg);
      assert.deepEqual(ca._tickLabelsG.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
      assert.doesNotThrow(() => xScale.domain(["bar", "baz", "bam"]));
      assert.deepEqual(ca._tickLabelsG.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
      svg.remove();
    });

    it("requests appropriate space when the scale has no domain", () => {
      var svg = generateSVG(400, 400);
      var scale = new Plottable.Scale.Ordinal();
      var ca = new Plottable.Axis.Category(scale);
      ca._anchor(svg);
      var s = ca._requestedSpace(400, 400);
      assert.operator(s.width, ">=", 0, "it requested 0 or more width");
      assert.operator(s.height, ">=", 0, "it requested 0 or more height");
      assert.isFalse(s.wantsWidth, "it doesn't want width");
      assert.isFalse(s.wantsHeight, "it doesn't want height");
      svg.remove();
    });
  });
});
