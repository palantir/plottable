///<reference path="../testReference.ts" />

describe("SymbolFactory", () => {
  describe("SymbolFactory generates correct path", () => {
    let svg: d3.Selection<void>;
    let generateSymbol: (type: string, size: number) => string;
    let symbolSize = 5;

    beforeEach(() => {
      svg = TestMethods.generateSVG();
      generateSymbol = (type: string, size: number) => d3.svg.symbol().type(type).size(size)(null);
    });

    it("returns a circle factory that generates circle based on symbolSize", () => {
      let circleFoactory = Plottable.SymbolFactories.circle();
      let actualSize = Math.PI * Math.pow(symbolSize / 2, 2);
      let d = circleFoactory(5);
      assert.strictEqual(d, generateSymbol("circle", actualSize), "a circle of set size is generated");
      svg.append("path").data([{"d": d}]).attr("d", (d) => d.d).enter();
      let bbox = Plottable.Utils.DOM.elementBBox(svg.select("path"));
      assert.strictEqual(bbox.height, symbolSize, "height is as set");
      assert.strictEqual(bbox.width, symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();

    });

    it("returns a square factory that generates square based on symbolSize", () => {
      let squareFoactory = Plottable.SymbolFactories.square();
      let actualSize = Math.pow(symbolSize, 2);
      let d = squareFoactory(5);
      assert.strictEqual(d, generateSymbol("square", actualSize), "a square of set size is generated");
      svg.append("path").data([{"d": d}]).attr("d", (d) => d.d).enter();
      let bbox = Plottable.Utils.DOM.elementBBox(svg.select("path"));
      assert.strictEqual(bbox.height, symbolSize, "height is as set");
      assert.strictEqual(bbox.width, symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();
    });

    it("returns a cross factory that generates cross based on symbolSize", () => {
      let crossFoactory = Plottable.SymbolFactories.cross();
      let actualSize = (5 / 9) * Math.pow(symbolSize, 2);
      let d = crossFoactory(5);
      assert.strictEqual(d, generateSymbol("cross", actualSize), "a cross of set size is generated");
      svg.append("path").data([{"d": d}]).attr("d", (d) => d.d).enter();
      let bbox = Plottable.Utils.DOM.elementBBox(svg.select("path"));
      assert.strictEqual(bbox.height, symbolSize, "height is as set");
      assert.strictEqual(bbox.width, symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();
    });

    it("returns a diamond factory that generates diamond based on symbolSize", () => {
      let diamondFoactory = Plottable.SymbolFactories.diamond();
      let actualSize = Math.tan(Math.PI / 6) * Math.pow(symbolSize, 2) / 2;
      let d = diamondFoactory(5);
      assert.strictEqual(d, generateSymbol("diamond", actualSize), "a diamond of set size is generated");
      svg.append("path").data([{"d": d}]).attr("d", (d) => d.d).enter();
      let bbox = Plottable.Utils.DOM.elementBBox(svg.select("path"));
      assert.strictEqual(bbox.height, symbolSize, "height is as set");
      assert.operator(bbox.width, "<", symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();
    });

    it("returns an up triangle factory that generates up triangle based on symbolSize", () => {
      let triangleUpFoactory = Plottable.SymbolFactories.triangleUp();
      let actualSize = Math.sqrt(3) * Math.pow(symbolSize / 2, 2);
      let d = triangleUpFoactory(5);
      assert.strictEqual(d, generateSymbol("triangle-up", actualSize), "an up triangle of set size is generated");
      svg.append("path").data([{"d": d}]).attr("d", (d) => d.d).enter();
      let bbox = Plottable.Utils.DOM.elementBBox(svg.select("path"));
      assert.operator(bbox.height, "<", symbolSize, "height is as set");
      assert.strictEqual(bbox.width, symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();
    });

    it("returns a down triangle factory that generates down triangle based on symbolSize", () => {
      let triangleDownFoactory = Plottable.SymbolFactories.triangleDown();
      let actualSize = Math.sqrt(3) * Math.pow(symbolSize / 2, 2);
      let d = triangleDownFoactory(5);
      assert.strictEqual(d, generateSymbol("triangle-down", actualSize), "a down triangle of set size is generated");
      svg.append("path").data([{"d": d}]).attr("d", (d) => d.d).enter();
      let bbox = Plottable.Utils.DOM.elementBBox(svg.select("path"));
      assert.operator(bbox.height, "<", symbolSize, "height is as set");
      assert.strictEqual(bbox.width, symbolSize, "width is as set");
      assert.strictEqual(bbox.x, -bbox.width / 2, "x is centered in the middle");
      assert.strictEqual(bbox.y, -bbox.height / 2, "y is centered in the middle");
      svg.remove();
    });
  });
});
