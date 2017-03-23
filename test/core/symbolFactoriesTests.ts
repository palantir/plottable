import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("SymbolFactory", () => {
  describe("Generates correct path", () => {
    let svg: d3.Selection<SVGSVGElement, any, any, any>;
    const symbolSize = 5;

    beforeEach(() => {
      svg = TestMethods.generateSVG();
    });

    it("returns a circle factory that generates circle based on symbolSize", () => {
      const circleFactory = Plottable.SymbolFactories.circle();
      const actualSize = Math.PI * Math.pow(symbolSize / 2, 2);
      const d = circleFactory(symbolSize);
      const expectedD = d3.symbol().type(d3.symbolCircle).size(actualSize)(null);
      assert.strictEqual(d, expectedD, "a circle of set size is generated");
      const path = svg.append("path").attr("d", d);
      const bbox = Plottable.Utils.DOM.elementBBox(path);
      assert.strictEqual(bbox.height, symbolSize, "height is as set");
      assert.strictEqual(bbox.width, symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();
    });

    it("returns a square factory that generates square based on symbolSize", () => {
      const squareFactory = Plottable.SymbolFactories.square();
      const actualSize = Math.pow(symbolSize, 2);
      const d = squareFactory(symbolSize);
      const expectedD = d3.symbol().type(d3.symbolSquare).size(actualSize)(null);
      assert.strictEqual(d, expectedD, "a square of set size is generated");
      const path = svg.append("path").attr("d", d);
      const bbox = Plottable.Utils.DOM.elementBBox(path);
      assert.strictEqual(bbox.height, symbolSize, " is as set");
      assert.strictEqual(bbox.width, symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();
    });

    it("returns a cross factory that generates cross based on symbolSize", () => {
      const crossFactory = Plottable.SymbolFactories.cross();
      const actualSize = (5 / 9) * Math.pow(symbolSize, 2);
      const d = crossFactory(symbolSize);
      const expectedD = d3.symbol().type(d3.symbolCross).size(actualSize)(null);
      assert.strictEqual(d, expectedD, "a cross of set size is generated");
      const path = svg.append("path").attr("d", d);
      const bbox = Plottable.Utils.DOM.elementBBox(path);
      assert.strictEqual(bbox.height, symbolSize, "height is as set");
      assert.strictEqual(bbox.width, symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();
    });

    it("returns a diamond factory that generates diamond based on symbolSize", () => {
      const diamondFactory = Plottable.SymbolFactories.diamond();
      const actualSize = Math.tan(Math.PI / 6) * Math.pow(symbolSize, 2) / 2;
      const d = diamondFactory(symbolSize);
      const expectedD = d3.symbol().type(d3.symbolDiamond).size(actualSize)(null);
      assert.strictEqual(d, expectedD, "a diamond of set size is generated");
      const path = svg.append("path").attr("d", d);
      const bbox = Plottable.Utils.DOM.elementBBox(path);
      assert.strictEqual(bbox.height, symbolSize, "height is as set");
      assert.operator(bbox.width, "<", symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();
    });

    it("returns a triangle factory that generates a triangle based on symbolSize", () => {
      const triangleFactory = Plottable.SymbolFactories.triangle();

      const actualSize = Math.sqrt(3) * Math.pow(symbolSize / 2, 2);
      const d = triangleFactory(symbolSize);
      const expectedD = d3.symbol().type(d3.symbolTriangle).size(actualSize)(null);
      assert.strictEqual(d, expectedD, "a up triangle of set size is generated");
      const path = svg.append("path").attr("d", d);
      const bbox = Plottable.Utils.DOM.elementBBox(path);
      assert.operator(bbox.height, "<", symbolSize, "height is as set");
      assert.strictEqual(bbox.width, symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      svg.remove();
    });

    it("returns a wye factory that generates wye based on symbolSize", () => {
      const wyeFactory = Plottable.SymbolFactories.wye();
      const a = ((1 / Math.sqrt(12)) / 2 + 1) * 3;
      const actualSize = a * Math.pow(symbolSize / 2.4, 2);
      const d = wyeFactory(symbolSize);
      const expectedD = d3.symbol().type(d3.symbolWye).size(actualSize)(null);
      assert.strictEqual(d, expectedD, "a wye of set size is generated");
      const path = svg.append("path").attr("d", d);
      const bbox = Plottable.Utils.DOM.elementBBox(path);
      assert.operator(bbox.height, "<", symbolSize, "height is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      svg.remove();
    });
  });
});
