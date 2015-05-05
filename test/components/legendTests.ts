///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Legend", () => {
  var svg: D3.Selection;
  var color: Plottable.Scales.Color;
  var legend: Plottable.Components.Legend;

  var entrySelector = "." + Plottable.Components.Legend.LEGEND_ENTRY_CLASS;
  var rowSelector = "." + Plottable.Components.Legend.LEGEND_ROW_CLASS;

  beforeEach(() => {
    svg = TestMethods.generateSVG(400, 400);
    color = new Plottable.Scales.Color();
    legend = new Plottable.Components.Legend(color);
  });

  it("a basic legend renders", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);
    var rows = (<any> legend)._content.selectAll(entrySelector);
    assert.lengthOf(rows[0], color.domain().length, "one entry is created for each item in the domain");

    rows.each(function(d: any, i: number) {
      assert.strictEqual(d, color.domain()[i], "the data is set properly");
      var d3this = d3.select(this);
      var text = d3this.select("text").text();
      assert.strictEqual(text, d, "the text node has correct text");
      var symbol = d3this.select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS);
      assert.strictEqual(symbol.attr("fill"), color.scale(d), "the symbol's fill is set properly");
    });
    svg.remove();
  });

  it("legend domain can be updated after initialization, and height updates as well", () => {
    legend.renderTo(svg);
    legend.scale(color);
    assert.strictEqual(legend._requestedSpace(200, 200).minHeight, 10, "there is a padding requested height when domain is empty");
    color.domain(["foo", "bar"]);
    var height1 = legend._requestedSpace(400, 400).minHeight;
    var actualHeight1 = legend.height();
    assert.operator(height1, ">", 0, "changing the domain gives a positive height");
    color.domain(["foo", "bar", "baz"]);
    assert.operator(legend._requestedSpace(400, 400).minHeight, ">", height1, "adding to the domain increases the height requested");
    var actualHeight2 = legend.height();
    assert.operator(actualHeight1, "<", actualHeight2, "Changing the domain caused the legend to re-layout with more height");
    var numRows = (<any> legend)._content.selectAll(rowSelector)[0].length;
    assert.strictEqual(numRows, 3, "there are 3 rows");
    svg.remove();
  });

  it("a legend with many labels does not overflow vertically", () => {
    color.domain(["alpha", "beta", "gamma", "delta", "omega", "omicron", "persei", "eight"]);
    legend.renderTo(svg);

    var contentBBox = Plottable.Utils.DOM.getBBox((<any> legend)._content);
    var contentBottomEdge = contentBBox.y + contentBBox.height;
    var bboxBBox = Plottable.Utils.DOM.getBBox((<any> legend)._element.select(".bounding-box"));
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
    var numRows = (<any> legend)._content.selectAll(rowSelector)[0].length;
    assert.strictEqual(numRows, 3, "there are 3 legend rows initially");
    legend._render();
    numRows = (<any> legend)._content.selectAll(rowSelector)[0].length;
    assert.strictEqual(numRows, 3, "there are 3 legend rows after second render");
    svg.remove();
  });

  it("re-rendering the legend with a new domain will do the right thing", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);
    var newDomain = ["mushu", "foo", "persei", "baz", "eight"];
    color.domain(newDomain);

    (<any> legend)._content.selectAll(entrySelector).each(function(d: any, i: number) {
      assert.strictEqual(d, newDomain[i], "the data is set correctly");
      var text = d3.select(this).select("text").text();
      assert.strictEqual(text, d, "the text was set properly");
      var fill = d3.select(this).select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS).attr("fill");
      assert.strictEqual(fill, color.scale(d), "the fill was set properly");
    });
    assert.lengthOf((<any> legend)._content.selectAll(rowSelector)[0], 5, "there are the right number of legend elements");
    svg.remove();
  });

  it("legend.scale() replaces domain", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);

    var newDomain = ["a", "b", "c"];
    var newColorScale = new Plottable.Scales.Color("20");
    newColorScale.domain(newDomain);
    legend.scale(newColorScale);

    (<any> legend)._content.selectAll(entrySelector).each(function(d: any, i: number) {
      assert.strictEqual(d, newDomain[i], "the data is set correctly");
      var text = d3.select(this).select("text").text();
      assert.strictEqual(text, d, "the text was set properly");
      var fill = d3.select(this).select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS).attr("fill");
      assert.strictEqual(fill, newColorScale.scale(d), "the fill was set properly");
    });

    svg.remove();
  });

  it("legend.scale() correctly reregisters listeners", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);

    var tempDomain = ["a", "b", "c"];
    var newColorScale = new Plottable.Scales.Color("20");
    newColorScale.domain(tempDomain);
    legend.scale(newColorScale);

    var newDomain = ["a", "foo", "d"];
    newColorScale.domain(newDomain);
    (<any> legend)._content.selectAll(entrySelector).each(function(d: any, i: number) {
      assert.strictEqual(d, newDomain[i], "the data is set correctly");
      var text = d3.select(this).select("text").text();
      assert.strictEqual(text, d, "the text was set properly");
      var fill = d3.select(this).select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS).attr("fill");
      assert.strictEqual(fill, newColorScale.scale(d), "the fill was set properly");
    });
    svg.remove();
  });

  it("scales icon sizes properly with font size (textHeight / 2 < symbolHeight < textHeight)", () => {
    color.domain(["foo"]);
    legend.renderTo(svg);
    var style = (<any> legend)._element.append("style");
    style.attr("type", "text/css");

    function verifySymbolHeight() {
      var text = (<any> legend)._content.select("text");
      var icon = (<any> legend)._content.select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS);
      var textHeight = Plottable.Utils.DOM.getBBox(text).height;
      var symbolHeight = icon.node().getBoundingClientRect().height;
      assert.operator(symbolHeight, "<", textHeight, "icons too small: symbolHeight < textHeight");
      assert.operator(symbolHeight, ">", textHeight / 2, "icons too big: textHeight / 2 > symbolHeight");
    }

    verifySymbolHeight();

    style.text(".plottable .legend text { font-size: 60px; }");
    legend.computeLayout();
    legend._render();
    verifySymbolHeight();

    style.text(".plottable .legend text { font-size: 10px; }");
    legend.computeLayout();
    legend._render();
    verifySymbolHeight();

    svg.remove();
  });

  it("maxEntriesPerRow() works as expected", () => {
    color.domain(["AA", "BB", "CC", "DD", "EE", "FF"]);
    legend.renderTo(svg);

    var verifyMaxEntriesInRow = (n: number) => {
      legend.maxEntriesPerRow(n);
      var rows = (<any> legend)._element.selectAll(rowSelector);
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

  it("wraps entries onto extra rows if necessary for horizontal legends", () => {
    color.domain(["George Waaaaaashington", "John Adaaaams", "Thomaaaaas Jefferson"]);
    legend.maxEntriesPerRow(Infinity);

    legend.renderTo(svg);
    var rows = (<any> legend)._element.selectAll(rowSelector);
    assert.lengthOf(rows[0], 2, "Wrapped text on to two rows when space is constrained");
    legend.detach();
    svg.remove();

    svg = TestMethods.generateSVG(100, 100);
    legend.renderTo(svg);
    rows = (<any> legend)._element.selectAll(rowSelector);
    assert.lengthOf(rows[0], 3, "Wrapped text on to three rows when further constrained");
    svg.remove();
  });

  it("getEntry() retrieves the correct entry for vertical legends", () => {
    color.domain(["AA", "BB", "CC"]);
    legend.maxEntriesPerRow(1);
    legend.renderTo(svg);
    assert.deepEqual(legend.getEntry({x: 10, y: 10}).data(), ["AA"], "get first entry");
    assert.deepEqual(legend.getEntry({x: 10, y: 30}).data(), ["BB"], "get second entry");
    assert.deepEqual(legend.getEntry({x: 10, y: 150}), d3.select(), "no entries at location outside legend");

    svg.remove();
  });

  it("getEntry() retrieves the correct entry for horizontal legends", () => {
    color.domain(["AA", "BB", "CC"]);
    legend.maxEntriesPerRow(Infinity);
    legend.renderTo(svg);
    assert.deepEqual(legend.getEntry({x: 10, y: 10}).data(), ["AA"], "get first entry");
    assert.deepEqual(legend.getEntry({x: 50, y: 10}).data(), ["BB"], "get second entry");
    assert.deepEqual(legend.getEntry({x: 150, y: 10}), d3.select(), "no entries at location outside legend");

    svg.remove();
  });

 it("sortFunction() works as expected", () => {
    var newDomain = ["F", "E", "D", "C", "B", "A"];
    color.domain(newDomain);
    legend.renderTo(svg);
    var entries = (<any> legend)._element.selectAll(entrySelector);
    var elementTexts = entries.select("text")[0].map((node: Element) => d3.select(node).text());
    assert.deepEqual(elementTexts, newDomain, "entry has not been sorted");

    var sortFn = (a: string, b: string) => a.localeCompare(b);
    legend.sortFunction(sortFn);
    entries = (<any> legend)._element.selectAll(entrySelector);
    elementTexts = entries.select("text")[0].map((node: Element) => d3.select(node).text());
    newDomain.sort(sortFn);
    assert.deepEqual(elementTexts, newDomain, "entry has been sorted alphabetically");

    svg.remove();
  });

 it("truncates and hides entries if space is constrained for a horizontal legend", () => {
    svg.remove();
    svg = TestMethods.generateSVG(70, 400);
    legend.maxEntriesPerRow(Infinity);
    legend.renderTo(svg);

    var textEls = (<any> legend)._element.selectAll("text");
    textEls.each(function(d: any) {
      var textEl = d3.select(this);
      TestMethods.assertBBoxInclusion((<any> legend)._element, textEl);
    });

    legend.detach();
    svg.remove();
    svg = TestMethods.generateSVG(100, 50);
    legend.renderTo(svg);
    textEls = (<any> legend)._element.selectAll("text");
    textEls.each(function(d: any) {
      var textEl = d3.select(this);
      TestMethods.assertBBoxInclusion((<any> legend)._element, textEl);
    });

    svg.remove();
  });
});
