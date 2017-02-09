import * as d3 from "d3";
import * as sinon from "sinon";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("ClientToSVGTranslator", () => {
  it("getTranslator() creates only one ClientToSVGTranslator per <svg>", () => {
    let svg = TestMethods.generateSVG();
    const component = new Plottable.Component();
    sinon.stub(component, "element", () => svg);

    let t1 = Plottable.Utils.ClientToSVGTranslator.getTranslator(component);
    assert.isNotNull(t1, "created a new ClientToSVGTranslator on a <svg>");
    let t2 = Plottable.Utils.ClientToSVGTranslator.getTranslator(component);
    assert.strictEqual(t1, t2, "returned the existing ClientToSVGTranslator if called again with same <svg>");

    svg.remove();
  });

  it("converts points to <svg>-space correctly", () => {
    let svg = TestMethods.generateSVG();
    const component = new Plottable.Component();
    sinon.stub(component, "element", () => svg);

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

    let translator = Plottable.Utils.ClientToSVGTranslator.getTranslator(component);

    let rectBCR = (<Element> rect.node()).getBoundingClientRect();
    let computedOrigin = translator.computePosition(rectBCR.left, rectBCR.top);
    TestMethods.assertPointsClose(computedOrigin, rectOrigin, 0.5, "translates client coordinates to <svg> coordinates correctly");

    svg.remove();
  });
});
