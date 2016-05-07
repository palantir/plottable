///<reference path="../testReference.ts" />

describe("ClientToSVGTranslator", () => {
  it("getTranslator() creates only one ClientToSVGTranslator per <svg>", () => {
    let svg = TestMethods.generateSVG();

    let t1 = Plottable.Utils.ClientToSVGTranslator.getTranslator(<SVGElement> svg.node());
    assert.isNotNull(t1, "created a new ClientToSVGTranslator on a <svg>");
    let t2 = Plottable.Utils.ClientToSVGTranslator.getTranslator(<SVGElement> svg.node());
    assert.strictEqual(t1, t2, "returned the existing ClientToSVGTranslator if called again with same <svg>");

    svg.remove();
  });

  it("converts points to <svg>-space correctly", () => {
    let svg = TestMethods.generateSVG();

    let rectOrigin: Plottable.Point = {
      x: 19,
      y: 85,
    };
    let rect = svg.append("rect").attr({
      x: rectOrigin.x,
      y: rectOrigin.y,
      width: 30,
      height: 30,
    });

    let translator = Plottable.Utils.ClientToSVGTranslator.getTranslator(<SVGElement> svg.node());

    let rectBCR = (<Element> rect.node()).getBoundingClientRect();
    let computedOrigin = translator.computePosition(rectBCR.left, rectBCR.top);
    TestMethods.assertPointsClose(computedOrigin, rectOrigin, 0.5, "translates client coordinates to <svg> coordinates correctly");

    svg.remove();
  });
});
