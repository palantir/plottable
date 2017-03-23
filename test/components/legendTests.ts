import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";
import { getTranslateValues } from "../../src/utils/domUtils";

import * as TestMethods from "../testMethods";

describe("Legend", () => {
  const ENTRY_SELECTOR = "." + Plottable.Components.Legend.LEGEND_ENTRY_CLASS;
  const SYMBOL_SELECTOR = "." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS;
  const TEXT_LINE_SELECTOR = ".text-line";
  const ROW_SELECTOR = "." + Plottable.Components.Legend.LEGEND_ROW_CLASS;

  describe("Basic Usage", () => {
    let div: d3.Selection<HTMLDivElement, any, any, any>;
    let color: Plottable.Scales.Color;
    let legend: Plottable.Components.Legend;

    beforeEach(() => {
      div = TestMethods.generateDiv();
      color = new Plottable.Scales.Color();
      legend = new Plottable.Components.Legend(color);
    });

    it("renders rows with correct text, fill, and opacity", () => {
      color.domain(["foo", "bar", "baz"]);
      legend.renderTo(div);
      let rows = legend.content().selectAll<Element, any>(ENTRY_SELECTOR);
      assert.strictEqual(rows.size(), color.domain().length, "one entry is created for each item in the domain");

      rows.each(function(d: any, i: number) {
        const name = d[0].data.name;
        assert.strictEqual(name, color.domain()[i], "the data is set properly");
        let row = d3.select(this);
        let text = row.select("text").text();
        assert.strictEqual(text, name, "the text node has correct text");
        let symbol = row.select(SYMBOL_SELECTOR);
        assert.strictEqual(symbol.attr("fill"), color.scale(name), "the symbol's fill is set properly");
        assert.strictEqual(symbol.attr("opacity"), "1", "the symbol's opacity is set by default to 1");
      });
      div.remove();
    });

    it("updates height when domain is updated", () => {
      legend.renderTo(div);
      legend.colorScale(color);
      const minHeight1 = legend.requestedSpace(200, 200).minHeight;
      assert.operator(minHeight1, ">", 0, "there is a padding requested height when domain is empty");

      color.domain(["foo", "bar"]);
      const minHeight2 = legend.requestedSpace(400, 400).minHeight;
      const actualHeight2 = legend.height();
      assert.operator(minHeight2, ">", minHeight1, "changing the domain gives a height greater than empty domain");

      color.domain(["foo", "bar", "baz"]);
      const minHeight3 = legend.requestedSpace(400, 400).minHeight;
      assert.operator(minHeight3, ">", minHeight2, "adding to the domain increases the height requested");
      let actualHeight3 = legend.height();
      assert.operator(actualHeight2, "<", actualHeight3, "Changing the domain caused the legend to re-layout with more height");
      assert.strictEqual(legend.content().selectAll<Element, any>(ROW_SELECTOR).size(), 3, "there are 3 rows");
      div.remove();
    });

    it("does not overflow vertically", () => {
      color.domain(["alpha", "beta", "gamma", "delta", "omega", "omicron", "persei", "eight"]);
      legend.renderTo(div);

      const contentBBox = Plottable.Utils.DOM.elementBBox(legend.content());
      const contentBottomEdge = contentBBox.y + contentBBox.height;
      const bboxBBox = legend.element().node().getBoundingClientRect();
      const bboxBottomEdge = bboxBBox.top + bboxBBox.height;

      assert.operator(contentBottomEdge, "<=", bboxBottomEdge, "content does not extend past bounding box");
      div.remove();
    });

    it("does not overflow horizontally with long label", () => {
      color.domain(["foooboooloonoogoorooboopoo"]);
      div.style("width", "100px");
      legend.renderTo(div);
      let text = legend.content().select("text").text();
      assert.notEqual(text, "foooboooloonoogoorooboopoo", "the text was truncated");
      let rightEdge = (<Element> legend.content().select("text").node()).getBoundingClientRect().right;
      let rightEdgeBBox = legend.element().node().getBoundingClientRect().right;
      assert.operator(rightEdge, "<=", rightEdgeBBox, "the long text did not overflow the legend");
      div.remove();
    });

    it("does not add more elements if legend.render is called multiple times", () => {
      color.domain(["foo", "bar", "baz"]);
      legend.renderTo(div);
      assert.strictEqual(legend.content().selectAll<Element, any>(ROW_SELECTOR).size(), 3, "there are 3 legend rows initially");
      legend.render();
      assert.strictEqual(legend.content().selectAll<Element, any>(ROW_SELECTOR).size(), 3, "there are 3 legend rows after second render");
      div.remove();
    });

    it("updates properties correctly on rerendering after domain is changed", () => {
      color.domain(["foo", "bar", "baz"]);
      legend.renderTo(div);
      const newDomain = ["mushu", "foo", "persei", "baz", "eight"];
      color.domain(newDomain);

      legend.content().selectAll<Element, any>(ENTRY_SELECTOR).each(function(d: any, i: number) {
        const name = d[0].data.name;
        assert.strictEqual(name, newDomain[i], "the data is set correctly");
        const text = d3.select(this).select("text").text();
        assert.strictEqual(text, name, "the text was set properly");
        const fill = d3.select(this).select(SYMBOL_SELECTOR).attr("fill");
        assert.strictEqual(fill, color.scale(name), "the fill was set properly");
      });
      assert.strictEqual(legend.content().selectAll<Element, any>(ENTRY_SELECTOR).size(), 5, "there are the right number of legend elements");
      div.remove();
    });

    it("updates domain when the scale is replaced", () => {
      color.domain(["foo", "bar", "baz"]);
      legend.renderTo(div);

      const newDomain = ["a", "b", "c"];
      const newColorScale = new Plottable.Scales.Color("20");
      newColorScale.domain(newDomain);
      legend.colorScale(newColorScale);

      legend.content().selectAll<Element, any>(ENTRY_SELECTOR).each(function(d: any, i: number) {
        const name = d[0].data.name;
        assert.strictEqual(name, newDomain[i], "the data is set correctly");
        let text = d3.select(this).select("text").text();
        assert.strictEqual(text, name, "the text was set properly");
        let fill = d3.select(this).select(SYMBOL_SELECTOR).attr("fill");
        assert.strictEqual(fill, newColorScale.scale(name), "the fill was set properly");
      });

      div.remove();
    });

    it("reregisters listeners when scale is replaced", () => {
      color.domain(["foo", "bar", "baz"]);
      legend.renderTo(div);

      const tempDomain = ["a", "b", "c"];
      const newColorScale = new Plottable.Scales.Color("20");
      newColorScale.domain(tempDomain);
      legend.colorScale(newColorScale);

      const newDomain = ["a", "foo", "d"];
      newColorScale.domain(newDomain);
      legend.content().selectAll<Element, any>(ENTRY_SELECTOR).each(function(d: any, i: number) {
        const name = d[0].data.name;
        assert.strictEqual(name, newDomain[i], "the data is set correctly");
        const text = d3.select(this).select("text").text();
        assert.strictEqual(text, name, "the text was set properly");
        const fill = d3.select(this).select(SYMBOL_SELECTOR).attr("fill");
        assert.strictEqual(fill, newColorScale.scale(name), "the fill was set properly");
      });
      div.remove();
    });

    // Disable this test for now since it flakes all the time on Saucelabs Safari 10
    xit("can set maximum number of lines per entry", () => {
      color.domain(["this is a very very very very very very very long"]);
      legend.renderTo(div);
      legend.maxWidth(100);
      legend.maxLinesPerEntry(2);
      assert.strictEqual(2, legend.content().selectAll<Element, any>(`${ROW_SELECTOR} ${TEXT_LINE_SELECTOR}`).size());
      legend.maxLinesPerEntry(4);
      assert.strictEqual(4, legend.content().selectAll<Element, any>(`${ROW_SELECTOR} ${TEXT_LINE_SELECTOR}`).size());
      div.remove();
    });

    it("can set maximum width of legend", () => {
      color.domain(["this is a very very very very very very very long"]);
      legend.renderTo(div);
      legend.maxWidth(100);
      assert.isTrue((legend.content().node() as SVGElement).getBoundingClientRect().width <= 100);
      div.remove();
    });

    // Disable this test for now since it flakes all the time on Saucelabs Safari 10
    xit("can set maximum number of entries per row", () => {
      color.domain(["AA", "BB", "CC", "DD", "EE", "FF"]);
      legend.renderTo(div);

      function verifyMaxEntriesInRow (n: number) {
        legend.maxEntriesPerRow(n);
        const rows = legend.content().selectAll<Element, any>(ROW_SELECTOR);
        assert.strictEqual(rows.size(), (6 / n), "number of rows is correct");
        rows.each(function(d: any) {
          const entries = d3.select(this).selectAll<Element, any>(ENTRY_SELECTOR);
          assert.strictEqual(entries.size(), n, "number of entries in row is correct");
        });
      }

      verifyMaxEntriesInRow(1);
      verifyMaxEntriesInRow(2);
      verifyMaxEntriesInRow(3);
      verifyMaxEntriesInRow(6);

      div.remove();
    });

    it("wraps entries onto extra rows if necessary for horizontal legends", () => {
      color.domain(["George Waaaaaashington", "John Adaaaams", "Thomaaaaas Jefferson"]);
      legend.maxEntriesPerRow(Infinity);

      legend.renderTo(div);
      let rows = legend.content().selectAll<Element, any>(ROW_SELECTOR);
      assert.strictEqual(rows.size(), 2, "Wrapped text on to two rows when space is constrained");
      legend.detach();
      div.remove();

      div = TestMethods.generateDiv(100, 100);
      legend.renderTo(div);
      rows = legend.content().selectAll<Element, any>(ROW_SELECTOR);
      assert.strictEqual(rows.size(), 3, "Wrapped text on to three rows when further constrained");
      div.remove();
    });

    it("truncates and hides entries if space is constrained for a horizontal legend", () => {
      div.remove();
      div = TestMethods.generateDiv(70, 400);
      legend.maxEntriesPerRow(Infinity);
      legend.renderTo(div);

      let textEls = legend.content().selectAll<Element, any>("text");
      textEls.each(function(d: any) {
        const textEl = d3.select(this);
        TestMethods.assertBBoxInclusion(legend.content(), textEl);
      });

      legend.detach();
      div.remove();
      div = TestMethods.generateDiv(100, 50);
      legend.renderTo(div);
      textEls = legend.content().selectAll<Element, any>("text");
      textEls.each(function(d: any) {
        let textEl = d3.select(this);
        TestMethods.assertBBoxInclusion(legend.content(), textEl);
      });

      div.remove();
    });
  });

  describe("Symbols", () => {
    let div: d3.Selection<HTMLDivElement, any, any, any>;
    let color: Plottable.Scales.Color;
    let legend: Plottable.Components.Legend;

    beforeEach(() => {
      div = TestMethods.generateDiv();
      color = new Plottable.Scales.Color();
      legend = new Plottable.Components.Legend(color);
    });

    it("renders with correct opacity for each symbol when specified", () => {
      const opacity = 0.5;
      color.domain(["foo", "bar", "baz"]);
      legend.symbolOpacity(opacity);
      legend.renderTo(div);

      let rows = legend.content().selectAll<Element, any>(ENTRY_SELECTOR);

      rows.each(function(d: any, i: number) {
        const row = d3.select(this);
        const symbol = row.select(SYMBOL_SELECTOR);
        assert.strictEqual(TestMethods.numAttr(symbol, "opacity"), opacity, "the symbol's opacity is set to a constant");
      });

      const opacityFunction = (d: any, i: number) => {
        return (d === "foo") ? 0.2 : 0.8;
      };
      legend.symbolOpacity(opacityFunction).redraw();
      rows = legend.content().selectAll<Element, any>(ENTRY_SELECTOR);

      rows.each(function(d: any, i: number) {
        const name = d[0].data.name;
        const row = d3.select(this);
        const symbol = row.select(SYMBOL_SELECTOR);
        assert.strictEqual(symbol.attr("opacity"), String(opacityFunction(name, i)), "the symbol's opacity follows the provided function.");
      });
      div.remove();
    });

    it("scales icon sizes properly with font size", () => {
      color.domain(["foo"]);
      legend.renderTo(div);
      const style = div.append("style");
      style.attr("type", "text/css");

      function verifySymbolHeight() {
        const text = legend.content().select("text");
        const icon = legend.content().select(SYMBOL_SELECTOR);
        const textHeight = Plottable.Utils.DOM.elementBBox(text).height;
        const symbolHeight = (<Element> icon.node()).getBoundingClientRect().height;
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

      div.remove();
    });

    it("passes correct index in symbol", () => {
      const domain = ["AA", "BB", "CC"];
      color.domain(domain);

      let expectedIndex = 0;
      const symbolChecker = (d: any, index: number) => {
        assert.strictEqual(index, expectedIndex, "index passed in is correct");
        expectedIndex++;
        return (size: number) => "";
      };
      legend.symbol(symbolChecker);

      legend.renderTo(div);
      div.remove();
    });

    it("passes correct index in symbolOpacity", () => {
      const domain = ["AA", "BB", "CC"];
      color.domain(domain);

      let expectedIndex = 0;
      let symbolOpacityChecker = (d: any, index: number) => {
        assert.strictEqual(index, expectedIndex, "index passed in is correct");
        expectedIndex++;
        return 0.5;
      };
      legend.symbolOpacity(symbolOpacityChecker);

      legend.renderTo(div);
      div.remove();
    });
  });

  describe("Title Elements", () => {
    let div: d3.Selection<HTMLDivElement, any, any, any>;
    let color: Plottable.Scales.Color;
    let legend: Plottable.Components.Legend;

    beforeEach(() => {
      div = TestMethods.generateDiv();
      color = new Plottable.Scales.Color();
      legend = new Plottable.Components.Legend(color);
    });

    it("create title elements by default", () => {
      color.domain(["foo", "bar", "baz"]);
      legend.renderTo(div);

      const entries = legend.content().selectAll<Element, any>(ENTRY_SELECTOR);
      const titles = entries.selectAll<Element, any>("title");
      assert.strictEqual(titles.size(), color.domain().length, "same number of title tags as legend entries");

      entries.each(function(d: any, i: number) {
        const entry = d3.select(this);
        const text = entry.select("text").text();
        const title = entry.selectAll<Element, any>("title");
        assert.strictEqual(title.size(), 1, "only one title node per legend entry should be present");
        assert.strictEqual(text, title.text(), "the text and title node have the same text");
      });
      div.remove();
    });

    it("does not create title elements if configuration is set to false", () => {
      color.domain(["foo", "bar", "baz"]);
      const originalSetting = Plottable.Configs.ADD_TITLE_ELEMENTS;
      Plottable.Configs.ADD_TITLE_ELEMENTS = false;
      legend.renderTo(div);
      Plottable.Configs.ADD_TITLE_ELEMENTS = originalSetting;

      const entries = legend.content().selectAll<Element, any>(ENTRY_SELECTOR);
      const titles = entries.selectAll<Element, any>("title");
      assert.strictEqual(titles.size(), 0, "no titles should be rendered");
      div.remove();
    });
  });

  describe("Formatting and Sorting", () => {
    let div: d3.Selection<HTMLDivElement, any, any, any>;
    let color: Plottable.Scales.Color;
    let legend: Plottable.Components.Legend;

    beforeEach(() => {
      div = TestMethods.generateDiv();
      color = new Plottable.Scales.Color();
      legend = new Plottable.Components.Legend(color);
    });

    it("can set formatter to change how entry labels are displayed", () => {
      color.domain(["A", "B", "C"]);
      const formatter = (id: string) => `${id}foo`;
      legend.formatter(formatter);
      legend.renderTo(div);
      const legendRows = div.selectAll<Element, any>(ENTRY_SELECTOR);
      assert.operator(legendRows.size(), ">=", 1, "There is at least one entry in the test");
      legendRows.each(function(d, i){
        const expectedText = formatter(legend.colorScale().domain()[i]);
        assert.strictEqual(d3.select(this).select("text").text(), expectedText,
          `formatter output ${expectedText} should be displayed`);
      });
      div.remove();
    });

    it("can get formatter of the legend", () => {
      const formatter = (id: string) => `${id}foo`;
      legend.formatter(formatter);
      assert.strictEqual(legend.formatter(), formatter, "formatter() returns the formatter of legend correctly");
      div.remove();
    });

    it("can sort displayed texts using comparator", () => {
      const colorDomain = ["A", "B", "C"];
      color.domain(colorDomain);
      const expectedTexts = ["Z", "Y", "X"];
      const formatter = (d: string) => expectedTexts[colorDomain.indexOf(d)];
      legend.formatter(formatter);
      const comparator = (a: string, b: string) => a.charCodeAt(0) - b.charCodeAt(0);
      legend.comparator(comparator);
      legend.renderTo(div);
      const entryTexts = div.selectAll<Element, any>(ENTRY_SELECTOR).nodes().map((node: Element) => d3.select(node).select("text").text());
      expectedTexts.sort(comparator);
      assert.deepEqual(expectedTexts, entryTexts, "displayed texts should be sorted in alphabetic order");
      div.remove();
    });

    it("does not change the order of legend entries when using default comparator", () => {
      const colorDomain = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];
      color.domain(colorDomain);
      legend.renderTo(div);
      const entryTexts = legend.content().selectAll<Element, any>(ENTRY_SELECTOR).data().map((datum) => datum[0].data.name);
      assert.deepEqual(colorDomain, entryTexts, "displayed texts should have the same order as the legend domain");
      div.remove();
    });

    it("sorts entries by comparator", () => {
      const newDomain = ["F", "E", "D", "C", "B", "A"];
      color.domain(newDomain);
      legend.renderTo(div);
      let entries = legend.content().selectAll<Element, any>(ENTRY_SELECTOR);
      let elementTexts = entries.select("text").nodes().map((node: Element) => d3.select(node).text());
      assert.deepEqual(elementTexts, newDomain, "entry has not been sorted");

      const compareFunction = (a: string, b: string) => a.localeCompare(b);
      legend.comparator(compareFunction);
      entries = legend.content().selectAll<Element, any>(ENTRY_SELECTOR);
      elementTexts = entries.select("text").nodes().map((node: Element) => d3.select(node).text());
      newDomain.sort(compareFunction);
      assert.deepEqual(elementTexts, newDomain, "entry has been sorted alphabetically");

      div.remove();
    });
  });

  describe("Selection", () => {
    let div: d3.Selection<HTMLDivElement, any, any, any>;
    let color: Plottable.Scales.Color;
    let legend: Plottable.Components.Legend;

    beforeEach(() => {
      div = TestMethods.generateDiv();
      color = new Plottable.Scales.Color();
      legend = new Plottable.Components.Legend(color);
    });

    function computeExpectedSymbolPosition(rowIndex: number, entryIndexWithinRow: number) {
      const row = d3.select(legend.content().selectAll<Element, any>(ROW_SELECTOR).nodes()[rowIndex]);
      const entry = d3.select(row.selectAll<Element, any>(ENTRY_SELECTOR).nodes()[entryIndexWithinRow]);
      const symbol = entry.select(SYMBOL_SELECTOR);
      const rowTranslate = getTranslateValues(row);
      const entryTranslate = getTranslateValues(entry);
      const symbolTranslate = getTranslateValues(symbol);
      return {
        x: rowTranslate[0] + entryTranslate[0] + symbolTranslate[0],
        y: rowTranslate[1] + entryTranslate[1] + symbolTranslate[1],
      };
    }

    it("gets Entities representing the entry at a particular point", () => {
      const domain = ["AA", "BB", "CC"];
      color.domain(domain);
      legend.renderTo(div);
      let entities = legend.entitiesAt({x: 10, y: 10});
      const entries = legend.content().selectAll<Element, any>(ENTRY_SELECTOR);

      let expectedEntity: Plottable.IEntity<Plottable.Components.Legend> = {
        datum: "AA",
        position: computeExpectedSymbolPosition(0, 0),
        selection: d3.select(entries.nodes()[0]),
        component: legend,
      };
      TestMethods.assertEntitiesEqual(entities[0], expectedEntity, "returned Entity corresponding to first entry");

      entities = legend.entitiesAt({x: 10, y: 30});
      expectedEntity = {
        datum: "BB",
        position: computeExpectedSymbolPosition(1, 0),
        selection: d3.select(entries.nodes()[1]),
        component: legend,
      };
      TestMethods.assertEntitiesEqual(entities[0], expectedEntity, "returned Entity corresponding to second entry");

      legend.detach();
      entities = legend.entitiesAt({x: 10, y: 10});
      assert.lengthOf(entities, 0, "returns no Entities if not anchored");
      div.remove();
    });

    it("gets Entities representing the entry at a particular point if maxEntriesPerRow is greater than 1", () => {
      const domain = ["AA", "BB", "CC"];
      color.domain(domain);
      legend.maxEntriesPerRow(Infinity);
      legend.renderTo(div);
      let entities = legend.entitiesAt({x: 10, y: 10});
      const entries = legend.content().selectAll<Element, any>(ENTRY_SELECTOR);
      let expectedEntity: Plottable.IEntity<Plottable.Components.Legend> = {
        datum: "AA",
        position: computeExpectedSymbolPosition(0, 0),
        selection: d3.select(entries.nodes()[0]),
        component: legend,
      };
      TestMethods.assertEntitiesEqual(entities[0], expectedEntity, "returned Entity corresponding to first entry");

      entities = legend.entitiesAt({x: 50, y: 10});
      expectedEntity = {
        datum: "BB",
        position: computeExpectedSymbolPosition(0, 1),
        selection: d3.select(entries.nodes()[1]),
        component: legend,
      };
      TestMethods.assertEntitiesEqual(entities[0], expectedEntity, "returned Entity corresponding to second entry");

      div.remove();
    });

    it("returns an empty array if no Entitites are present at that point", () => {
      const domain = ["AA", "BB", "CC"];
      color.domain(domain);
      legend.renderTo(div);
      const entities = legend.entitiesAt({x: -100, y: -100});
      assert.lengthOf(entities, 0, "no Entities returned if there are no entries at that point");
      div.remove();
    });
  });
});
