///<reference path="../testReference.ts" />

describe("Legend", () => {
  let svg: d3.Selection<void>;
  let color: Plottable.Scales.Color;
  let legend: Plottable.Components.Legend;

  let entrySelector = "." + Plottable.Components.Legend.LEGEND_ENTRY_CLASS;
  let symbolSelector = "." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS;
  let rowSelector = "." + Plottable.Components.Legend.LEGEND_ROW_CLASS;

  beforeEach(() => {
    svg = TestMethods.generateSVG(400, 400);
    color = new Plottable.Scales.Color();
    legend = new Plottable.Components.Legend(color);
  });

  it("a basic legend renders", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);
    let rows = (<any> legend)._content.selectAll(entrySelector);
    assert.lengthOf(rows[0], color.domain().length, "one entry is created for each item in the domain");

    rows.each(function(d: any, i: number) {
      assert.strictEqual(d, color.domain()[i], "the data is set properly");
      let d3this = d3.select(this);
      let text = d3this.select("text").text();
      assert.strictEqual(text, d, "the text node has correct text");
      let symbol = d3this.select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS);
      assert.strictEqual(symbol.attr("fill"), color.scale(d), "the symbol's fill is set properly");
      assert.strictEqual(symbol.attr("opacity"), "1", "the symbol's opacity is set by default to 1");
    });
    svg.remove();
  });

  it("legend domain can be updated after initialization, and height updates as well", () => {
    legend.renderTo(svg);
    legend.colorScale(color);
    assert.strictEqual(legend.requestedSpace(200, 200).minHeight, 10, "there is a padding requested height when domain is empty");
    color.domain(["foo", "bar"]);
    let height1 = legend.requestedSpace(400, 400).minHeight;
    let actualHeight1 = legend.height();
    assert.operator(height1, ">", 0, "changing the domain gives a positive height");
    color.domain(["foo", "bar", "baz"]);
    assert.operator(legend.requestedSpace(400, 400).minHeight, ">", height1, "adding to the domain increases the height requested");
    let actualHeight2 = legend.height();
    assert.operator(actualHeight1, "<", actualHeight2, "Changing the domain caused the legend to re-layout with more height");
    let numRows = (<any> legend)._content.selectAll(rowSelector)[0].length;
    assert.strictEqual(numRows, 3, "there are 3 rows");
    svg.remove();
  });

  it("a legend with many labels does not overflow vertically", () => {
    color.domain(["alpha", "beta", "gamma", "delta", "omega", "omicron", "persei", "eight"]);
    legend.renderTo(svg);

    let contentBBox = Plottable.Utils.DOM.elementBBox((<any> legend)._content);
    let contentBottomEdge = contentBBox.y + contentBBox.height;
    let bboxBBox = Plottable.Utils.DOM.elementBBox((<any> legend)._element.select(".bounding-box"));
    let bboxBottomEdge = bboxBBox.y + bboxBBox.height;

    assert.operator(contentBottomEdge, "<=", bboxBottomEdge, "content does not extend past bounding box");
    svg.remove();
  });

  it("a legend with a long label does not overflow horizontally", () => {
    color.domain(["foooboooloonoogoorooboopoo"]);
    svg.attr("width", 100);
    legend.renderTo(svg);
    let text = (<any> legend)._content.select("text").text();
    assert.notEqual(text, "foooboooloonoogoorooboopoo", "the text was truncated");
    let rightEdge = (<any> legend)._content.select("text").node().getBoundingClientRect().right;
    let bbox = (<any> legend)._element.select(".bounding-box");
    let rightEdgeBBox = bbox.node().getBoundingClientRect().right;
    assert.operator(rightEdge, "<=", rightEdgeBBox, "the long text did not overflow the legend");
    svg.remove();
  });

  it("calling legend.render multiple times does not add more elements", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);
    let numRows = (<any> legend)._content.selectAll(rowSelector)[0].length;
    assert.strictEqual(numRows, 3, "there are 3 legend rows initially");
    legend.render();
    numRows = (<any> legend)._content.selectAll(rowSelector)[0].length;
    assert.strictEqual(numRows, 3, "there are 3 legend rows after second render");
    svg.remove();
  });

  it("re-rendering the legend with a new domain will do the right thing", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);
    let newDomain = ["mushu", "foo", "persei", "baz", "eight"];
    color.domain(newDomain);

    (<any> legend)._content.selectAll(entrySelector).each(function(d: any, i: number) {
      assert.strictEqual(d, newDomain[i], "the data is set correctly");
      let text = d3.select(this).select("text").text();
      assert.strictEqual(text, d, "the text was set properly");
      let fill = d3.select(this).select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS).attr("fill");
      assert.strictEqual(fill, color.scale(d), "the fill was set properly");
    });
    assert.lengthOf((<any> legend)._content.selectAll(rowSelector)[0], 5, "there are the right number of legend elements");
    svg.remove();
  });

  it("legend.scale() replaces domain", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);

    let newDomain = ["a", "b", "c"];
    let newColorScale = new Plottable.Scales.Color("20");
    newColorScale.domain(newDomain);
    legend.colorScale(newColorScale);

    (<any> legend)._content.selectAll(entrySelector).each(function(d: any, i: number) {
      assert.strictEqual(d, newDomain[i], "the data is set correctly");
      let text = d3.select(this).select("text").text();
      assert.strictEqual(text, d, "the text was set properly");
      let fill = d3.select(this).select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS).attr("fill");
      assert.strictEqual(fill, newColorScale.scale(d), "the fill was set properly");
    });

    svg.remove();
  });

  it("renders with correct opacity for each symbol when specified", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.symbolOpacity(0.5);
    legend.renderTo(svg);

    let rows = (<any> legend)._content.selectAll(entrySelector);

    rows.each(function(d: any, i: number) {
      let d3this = d3.select(this);
      let symbol = d3this.select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS);
      assert.strictEqual(symbol.attr("opacity"), "0.5", "the symbol's opacity is set to a constant");
    });

    let opacityFunction = (d: any, i: number) => {
      return (d === "foo") ? 0.2 : 0.8;
    };
    legend.symbolOpacity(opacityFunction).redraw();
    rows = (<any> legend)._content.selectAll(entrySelector);

    rows.each(function(d: any, i: number) {
      let d3this = d3.select(this);
      let symbol = d3this.select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS);
      assert.strictEqual(symbol.attr("opacity"), String(opacityFunction(d, i)), "the symbol's opacity follows the provided function.");
    });
    svg.remove();
  });

  it("legend.scale() correctly reregisters listeners", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);

    let tempDomain = ["a", "b", "c"];
    let newColorScale = new Plottable.Scales.Color("20");
    newColorScale.domain(tempDomain);
    legend.colorScale(newColorScale);

    let newDomain = ["a", "foo", "d"];
    newColorScale.domain(newDomain);
    (<any> legend)._content.selectAll(entrySelector).each(function(d: any, i: number) {
      assert.strictEqual(d, newDomain[i], "the data is set correctly");
      let text = d3.select(this).select("text").text();
      assert.strictEqual(text, d, "the text was set properly");
      let fill = d3.select(this).select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS).attr("fill");
      assert.strictEqual(fill, newColorScale.scale(d), "the fill was set properly");
    });
    svg.remove();
  });

  it("scales icon sizes properly with font size (textHeight / 2 < symbolHeight < textHeight)", () => {
    color.domain(["foo"]);
    legend.renderTo(svg);
    let style = (<any> legend)._element.append("style");
    style.attr("type", "text/css");

    function verifySymbolHeight() {
      let text = (<any> legend)._content.select("text");
      let icon = (<any> legend)._content.select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS);
      let textHeight = Plottable.Utils.DOM.elementBBox(text).height;
      let symbolHeight = icon.node().getBoundingClientRect().height;
      assert.operator(symbolHeight, "<", textHeight, "icons too small: symbolHeight < textHeight");
      assert.operator(symbolHeight, ">", textHeight / 2, "icons too big: textHeight / 2 > symbolHeight");
    }

    verifySymbolHeight();

    style.text(".plottable .legend text { font-size: 60px; }");
    legend.computeLayout();
    legend.render();
    verifySymbolHeight();

    style.text(".plottable .legend text { font-size: 10px; }");
    legend.computeLayout();
    legend.render();
    verifySymbolHeight();

    svg.remove();
  });

  it("maxEntriesPerRow() works as expected", () => {
    color.domain(["AA", "BB", "CC", "DD", "EE", "FF"]);
    legend.renderTo(svg);

    let verifyMaxEntriesInRow = (n: number) => {
      legend.maxEntriesPerRow(n);
      let rows = (<any> legend)._element.selectAll(rowSelector);
      assert.lengthOf(rows[0], (6 / n), "number of rows is correct");
      rows.each(function(d: any) {
        let entries = d3.select(this).selectAll(entrySelector);
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
    let rows = (<any> legend)._element.selectAll(rowSelector);
    assert.lengthOf(rows[0], 2, "Wrapped text on to two rows when space is constrained");
    legend.detach();
    svg.remove();

    svg = TestMethods.generateSVG(100, 100);
    legend.renderTo(svg);
    rows = (<any> legend)._element.selectAll(rowSelector);
    assert.lengthOf(rows[0], 3, "Wrapped text on to three rows when further constrained");
    svg.remove();
  });

  it("requests more width if entries would be truncated", () => {
    color.domain(["George Waaaaaashington", "John Adaaaams", "Thomaaaaas Jefferson"]);

    legend.renderTo(svg); // have to be in DOM to measure

    let idealSpaceRequest = legend.requestedSpace(Infinity, Infinity);
    let constrainedRequest = legend.requestedSpace(idealSpaceRequest.minWidth * 0.9, Infinity);

    assert.strictEqual(idealSpaceRequest.minWidth, constrainedRequest.minWidth,
      "won't settle for less width if entries would be truncated");
    svg.remove();
  });

  it("can set formatter and change how entry labels are displayed", () => {
    color.domain(["A", "B", "C"]);
    let formatter = (id: string) => String.fromCharCode(id.charCodeAt(0) + 1);
    legend.formatter(formatter);
    legend.renderTo(svg);
    let legendRows = svg.selectAll(entrySelector);
    assert.operator(legendRows.size(), ">=", 1, "There is at least one entry in the test");
    legendRows.each(function(d, i){
      let expectText = formatter(legend.colorScale().domain()[i]);
      assert.strictEqual(d3.select(this).select("text").text(), expectText,
        `formatter output ${expectText} should be displayed`);
    });
    svg.remove();
  });

  it("can get formatter of the legend using formatter()", () => {
    let formatter = (id: string) => String.fromCharCode(id.charCodeAt(0) + 1);
    legend.formatter(formatter);
    assert.strictEqual(legend.formatter(), formatter, "formatter() returns the formatter of legend correctly");
    svg.remove();
  });

  it("can sort displayed texts using comparator()", () => {
    let colorDomain = ["A", "B", "C"];
    color.domain(colorDomain);
    let expectedTexts = ["Z", "Y", "X"];
    let formatter = (d: string) => expectedTexts[colorDomain.indexOf(d)];
    legend.formatter(formatter);
    let comparator = (a: string, b: string) => a.charCodeAt(0) - b.charCodeAt(0);
    legend.comparator(comparator);
    legend.renderTo(svg);
    let entryTexts = svg.selectAll(entrySelector)[0].map((node: Element) => d3.select(node).select("text").text());
    expectedTexts.sort(comparator);
    assert.deepEqual(expectedTexts, entryTexts, "displayed texts should be sorted in alphabetic order");
    svg.remove();
  });

  describe("entitiesAt()", () => {
    function computeExpectedSymbolPosition(legend: Plottable.Components.Legend, rowIndex: number, entryIndexWithinRow: number) {
      let row = d3.select(legend.content().selectAll(rowSelector)[0][rowIndex]);
      let entry = d3.select(row.selectAll(entrySelector)[0][entryIndexWithinRow]);
      let symbol = entry.select(symbolSelector);
      let rowTranslate = d3.transform(row.attr("transform")).translate;
      let entryTranslate = d3.transform(entry.attr("transform")).translate;
      let symbolTranslate = d3.transform(symbol.attr("transform")).translate;
      return {
        x: rowTranslate[0] + entryTranslate[0] + symbolTranslate[0],
        y: rowTranslate[1] + entryTranslate[1] + symbolTranslate[1]
      };
    }

    it("gets Entities representing the entry at a particular point", () => {
      let domain = ["AA", "BB", "CC"];
      color.domain(domain);
      legend.renderTo(svg);
      let entities = legend.entitiesAt({x: 10, y: 10});
      let entries = legend.content().selectAll(entrySelector);

      let expectedEntity: Plottable.Entity<Plottable.Components.Legend> = {
        datum: "AA",
        index: 0,
        position: computeExpectedSymbolPosition(legend, 0, 0),
        selection: d3.select(entries[0][0]),
        component: legend
      };
      TestMethods.assertEntitiesEqual(entities[0], expectedEntity, "returned Entity corresponding to first entry");

      entities = legend.entitiesAt({x: 10, y: 30});
      expectedEntity = {
        datum: "BB",
        index: 1,
        position: computeExpectedSymbolPosition(legend, 1, 0),
        selection: d3.select(entries[0][1]),
        component: legend
      };
      TestMethods.assertEntitiesEqual(entities[0], expectedEntity, "returned Entity corresponding to second entry");

      legend.detach();
      entities = legend.entitiesAt({x: 10, y: 10});
      assert.lengthOf(entities, 0, "returns no Entities if not anchored");
      svg.remove();
    });

    it("gets Entities representing the entry at a particular point (maxEntriesPerRow > 1)", () => {
      let domain = ["AA", "BB", "CC"];
      color.domain(domain);
      legend.maxEntriesPerRow(Infinity);
      legend.renderTo(svg);
      let entities = legend.entitiesAt({x: 10, y: 10});
      let entries = legend.content().selectAll(entrySelector);
      let expectedEntity: Plottable.Entity<Plottable.Components.Legend> = {
        datum: "AA",
        index: 0,
        position: computeExpectedSymbolPosition(legend, 0, 0),
        selection: d3.select(entries[0][0]),
        component: legend
      };
      TestMethods.assertEntitiesEqual(entities[0], expectedEntity, "returned Entity corresponding to first entry");

      entities = legend.entitiesAt({x: 50, y: 10});
      expectedEntity = {
        datum: "BB",
        index: 1,
        position: computeExpectedSymbolPosition(legend, 0, 1),
        selection: d3.select(entries[0][1]),
        component: legend
      };
      TestMethods.assertEntitiesEqual(entities[0], expectedEntity, "returned Entity corresponding to second entry");

      svg.remove();
    });

    it("returns an empty array if no Entitites are present at that point", () => {
      let domain = ["AA", "BB", "CC"];
      color.domain(domain);
      legend.renderTo(svg);
      let entities = legend.entitiesAt({x: -100, y: -100});
      assert.lengthOf(entities, 0, "no Entities returned if there are no entries at that point");
      svg.remove();
    });
  });

  it("comparator() works as expected", () => {
    let newDomain = ["F", "E", "D", "C", "B", "A"];
    color.domain(newDomain);
    legend.renderTo(svg);
    let entries = (<any> legend)._element.selectAll(entrySelector);
    let elementTexts = entries.select("text")[0].map((node: Element) => d3.select(node).text());
    assert.deepEqual(elementTexts, newDomain, "entry has not been sorted");

    let compareFunction = (a: string, b: string) => a.localeCompare(b);
    legend.comparator(compareFunction);
    entries = (<any> legend)._element.selectAll(entrySelector);
    elementTexts = entries.select("text")[0].map((node: Element) => d3.select(node).text());
    newDomain.sort(compareFunction);
    assert.deepEqual(elementTexts, newDomain, "entry has been sorted alphabetically");

    svg.remove();
  });

  it("truncates and hides entries if space is constrained for a horizontal legend", () => {
    svg.remove();
    svg = TestMethods.generateSVG(70, 400);
    legend.maxEntriesPerRow(Infinity);
    legend.renderTo(svg);

    let textEls = (<any> legend)._element.selectAll("text");
    textEls.each(function(d: any) {
      let textEl = d3.select(this);
      TestMethods.assertBBoxInclusion((<any> legend)._element, textEl);
    });

    legend.detach();
    svg.remove();
    svg = TestMethods.generateSVG(100, 50);
    legend.renderTo(svg);
    textEls = (<any> legend)._element.selectAll("text");
    textEls.each(function(d: any) {
      let textEl = d3.select(this);
      TestMethods.assertBBoxInclusion((<any> legend)._element, textEl);
    });

    svg.remove();
  });

  it("symbol() passes index correctly", () => {
    let domain = ["AA", "BB", "CC"];
    color.domain(domain);

    let expectedIndex = 0;
    let symbolChecker = (d: any, index: number) => {
      assert.strictEqual(index, expectedIndex, "index passed in is correct");
      expectedIndex++;
      return (size: number) => "";
    };
    legend.symbol(symbolChecker);

    legend.renderTo(svg);
    svg.remove();
  });

  it("symbolOpacity() passes index correctly", () => {
    let domain = ["AA", "BB", "CC"];
    color.domain(domain);

    let expectedIndex = 0;
    let symbolOpacityChecker = (d: any, index: number) => {
      assert.strictEqual(index, expectedIndex, "index passed in is correct");
      expectedIndex++;
      return 0.5;
    };
    legend.symbolOpacity(symbolOpacityChecker);

    legend.renderTo(svg);
    svg.remove();
  });

  it("Title elements are created by default", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);

    let entries = (<any> legend)._element.selectAll(entrySelector);
    let titles = entries.selectAll("title");
    assert.strictEqual(titles.size(), color.domain().length, "same number of title tags as legend entries");

    entries.each(function(d: any, i: number) {
      let d3this = d3.select(this);
      let text = d3this.select("text").text();
      let titles = d3this.selectAll("title");
      assert.strictEqual(titles.size(), 1, "only one title node per legend entry should be present");
      assert.strictEqual(text, titles.text(), "the text and title node have the same text");
    });
    svg.remove();
  });

  it("No title elements are created if configuration is set to false", () => {
    color.domain(["foo", "bar", "baz"]);
    let originalSetting = Plottable.Configs.ADD_TITLE_ELEMENTS;
    Plottable.Configs.ADD_TITLE_ELEMENTS = false;
    legend.renderTo(svg);
    Plottable.Configs.ADD_TITLE_ELEMENTS = originalSetting;

    let entries = (<any> legend)._element.selectAll(entrySelector);
    let titles = entries.selectAll("title");
    assert.strictEqual(titles.size(), 0, "no titles should be rendered");
    svg.remove();
  });
});
