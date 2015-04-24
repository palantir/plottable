///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("ClientToSVGTranslator", () => {
  it("getTranslator() creates only one ClientToSVGTranslator per <svg>", () => {
    var svg = generateSVG();

    var t1 = Plottable.Utils.ClientToSVGTranslator.getTranslator(<SVGElement> svg.node());
    assert.isNotNull(t1, "created a new ClientToSVGTranslator on a <svg>");
    var t2 = Plottable.Utils.ClientToSVGTranslator.getTranslator(<SVGElement> svg.node());
    assert.strictEqual(t1, t2, "returned the existing ClientToSVGTranslator if called again with same <svg>");

    svg.remove();
  });

  it("converts points to <svg>-space correctly", () => {
    var svg = generateSVG();

    var rectOrigin: Plottable.Point = {
      x: 19,
      y: 85
    };
    var rect = svg.append("rect").attr({
      x: rectOrigin.x,
      y: rectOrigin.y,
      width: 30,
      height: 30
    });

    var translator = Plottable.Utils.ClientToSVGTranslator.getTranslator(<SVGElement> svg.node());

    var rectBCR = rect.node().getBoundingClientRect();
    var computedOrigin = translator.computePosition(rectBCR.left, rectBCR.top);
    assertPointsClose(computedOrigin, rectOrigin, 0.5, "translates client coordinates to <svg> coordinates correctly");

    svg.remove();
  });
});
