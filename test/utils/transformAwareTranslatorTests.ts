import * as sinon from "sinon";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Translator", () => {
    it("getTranslator() creates only one Translator per Component", () => {
        const svg = TestMethods.generateSVG();
        const component = new Plottable.Component();
        sinon.stub(component, "element").returns(svg);

        const t1 = Plottable.Utils.getTranslator(component);
        assert.isNotNull(t1, "created a new Translator on a Component");
        const t2 = Plottable.Utils.getTranslator(component);
        assert.strictEqual(t1, t2, "returned the existing Translator if called again with same Component");

        svg.remove();
    });

    it("converts points to Component space correctly", () => {
        const svg = TestMethods.generateSVG();
        const component = new Plottable.Component();
        sinon.stub(component, "element").returns(svg);

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

        const svgBCR = svg.node().getBoundingClientRect();
        const rectBCR = (rect.node() as Element).getBoundingClientRect();
        // translator returns position relative to component origin
        const computedOrigin = translator.computePosition(rectBCR.left - svgBCR.left, rectBCR.top - svgBCR.top);
        TestMethods.assertPointsClose(computedOrigin, rectOrigin, 0.5, "translates client coordinates to <svg> coordinates correctly");

        svg.remove();
    });
});
