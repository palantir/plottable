///<reference path="../testReference.ts" />

var assert = chai.assert;


describe("Legends", () => {
  var svg: D3.Selection;
  var color: Plottable.Scale.Color;
  var legend: Plottable.Component.Legend;

  beforeEach(() => {
    svg = generateSVG(400, 400);
    color = new Plottable.Scale.Color("Category10");
    legend = new Plottable.Component.Legend(color).maxEntriesPerRow(1);
  });

  it("a basic legend renders", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);
    var rows = (<any> legend)._content.selectAll(".legend-entry");
    assert.lengthOf(rows[0], 3, "there are 3 legend entries");

    rows.each(function(d: any, i: number) {
      assert.equal(d, color.domain()[i], "the data is set properly");
      var d3this = d3.select(this);
      var text = d3this.select("text").text();
      assert.equal(text, d, "the text node has correct text");
      var circle = d3this.select("circle");
      assert.equal(circle.attr("fill"), color.scale(d), "the circle's fill is set properly");
    });
    svg.remove();
  });

  it("legend domain can be updated after initialization, and height updates as well", () => {
    legend.renderTo(svg);
    legend.scale(color);
    assert.equal(legend._requestedSpace(200, 200).height, 10, "there is a padding requested height when domain is empty");
    color.domain(["foo", "bar"]);
    var height1 = legend._requestedSpace(400, 400).height;
    var actualHeight1 = legend.height();
    assert.operator(height1, ">", 0, "changing the domain gives a positive height");
    color.domain(["foo", "bar", "baz"]);
    assert.operator(legend._requestedSpace(400, 400).height, ">", height1, "adding to the domain increases the height requested");
    var actualHeight2 = legend.height();
    assert.operator(actualHeight1, "<", actualHeight2, "Changing the domain caused the legend to re-layout with more height");
    var numRows = (<any> legend)._content.selectAll(".legend-row")[0].length;
    assert.equal(numRows, 3, "there are 3 rows");
    svg.remove();
  });

  it("a legend with many labels does not overflow vertically", () => {
    color.domain(["alpha", "beta", "gamma", "delta", "omega", "omicron", "persei", "eight"]);
    legend.renderTo(svg);

    var contentBBox = Plottable._Util.DOM.getBBox((<any> legend)._content);
    var contentBottomEdge = contentBBox.y + contentBBox.height;
    var bboxBBox = Plottable._Util.DOM.getBBox((<any> legend)._element.select(".bounding-box"));
    var bboxBottomEdge = bboxBBox.y + bboxBBox.height;

    assert.operator(contentBottomEdge, "<=", bboxBottomEdge, "content does not extend past bounding box");
    svg.remove();
  });

  // Test is flaky under SauceLabs for firefox version 30
  it.skip("a legend with a long label does not overflow horizontally", () => {
    color.domain(["foooboooloonoogoorooboopoo"]);
    svg.attr("width", 100);
    legend.renderTo(svg);
    var text = (<any> legend)._content.select("text").text();
    assert.notEqual(text, "foooboooloonoogoorooboopoo", "the text was truncated");
    var rightEdge = (<any> legend)._content.select("text").node().getBoundingClientRect().right;
    var bbox = (<any> legend)._element.select(".bounding-box");
    var rightEdgeBBox = bbox.node().getBoundingClientRect().right;
    assert.operator(rightEdge, "<=", rightEdgeBBox, "the long text did not overflow the legend");
    svg.remove();
  });

  it("calling legend.render multiple times does not add more elements", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);
    var numRows = (<any> legend)._content.selectAll(".legend-row")[0].length;
    assert.equal(numRows, 3, "there are 3 legend rows initially");
    legend._render();
    numRows = (<any> legend)._content.selectAll(".legend-row")[0].length;
    assert.equal(numRows, 3, "there are 3 legend rows after second render");
    svg.remove();
  });

  it("re-rendering the legend with a new domain will do the right thing", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);
    var newDomain = ["mushu", "foo", "persei", "baz", "eight"];
    color.domain(newDomain);

    (<any> legend)._content.selectAll(".legend-entry").each(function(d: any, i: number) {
      assert.equal(d, newDomain[i], "the data is set correctly");
      var text = d3.select(this).select("text").text();
      assert.equal(text, d, "the text was set properly");
      var fill = d3.select(this).select("circle").attr("fill");
      assert.equal(fill, color.scale(d), "the fill was set properly");
    });
    assert.lengthOf((<any> legend)._content.selectAll(".legend-row")[0], 5, "there are the right number of legend elements");
    svg.remove();
  });

  it("legend.scale() replaces domain", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);

    var newDomain = ["a", "b", "c"];
    var newColorScale = new Plottable.Scale.Color("20");
    newColorScale.domain(newDomain);
    legend.scale(newColorScale);


    (<any> legend)._content.selectAll(".legend-entry").each(function(d: any, i: number) {
      assert.equal(d, newDomain[i], "the data is set correctly");
      var text = d3.select(this).select("text").text();
      assert.equal(text, d, "the text was set properly");
      var fill = d3.select(this).select("circle").attr("fill");
      assert.equal(fill, newColorScale.scale(d), "the fill was set properly");
    });

    svg.remove();
  });

  it("legend.scale() correctly reregisters listeners", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);

    var tempDomain = ["a", "b", "c"];
    var newColorScale = new Plottable.Scale.Color("20");
    newColorScale.domain(tempDomain);
    legend.scale(newColorScale);

    var newDomain = ["a", "foo", "d"];
    newColorScale.domain(newDomain);
    (<any> legend)._content.selectAll(".legend-entry").each(function(d: any, i: number) {
      assert.equal(d, newDomain[i], "the data is set correctly");
      var text = d3.select(this).select("text").text();
      assert.equal(text, d, "the text was set properly");
      var fill = d3.select(this).select("circle").attr("fill");
      assert.equal(fill, newColorScale.scale(d), "the fill was set properly");
    });
    svg.remove();
  });

  it("iconHeight / 2 < circleHeight < iconHeight", () => {
    color.domain(["foo"]);
    legend.renderTo(svg);
    var style = (<any> legend)._element.append("style");
    style.attr("type", "text/css");

    function verifyCircleHeight() {
      var text = (<any> legend)._content.select("text");
      var circle = (<any> legend)._content.select("circle");
      var textHeight = Plottable._Util.DOM.getBBox(text).height;
      var circleHeight = Plottable._Util.DOM.getBBox(circle).height;
      assert.operator(circleHeight, "<", textHeight, "icons too small: iconHeight < circleHeight");
      assert.operator(circleHeight, ">", textHeight / 2, "icons too big: iconHeight / 2 > circleHeight");
    }

    verifyCircleHeight();

    style.text(".plottable .legend text { font-size: 60px; }");
    legend._computeLayout();
    legend._render();
    verifyCircleHeight();

    style.text(".plottable .legend text { font-size: 10px; }");
    legend._computeLayout();
    legend._render();
    verifyCircleHeight();

    svg.remove();
  });
});

describe("Legend", () => {
  var colorScale: Plottable.Scale.Color;
  var horizLegend: Plottable.Component.Legend;

  var entrySelector = "." + Plottable.Component.Legend.LEGEND_ENTRY_CLASS;
  var rowSelector = "." + Plottable.Component.Legend.LEGEND_ROW_CLASS;

  beforeEach(() => {
    colorScale = new Plottable.Scale.Color();
    colorScale.domain([
      "Washington",
      "Adams",
      "Jefferson",
    ]);
    horizLegend = new Plottable.Component.Legend(colorScale).maxEntriesPerRow(Infinity);
  });

  it("renders an entry for each item in the domain", () => {
    var svg = generateSVG(400, 100);
    horizLegend.renderTo(svg);
    var entries = (<any> horizLegend)._element.selectAll(entrySelector);
    assert.equal(entries[0].length, colorScale.domain().length, "one entry is created for each item in the domain");

    var elementTexts = entries.select("text")[0].map((node: Element) => d3.select(node).text());
    assert.deepEqual(elementTexts, colorScale.domain(), "entry texts match scale domain");

    var newDomain = colorScale.domain();
    newDomain.push("Madison");
    colorScale.domain(newDomain);

    entries = (<any> horizLegend)._element.selectAll(entrySelector);
    assert.equal(entries[0].length, colorScale.domain().length, "Legend updated to include item added to the domain");

    svg.remove();
  });

  it("wraps entries onto extra rows if necessary", () => {
    var svg = generateSVG(200, 100);
    horizLegend.renderTo(svg);

    var rows = (<any> horizLegend)._element.selectAll(rowSelector);
    assert.lengthOf(rows[0], 2, "Wrapped text on to two rows when space is constrained");

    horizLegend.detach();
    svg.remove();
    svg = generateSVG(100, 100);
    horizLegend.renderTo(svg);

    rows = (<any> horizLegend)._element.selectAll(rowSelector);
    assert.lengthOf(rows[0], 3, "Wrapped text on to three rows when further constrained");

    svg.remove();
  });

  it("truncates and hides entries if space is constrained", () => {
    var svg = generateSVG(70, 400);
    horizLegend.renderTo(svg);

    var textEls = (<any> horizLegend)._element.selectAll("text");
    textEls.each(function(d: any) {
      var textEl = d3.select(this);
      assertBBoxInclusion((<any> horizLegend)._element, textEl);
    });

    horizLegend.detach();
    svg.remove();
    svg = generateSVG(100, 50);
    horizLegend.renderTo(svg);
    textEls = (<any> horizLegend)._element.selectAll("text");
    textEls.each(function(d: any) {
      var textEl = d3.select(this);
      assertBBoxInclusion((<any> horizLegend)._element, textEl);
    });

    svg.remove();
  });

  it("scales icon size with entry font size", () => {
    colorScale.domain(["A"]);
    var svg = generateSVG(400, 100);
    horizLegend.renderTo(svg);

    var style = (<any> horizLegend)._element.append("style");
    style.attr("type", "text/css");

    function verifyCircleHeight() {
      var text = (<any> horizLegend)._content.select("text");
      var circle = (<any> horizLegend)._content.select("circle");
      var textHeight = Plottable._Util.DOM.getBBox(text).height;
      var circleHeight = Plottable._Util.DOM.getBBox(circle).height;
      assert.operator(circleHeight, "<", textHeight, "Icon is smaller than entry text");
      return circleHeight;
    }

    var origCircleHeight = verifyCircleHeight();

    style.text(".plottable .legend text { font-size: 30px; }");
    horizLegend._invalidateLayout();
    var bigCircleHeight = verifyCircleHeight();
    assert.operator(bigCircleHeight, ">", origCircleHeight, "icon size increased with font size");

    style.text(".plottable .legend text { font-size: 6px; }");
    horizLegend._invalidateLayout();
    var smallCircleHeight = verifyCircleHeight();
    assert.operator(smallCircleHeight, "<", origCircleHeight, "icon size decreased with font size");

    svg.remove();
  });

  it("getEntry() horizontal", () => {
    colorScale.domain(["AA", "BB", "CC"]);
    var svg = generateSVG(300, 300);
    horizLegend.renderTo(svg);
    assert.deepEqual(horizLegend.getEntry({x: 10, y: 10}).data(), ["AA"], "get first entry");
    assert.deepEqual(horizLegend.getEntry({x: 50, y: 10}).data(), ["BB"], "get second entry");
    assert.deepEqual(horizLegend.getEntry({x: 150, y: 10}), d3.select(), "no entries at location outside legend");

    svg.remove();
  });

  it("getEntry() vertical", () => {
    colorScale.domain(["AA", "BB", "CC"]);
    var svg = generateSVG(300, 300);
    horizLegend.maxEntriesPerRow(1);
    horizLegend.renderTo(svg);
    assert.deepEqual(horizLegend.getEntry({x: 10, y: 10}).data(), ["AA"], "get first entry");
    assert.deepEqual(horizLegend.getEntry({x: 10, y: 30}).data(), ["BB"], "get second entry");
    assert.deepEqual(horizLegend.getEntry({x: 10, y: 150}), d3.select(), "no entries at location outside legend");

    svg.remove();
  });

  it("maxEntriesPerRow() works as expected", () => {
    colorScale.domain(["AA", "BB", "CC", "DD", "EE", "FF"]);
    var svg = generateSVG(300, 300);
    horizLegend.renderTo(svg);

    var verifyMaxEntriesInRow = (n: number) => {
      horizLegend.maxEntriesPerRow(n);
      var rows = (<any> horizLegend)._element.selectAll(rowSelector);
      assert.lengthOf(rows[0], (6 / n), "number of rows is correct");
      rows.each(function(d: any) {
        var entries = d3.select(this).selectAll(entrySelector);
        assert.lengthOf(entries[0], n, "number of entries in row is correct");
      });
    };

    verifyMaxEntriesInRow(1);
    verifyMaxEntriesInRow(2);
    verifyMaxEntriesInRow(3);
    verifyMaxEntriesInRow(6);

    svg.remove();
  });

  it("sortFunction() works as expected", () => {
    var newDomain = ["F", "E", "D", "C", "B", "A"];
    colorScale.domain(newDomain);
    var svg = generateSVG(300, 300);
    horizLegend.renderTo(svg);
    var entries = (<any> horizLegend)._element.selectAll(entrySelector);
    var elementTexts = entries.select("text")[0].map((node: Element) => d3.select(node).text());
    assert.deepEqual(elementTexts, newDomain, "entry has not been sorted");

    var sortFn = (a: string, b: string) => a.localeCompare(b);
    horizLegend.sortFunction(sortFn);
    entries = (<any> horizLegend)._element.selectAll(entrySelector);
    elementTexts = entries.select("text")[0].map((node: Element) => d3.select(node).text());
    newDomain.sort(sortFn);
    assert.deepEqual(elementTexts, newDomain, "entry has been sorted alfabetically");

    svg.remove();
  });
});
