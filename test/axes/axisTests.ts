import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Axis", () => {

  const horizontalOrientations: Plottable.AxisOrientation[] = ["top", "bottom"];
  const verticalOrientations: Plottable.AxisOrientation[] = ["left", "right"];
  const orientations = horizontalOrientations.concat(verticalOrientations);

  const isHorizOrient = (orientation: Plottable.AxisOrientation) => horizontalOrientations.indexOf(orientation) > -1;
  const numAttr = TestMethods.numAttr;

  horizontalOrientations.forEach((horizontalOrientation) => {
    const alignment = horizontalOrientation === "top" ? "bottom" : "top";

    it(`defaults to a ${alignment} y alignment with orientation ${horizontalOrientation}`, () => {
      const scale = new Plottable.Scales.Linear();
      const axis = new Plottable.Axis(scale, horizontalOrientation);
      assert.strictEqual(axis.yAlignment(), alignment, `y alignment for ${horizontalOrientation} is default ${alignment}`);
      axis.destroy();
    });
  });

  verticalOrientations.forEach((verticalOrientation) => {
    const alignment = verticalOrientation === "left" ? "right" : "left";

    it(`defaults to a ${alignment} x alignment with orientation ${verticalOrientation}`, () => {
      const scale = new Plottable.Scales.Linear();
      const axis = new Plottable.Axis(scale, verticalOrientation);
      assert.strictEqual(axis.xAlignment(), alignment, `x alignment for ${verticalOrientation} is default ${alignment}`);
      axis.destroy();
    });
  });

  it("throws an error when setting an invalid orientation", () => {
    const scale = new Plottable.Scales.Linear();
    assert.throws(() => new Plottable.Axis(scale, "blargh" as any), "unsupported");
  });

  it("throws an error when setting a negative tickLabelPadding", () => {
    const scale = new Plottable.Scales.Linear();
    const axis = new Plottable.Axis(scale, "bottom");

    assert.throws(() => axis.tickLabelPadding(-1), "must be positive");
    axis.destroy();
  });

  it("throws an error when setting a negative margin", () => {
    const scale = new Plottable.Scales.Linear();
    const axis = new Plottable.Axis(scale, "right");

    assert.throws(() => axis.margin(-1), "must be positive");
    axis.destroy();
  });

  orientations.forEach((orientation) => {
    it(`updates the layout when updating the margin after rendering for orientation ${orientation}`, () => {
      const div = TestMethods.generateDiv();
      const scale = new Plottable.Scales.Linear();
      const axis = new Plottable.Axis(scale, orientation);
      axis.renderTo(div);

      const relevantDimensionF = () => isHorizOrient(orientation) ? axis.height() : axis.width();

      let axisSize = axis.innerTickLength() + axis.margin();
      assert.strictEqual(relevantDimensionF(), axisSize, "axis size is the tick length and the margin");

      const newMargin = 20;
      axis.margin(newMargin);
      axisSize = axis.innerTickLength() + axis.margin();
      assert.strictEqual(relevantDimensionF(), axisSize, "changing the margin size updates the size");

      axis.destroy();
      div.remove();
    });
  });

  orientations.forEach((orientation) => {
    it(`draws the baseline at the correct edge for ${orientation} orientation`, () => {
      const div = TestMethods.generateDiv();
      const scale = new Plottable.Scales.Linear();
      const axis = new Plottable.Axis(scale, orientation);
      axis.renderTo(div);

      const baseline = axis.content().select(".baseline");
      assert.isFalse(baseline.empty(), "baseline exists");
      assert.strictEqual(baseline.attr("x1"), orientation !== "left" ? "0" : String(axis.width()), "x1");
      assert.strictEqual(baseline.attr("x2"), orientation !== "right" ? String(axis.width()) : "0", "x2");
      assert.strictEqual(baseline.attr("y1"), orientation !== "top" ? "0" : String(axis.height()), "y1");
      assert.strictEqual(baseline.attr("y2"), orientation !== "bottom" ? String(axis.height()) : "0", "y2");

      axis.destroy();
      div.remove();
    });
  });

  describe("setting the length of the tick marks", () => {
    it("can set for inner", () => {
      const scale = new Plottable.Scales.Linear();
      const axis = new Plottable.Axis(scale, "bottom");
      const tickLength = 10;
      assert.strictEqual(axis.innerTickLength(tickLength), axis, "setting returns calling object");
      assert.strictEqual(axis.innerTickLength(), tickLength, "retrieves set tick length");
      assert.throws(() => axis.innerTickLength(-1), "must be positive");
      axis.destroy();
    });

    it("can set for ends", () => {
      const scale = new Plottable.Scales.Linear();
      const axis = new Plottable.Axis(scale, "bottom");
      const tickLength = 10;
      assert.strictEqual(axis.endTickLength(tickLength), axis, "setting returns calling object");
      assert.strictEqual(axis.endTickLength(), tickLength, "retrieves set tick length");
      assert.throws(() => axis.endTickLength(-1), "must be positive");
      axis.destroy();
    });

    it("adjusts the height to the greater of innerTickLength and endTickLength", () => {
      const div = TestMethods.generateDiv();
      const scale = new Plottable.Scales.Linear();
      const axis = new Plottable.Axis(scale, "bottom");
      axis.showEndTickLabels(true);
      axis.renderTo(div);

      const expectedHeight = Math.max(axis.innerTickLength(), axis.endTickLength()) + axis.margin();
      assert.strictEqual(axis.height(), expectedHeight, "height should be equal to the maximum of the two");

      const increasingInnerTickLength = axis.endTickLength() + 10;
      axis.innerTickLength(increasingInnerTickLength);
      assert.strictEqual(axis.height(), increasingInnerTickLength + axis.margin(), "height should increase to inner tick length");

      const increasingEndTickLength = axis.innerTickLength() + 10;
      axis.endTickLength(increasingEndTickLength);
      assert.strictEqual(axis.height(), increasingEndTickLength + axis.margin(), "height should increase to end tick length");

      const decreasingInnerTickLength = axis.endTickLength() - 10;
      axis.innerTickLength(decreasingInnerTickLength);
      assert.strictEqual(axis.height(), increasingEndTickLength + axis.margin(), "height should not decrease");

      axis.destroy();
      div.remove();
    });
  });

  describe("enabling axis annotations", () => {
    let axis: Plottable.Axis<Date>;
    let scale: Plottable.Scales.Time;

    beforeEach(() => {
      scale = new Plottable.Scales.Time();
      axis = new Plottable.Axis(scale, "bottom");
    });

    it("has annotations disabled by default", () => {
      assert.isFalse(axis.annotationsEnabled(), "annotations are disabled by default");
    });

    it("can set if annotations are enabled", () => {
      const annotationsEnabled = true;
      assert.strictEqual(axis.annotationsEnabled(annotationsEnabled), axis, "enabling/disabling annotations returns calling axis");
      assert.strictEqual(axis.annotationsEnabled(), annotationsEnabled, "can set if annotations are enabled");

      const annotatedTicks = [new Date((scale.domain()[0].valueOf() + scale.domain()[1].valueOf()) / 2)];
      axis.annotatedTicks(annotatedTicks);

      const div = TestMethods.generateDiv();
      axis.renderTo(div);

      assert.isFalse(axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_CIRCLE_CLASS}`).empty(), "annotations render");

      axis.destroy();
      div.remove();
    });

    it("can enable annotations after render", () => {
      const div = TestMethods.generateDiv();
      const domainValues = [scale.domain()[0].valueOf(), scale.domain()[1].valueOf()];
      const annotatedTicks = Plottable.Utils.Math.range(domainValues[0], domainValues[1], (domainValues[1] - domainValues[0]) / 10)
        .map((d) => new Date(d));
      axis.annotatedTicks(annotatedTicks);
      axis.renderTo(div);

      assert.strictEqual(axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
        0, "no annotations by default");

      axis.annotationsEnabled(true);

      assert.strictEqual(axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
        annotatedTicks.length, "annotations render");

      div.remove();
    });

    it("can disable annotations after render", () => {
      const div = TestMethods.generateDiv();
      const domainValues = [scale.domain()[0].valueOf(), scale.domain()[1].valueOf()];
      const annotatedTicks = Plottable.Utils.Math.range(domainValues[0], domainValues[1], (domainValues[1] - domainValues[0]) / 10)
        .map((d) => new Date(d));
      axis.annotationsEnabled(true);
      axis.annotatedTicks(annotatedTicks);
      axis.renderTo(div);

      assert.strictEqual(axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
        annotatedTicks.length, "annotations render");

      axis.annotationsEnabled(false);

      assert.strictEqual(axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
        0, "no annotations by default");

      div.remove();
    });
  });

  describe("annotating ticks", () => {
    let axis: Plottable.Axis<number>;
    let scale: Plottable.Scales.Linear;

    beforeEach(() => {
      scale = new Plottable.Scales.Linear();
      axis = new Plottable.Axis(scale, "bottom");
    });

    it("has no annotated ticks by default", () => {
      assert.deepEqual(axis.annotatedTicks(), [], "no annotated ticks by default");
      axis.destroy();
    });

    it("can set the annotated ticks", () => {
      const domainValues = [scale.domain()[0].valueOf(), scale.domain()[1].valueOf()];
      const annotatedTicks = Plottable.Utils.Math.range(domainValues[0], domainValues[1], 10);
      assert.strictEqual(axis.annotatedTicks(annotatedTicks), axis, "setting annotated ticks returns calling axis");
      assert.deepEqual(axis.annotatedTicks(), annotatedTicks, "can set the annotated ticks");

      axis.annotationsEnabled(true);

      const div = TestMethods.generateDiv();
      axis.renderTo(div);

      assert.deepEqual(axis.content().selectAll<Element, any>(".annotation-label").data(), annotatedTicks, "annotated ticks set");

      axis.destroy();
      div.remove();
    });

    it("re-renders when annotated ticks are set after render", () => {
      const domainValues = [scale.domain()[0].valueOf(), scale.domain()[1].valueOf()];
      const annotatedTicks = Plottable.Utils.Math.range(domainValues[0], domainValues[1], 10);
      const div = TestMethods.generateDiv();
      axis.annotationsEnabled(true);
      axis.renderTo(div);

      assert.strictEqual(axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
        0, "no annotations by default");

      axis.annotatedTicks(annotatedTicks);

      assert.strictEqual(axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
        annotatedTicks.length, "annotated ticks annotated");

      const annotationFormatter = axis.annotationFormatter();
      const annotationLabels = axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`);
      annotationLabels.each(function(d, i) {
        assert.strictEqual(d3.select(this).text(), annotationFormatter(annotatedTicks[i]), `annotated tick ${i} has been formatted`);
      });
      div.remove();
    });
  });

  describe("formatting annotation ticks", () => {
    let axis: Plottable.Axis<number>;
    let scale: Plottable.Scales.Linear;

    beforeEach(() => {
      scale = new Plottable.Scales.Linear();
      axis = new Plottable.Axis(scale, "bottom");
    });

    it("uses the identity formatter by default", () => {
      const annotationFormatter = axis.annotationFormatter();
      const identityFormatter = Plottable.Formatters.identity();
      const testString = "testString";
      assert.strictEqual(annotationFormatter(testString), identityFormatter(testString), "uses the identity formatter by default");
      axis.destroy();
    });

    it("can set the annotation formatter", () => {
      const annotationFormatter = (d: any) => `${d}foo`;
      assert.strictEqual(axis.annotationFormatter(annotationFormatter), axis, "setting annotation formatter returns calling axis");
      const testString = "testString";
      assert.strictEqual(annotationFormatter(testString), axis.annotationFormatter()(testString), "can set the annotated ticks");

      const annotatedTicks = Plottable.Utils.Math.range(scale.domain()[0], scale.domain()[1], 10);
      axis.annotatedTicks(annotatedTicks);
      axis.annotationsEnabled(true);

      const div = TestMethods.generateDiv();
      axis.renderTo(div);

      const annotationLabels = axis.content().selectAll<Element, any>(".annotation-label");
      assert.strictEqual(annotationLabels.size(), annotatedTicks.length, "same number of annotation labels as annotated ticks");
      annotationLabels.each(function(d, i) {
        assert.strictEqual(d3.select(this).text(), annotationFormatter(d), `formats tick ${i}`);
      });

      axis.destroy();
      div.remove();
    });

    it("re-renders when the annotation formatter is changed", () => {
      const div = TestMethods.generateDiv();
      const annotatedTicks = Plottable.Utils.Math.range(scale.domain()[0], scale.domain()[1], 10);
      axis.annotationsEnabled(true);
      axis.annotatedTicks(annotatedTicks);
      axis.renderTo(div);

      assert.strictEqual(axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
        annotatedTicks.length, "annotations have rendered");

      const bazFormatter = (d: any) => `${d}baz`;
      axis.annotationFormatter(bazFormatter);

      const annotationLabels = axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`);
      assert.strictEqual(annotationLabels.size(), annotatedTicks.length, "annotations have rendered");

      annotationLabels.each(function(d, i) {
        assert.strictEqual(d3.select(this).text(), bazFormatter(annotatedTicks[i]), `new formatter used for annotation label ${i}`);
      });
      axis.destroy();
      div.remove();
    });
  });

  describe("setting the number of annotation tiers", () => {
    let axis: Plottable.Axis<number>;

    beforeEach(() => {
      axis = new Plottable.Axis(new Plottable.Scales.Linear(), "bottom");
    });

    it("one annotation tier by default", () => {
      assert.deepEqual(axis.annotationTierCount(), 1, "one annotation tier by default");
      axis.destroy();
    });

    it("can set the annotation tier count", () => {
      const annotationTierCount = 5;
      assert.strictEqual(axis.annotationTierCount(annotationTierCount), axis, "setting annotation tier count returns calling axis");
      assert.deepEqual(axis.annotationTierCount(), annotationTierCount, "can set the annotation tier count");

      axis.annotationsEnabled(true);

      const div = TestMethods.generateDiv();
      axis.renderTo(div);

      const oldAxisHeight = axis.height();
      const increaseAmount = 2;
      axis.annotationTierCount(axis.annotationTierCount() + increaseAmount);
      assert.operator(axis.height(), ">", oldAxisHeight, "axis takes number of tiers into account");

      axis.destroy();
      div.remove();
    });

    it("throws an error when annotation tier count is not valid", () => {
      const invalidAnnotationTierCounts = [-1, -100];
      invalidAnnotationTierCounts.forEach(function(annotationTierCount) {
        const currentAnnotationTierCount = axis.annotationTierCount();
        assert.throws(() => axis.annotationTierCount(annotationTierCount),
        `annotationTierCount cannot be negative`);
        assert.strictEqual(axis.annotationTierCount(), currentAnnotationTierCount,
        "annotationTierCount should not be changed to invalid values");
      });
      axis.destroy();
    });
  });

  describe("drawing annotation elements", () => {
    orientations.forEach((orientation) => {
      const scale = new Plottable.Scales.ModifiedLog();
      scale.domain([0, 300]);
      const annotatedTicks = [3, 100, 250];

      it(`renders annotation lines, circles, and text extending out from baseline to rect with orientation ${orientation}`, () => {
        const div = TestMethods.generateDiv();
        const axis = new Plottable.Axis(scale, orientation);
        axis.annotatedTicks(annotatedTicks);
        axis.annotationsEnabled(true);
        axis.renderTo(div);

        const annotationRects = axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);

        const annotationCircles = axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_CIRCLE_CLASS}`);

        assert.strictEqual(annotationCircles.size(), annotatedTicks.length, "circle for each annotated tick");

        const axisPointX = (index: number) => {
          const correspRect = d3.select(annotationRects.nodes()[index]);
          return isHorizOrient(orientation) ? numAttr(correspRect, "x") : (orientation === "left" ? axis.width() : 0);
        };

        const axisPointY = (index: number) => {
          const correspRect = d3.select(annotationRects.nodes()[index]);
          return isHorizOrient(orientation) ? (orientation === "top" ? axis.height() : 0) : numAttr(correspRect, "y");
        };

        annotationCircles.each(function (d, i) {
          const annotationCircle = d3.select(this);
          assert.closeTo(numAttr(annotationCircle, "cx"), axisPointX(i), window.Pixel_CloseTo_Requirement, `circle ${i} at start`);
          assert.closeTo(numAttr(annotationCircle, "cy"), axisPointY(i), window.Pixel_CloseTo_Requirement, `circle ${i} at the top`);
        });

        const annotationLines = axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_LINE_CLASS}`);

        assert.strictEqual(annotationLines.size(), annotatedTicks.length, "line for each annotated tick");

        annotationLines.each(function (d, i) {
          const annotationLine = d3.select(this);
          const correspondingRect = d3.select(annotationRects.nodes()[i]);
          const x2 = numAttr(correspondingRect, "x") + (orientation === "left" ? numAttr(correspondingRect, "width") : 0);
          const y2 = numAttr(correspondingRect, "y") + (orientation === "top" ? numAttr(correspondingRect, "height") : 0);
          assert.closeTo(numAttr(annotationLine, "x1"), axisPointX(i), window.Pixel_CloseTo_Requirement, `line ${i} x1`);
          assert.closeTo(numAttr(annotationLine, "x2"), x2, window.Pixel_CloseTo_Requirement, `line ${i} x2`);
          assert.closeTo(numAttr(annotationLine, "y1"), axisPointY(i), window.Pixel_CloseTo_Requirement, `line ${i} y1`);
          assert.closeTo(numAttr(annotationLine, "y2"), y2, window.Pixel_CloseTo_Requirement, `line ${i} y2`);
        });

        const annotationLabelTexts = axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS} text`);

        assert.strictEqual(annotationLabelTexts.size(), annotatedTicks.length, "label text for each annotated tick");

        annotationLabelTexts.each(function (d, i) {
          const annotationLabel = d3.select(this);
          const surroundingRect = d3.select(annotationRects.nodes()[i]);
          TestMethods.assertBBoxInclusion(surroundingRect, annotationLabel);
        });
        axis.destroy();
        div.remove();
      });
    });

    orientations.forEach((orientation) => {
      const scale = new Plottable.Scales.ModifiedLog();
      scale.domain([0, 300]);
      const annotatedTicks = [3, 100, 250];

      it(`places the rectangle at the scaled x position for ${orientation} orientation`, () => {
        const div = TestMethods.generateDiv();
        const axis = new Plottable.Axis(scale, orientation);
        axis.annotatedTicks(annotatedTicks);
        axis.annotationsEnabled(true);
        axis.renderTo(div);

        const annotationRects = axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);

        assert.strictEqual(annotationRects.size(), annotatedTicks.length, "same number of annotation rects as ticks");

        const scaleAttribute = isHorizOrient(orientation) ? "x" : "y";

        annotationRects.each(function (d, i) {
          const annotationRect = d3.select(this);
          assert.closeTo(numAttr(annotationRect, scaleAttribute), scale.scale(d),
            window.Pixel_CloseTo_Requirement, `rectangle ${i} positioned at scaled position`);
        });
        axis.destroy();
        div.remove();
      });
    });

    orientations.forEach((orientation) => {
      const scale = new Plottable.Scales.ModifiedLog();
      scale.domain([0, 300]);
      const annotatedTicks = [3, 100, 250];

      it(`places the first row right at the beginning of the annotation area for ${orientation} orientation`, () => {
        const div = TestMethods.generateDiv();
        const axis = new Plottable.Axis(scale, orientation);
        axis.annotatedTicks(annotatedTicks);
        axis.annotationsEnabled(true);
        axis.renderTo(div);

        const firstAnnotationRect = axis.content().select(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);

        let rectangleRowPos: number;
        let expectedRowPos: number;
        switch (orientation) {
          case "bottom":
            rectangleRowPos = numAttr(firstAnnotationRect, "y") + numAttr(firstAnnotationRect, "height");
            expectedRowPos = axis.height() - axis.margin();
            break;
          case "top":
            rectangleRowPos = numAttr(firstAnnotationRect, "y");
            expectedRowPos = axis.margin();
            break;
          case "left":
            rectangleRowPos = numAttr(firstAnnotationRect, "x");
            expectedRowPos = axis.margin();
            break;
          case "right":
            rectangleRowPos = numAttr(firstAnnotationRect, "x") + numAttr(firstAnnotationRect, "width");
            expectedRowPos = axis.width() - axis.margin();
            break;
        }

        assert.closeTo(rectangleRowPos, expectedRowPos, window.Pixel_CloseTo_Requirement, "rectangle positioned right above margin");
        axis.destroy();
        div.remove();
      });
    });

    orientations.forEach((orientation) => {
      const scale = new Plottable.Scales.ModifiedLog();
      scale.domain([0, 300]);
      const annotatedTicks = [50, 51];

      it(`moves rectangles that would overlap to different rows for ${orientation} orientation`, () => {
        const div = TestMethods.generateDiv();
        const axis = new Plottable.Axis(scale, orientation);
        axis.annotatedTicks(annotatedTicks);
        axis.annotationsEnabled(true);
        axis.renderTo(div);

        const annotationRects = axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);
        const firstAnnotationRect = d3.select(annotationRects.nodes()[0]);
        const secondAnnotationRect = d3.select(annotationRects.nodes()[1]);

        const positionAttr = isHorizOrient(orientation) ? "y" : "x";
        const offsetAttr = isHorizOrient(orientation) ? "height" : "width";

        assert.strictEqual(Math.abs(numAttr(secondAnnotationRect, positionAttr) - numAttr(firstAnnotationRect, positionAttr)),
          numAttr(firstAnnotationRect, offsetAttr), "rectangle offset by previous rectangle");
        axis.destroy();
        div.remove();
      });
    });
  });

  it("hides annotations if rectangles are outside the annotation area", () => {
    const scale = new Plottable.Scales.Linear();
    const annotatedTicks = [50, 51, 150];
    scale.domain([0, 300]);

    const axis = new Plottable.Axis(scale, "bottom");
    axis.annotatedTicks(annotatedTicks);
    axis.annotationsEnabled(true);

    const div = TestMethods.generateDiv(300, 300);
    axis.renderTo(div);

    const annotationRects = axis.content().selectAll<SVGRectElement, any>(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);

    assert.strictEqual(annotationRects.size(), annotatedTicks.length, "same number of annotation rects as ticks");

    annotationRects.each(function(d, i) {
      const annotationRect = d3.select(this);
      const bbox = this.getBBox();
      // add 1px fudge factor to avoid floating point rounding errors
      const insideAnnotationArea = bbox.x >= 0 && bbox.x + bbox.width <= axis.width() + 1 &&
        bbox.y >= 0 && bbox.y + bbox.height <= axis.height() - axis.margin() + 1;
      if (insideAnnotationArea) {
        assert.strictEqual(annotationRect.attr("visibility"), "visible", `rect ${i} inside margin area should be visible`);
      } else {
        assert.strictEqual(annotationRect.attr("visibility"), "hidden", `rect ${i} outside margin area should be not visible`);
      }
    });
    axis.destroy();
    div.remove();
  });

  it("shows annotation circles regardless if rectangles are hidden", () => {
    const scale = new Plottable.Scales.Linear();
    const annotatedTicks = [50, 51, 150];
    scale.domain([0, 300]);

    const axis = new Plottable.Axis(scale, "bottom");
    axis.annotatedTicks(annotatedTicks);
    axis.annotationsEnabled(true);

    const div = TestMethods.generateDiv(300, 300);
    axis.renderTo(div);

    const annotationCircles = axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_CIRCLE_CLASS}`);

    assert.strictEqual(annotationCircles.size(), annotatedTicks.length, "same number of annotation circles as ticks");

    annotationCircles.each(function(d, i) {
      const annotationCircle = d3.select(this);
      assert.notStrictEqual(annotationCircle.attr("visibility"), "hidden", `circle ${i} inside margin area should be visible`);
    });
    axis.destroy();
    div.remove();
  });

  it("does not render the null as an annotation", () => {
    const annotatedTicks: Date[] = [null];
    const scale = new Plottable.Scales.Time();
    scale.domain([new Date(1994, 11, 17), new Date(1995, 11, 17)]);
    const axis = new Plottable.Axis(scale, "bottom");
    axis.annotationsEnabled(true);
    const div = TestMethods.generateDiv(300, 300);
    axis.renderTo(div);

    axis.annotatedTicks(annotatedTicks);

    assert.strictEqual(axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(), 0, "no annotated ticks");

    axis.destroy();
    div.remove();
  });

  it("only renders unique annotated ticks", () => {
    const annotatedTicks = [150, 150, 200];
    const scale = new Plottable.Scales.Linear();
    scale.domain([100, 200]);
    const axis = new Plottable.Axis(scale, "bottom");
    axis.annotationsEnabled(true);
    const div = TestMethods.generateDiv(300, 300);
    axis.renderTo(div);

    axis.annotatedTicks(annotatedTicks);

    const annotatedTickSet = new Plottable.Utils.Set();
    annotatedTicks.forEach((annotatedTick) => {
      annotatedTickSet.add(annotatedTick);
    });
    assert.strictEqual(axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
      annotatedTickSet.size, "only unique annotations rendered");

    axis.destroy();
    div.remove();
  });

  it("places the tick at the top most row even if it is a duplicated tick", () => {
    const annotatedTicks = [150, 150];
    const scale = new Plottable.Scales.Linear();
    scale.domain([100, 200]);
    const axis = new Plottable.Axis(scale, "bottom");
    axis.annotationsEnabled(true);
    const div = TestMethods.generateDiv(300, 300);
    axis.renderTo(div);

    axis.annotatedTicks(annotatedTicks);

    const annotationRects = axis.content().selectAll<Element, any>(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);
    assert.strictEqual(annotationRects.size(), 1, "only one annotation rendered");

    const annotationRect = d3.select(annotationRects.nodes()[0]);
    assert.closeTo(numAttr(annotationRect, "y") + numAttr(annotationRect, "height"),
      axis.height() - axis.margin(), window.Pixel_CloseTo_Requirement, "rectangle positioned correctly");

    axis.destroy();
    div.remove();
  });

  describe("tickLabelDataOnElement", () => {
    const domain = ["label1", "label2", "long long long long long long long long long long long long title"];

    let div: d3.Selection<HTMLDivElement, void | {}, any, any>;
    let scale: Plottable.Scales.Category;
    let axis: Plottable.Axes.Category;

    beforeEach(() => {
      div = TestMethods.generateDiv();
      scale = new Plottable.Scales.Category().domain(domain);
      axis = new Plottable.Axes.Category(scale, "left");
      const TICK_LABEL_MAX_WIDTH = 60;
      axis.tickLabelMaxWidth(TICK_LABEL_MAX_WIDTH);
      axis.renderTo(div);
    });

    afterEach(() => {
      axis.destroy();
      div.remove();
    });

    it("returns label datum when element has tick label class", () => {
      const tickLabelElement = div.select(`.${Plottable.Axis.TICK_LABEL_CLASS}`).node() as Element;
      assert.equal(axis.tickLabelDataOnElement(tickLabelElement), domain[0]);
    });

    it.skip("returns label datum when element in ancestor has tick label class", () => {
      const labelTextLineElement = div.select(".text-line").node() as Element;
      assert.equal(axis.tickLabelDataOnElement(labelTextLineElement), domain[0]);
    });

    it("returns undefined when no ancestor has tick label class", () => {
      const contentElement = div.select(".content").node() as Element;
      assert.isUndefined(axis.tickLabelDataOnElement(contentElement));
    });

    it("returns undefined when element is null / undefined", () => {
      axis = new Plottable.Axes.Category(scale, "left");
      assert.isUndefined(axis.tickLabelDataOnElement(undefined));
      assert.isUndefined(axis.tickLabelDataOnElement(null));
    });
  });
});
