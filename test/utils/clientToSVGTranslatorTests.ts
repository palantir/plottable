///<reference path="../testReference.ts" />

describe("ClientToSVGTranslator", () => {
  it("getTranslator() creates only one ClientToSVGTranslator per <svg>", () => {
    const svg = TestMethods.generateSVG();

    const t1 = Plottable.Utils.ClientToSVGTranslator.getTranslator(<SVGElement> svg.node());
    assert.isNotNull(t1, "created a new ClientToSVGTranslator on a <svg>");
    const t2 = Plottable.Utils.ClientToSVGTranslator.getTranslator(<SVGElement> svg.node());
    assert.strictEqual(t1, t2, "returned the existing ClientToSVGTranslator if called again with same <svg>");

    svg.remove();
  });

  it("converts points to <svg>-space correctly", () => {
    const svg = TestMethods.generateSVG();

    const rectOrigin: Plottable.Point = {
      x: 19,
      y: 85
    };
    const rect = svg.append("rect").attr({
      x: rectOrigin.x,
      y: rectOrigin.y,
      width: 30,
      height: 30
    });

    const translator = Plottable.Utils.ClientToSVGTranslator.getTranslator(<SVGElement> svg.node());

    const rectBCR = (<Element> rect.node()).getBoundingClientRect();
    const computedOrigin = translator.computePosition(rectBCR.left, rectBCR.top);
    TestMethods.assertPointsClose(computedOrigin, rectOrigin, 0.5, "translates client coordinates to <svg> coordinates correctly");

    svg.remove();
  });
});
