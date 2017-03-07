import * as d3 from "d3";
import * as sinon from "sinon";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Translator", () => {
it("getTranslator() creates only one Translator per html root", () => {
    let div = TestMethods.generateDiv();
    const component = new Plottable.Component();
    sinon.stub(component, "rootElement", () => div);

    let t1 = Plottable.Utils.getTranslator(component);
    assert.isNotNull(t1, "created a new Translator on a <svg>");
    let t2 = Plottable.Utils.getTranslator(component);
    assert.strictEqual(t1, t2, "returned the existing Translator if called again with same <svg>");

    div.remove();
  });

  it("converts points to html-space correctly", () => {
    let div = TestMethods.generateDiv();
    div.style("position", "relative");
    const component = new Plottable.Component();
    sinon.stub(component, "rootElement", () => div);

    let divOrigin: Plottable.Point = {
      x: 19,
      y: 85,
    };
    let rect = div.append("div").styles({
      left: `${divOrigin.x}px`,
      position: "absolute",
      top: `${divOrigin.y}px`,
      width: "30px",
      height: "30px",
    });

    let translator = Plottable.Utils.getTranslator(component);

    let boundingClientRect = (<Element> rect.node()).getBoundingClientRect();
    let computedOrigin = translator.computePosition(boundingClientRect.left, boundingClientRect.top);
    TestMethods.assertPointsClose(computedOrigin, divOrigin, 0.5, "translates client coordinates to <svg> coordinates correctly");

    div.remove();
  });

  it("getTranslator() creates only one Translator per <svg>", () => {
    let div = TestMethods.generateDiv();
    const component = new Plottable.Component();
    sinon.stub(component, "rootElement", () => div);

    let t1 = Plottable.Utils.getTranslator(component);
    assert.isNotNull(t1, "created a new Translator on a <svg>");
    let t2 = Plottable.Utils.getTranslator(component);
    assert.strictEqual(t1, t2, "returned the existing Translator if called again with same <svg>");

    div.remove();
  });

  it("converts points to <svg>-space correctly", () => {
    let svg = TestMethods.generateSVG();
    const component = new Plottable.Component();
    sinon.stub(component, "rootElement", () => svg);

    let rectOrigin: Plottable.Point = {
      x: 19,
      y: 85,
    };
    let rect = svg.append("rect").attrs({
      x: rectOrigin.x,
      y: rectOrigin.y,
      width: 30,
      height: 30,
    });

    let translator = Plottable.Utils.getTranslator(component);

    let rectBCR = (<Element> rect.node()).getBoundingClientRect();
    let computedOrigin = translator.computePosition(rectBCR.left, rectBCR.top);
    TestMethods.assertPointsClose(computedOrigin, rectOrigin, 0.5, "translates client coordinates to <svg> coordinates correctly");

    svg.remove();
  });
});
