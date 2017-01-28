///<reference path="../testReference.ts" />

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("SymbolFactory", () => {
  describe("Generates correct path", () => {
    let svg: d3.Selection<void>;
    let symbolSize = 5;

    beforeEach(() => {
      svg = TestMethods.generateSVG();
    });

    it("returns a circle factory that generates circle based on symbolSize", () => {
      let circleFactory = Plottable.SymbolFactories.circle();
      let actualSize = Math.PI * Math.pow(symbolSize / 2, 2);
      let d = circleFactory(symbolSize);
      let expectedD = d3.svg.symbol().type("circle").size(actualSize)(null);
      assert.strictEqual(d, expectedD, "a circle of set size is generated");
      let path = svg.append("path").attr("d", d);
      let bbox = Plottable.Utils.DOM.elementBBox(path);
      assert.strictEqual(bbox.height, symbolSize, "height is as set");
      assert.strictEqual(bbox.width, symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();
    });

    it("returns a square factory that generates square based on symbolSize", () => {
      let squareFactory = Plottable.SymbolFactories.square();
      let actualSize = Math.pow(symbolSize, 2);
      let d = squareFactory(symbolSize);
      let expectedD = d3.svg.symbol().type("square").size(actualSize)(null);
      assert.strictEqual(d, expectedD, "a square of set size is generated");
      let path = svg.append("path").attr("d", d);
      let bbox = Plottable.Utils.DOM.elementBBox(path);
      assert.strictEqual(bbox.height, symbolSize, " is as set");
      assert.strictEqual(bbox.width, symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();
    });

    it("returns a cross factory that generates cross based on symbolSize", () => {
      let crossFactory = Plottable.SymbolFactories.cross();
      let actualSize = (5 / 9) * Math.pow(symbolSize, 2);
      let d = crossFactory(symbolSize);
      let expectedD = d3.svg.symbol().type("cross").size(actualSize)(null);
      assert.strictEqual(d, expectedD, "a cross of set size is generated");
      let path = svg.append("path").attr("d", d);
      let bbox = Plottable.Utils.DOM.elementBBox(path);
      assert.strictEqual(bbox.height, symbolSize, "height is as set");
      assert.strictEqual(bbox.width, symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();
    });

    it("returns a diamond factory that generates diamond based on symbolSize", () => {
      let diamondFactory = Plottable.SymbolFactories.diamond();
      let actualSize = Math.tan(Math.PI / 6) * Math.pow(symbolSize, 2) / 2;
      let d = diamondFactory(symbolSize);
      let expectedD = d3.svg.symbol().type("diamond").size(actualSize)(null);
      assert.strictEqual(d, expectedD, "a diamond of set size is generated");
      let path = svg.append("path").attr("d", d);
      let bbox = Plottable.Utils.DOM.elementBBox(path);
      assert.strictEqual(bbox.height, symbolSize, "height is as set");
      assert.operator(bbox.width, "<", symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();
    });

    it("returns an up triangle factory that generates up triangle based on symbolSize", () => {
      let triangleUpFactory = Plottable.SymbolFactories.triangleUp();
      let actualSize = Math.sqrt(3) * Math.pow(symbolSize / 2, 2);
      let d = triangleUpFactory(symbolSize);
      let expectedD = d3.svg.symbol().type("triangle-up").size(actualSize)(null);
      assert.strictEqual(d, expectedD, "a up triangle of set size is generated");
      let path = svg.append("path").attr("d", d);
      let bbox = Plottable.Utils.DOM.elementBBox(path);
      assert.operator(bbox.height, "<", symbolSize, "height is as set");
      assert.strictEqual(bbox.width, symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();
    });

    it("returns a down triangle factory that generates down triangle based on symbolSize", () => {
      let triangleDownFactory = Plottable.SymbolFactories.triangleDown();
      let actualSize = Math.sqrt(3) * Math.pow(symbolSize / 2, 2);
      let d = triangleDownFactory(symbolSize);
      let expectedD = d3.svg.symbol().type("triangle-down").size(actualSize)(null);
      assert.strictEqual(d, expectedD, "a down triangle of set size is generated");
      let path = svg.append("path").attr("d", d);
      let bbox = Plottable.Utils.DOM.elementBBox(path);
      assert.operator(bbox.height, "<", symbolSize, "height is as set");
      assert.strictEqual(bbox.width, symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();
    });
  });
});
