import * as sinon from "sinon";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Translator", () => {
    it("getTranslator() creates only one Translator per Component", () => {
        const div = TestMethods.generateDiv();
        const component = new Plottable.Component();

        const t1 = Plottable.Utils.getTranslator(component);
        assert.isNotNull(t1, "created a new Translator on a Component");
        const t2 = Plottable.Utils.getTranslator(component);
        assert.strictEqual(t1, t2, "returned the existing Translator if called again with same Component");

        div.remove();
      });

    it("converts points to html-space correctly", () => {
        const div = TestMethods.generateDiv();
        div.style("position", "relative");
        const component = new Plottable.Component();
        sinon.stub(component, "rootElement").returns(div);

        const divOrigin: Plottable.Point = {
          x: 19,
          y: 85,
        };
        const rect = div.append("div").styles({
          left: `${divOrigin.x}px`,
          position: "absolute",
          top: `${divOrigin.y}px`,
          width: "30px",
          height: "30px",
        });

        const translator = Plottable.Utils.getTranslator(component);

        const boundingClientRect = (<Element> rect.node()).getBoundingClientRect();
        const computedOrigin = translator.computePosition(boundingClientRect.left, boundingClientRect.top);
        TestMethods.assertPointsClose(computedOrigin, divOrigin, 0.5, "translates client coordinates to <svg> coordinates correctly");

        div.remove();
      });

    it("converts points to <svg>-space correctly", () => {
        const svg = TestMethods.generateSVG();
        const component = new Plottable.Component();
        sinon.stub(component, "rootElement").returns(svg);

        const rectOrigin: Plottable.Point = {
          x: 19,
          y: 85,
        };
        const rect = svg.append("rect").attrs({
          x: rectOrigin.x,
          y: rectOrigin.y,
          width: 30,
          height: 30,
        });

        const translator = Plottable.Utils.getTranslator(component);

        const rectBCR = (<Element> rect.node()).getBoundingClientRect();
        const computedOrigin = translator.computePosition(rectBCR.left, rectBCR.top);
        TestMethods.assertPointsClose(computedOrigin, rectOrigin, 0.5, "translates client coordinates to <svg> coordinates correctly");

        svg.remove();
    });
});
