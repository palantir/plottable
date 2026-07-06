import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Utils.DOM", () => {

  it("getBBox works properly", () => {
    const svg = TestMethods.generateSVG();
    const expectedBox: { [key: string]: number } = {
      x: 0,
      y: 0,
      width: 40,
      height: 20,
    };
    const rect = svg.append("rect").attrs(expectedBox);
    const measuredBox = Plottable.Utils.DOM.elementBBox(rect);
    assert.deepEqual(measuredBox, expectedBox, "getBBox measures correctly");
    svg.remove();
  });

  it("getBBox does not fail on disconnected and display:none nodes", () => {
    const expectedBox: { [key: string]: number } = {
      x: 0,
      y: 0,
      width: 40,
      height: 20,
    };

    const removedSVG = TestMethods.generateSVG().remove();
    let rect = removedSVG.append("rect").attrs(expectedBox);
    Plottable.Utils.DOM.elementBBox(rect); // could throw NS_ERROR on FF

    const noneSVG = TestMethods.generateSVG().style("display", "none");
    rect = noneSVG.append("rect").attrs(expectedBox);
    Plottable.Utils.DOM.elementBBox(rect); // could throw NS_ERROR on FF

    noneSVG.remove();
  });

  describe("elementWidth(), elementHeight()", () => {
    it("can get a plain element's size", () => {
      const parent = TestMethods.getElementParent();
      parent.style("width", "300px");
      parent.style("height", "200px");
      const parentElem = <Element> parent.node();

      const width = Plottable.Utils.DOM.elementWidth(parentElem);
      assert.strictEqual(width, 300, "measured width matches set width");
      const height = Plottable.Utils.DOM.elementHeight(parentElem);
      assert.strictEqual(height, 200, "measured height matches set height");
    });

    it("can get the svg's size", () => {
      const svg = TestMethods.generateSVG(450, 120);
      const svgElem = <Element> svg.node();

      const width = Plottable.Utils.DOM.elementWidth(svgElem);
      assert.strictEqual(width, 450, "measured width matches set width");
      const height = Plottable.Utils.DOM.elementHeight(svgElem);
      assert.strictEqual(height, 120, "measured height matches set height");
      svg.remove();
    });

    it("can accept multiple units and convert to pixels", () => {
      const parent = TestMethods.getElementParent();
      const parentElem = <Element> parent.node();
      const child = parent.append("div");
      const childElem = <Element> child.node();

      parent.style("width", "200px");
      parent.style("height", "50px");
      assert.strictEqual(Plottable.Utils.DOM.elementWidth(parentElem), 200, "width is correct");
      assert.strictEqual(Plottable.Utils.DOM.elementHeight(parentElem), 50, "height is correct");

      child.style("width", "20px");
      child.style("height", "10px");
      assert.strictEqual(Plottable.Utils.DOM.elementWidth(childElem), 20, "width is correct");
      assert.strictEqual(Plottable.Utils.DOM.elementHeight(childElem), 10, "height is correct");

      child.style("width", "100%");
      child.style("height", "100%");
      assert.strictEqual(Plottable.Utils.DOM.elementWidth(childElem), 200, "width is correct");
      assert.strictEqual(Plottable.Utils.DOM.elementHeight(childElem), 50, "height is correct");

      child.style("width", "50%");
      child.style("height", "50%");
      assert.strictEqual(Plottable.Utils.DOM.elementWidth(childElem), 100, "width is correct");
      assert.strictEqual(Plottable.Utils.DOM.elementHeight(childElem), 25, "height is correct");

      // reset test page DOM
      parent.style("width", "auto");
      parent.style("height", "auto");
      child.remove();
    });
  });

  describe("elementWidth(), elementHeight() for display none element", () => {
    it("can get a display none element's size", () => {
      const parent = TestMethods.getElementParent();
      parent.style("display", "none");
      parent.style("width", "600px");
      parent.style("height", "400px");
      const parentElem = <Element> parent.node();

      const width = Plottable.Utils.DOM.elementWidth(parentElem);
      assert.strictEqual(width, 600, "measured width matches set width");
      const height = Plottable.Utils.DOM.elementHeight(parentElem);
      assert.strictEqual(height, 400, "measured height matches set height");
    });

    it("can get a div display none element's size", () => {
      const div = TestMethods.generateDiv(300, 200);
      div.style("display", "none");
      const divElement = <Element> div.node();

      const width = Plottable.Utils.DOM.elementWidth(divElement);
      assert.strictEqual(width, 300, "measured width matches set width");
      const height = Plottable.Utils.DOM.elementHeight(divElement);
      assert.strictEqual(height, 200, "measured height matches set height");
      div.remove();
    });

    it("can get a div display element's size inside parent display none", () => {
      const parent = TestMethods.getElementParent();
      parent.attr("display", "none");

      const div = TestMethods.generateDiv(300, 200);
      const divElement = <Element> div.node();

      const width = Plottable.Utils.DOM.elementWidth(divElement);
      assert.strictEqual(width, 300, "measured width matches set width");
      const height = Plottable.Utils.DOM.elementHeight(divElement);
      assert.strictEqual(height, 200, "measured height matches set height");
      div.remove();
    });
  });
});
