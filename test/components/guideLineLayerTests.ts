///<reference path="../testReference.ts" />

describe("GuideLineLayer", () => {
  it("scale()", () => {
    let gll = new Plottable.Components.GuideLineLayer<Date>("vertical");
    let timeScale = new Plottable.Scales.Time();
    assert.strictEqual(gll.scale(timeScale), gll, "setter returns the calling GuideLineLayer");
    assert.strictEqual(gll.scale(), timeScale, "getter returns the set Scale");
  });

  it("value()", () => {
    let gll = new Plottable.Components.GuideLineLayer<number>("vertical");
    let expectedValue = 5;
    assert.isUndefined(gll.value(), "returns undefined before any value is set");
    assert.strictEqual(gll.value(expectedValue), gll, "setter returns the calling GuideLineLayer");
    assert.strictEqual(gll.value(), expectedValue, "getter returns the set value");
  });

  it("pixelPosition()", () => {
    let gll = new Plottable.Components.GuideLineLayer<number>("vertical");
    let expectedPosition = 5;
    assert.isUndefined(gll.pixelPosition(), "returns undefined before any pixel position is set");
    assert.strictEqual(gll.pixelPosition(expectedPosition), gll, "setter returns the calling GuideLineLayer");
    assert.strictEqual(gll.pixelPosition(), expectedPosition, "getter returns the set pixel position");
  });

  describe("coordination between scale(), value(), and pixelPosition()", () => {
    it("changing value() updates pixelPosition()", () => {
      let linearScale = new Plottable.Scales.Linear();
      linearScale.domain([0, 1]);
      linearScale.range([0, 100]);
      let gll = new Plottable.Components.GuideLineLayer<number>("vertical");
      gll.scale(linearScale);
      let value = 0.5;
      let expectedPosition = linearScale.scale(value);
      gll.value(value);
      assert.strictEqual(gll.pixelPosition(), expectedPosition, "pixel position was updated to match the set value");
    });

    it("changing pixelPosition() updates value()", () => {
      let linearScale = new Plottable.Scales.Linear();
      linearScale.domain([0, 1]);
      linearScale.range([0, 100]);
      let gll = new Plottable.Components.GuideLineLayer<number>("vertical");
      gll.scale(linearScale);
      let position = 50;
      let expectedValue = linearScale.invert(position);
      gll.pixelPosition(position);
      assert.strictEqual(gll.value(), expectedValue, "value was updated to match the set pixel position");
    });

    it("updating the scale's domain updates pixelPosition() to match the existing value()", () => {
      let linearScale = new Plottable.Scales.Linear();
      linearScale.domain([0, 1]);
      linearScale.range([0, 100]);
      let gll = new Plottable.Components.GuideLineLayer<number>("vertical");
      gll.scale(linearScale);
      let value = 0.5;
      gll.value(value);
      assert.strictEqual(gll.pixelPosition(), linearScale.scale(value), "pixel position matches set value");
      linearScale.domain([0, 2]);
      assert.strictEqual(gll.pixelPosition(), linearScale.scale(value), "pixel position was updated when scale updated");
    });

    it("changing the scale updates pixelPosition() to match the existing value()", () => {
      let linearScale = new Plottable.Scales.Linear();
      linearScale.domain([0, 1]);
      linearScale.range([0, 100]);

      let gll = new Plottable.Components.GuideLineLayer<number>("vertical");
      let value = 0.5;
      gll.value(value);
      let expectedPosition = linearScale.scale(value);
      gll.scale(linearScale);
      assert.strictEqual(gll.pixelPosition(), expectedPosition, "setting the scale updates the pixel position");

      let linearScaleB = new Plottable.Scales.Linear();
      linearScaleB.domain([0, 1]);
      linearScaleB.range([0, 200]);
      let expectedPositionB = linearScaleB.scale(value);
      gll.scale(linearScaleB);
      assert.strictEqual(gll.pixelPosition(), expectedPositionB, "changing the scale updates the pixel position");

      linearScaleB.range([0, 400]); // range changes are non-updating
      assert.strictEqual(gll.pixelPosition(), expectedPositionB, "range() updates don't normally affect GuideLineLayer");
      linearScale.domain([0, 2]);
      assert.strictEqual(gll.pixelPosition(), expectedPositionB, "changing the old scale does not trigger updates");
    });
  });

  it("rejects invalid orientations", () => {
    assert.doesNotThrow(() => new Plottable.Components.GuideLineLayer<number>("vertical"), Error, "accepts \"vertical\"");
    assert.doesNotThrow(() => new Plottable.Components.GuideLineLayer<number>("horizontal"), Error, "accepts \"horizontal\"");
    assert.throws(() => new Plottable.Components.GuideLineLayer<number>("blargh"), Error);
  });

  it("has fixed height if vertical, fixed width if horizontal", () => {
    let verticalGLL = new Plottable.Components.GuideLineLayer<number>("vertical");
    assert.strictEqual(verticalGLL.fixedHeight(), true, "fixed height if vertical");
    let horizontalGLL = new Plottable.Components.GuideLineLayer<number>("horizontal");
    assert.strictEqual(horizontalGLL.fixedWidth(), true, "fixed width if horizontal");
  });

  describe("rendering (vertical)", () => {
    let SVG_WIDTH = 400;
    let SVG_HEIGHT = 400;

    it("renders correctly given a pixel position", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let expectedPosition1 = SVG_WIDTH / 2;
      let gll = new Plottable.Components.GuideLineLayer<number>("vertical");
      gll.pixelPosition(expectedPosition1);
      gll.renderTo(svg);

      assert.strictEqual(gll.content().selectAll("line").size(), 1, "exactly one line is drawn");
      let line = gll.content().select("line");
      let expectedAttrs1 = {
        x1: expectedPosition1,
        x2: expectedPosition1,
        y1: 0,
        y2: SVG_HEIGHT
      };
      TestMethods.assertLineAttrs(line, expectedAttrs1, "the line was drawn at the specified position");

      let expectedPosition2 = SVG_WIDTH * 3 / 4;
      gll.pixelPosition(expectedPosition2);
      assert.strictEqual(gll.content().selectAll("line").size(), 1, "exactly one line is drawn");
      line = gll.content().select("line");
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
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let gll = new Plottable.Components.GuideLineLayer<number>("vertical");
      gll.renderTo(svg);
      let scale = new Plottable.Scales.Linear();
      scale.domain([0, 10]);
      gll.scale(scale);

      let value1 = 5;
      gll.value(value1);
      assert.strictEqual(gll.content().selectAll("line").size(), 1, "exactly one line is drawn");
      let line = gll.content().select("line");
      let expectedAttrs1 = {
        x1: scale.scale(value1),
        x2: scale.scale(value1),
        y1: 0,
        y2: SVG_HEIGHT
      };
      TestMethods.assertLineAttrs(line, expectedAttrs1, "the line was drawn at the correct position");

      let value2 = 8;
      gll.value(value2);
      assert.strictEqual(gll.content().selectAll("line").size(), 1, "exactly one line is drawn");
      line = gll.content().select("line");
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
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let gll = new Plottable.Components.GuideLineLayer<number>("vertical");
      let value = 5;
      gll.value(value);
      gll.renderTo(svg);

      let scale1 = new Plottable.Scales.Linear();
      scale1.domain([0, 10]);
      gll.scale(scale1);
      let line = gll.content().select("line");
      let expectedAttrs1 = {
        x1: scale1.scale(value),
        x2: scale1.scale(value),
        y1: 0,
        y2: SVG_HEIGHT
      };
      TestMethods.assertLineAttrs(line, expectedAttrs1, "the line was drawn at the correct position");

      let scale2 = new Plottable.Scales.Linear();
      scale2.domain([0, 100]);
      gll.scale(scale2);
      line = gll.content().select("line");
      let expectedAttrs2 = {
        x1: scale2.scale(value),
        x2: scale2.scale(value),
        y1: 0,
        y2: SVG_HEIGHT
      };
      TestMethods.assertLineAttrs(line, expectedAttrs2, "the line was redrawn at the new position when the value was changed");

      svg.remove();
    });
  });

  describe("rendering (horizontal)", () => {
    let SVG_WIDTH = 400;
    let SVG_HEIGHT = 400;

    it("renders correctly given a pixel position", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let expectedPosition1 = SVG_WIDTH / 2;
      let gll = new Plottable.Components.GuideLineLayer<number>("horizontal");
      gll.pixelPosition(expectedPosition1);
      gll.renderTo(svg);

      assert.strictEqual(gll.content().selectAll("line").size(), 1, "exactly one line is drawn");
      let line = gll.content().select("line");
      let expectedAttrs1 = {
        x1: 0,
        x2: SVG_WIDTH,
        y1: expectedPosition1,
        y2: expectedPosition1
      };
      TestMethods.assertLineAttrs(line, expectedAttrs1, "the line was drawn at the specified position");

      let expectedPosition2 = SVG_WIDTH * 3 / 4;
      gll.pixelPosition(expectedPosition2);
      assert.strictEqual(gll.content().selectAll("line").size(), 1, "exactly one line is drawn");
      line = gll.content().select("line");
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
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let gll = new Plottable.Components.GuideLineLayer<number>("horizontal");
      gll.renderTo(svg);
      let scale = new Plottable.Scales.Linear();
      scale.domain([0, 10]);
      gll.scale(scale);

      let value1 = 5;
      gll.value(value1);
      assert.strictEqual(gll.content().selectAll("line").size(), 1, "exactly one line is drawn");
      let line = gll.content().select("line");
      let expectedAttrs1 = {
        x1: 0,
        x2: SVG_WIDTH,
        y1: scale.scale(value1),
        y2: scale.scale(value1)
      };
      TestMethods.assertLineAttrs(line, expectedAttrs1, "the line was drawn at the correct position");

      let value2 = 8;
      gll.value(value2);
      assert.strictEqual(gll.content().selectAll("line").size(), 1, "exactly one line is drawn");
      line = gll.content().select("line");
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
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let gll = new Plottable.Components.GuideLineLayer<number>("horizontal");
      let value = 5;
      gll.value(value);
      gll.renderTo(svg);

      let scale1 = new Plottable.Scales.Linear();
      scale1.domain([0, 10]);
      gll.scale(scale1);
      let line = gll.content().select("line");
      let expectedAttrs1 = {
        x1: 0,
        x2: SVG_WIDTH,
        y1: scale1.scale(value),
        y2: scale1.scale(value)
      };
      TestMethods.assertLineAttrs(line, expectedAttrs1, "the line was drawn at the correct position");

      let scale2 = new Plottable.Scales.Linear();
      scale2.domain([0, 100]);
      gll.scale(scale2);
      line = gll.content().select("line");
      let expectedAttrs2 = {
        x1: 0,
        x2: SVG_WIDTH,
        y1: scale2.scale(value),
        y2: scale2.scale(value)
      };
      TestMethods.assertLineAttrs(line, expectedAttrs2, "the line was redrawn at the new position when the value was changed");

      svg.remove();
    });
  });
});
