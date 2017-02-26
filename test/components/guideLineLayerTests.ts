import { SimpleSelection } from "../../src/core/interfaces";
import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("GuideLineLayer", () => {
  describe("Basic Usage", () => {
    it("has the \"vertical\" class if vertical, and the \"horizontal\" class if horizontal", () => {
      const verticalGLL = new Plottable.Components.GuideLineLayer<void>("vertical");
      assert.isTrue(verticalGLL.hasClass("vertical"), "vertical GuideLineLayer has \"vertical\" class");
      const horizontalGLL = new Plottable.Components.GuideLineLayer<void>("horizontal");
      assert.isTrue(horizontalGLL.hasClass("horizontal"), "horizontal GuideLineLayer has \"horizontal\" class");
    });

    it("can get and set the scale property", () => {
      const gll = new Plottable.Components.GuideLineLayer<Date>("vertical");
      const timeScale = new Plottable.Scales.Time();
      assert.isUndefined(gll.scale(), "there is no default scale");
      assert.strictEqual(gll.scale(timeScale), gll, "setter returns the calling GuideLineLayer");
      assert.strictEqual(gll.scale(), timeScale, "getter returns the set Scale");
    });

    it("can get and set the value property", () => {
      const gll = new Plottable.Components.GuideLineLayer<number>("vertical");
      const expectedValue = 5;
      assert.isUndefined(gll.value(), "returns undefined before any value is set");
      assert.strictEqual(gll.value(expectedValue), gll, "setter returns the calling GuideLineLayer");
      assert.strictEqual(gll.value(), expectedValue, "getter returns the set value");
    });

    it("can get and set the pixelPosition property", () => {
      const gll = new Plottable.Components.GuideLineLayer<void>("vertical");
      const expectedPosition = 5;
      assert.isUndefined(gll.pixelPosition(), "returns undefined before any pixel position is set");
      assert.strictEqual(gll.pixelPosition(expectedPosition), gll, "setter returns the calling GuideLineLayer");
      assert.strictEqual(gll.pixelPosition(), expectedPosition, "getter returns the set pixel position");
      // HACKHACK #2614: chai-assert.d.ts has the wrong signature
      (<any> assert).throws(() => gll.pixelPosition(NaN), Error,
        "pixelPosition must be a finite number", "Rejects NaN");
      (<any> assert).throws(() => gll.pixelPosition(Infinity), Error,
        "pixelPosition must be a finite number", "Rejects Infinity");
      (<any> assert).throws(() => gll.pixelPosition(-Infinity), Error,
        "pixelPosition must be a finite number", "Rejects -Infinity");
      (<any> assert).throws(() => gll.pixelPosition(<any> "5"), Error,
        "pixelPosition must be a finite number", "Rejects stringy numbers");
    });

    it("disconnects scales safely on destroy", () => {
      const scaleLessGLL = new Plottable.Components.GuideLineLayer<void>("vertical");
      assert.doesNotThrow(() => scaleLessGLL.destroy(), Error, "destroy() does not error if no scale was set");
      const timeScaleGLL = new Plottable.Components.GuideLineLayer<Date>("vertical");
      const timeScale = new Plottable.Scales.Time();
      timeScaleGLL.scale(timeScale);
      assert.doesNotThrow(() => timeScaleGLL.destroy(), Error, "destroy() does not error if a scale was set");
      assert.strictEqual((<any>timeScale)._callbacks.size, 0, "callback was removed from Scale");
    });

    it("rejects invalid orientations", () => {
      assert.doesNotThrow(() => new Plottable.Components.GuideLineLayer<number>("vertical"), Error, "accepts \"vertical\"");
      assert.doesNotThrow(() => new Plottable.Components.GuideLineLayer<number>("horizontal"), Error, "accepts \"horizontal\"");
      (<any> assert).throws(() => new Plottable.Components.GuideLineLayer<number>("blargh"), Error,
        "blargh is not a valid orientation for GuideLineLayer", "throws error on invalid orientation");
    });
  });

  describe("Coordination between scale, value, and pixelPosition", () => {
    let linearScale: Plottable.Scales.Linear;
    let gll: Plottable.Components.GuideLineLayer<number>;

    beforeEach(() => {
      linearScale = new Plottable.Scales.Linear();
      linearScale.domain([0, 1]);
      linearScale.range([0, 100]);
      gll = new Plottable.Components.GuideLineLayer<number>("vertical");
    });

    it("updates pixelPosition when changing value if scale is set", () => {
      gll.scale(linearScale);
      const value = 0.5;
      const expectedPosition = linearScale.scale(value);
      gll.value(value);
      assert.strictEqual(gll.pixelPosition(), expectedPosition, "pixel position was updated to match the set value");

      const valueB = 0.8;
      const expectedPositionB = linearScale.scale(valueB);
      gll.value(valueB);
      assert.strictEqual(gll.pixelPosition(), expectedPositionB, "pixel position was updated when value was changed again");
    });

    it("updates value when changing pixelPosition if scale is set", () => {
      gll.scale(linearScale);
      const position = 50;
      const expectedValue = linearScale.invert(position);
      gll.pixelPosition(position);
      assert.strictEqual(gll.value(), expectedValue, "value was updated to match the set pixel position");

      const positionB = 75;
      const expectedValueB = linearScale.invert(positionB);
      gll.pixelPosition(positionB);
      assert.strictEqual(gll.value(), expectedValueB, "value was updated when the position was changed again");
    });

    it("updates pixelPosition when the scale's domain changes if value was the last property set", () => {
      gll.scale(linearScale);
      const value = 0.5;
      gll.value(value);
      assert.strictEqual(gll.pixelPosition(), linearScale.scale(value), "pixel position matches set value");
      linearScale.domain([0, 2]);
      assert.strictEqual(gll.pixelPosition(), linearScale.scale(value), "pixel position was updated when scale updated");
    });

    it("updates value when the scale's domain changes if pixelPosition was the last property set", () => {
      gll.scale(linearScale);
      const pixelPosition = 50;
      gll.pixelPosition(pixelPosition);
      assert.strictEqual(gll.value(), linearScale.invert(pixelPosition), "value matches set pixel position");
      linearScale.domain([0, 2]);
      assert.strictEqual(gll.value(), linearScale.invert(pixelPosition), "value was updated when scale updated");
    });

    it("updates pixelPosition when changing the scale if value was the last property set", () => {
      const setPosition = -100;
      gll.pixelPosition(setPosition);
      const setValue = 0.5;
      gll.value(setValue);
      const expectedPosition = linearScale.scale(setValue);

      gll.scale(linearScale);
      assert.strictEqual(gll.pixelPosition(), expectedPosition,
        "setting the scale updates the pixel position if value() was the last thing set");
      assert.strictEqual(gll.value(), setValue, "value is not changed");
      assert.notStrictEqual(gll.pixelPosition(), setPosition, "originally-set pixel position was overridden");

      const linearScaleB = new Plottable.Scales.Linear();
      linearScaleB.domain([0, 1]);
      linearScaleB.range([0, 200]);
      const expectedPositionB = linearScaleB.scale(setValue);
      gll.scale(linearScaleB);
      assert.strictEqual(gll.pixelPosition(), expectedPositionB,
        "changing the scale updates the pixel position if value() was the last thing set");
      assert.strictEqual(gll.value(), setValue, "value is not changed");
      assert.strictEqual((<any>linearScale)._callbacks.size, 0, "callback was removed from the previous Scale");
    });

    it("updates value when changing the scale if pixelPosition was the last property set", () => {
      const setValue = 0.5;
      gll.value(setValue);
      const setPosition = -100;
      gll.pixelPosition(setPosition);
      const expectedValue = linearScale.invert(setPosition);

      gll.scale(linearScale);
      assert.strictEqual(gll.value(), expectedValue,
        "setting the scale updates the value if pixelPosition() was the last thing set");
      assert.strictEqual(gll.pixelPosition(), setPosition, "pixel position is not changed");
      assert.notStrictEqual(gll.value(), setValue, "originally-set value was overridden");

      const linearScaleB = new Plottable.Scales.Linear();
      linearScaleB.domain([0, 1]);
      linearScaleB.range([0, 200]);
      const expectedValueB = linearScaleB.invert(setPosition);
      gll.scale(linearScaleB);
      assert.strictEqual(gll.value(), expectedValueB,
        "changing the scale updates the value if pixelPosition() was the last thing set");
      assert.strictEqual(gll.pixelPosition(), setPosition, "pixel position is not changed");
      assert.strictEqual((<any>linearScale)._callbacks.size, 0, "callback was removed from the previous Scale");
    });
  });

  ["vertical", "horizontal"].forEach((orientation: string) => {
    describe(`Rendering ${orientation} guide line`, () => {
      const SVG_WIDTH = orientation === "vertical" ? 400 : 300;
      const SVG_HEIGHT = orientation === "vertical" ? 300 : 400;
      const GUIDE_LINE_CLASS = ".guide-line";

      let svg: SimpleSelection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      });

      function getExpectedAttr(value: number) {
        return {
          x1: orientation === "vertical" ? value : 0,
          x2: orientation === "vertical" ? value : SVG_WIDTH,
          y1: orientation === "vertical" ? 0 : value,
          y2: orientation === "vertical" ? SVG_HEIGHT : value,
        };
      }
      it("requests no space, but will occupy all offered space", () => {
        const gll = new Plottable.Components.GuideLineLayer<void>(orientation);
        const request = gll.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
        TestMethods.verifySpaceRequest(request, 0, 0, "does not request any space");
        assert.isTrue(gll.fixedWidth(), "fixed width");
        assert.isTrue(gll.fixedHeight(), "fixed height");

        gll.anchor(svg);
        gll.computeLayout({x: 0, y: 0}, SVG_WIDTH, SVG_HEIGHT);
        assert.strictEqual(gll.width(), SVG_WIDTH, "accepted all offered width");
        assert.strictEqual(gll.height(), SVG_HEIGHT, "accepted all offered height");
        svg.remove();
      });

      it("generates the correct clipPath", () => {
        const gll = new Plottable.Components.GuideLineLayer<void>(orientation);
        gll.renderTo(svg);
        TestMethods.verifyClipPath(gll);
        const clipRect = (<any> gll)._boxContainer.select(".clip-rect");
        assert.strictEqual(TestMethods.numAttr(clipRect, "width"), SVG_WIDTH, "the clipRect has an appropriate width");
        assert.strictEqual(TestMethods.numAttr(clipRect, "height"), SVG_HEIGHT, "the clipRect has an appropriate height");
        svg.remove();
      });

      it("renders correctly given a pixel position", () => {
        const range = (orientation === "vertical" ? SVG_WIDTH : SVG_HEIGHT);
        const expectedPosition1 = range / 2;
        const gll = new Plottable.Components.GuideLineLayer<number>(orientation);
        gll.pixelPosition(expectedPosition1);
        gll.renderTo(svg);

        assert.strictEqual(gll.content().selectAll<Element, any>(GUIDE_LINE_CLASS).size(), 1, "exactly one line is drawn");
        const line = gll.content().select(GUIDE_LINE_CLASS);
        const expectedAttrs1 = getExpectedAttr(expectedPosition1);
        TestMethods.assertLineAttrs(line, expectedAttrs1, "the line was drawn at the specified position");

        const expectedPosition2 = range * 3 / 4;
        gll.pixelPosition(expectedPosition2);
        assert.strictEqual(gll.content().selectAll<Element, any>(GUIDE_LINE_CLASS).size(), 1, "exactly one line is drawn");
        const line2 = gll.content().select(GUIDE_LINE_CLASS);
        const expectedAttrs2 = getExpectedAttr(expectedPosition2);
        TestMethods.assertLineAttrs(line2, expectedAttrs2, "the line was drawn at the updated position");

        svg.remove();
      });

      it("renders correctly given a value and scale", () => {
        const gll = new Plottable.Components.GuideLineLayer<number>(orientation);
        gll.renderTo(svg);
        const scale = new Plottable.Scales.Linear();
        scale.domain([0, 10]);
        gll.scale(scale);

        const value1 = 5;
        gll.value(value1);
        assert.strictEqual(gll.content().selectAll<Element, any>(GUIDE_LINE_CLASS).size(), 1, "exactly one line is drawn");
        const line = gll.content().select(GUIDE_LINE_CLASS);
        const expectedAttrs1 = getExpectedAttr(scale.scale(value1));
        TestMethods.assertLineAttrs(line, expectedAttrs1, "the line was drawn at the correct position");

        const value2 = 8;
        gll.value(value2);
        assert.strictEqual(gll.content().selectAll<Element, any>(GUIDE_LINE_CLASS).size(), 1, "exactly one line is drawn");
        const line2 = gll.content().select(GUIDE_LINE_CLASS);
        const expectedAttrs2 = getExpectedAttr(scale.scale(value2));
        TestMethods.assertLineAttrs(line2, expectedAttrs2, "the line was redrawn at the new position when the value was changed");

        svg.remove();
      });

      it("re-renders correctly when the scale is updated", () => {
        const gll = new Plottable.Components.GuideLineLayer<number>(orientation);
        const value = 5;
        gll.value(value);
        gll.renderTo(svg);

        const scale1 = new Plottable.Scales.Linear();
        scale1.domain([0, 10]);
        gll.scale(scale1);
        const line = gll.content().select(GUIDE_LINE_CLASS);
        const expectedAttrs1 = getExpectedAttr(scale1.scale(value));
        TestMethods.assertLineAttrs(line, expectedAttrs1, "the line was drawn at the correct position");

        scale1.domain([0, 20]);
        const expectedAttrs1b = getExpectedAttr(scale1.scale(value));
        TestMethods.assertLineAttrs(line, expectedAttrs1b, "the line was redrawn at the correct position on domain change");

        const scale2 = new Plottable.Scales.Linear();
        scale2.domain([0, 100]);
        gll.scale(scale2);
        const line2 = gll.content().select(GUIDE_LINE_CLASS);
        const expectedAttrs2 = getExpectedAttr(scale2.scale(value));
        TestMethods.assertLineAttrs(line2, expectedAttrs2, "the line was redrawn at the new position when the scale was changed");

        svg.remove();
      });

      it(`sets the scale's range based on the allocated ${orientation === "vertical" ? "width" : "height"}`, () => {
        const gll = new Plottable.Components.GuideLineLayer<number>(orientation);
        const scale1 = new Plottable.Scales.Linear();
        const expectedRange = orientation === "vertical" ? [0, SVG_WIDTH] : [SVG_HEIGHT, 0];
        gll.scale(scale1);
        gll.renderTo(svg);
        assert.deepEqual(gll.scale().range(), expectedRange, "range was set based on the allocated space");

        const scale2 = new Plottable.Scales.Linear();
        gll.scale(scale2);
        assert.deepEqual(gll.scale().range(), expectedRange, "replacement scale has its range set based on the allocated space");

        svg.remove();
      });
    });
  });
});
