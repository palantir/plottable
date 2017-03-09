import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Animators", () => {
  describe("Null Animator", () => {
    it("has a total animation time of zero", () => {
      const animator = new Plottable.Animators.Null();
      assert.strictEqual(animator.totalTime(null), 0);
    });

    it("applies the requested attributes to the selection", () => {
      const attributeName = "foo";
      const attributeValues = ["A", "B", "C"];
      const attributeProjector = (d: any, i: number) => attributeValues[i];
      const attrToAppliedProjector: Plottable.AttributeToAppliedProjector = {};
      attrToAppliedProjector[attributeName] = attributeProjector;

      const div = TestMethods.generateDiv();
      const elementName = "g";
      attributeValues.forEach(() => div.append(elementName));
      const elements = div.selectAll<SVGGElement, any>(elementName);

      const animator = new Plottable.Animators.Null();
      animator.animate(elements, attrToAppliedProjector);

      elements.each(function(d, i) {
        const actualAttribute = d3.select(this).attr(attributeName);
        const expectedAttribute = attributeProjector(d, i);
        assert.strictEqual(actualAttribute, expectedAttribute, `set the correct attribute on element with index ${i}`);
      });

      div.remove();
    });
  });
});
