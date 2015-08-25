///<reference path="../testReference.ts" />

describe("Layer Components", () => {
  describe("GuideLineLayer", () => {

    describe("Basic Usage", () => {
      it("has the \"vertical\" class if vertical, and the \"horizontal\" class if horizontal", () => {
        let verticalGLL = new Plottable.Components.GuideLineLayer<void>("vertical");
        assert.isTrue(verticalGLL.hasClass("vertical"), "vertical GuideLineLayer has \"vertical\" class");
        let horizontalGLL = new Plottable.Components.GuideLineLayer<void>("horizontal");
        assert.isTrue(horizontalGLL.hasClass("horizontal"), "horizontal GuideLineLayer has \"horizontal\" class");
      });

      it("can get and set the scale property", () => {
        let gll = new Plottable.Components.GuideLineLayer<Date>("vertical");
        let timeScale = new Plottable.Scales.Time();
        assert.isUndefined(gll.scale(), "there is no default scale");
        assert.strictEqual(gll.scale(timeScale), gll, "setter returns the calling GuideLineLayer");
        assert.strictEqual(gll.scale(), timeScale, "getter returns the set Scale");
      });

      it("can get and set the value property", () => {
        let gll = new Plottable.Components.GuideLineLayer<number>("vertical");
        let expectedValue = 5;
        assert.isUndefined(gll.value(), "returns undefined before any value is set");
        assert.strictEqual(gll.value(expectedValue), gll, "setter returns the calling GuideLineLayer");
        assert.strictEqual(gll.value(), expectedValue, "getter returns the set value");
      });

      it("can get and set the pixelPosition property", () => {
        let gll = new Plottable.Components.GuideLineLayer<void>("vertical");
        let expectedPosition = 5;
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

      it("disconnects scales safely when using destroy()", () => {
        let scaleLessGLL = new Plottable.Components.GuideLineLayer<void>("vertical");
        assert.doesNotThrow(() => scaleLessGLL.destroy(), Error, "destroy() does not error if no scale was set");
        let timeScaleGLL = new Plottable.Components.GuideLineLayer<Date>("vertical");
        let timeScale = new Plottable.Scales.Time();
        timeScaleGLL.scale(timeScale);
        assert.doesNotThrow(() => timeScaleGLL.destroy(), Error, "destroy() does not error if a scale was set");
        assert.strictEqual((<any>timeScale)._callbacks.size, 0, "callback was removed from Scale");
      });

      it("rejects invalid orientations", () => {
        assert.doesNotThrow(() => new Plottable.Components.GuideLineLayer<number>("vertical"), Error, "accepts \"vertical\"");
        assert.doesNotThrow(() => new Plottable.Components.GuideLineLayer<number>("horizontal"), Error, "accepts \"horizontal\"");
        assert.throws(() => new Plottable.Components.GuideLineLayer<number>("blargh"), Error);
      });
    });

    describe("Coordination between scale(), value(), and pixelPosition()", () => {
      let linearScale: Plottable.Scales.Linear;
      let gll: Plottable.Components.GuideLineLayer<number>;

      beforeEach(() => {
        linearScale = new Plottable.Scales.Linear();
        linearScale.domain([0, 1]);
        linearScale.range([0, 100]);
        gll = new Plottable.Components.GuideLineLayer<number>("vertical");
      });

      it("updates pixelPosition() when changing value() if scale() is set", () => {
        gll.scale(linearScale);
        let value = 0.5;
        let expectedPosition = linearScale.scale(value);
        gll.value(value);
        assert.strictEqual(gll.pixelPosition(), expectedPosition, "pixel position was updated to match the set value");

        let valueB = 0.8;
        let expectedPositionB = linearScale.scale(valueB);
        gll.value(valueB);
        assert.strictEqual(gll.pixelPosition(), expectedPositionB, "pixel position was updated when value was changed again");
      });

      it("updates value() when changing pixelPosition() if scale() is set", () => {
        gll.scale(linearScale);
        let position = 50;
        let expectedValue = linearScale.invert(position);
        gll.pixelPosition(position);
        assert.strictEqual(gll.value(), expectedValue, "value was updated to match the set pixel position");

        let positionB = 75;
        let expectedValueB = linearScale.invert(positionB);
        gll.pixelPosition(positionB);
        assert.strictEqual(gll.value(), expectedValueB, "value was updated when the position was changed again");
      });

      it("updates pixelPosition() when the scale's domain changes if value() was the last property set", () => {
        gll.scale(linearScale);
        let value = 0.5;
        gll.value(value);
        assert.strictEqual(gll.pixelPosition(), linearScale.scale(value), "pixel position matches set value");
        linearScale.domain([0, 2]);
        assert.strictEqual(gll.pixelPosition(), linearScale.scale(value), "pixel position was updated when scale updated");
      });

      it("updates value() when the scale's domain changes if pixelPosition() was the last property set", () => {
        gll.scale(linearScale);
        let pixelPosition = 50;
        gll.pixelPosition(pixelPosition);
        assert.strictEqual(gll.value(), linearScale.invert(pixelPosition), "value matches set pixel position");
        linearScale.domain([0, 2]);
        assert.strictEqual(gll.value(), linearScale.invert(pixelPosition), "value was updated when scale updated");
      });

      it("updates pixelPosition() when changing the scale if value() was the last property set", () => {
        let setPosition = -100;
        gll.pixelPosition(setPosition);
        let setValue = 0.5;
        gll.value(setValue);
        let expectedPosition = linearScale.scale(setValue);

        gll.scale(linearScale);
        assert.strictEqual(gll.pixelPosition(), expectedPosition,
          "setting the scale updates the pixel position if value() was the last thing set");
        assert.strictEqual(gll.value(), setValue, "value is not changed");
        assert.notStrictEqual(gll.pixelPosition(), setPosition, "originally-set pixel position was overridden");

        let linearScaleB = new Plottable.Scales.Linear();
        linearScaleB.domain([0, 1]);
        linearScaleB.range([0, 200]);
        let expectedPositionB = linearScaleB.scale(setValue);
        gll.scale(linearScaleB);
        assert.strictEqual(gll.pixelPosition(), expectedPositionB,
          "changing the scale updates the pixel position if value() was the last thing set");
        assert.strictEqual(gll.value(), setValue, "value is not changed");
        assert.strictEqual((<any>linearScale)._callbacks.size, 0, "callback was removed from the previous Scale");
      });

      it("updates value() when changing the scale if pixelPosition() was the last property set", () => {
        let setValue = 0.5;
        gll.value(setValue);
        let setPosition = -100;
        gll.pixelPosition(setPosition);
        let expectedValue = linearScale.invert(setPosition);

        gll.scale(linearScale);
        assert.strictEqual(gll.value(), expectedValue,
          "setting the scale updates the value if pixelPosition() was the last thing set");
        assert.strictEqual(gll.pixelPosition(), setPosition, "pixel position is not changed");
        assert.notStrictEqual(gll.value(), setValue, "originally-set value was overridden");

        let linearScaleB = new Plottable.Scales.Linear();
        linearScaleB.domain([0, 1]);
        linearScaleB.range([0, 200]);
        let expectedValueB = linearScaleB.invert(setPosition);
        gll.scale(linearScaleB);
        assert.strictEqual(gll.value(), expectedValueB,
          "changing the scale updates the value if pixelPosition() was the last thing set");
        assert.strictEqual(gll.pixelPosition(), setPosition, "pixel position is not changed");
        assert.strictEqual((<any>linearScale)._callbacks.size, 0, "callback was removed from the previous Scale");
      });
    });

    describe("Rendering (vertical)", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 300;
      let GUIDE_LINE_CLASS = "." + "guide-line";

      let svg: d3.Selection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      });

      it("requests no space, but will occupy all offered space", () => {
        let gll = new Plottable.Components.GuideLineLayer<void>("vertical");
        let request = gll.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
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
        let gll = new Plottable.Components.GuideLineLayer<void>("vertical");
        gll.renderTo(svg);
        TestMethods.verifyClipPath(gll);
        let clipRect = (<any> gll)._boxContainer.select(".clip-rect");
        assert.strictEqual(TestMethods.numAttr(clipRect, "width"), SVG_WIDTH, "the clipRect has an appropriate width");
        assert.strictEqual(TestMethods.numAttr(clipRect, "height"), SVG_HEIGHT, "the clipRect has an appropriate height");
        svg.remove();
      });

      it("renders correctly given a pixel position", () => {
        let expectedPosition1 = SVG_WIDTH / 2;
        let gll = new Plottable.Components.GuideLineLayer<number>("vertical");
        gll.pixelPosition(expectedPosition1);
        gll.renderTo(svg);

        assert.strictEqual(gll.content().selectAll(GUIDE_LINE_CLASS).size(), 1, "exactly one line is drawn");
        let line = gll.content().select(GUIDE_LINE_CLASS);
        let expectedAttrs1 = {
          x1: expectedPosition1,
          x2: expectedPosition1,
          y1: 0,
          y2: SVG_HEIGHT
        };
        TestMethods.assertLineAttrs(line, expectedAttrs1, "the line was drawn at the specified position");

        let expectedPosition2 = SVG_WIDTH * 3 / 4;
        gll.pixelPosition(expectedPosition2);
        assert.strictEqual(gll.content().selectAll(GUIDE_LINE_CLASS).size(), 1, "exactly one line is drawn");
        line = gll.content().select(GUIDE_LINE_CLASS);
        let expectedAttrs2 = {
          x1: expectedPosition2,
          x2: expectedPosition2,
          y1: 0,
          y2: SVG_HEIGHT
        };
        TestMethods.assertLineAttrs(line, expectedAttrs2, "the line was drawn at the updated position");

        svg.remove();
      });

      it("renders correctly given a value and scale", () => {
        let gll = new Plottable.Components.GuideLineLayer<number>("vertical");
        gll.renderTo(svg);
        let scale = new Plottable.Scales.Linear();
        scale.domain([0, 10]);
        gll.scale(scale);

        let value1 = 5;
        gll.value(value1);
        assert.strictEqual(gll.content().selectAll(GUIDE_LINE_CLASS).size(), 1, "exactly one line is drawn");
        let line = gll.content().select(GUIDE_LINE_CLASS);
        let expectedAttrs1 = {
          x1: scale.scale(value1),
          x2: scale.scale(value1),
          y1: 0,
          y2: SVG_HEIGHT
        };
        TestMethods.assertLineAttrs(line, expectedAttrs1, "the line was drawn at the correct position");

        let value2 = 8;
        gll.value(value2);
        assert.strictEqual(gll.content().selectAll(GUIDE_LINE_CLASS).size(), 1, "exactly one line is drawn");
        line = gll.content().select(GUIDE_LINE_CLASS);
        let expectedAttrs2 = {
          x1: scale.scale(value2),
          x2: scale.scale(value2),
          y1: 0,
          y2: SVG_HEIGHT
        };
        TestMethods.assertLineAttrs(line, expectedAttrs2, "the line was redrawn at the new position when the value was changed");

        svg.remove();
      });

      it("re-renders correctly when the scale is updated", () => {
        let gll = new Plottable.Components.GuideLineLayer<number>("vertical");
        let value = 5;
        gll.value(value);
        gll.renderTo(svg);

        let scale1 = new Plottable.Scales.Linear();
        scale1.domain([0, 10]);
        gll.scale(scale1);
        let line = gll.content().select(GUIDE_LINE_CLASS);
        let expectedAttrs1 = {
          x1: scale1.scale(value),
          x2: scale1.scale(value),
          y1: 0,
          y2: SVG_HEIGHT
        };
        TestMethods.assertLineAttrs(line, expectedAttrs1, "the line was drawn at the correct position");

        scale1.domain([0, 20]);
        let expectedAttrs1b = {
          x1: scale1.scale(value),
          x2: scale1.scale(value),
          y1: 0,
          y2: SVG_HEIGHT
        };
        TestMethods.assertLineAttrs(line, expectedAttrs1b, "the line was redrawn at the correct position on domain change");

        let scale2 = new Plottable.Scales.Linear();
        scale2.domain([0, 100]);
        gll.scale(scale2);
        line = gll.content().select(GUIDE_LINE_CLASS);
        let expectedAttrs2 = {
          x1: scale2.scale(value),
          x2: scale2.scale(value),
          y1: 0,
          y2: SVG_HEIGHT
        };
        TestMethods.assertLineAttrs(line, expectedAttrs2, "the line was redrawn at the new position when the scale was changed");

        svg.remove();
      });

      it("sets the scale's range based on the allocated width", () => {
        let gll = new Plottable.Components.GuideLineLayer<number>("vertical");
        let scale1 = new Plottable.Scales.Linear();
        gll.scale(scale1);
        gll.renderTo(svg);
        assert.deepEqual(gll.scale().range(), [0, SVG_WIDTH], "range was set based on the allocated width");

        let scale2 = new Plottable.Scales.Linear();
        gll.scale(scale2);
        assert.deepEqual(gll.scale().range(), [0, SVG_WIDTH], "replacement scale has its range set based on the allocated width");

        svg.remove();
      });
    });

    describe("Rendering (horizontal)", () => {
      let SVG_WIDTH = 300;
      let SVG_HEIGHT = 400;
      let GUIDE_LINE_CLASS = "." + "guide-line";

      let svg: d3.Selection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      });

      it("requests no space, but will occupy all offered space", () => {
        let gll = new Plottable.Components.GuideLineLayer<void>("horizontal");
        let request = gll.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
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
        let gll = new Plottable.Components.GuideLineLayer<void>("horizontal");
        gll.renderTo(svg);
        TestMethods.verifyClipPath(gll);
        let clipRect = (<any> gll)._boxContainer.select(".clip-rect");
        assert.strictEqual(TestMethods.numAttr(clipRect, "width"), SVG_WIDTH, "the clipRect has an appropriate width");
        assert.strictEqual(TestMethods.numAttr(clipRect, "height"), SVG_HEIGHT, "the clipRect has an appropriate height");
        svg.remove();
      });

      it("renders correctly given a pixel position", () => {
        let expectedPosition1 = SVG_WIDTH / 2;
        let gll = new Plottable.Components.GuideLineLayer<number>("horizontal");
        gll.pixelPosition(expectedPosition1);
        gll.renderTo(svg);

        assert.strictEqual(gll.content().selectAll(GUIDE_LINE_CLASS).size(), 1, "exactly one line is drawn");
        let line = gll.content().select(GUIDE_LINE_CLASS);
        let expectedAttrs1 = {
          x1: 0,
          x2: SVG_WIDTH,
          y1: expectedPosition1,
          y2: expectedPosition1
        };
        TestMethods.assertLineAttrs(line, expectedAttrs1, "the line was drawn at the specified position");

        let expectedPosition2 = SVG_WIDTH * 3 / 4;
        gll.pixelPosition(expectedPosition2);
        assert.strictEqual(gll.content().selectAll(GUIDE_LINE_CLASS).size(), 1, "exactly one line is drawn");
        line = gll.content().select(GUIDE_LINE_CLASS);
        let expectedAttrs2 = {
          x1: 0,
          x2: SVG_WIDTH,
          y1: expectedPosition2,
          y2: expectedPosition2
        };
        TestMethods.assertLineAttrs(line, expectedAttrs2, "the line was drawn at the updated position");

        svg.remove();
      });

      it("renders correctly given a value and scale", () => {
        let gll = new Plottable.Components.GuideLineLayer<number>("horizontal");
        gll.renderTo(svg);
        let scale = new Plottable.Scales.Linear();
        scale.domain([0, 10]);
        gll.scale(scale);

        let value1 = 5;
        gll.value(value1);
        assert.strictEqual(gll.content().selectAll(GUIDE_LINE_CLASS).size(), 1, "exactly one line is drawn");
        let line = gll.content().select(GUIDE_LINE_CLASS);
        let expectedAttrs1 = {
          x1: 0,
          x2: SVG_WIDTH,
          y1: scale.scale(value1),
          y2: scale.scale(value1)
        };
        TestMethods.assertLineAttrs(line, expectedAttrs1, "the line was drawn at the correct position");

        let value2 = 8;
        gll.value(value2);
        assert.strictEqual(gll.content().selectAll(GUIDE_LINE_CLASS).size(), 1, "exactly one line is drawn");
        line = gll.content().select(GUIDE_LINE_CLASS);
        let expectedAttrs2 = {
          x1: 0,
          x2: SVG_WIDTH,
          y1: scale.scale(value2),
          y2: scale.scale(value2)
        };
        TestMethods.assertLineAttrs(line, expectedAttrs2, "the line was redrawn at the new position when the value was changed");

        svg.remove();
      });

      it("re-renders correctly when the scale is updated", () => {
        let gll = new Plottable.Components.GuideLineLayer<number>("horizontal");
        let value = 5;
        gll.value(value);
        gll.renderTo(svg);

        let scale1 = new Plottable.Scales.Linear();
        scale1.domain([0, 10]);
        gll.scale(scale1);
        let line = gll.content().select(GUIDE_LINE_CLASS);
        let expectedAttrs1 = {
          x1: 0,
          x2: SVG_WIDTH,
          y1: scale1.scale(value),
          y2: scale1.scale(value)
        };
        TestMethods.assertLineAttrs(line, expectedAttrs1, "the line was drawn at the correct position");

        scale1.domain([0, 20]);
        let expectedAttrs1b = {
          x1: 0,
          x2: SVG_WIDTH,
          y1: scale1.scale(value),
          y2: scale1.scale(value)
        };
        TestMethods.assertLineAttrs(line, expectedAttrs1b, "the line was redrawn at the correct position on domain change");

        let scale2 = new Plottable.Scales.Linear();
        scale2.domain([0, 100]);
        gll.scale(scale2);
        line = gll.content().select(GUIDE_LINE_CLASS);
        let expectedAttrs2 = {
          x1: 0,
          x2: SVG_WIDTH,
          y1: scale2.scale(value),
          y2: scale2.scale(value)
        };
        TestMethods.assertLineAttrs(line, expectedAttrs2, "the line was redrawn at the new position when the scale was changed");

        svg.remove();
      });

      it("sets the scale's range based on the allocated height", () => {
        let gll = new Plottable.Components.GuideLineLayer<number>("horizontal");
        let scale1 = new Plottable.Scales.Linear();
        gll.scale(scale1);
        gll.renderTo(svg);
        assert.deepEqual(gll.scale().range(), [SVG_HEIGHT, 0], "range was set based on the allocated height");

        let scale2 = new Plottable.Scales.Linear();
        gll.scale(scale2);
        assert.deepEqual(gll.scale().range(), [SVG_HEIGHT, 0], "replacement scale has its range set based on the allocated height");

        svg.remove();
      });
    });
  });
});
