///<reference path="../testReference.ts" />

describe("Axis", () => {
  it("throws an error when setting an invalid orientation", () => {
    let scale = new Plottable.Scales.Linear();
    assert.throws(() => new Plottable.Axis(scale, "blargh"), "unsupported");
  });

  it("throws an error when setting a negative tickLabelPadding", () => {
    let scale = new Plottable.Scales.Linear();
    let axis = new Plottable.Axis(scale, "bottom");

    assert.throws(() => axis.tickLabelPadding(-1), "must be positive");
    axis.destroy();
  });

  it("throws an error when setting a negative margin", () => {
    let scale = new Plottable.Scales.Linear();
    let axis = new Plottable.Axis(scale, "right");

    assert.throws(() => axis.margin(-1), "must be positive");
    axis.destroy();
  });

  describe("right-oriented", () => {
    it("defaults to left alignment", () => {
      let scale = new Plottable.Scales.Linear();
      let axis = new Plottable.Axis(scale, "right");
      assert.strictEqual(axis.xAlignment(), "left", "x alignment defaults to left for right axis");
      axis.destroy();
    });

    it("updates the layout when updating the margin after rendering", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Linear();
      let axis = new Plottable.Axis(scale, "right");
      axis.renderTo(svg);

      let axisWidth = axis.innerTickLength() + axis.margin();
      assert.strictEqual(axis.width(), axisWidth, "calling width() with no arguments returns currently used width");

      let newMargin = 20;
      axis.margin(newMargin);
      axisWidth = axis.innerTickLength() + axis.margin();
      assert.strictEqual(axis.width(), axisWidth, "changing the margin size updates the width");

      axis.destroy();
      svg.remove();
    });

    it("draws the baseline", () => {
      let svg = TestMethods.generateSVG();
      let svgHeight = svg.attr("height");
      let scale = new Plottable.Scales.Linear();
      let axis = new Plottable.Axis(scale, "right");
      axis.renderTo(svg);

      let baseline = svg.select(".baseline");
      assert.isFalse(baseline.empty(), "baseline exists");
      assert.strictEqual(baseline.attr("x1"), "0");
      assert.strictEqual(baseline.attr("x2"), "0");
      assert.strictEqual(baseline.attr("y1"), "0");
      assert.strictEqual(baseline.attr("y2"), svgHeight);

      axis.destroy();
      svg.remove();
    });
  });

  describe("left-oriented", () => {
    it("defaults to right alignment", () => {
      let scale = new Plottable.Scales.Linear();
      let axis = new Plottable.Axis(scale, "left");
      assert.strictEqual(axis.xAlignment(), "right", "x alignment defaults to right for left axis");
      axis.destroy();
    });

    it("draws the baseline", () => {
      let svg = TestMethods.generateSVG();
      let svgHeight = svg.attr("height");
      let scale = new Plottable.Scales.Linear();
      let axis = new Plottable.Axis(scale, "left");
      axis.renderTo(svg);

      let baseline = svg.select(".baseline");
      assert.isFalse(baseline.empty(), "baseline exists");
      assert.strictEqual(baseline.attr("x1"), String(axis.width()));
      assert.strictEqual(baseline.attr("x2"), String(axis.width()));
      assert.strictEqual(baseline.attr("y1"), "0");
      assert.strictEqual(baseline.attr("y2"), svgHeight);

      axis.destroy();
      svg.remove();
    });
  });

  describe("bottom-oriented", () => {
    it("defaults to top alignment", () => {
      let scale = new Plottable.Scales.Linear();
      let axis = new Plottable.Axis(scale, "bottom");
      assert.strictEqual(axis.yAlignment(), "top", "y alignment defaults to top for bottom axis");
      axis.destroy();
    });

    it("updates the layout when updating the margin after rendering", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Linear();
      let axis = new Plottable.Axis(scale, "bottom");
      axis.renderTo(svg);

      let defaultHeight = axis.innerTickLength() + axis.margin();
      assert.strictEqual(axis.height(), defaultHeight, "calling height() with no arguments returns currently used height");

      let newMargin = 20;
      axis.margin(newMargin);
      defaultHeight = axis.innerTickLength() + axis.margin();
      assert.strictEqual(axis.height(), defaultHeight, "changing the margin size updates the height");

      axis.destroy();
      svg.remove();
    });

    it("draws the baseline", () => {
      let svg = TestMethods.generateSVG();
      let svgWidth = svg.attr("width");
      let scale = new Plottable.Scales.Linear();
      let axis = new Plottable.Axis(scale, "bottom");
      axis.renderTo(svg);

      let baseline = svg.select(".baseline");
      assert.isFalse(baseline.empty(), "baseline exists");
      assert.strictEqual(baseline.attr("x1"), "0");
      assert.strictEqual(baseline.attr("x2"), svgWidth);
      assert.strictEqual(baseline.attr("y1"), "0");
      assert.strictEqual(baseline.attr("y2"), "0");

      axis.destroy();
      svg.remove();
    });
  });

  describe("top-oriented", () => {
    it("defaults to bottom alignment", () => {
      let scale = new Plottable.Scales.Linear();
      let axis = new Plottable.Axis(scale, "top");
      assert.strictEqual(axis.yAlignment(), "bottom", "y alignment defaults to bottom for top axis");
      axis.destroy();
    });

    it("draws the baseline", () => {
      let svg = TestMethods.generateSVG();
      let svgWidth = svg.attr("width");
      let scale = new Plottable.Scales.Linear();
      let baseAxis = new Plottable.Axis(scale, "top");
      baseAxis.renderTo(svg);

      let baseline = svg.select(".baseline");
      assert.isFalse(baseline.empty(), "baseline exists");
      assert.strictEqual(baseline.attr("x1"), "0");
      assert.strictEqual(baseline.attr("x2"), svgWidth);
      assert.strictEqual(baseline.attr("y1"), String(baseAxis.height()));
      assert.strictEqual(baseline.attr("y2"), String(baseAxis.height()));

      baseAxis.destroy();
      svg.remove();
    });
  });

  describe("setting the length of the tick marks", () => {
    it("can set for inner", () => {
      let scale = new Plottable.Scales.Linear();
      let axis = new Plottable.Axis(scale, "bottom");
      let tickLength = 10;
      assert.strictEqual(axis.innerTickLength(tickLength), axis, "setting returns calling object");
      assert.strictEqual(axis.innerTickLength(), tickLength, "retrieves set tick length");
      assert.throws(() => axis.innerTickLength(-1), "must be positive");
      axis.destroy();
    });

    it("can set for ends", () => {
      let scale = new Plottable.Scales.Linear();
      let axis = new Plottable.Axis(scale, "bottom");
      let tickLength = 10;
      assert.strictEqual(axis.endTickLength(tickLength), axis, "setting returns calling object");
      assert.strictEqual(axis.endTickLength(), tickLength, "retrieves set tick length");
      assert.throws(() => axis.endTickLength(-1), "must be positive");
      axis.destroy();
    });

    it("adjusts the height to the greater of innerTickLength and endTickLength", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Linear();
      let baseAxis = new Plottable.Axis(scale, "bottom");
      baseAxis.showEndTickLabels(true);
      baseAxis.renderTo(svg);

      let expectedHeight = Math.max(baseAxis.innerTickLength(), baseAxis.endTickLength()) + baseAxis.margin();
      assert.strictEqual(baseAxis.height(), expectedHeight, "height should be equal to the maximum of the two");

      let increasingInnerTickLength = baseAxis.endTickLength() + 10;
      baseAxis.innerTickLength(increasingInnerTickLength);
      assert.strictEqual(baseAxis.height(), increasingInnerTickLength + baseAxis.margin(), "height should increase to inner tick length");

      let increasingEndTickLength = baseAxis.innerTickLength() + 10;
      baseAxis.endTickLength(increasingEndTickLength);
      assert.strictEqual(baseAxis.height(), increasingEndTickLength + baseAxis.margin(), "height should increase to end tick length");

      let decreasingInnerTickLength = baseAxis.endTickLength() - 10;
      baseAxis.innerTickLength(decreasingInnerTickLength);
      assert.strictEqual(baseAxis.height(), increasingEndTickLength + baseAxis.margin(), "height should not decrease");

      baseAxis.destroy();
      svg.remove();
    });
  });

  describe("axis annotations", () => {
    describe("enabling annotations", () => {

      let axis: Plottable.Axis<{}>;

      beforeEach(() => {
        axis = new Plottable.Axis(new Plottable.Scale<{}, number>(), "bottom");
      });

      afterEach(() => {
        axis.destroy();
      });

      it("has annotations disabled by default", () => {
        assert.isFalse(axis.annotationsEnabled(), "annotations are disabled by default");
      });

      it("can set if annotations are enabled", () => {
        let annotationsEnabled = axis.annotationsEnabled();
        assert.strictEqual(axis.annotationsEnabled(!annotationsEnabled), axis, "enabling/disabling annotations returns calling axis");
        assert.strictEqual(axis.annotationsEnabled(), !annotationsEnabled, "can set if annotations are enabled");
      });
    });

    describe("annotating ticks", () => {

      let axis: Plottable.Axis<{}>;

      beforeEach(() => {
        axis = new Plottable.Axis(new Plottable.Scale<{}, number>(), "bottom");
      });

      afterEach(() => {
        axis.destroy();
      });

      it("has no annotated ticks by default", () => {
        assert.deepEqual(axis.annotatedTicks(), [], "no annotated ticks by default");
      });

      it("can set the annotated ticks", () => {
        let annotatedTicks = [20, 30, 40];
        assert.strictEqual(axis.annotatedTicks(annotatedTicks), axis, "setting annotated ticks returns calling axis");
        assert.deepEqual(axis.annotatedTicks(), annotatedTicks, "can set the annotated ticks");
      });
    });

    describe("formatting annotation ticks", () => {

      let axis: Plottable.Axis<{}>;

      beforeEach(() => {
        axis = new Plottable.Axis(new Plottable.Scale<{}, number>(), "bottom");
      });

      afterEach(() => {
        axis.destroy();
      });

      it("uses the identity formatter by default", () => {
        let annotationFormatter = axis.annotationFormatter();
        let identityFormatter = Plottable.Formatters.identity();
        let test = "testString";
        assert.strictEqual(annotationFormatter(test), identityFormatter(test), "uses the identity formatter by default");
      });

      it("can set the annotation formatter", () => {
        let annotationFormatter = (d: any) => "";
        assert.strictEqual(axis.annotationFormatter(annotationFormatter), axis, "setting annotation formatter returns calling axis");
        let test = "testString";
        assert.strictEqual(annotationFormatter(test), axis.annotationFormatter()(test), "can set the annotated ticks");
      });
    });

    describe("annotation tier count", () => {

      let axis: Plottable.Axis<{}>;

      beforeEach(() => {
        axis = new Plottable.Axis(new Plottable.Scale<{}, number>(), "bottom");
      });

      afterEach(() => {
        axis.destroy();
      });

      it("one annotation tier by default", () => {
        assert.deepEqual(axis.annotationTierCount(), 1, "one annotation tier by default");
      });

      it("can set the annotation tier count", () => {
        let annotationTierCount = 5;
        assert.strictEqual(axis.annotationTierCount(annotationTierCount), axis, "setting annotation tier count returns calling axis");
        assert.deepEqual(axis.annotationTierCount(), annotationTierCount, "can set the annotation tier count");
      });

      it("throws an error when annotation tier count is not valid", () => {
        let invalidAnnotationTierCounts = [-1, -100];
        invalidAnnotationTierCounts.forEach(function(annotationTierCount) {
          let currentAnnotationTierCount = axis.annotationTierCount();
          assert.throws(() => axis.annotationTierCount(annotationTierCount),
          `annotationTierCount cannot be negative`);
          assert.strictEqual(axis.annotationTierCount(), currentAnnotationTierCount,
          "annotationTierCount should not be changed to invalid values");
        });
      });
    });

    describe("rendering annotations", () => {
      describe("label content", () => {

        let annotatedTicks: Date[];
        let axis: Plottable.Axis<Date>;
        let svg: d3.Selection<void>;

        beforeEach(() => {
          annotatedTicks = [new Date(1994, 11, 17), new Date(1995, 11, 17)];
          let scale = new Plottable.Scales.Time();
          scale.domain([new Date(1994, 11, 17), new Date(1995, 11, 17)]);
          axis = new Plottable.Axis(scale, "bottom");
          svg = TestMethods.generateSVG();
        });

        afterEach(() => {
          axis.destroy();
        });

        it("re-renders when the annotation formatter is changed", () => {
          axis.annotationsEnabled(true);
          axis.annotatedTicks(annotatedTicks);
          axis.renderTo(svg);

          assert.strictEqual(axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
            annotatedTicks.length, "annotations have rendered");

          let bazFormatter = (d: any) => d + "baz";
          axis.annotationFormatter(bazFormatter);

          let annotationLabels = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`);
          assert.strictEqual(annotationLabels.size(), annotatedTicks.length, "annotations have rendered");

          annotationLabels.each(function(d, i) {
            let d3this = d3.select(this);
            assert.strictEqual(d3this.text(), bazFormatter(annotatedTicks[i]), `new formatter used for annotation label ${i}`);
          });
          svg.remove();
        });

        it("can enable annotations after render", () => {
          axis.annotatedTicks(annotatedTicks);
          axis.renderTo(svg);

          assert.strictEqual(axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
            0, "no annotations by default");

          axis.annotationsEnabled(true);

          assert.strictEqual(axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
            annotatedTicks.length, "no annotations by default");

          svg.remove();
        });

        it("can disable annotations after render", () => {
          axis.annotationsEnabled(true);
          axis.annotatedTicks(annotatedTicks);
          axis.renderTo(svg);

          assert.strictEqual(axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
            annotatedTicks.length, "no annotations by default");

          axis.annotationsEnabled(false);

          assert.strictEqual(axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
            0, "no annotations by default");

          svg.remove();
        });

        it("re-renders when annotated ticks are set after render", () => {
          axis.annotationsEnabled(true);
          axis.renderTo(svg);

          assert.strictEqual(axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
            0, "no annotations by default");

          axis.annotatedTicks(annotatedTicks);

          assert.strictEqual(axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
            annotatedTicks.length, "annotated ticks annotated");

          let annotationFormatter = axis.annotationFormatter();
          let annotationLabels = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`);
          annotationLabels.each(function(d, i) {
            let d3this = d3.select(this);
            assert.strictEqual(d3this.text(), annotationFormatter(annotatedTicks[i]), `annotated tick ${i} has been formatted`);
          });
          svg.remove();
        });
      });

      describe("element placement in relation to annotation rectangle", () => {

        let svg: d3.Selection<void>;
        let scale: Plottable.Scales.ModifiedLog;
        let annotatedTicks: number[];

        beforeEach(() => {
          scale = new Plottable.Scales.ModifiedLog();
          annotatedTicks = [3, 100, 250];
          scale.domain([0, 300]);
          svg = TestMethods.generateSVG();
        });

        it("renders annotations at the axis baseline extending downwards with a bottom orientation axis", () => {
          let axis = new Plottable.Axis(scale, "bottom");
          axis.annotatedTicks(annotatedTicks);
          axis.annotationsEnabled(true);
          axis.renderTo(svg);

          let annotationRects = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);

          let annotationCircles = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_CIRCLE_CLASS}`);

          assert.strictEqual(annotationCircles.size(), annotatedTicks.length, "circle for each annotated tick");

          annotationCircles.each(function (d, i) {
            let annotationCircle = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.closeTo(TestMethods.numAttr(annotationCircle, "cx"),
              TestMethods.numAttr(correspondingRect, "x"), window.Pixel_CloseTo_Requirement, `circle ${i} at start of rect`);
            assert.closeTo(TestMethods.numAttr(annotationCircle, "cy"), 0, window.Pixel_CloseTo_Requirement, `circle ${i} at the top`);
          });

          let annotationLines = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LINE_CLASS}`);

          assert.strictEqual(annotationLines.size(), annotatedTicks.length, "line for each annotated tick");

          annotationLines.each(function (d, i) {
            let annotationLine = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.closeTo(TestMethods.numAttr(annotationLine, "x1"),
              TestMethods.numAttr(correspondingRect, "x"), window.Pixel_CloseTo_Requirement, `line ${i} at start of rect`);
            assert.closeTo(TestMethods.numAttr(annotationLine, "x2"),
              TestMethods.numAttr(correspondingRect, "x"), window.Pixel_CloseTo_Requirement, `line ${i} at start of rect`);
            assert.closeTo(TestMethods.numAttr(annotationLine, "y1"), 0, window.Pixel_CloseTo_Requirement, `line ${i} starts at the top`);
            assert.closeTo(TestMethods.numAttr(annotationLine, "y2"),
              TestMethods.numAttr(correspondingRect, "y"), window.Pixel_CloseTo_Requirement, `line ${i} goes to the rect`);
          });

          let annotationLabelTexts = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS} text`);

          assert.strictEqual(annotationLabelTexts.size(), annotatedTicks.length, "label text for each annotated tick");

          annotationLabelTexts.each(function (d, i) {
            let annotationLabel = d3.select(this);
            let surroundingRect = d3.select(annotationRects[0][i]);
            TestMethods.assertBBoxInclusion(surroundingRect, annotationLabel);
          });
          axis.destroy();
          svg.remove();
        });

        it("renders annotations at the axis baseline extending upwards with a top orientation axis", () => {
          let axis = new Plottable.Axis(scale, "top");
          axis.annotatedTicks(annotatedTicks);
          axis.annotationsEnabled(true);

          axis.renderTo(svg);

          let annotationRects = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);

          let annotationCircles = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_CIRCLE_CLASS}`);

          assert.strictEqual(annotationCircles.size(), annotatedTicks.length, "circle for each annotated tick");

          annotationCircles.each(function (d, i) {
            let annotationCircle = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.closeTo(TestMethods.numAttr(annotationCircle, "cx"),
              TestMethods.numAttr(correspondingRect, "x"), window.Pixel_CloseTo_Requirement, `circle ${i} at start of rect`);
            assert.closeTo(TestMethods.numAttr(annotationCircle, "cy"), axis.height(),
              window.Pixel_CloseTo_Requirement, `circle ${i} at the bottom`);
          });

          let annotationLines = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LINE_CLASS}`);

          assert.strictEqual(annotationLines.size(), annotatedTicks.length, "line for each annotated tick");

          annotationLines.each(function (d, i) {
            let annotationLine = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.closeTo(TestMethods.numAttr(annotationLine, "x1"),
              TestMethods.numAttr(correspondingRect, "x"), window.Pixel_CloseTo_Requirement, `line ${i} at tick scaled x position`);
            assert.closeTo(TestMethods.numAttr(annotationLine, "x2"),
              TestMethods.numAttr(correspondingRect, "x"), window.Pixel_CloseTo_Requirement, `line ${i} at tick scaled x position`);
            assert.closeTo(TestMethods.numAttr(annotationLine, "y1"), axis.height(),
              window.Pixel_CloseTo_Requirement, `line ${i} starts at the bottom`);
            assert.closeTo(TestMethods.numAttr(annotationLine, "y2"),
              TestMethods.numAttr(correspondingRect, "y") + TestMethods.numAttr(correspondingRect, "height"),
              window.Pixel_CloseTo_Requirement, `line ${i} goes to the rect`);
          });

          let annotationLabelTexts = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS} text`);

          assert.strictEqual(annotationLabelTexts.size(), annotatedTicks.length, "label text for each annotated tick");

          annotationLabelTexts.each(function (d, i) {
            let annotationLabel = d3.select(this);
            let surroundingRect = d3.select(annotationRects[0][i]);
            TestMethods.assertBBoxInclusion(surroundingRect, annotationLabel);
          });
          axis.destroy();
          svg.remove();
        });

        it("renders annotations at the axis baseline extending leftwards with a left orientation axis", () => {
          let axis = new Plottable.Axis(scale, "left");
          axis.annotatedTicks(annotatedTicks);
          axis.annotationsEnabled(true);

          axis.renderTo(svg);

          let annotationRects = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);

          let annotationCircles = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_CIRCLE_CLASS}`);

          assert.strictEqual(annotationCircles.size(), annotatedTicks.length, "circle for each annotated tick");

          annotationCircles.each(function (d, i) {
            let annotationCircle = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.closeTo(TestMethods.numAttr(annotationCircle, "cx"), axis.width(),
              window.Pixel_CloseTo_Requirement, `circle ${i} at the right`);
            assert.closeTo(TestMethods.numAttr(annotationCircle, "cy"),
              TestMethods.numAttr(correspondingRect, "y"), window.Pixel_CloseTo_Requirement, `circle ${i} at tick scaled y position`);
          });

          let annotationLines = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LINE_CLASS}`);

          assert.strictEqual(annotationLines.size(), annotatedTicks.length, "line for each annotated tick");

          annotationLines.each(function (d, i) {
            let annotationLine = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.closeTo(TestMethods.numAttr(annotationLine, "x1"), axis.width(),
              window.Pixel_CloseTo_Requirement, `line ${i} starts at the right`);
            assert.closeTo(TestMethods.numAttr(annotationLine, "x2"),
              TestMethods.numAttr(correspondingRect, "x") + TestMethods.numAttr(correspondingRect, "width"), 1, `line ${i} goes to rect`);
            assert.closeTo(TestMethods.numAttr(annotationLine, "y1"),
              TestMethods.numAttr(correspondingRect, "y"), window.Pixel_CloseTo_Requirement, `line ${i} at tick scaled y position`);
            assert.closeTo(TestMethods.numAttr(annotationLine, "y2"),
              TestMethods.numAttr(correspondingRect, "y"), window.Pixel_CloseTo_Requirement, `line ${i} at tick scaled y position`);
          });

          let annotationLabelTexts = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS} text`);

          assert.strictEqual(annotationLabelTexts.size(), annotatedTicks.length, "label rect for each annotated tick");

          annotationLabelTexts.each(function (d, i) {
            let annotationLabel = d3.select(this);
            let surroundingRect = d3.select(annotationRects[0][i]);
            TestMethods.assertBBoxInclusion(surroundingRect, annotationLabel);
          });
          axis.destroy();
          svg.remove();
        });

        it("renders annotations at the axis baseline extending rightwards with a right orientation axis", () => {
          let axis = new Plottable.Axis(scale, "right");
          axis.annotatedTicks(annotatedTicks);
          axis.annotationsEnabled(true);

          axis.renderTo(svg);

          let annotationRects = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);

          let annotationCircles = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_CIRCLE_CLASS}`);

          assert.strictEqual(annotationCircles.size(), annotatedTicks.length, "circle for each annotated tick");

          annotationCircles.each(function (d, i) {
            let annotationCircle = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.closeTo(TestMethods.numAttr(annotationCircle, "cx"), 0, window.Pixel_CloseTo_Requirement, `circle ${i} at the left`);
            assert.closeTo(TestMethods.numAttr(annotationCircle, "cy"),
              TestMethods.numAttr(correspondingRect, "y"), window.Pixel_CloseTo_Requirement, `circle ${i} at tick scaled y position`);
          });

          let annotationLines = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LINE_CLASS}`);

          assert.strictEqual(annotationLines.size(), annotatedTicks.length, "line for each annotated tick");

          annotationLines.each(function (d, i) {
            let annotationLine = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.closeTo(TestMethods.numAttr(annotationLine, "x1"), 0, window.Pixel_CloseTo_Requirement, `line ${i} starts at the left`);
            assert.closeTo(TestMethods.numAttr(annotationLine, "x2"),
              TestMethods.numAttr(correspondingRect, "x"), window.Pixel_CloseTo_Requirement, `line ${i} ends at the rect`);
            assert.closeTo(TestMethods.numAttr(annotationLine, "y1"),
              TestMethods.numAttr(correspondingRect, "y"), window.Pixel_CloseTo_Requirement, `line ${i} at tick scaled y position`);
            assert.closeTo(TestMethods.numAttr(annotationLine, "y2"),
              TestMethods.numAttr(correspondingRect, "y"), window.Pixel_CloseTo_Requirement, `line ${i} at tick scaled y position`);
          });

          let annotationLabelTexts = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS} text`);

          assert.strictEqual(annotationLabelTexts.size(), annotatedTicks.length, "label text for each annotated tick");

          annotationLabelTexts.each(function (d, i) {
            let annotationLabel = d3.select(this);
            let surroundingRect = d3.select(annotationRects[0][i]);
            TestMethods.assertBBoxInclusion(surroundingRect, annotationLabel);
          });
          axis.destroy();
          svg.remove();
        });
      });

      describe("annotation rectangle placement", () => {

        let svg: d3.Selection<void>;
        let scale: Plottable.Scales.Linear;
        let annotatedTicks: number[];

        beforeEach(() => {
          svg = TestMethods.generateSVG(300, 300);
          scale = new Plottable.Scales.Linear();
          annotatedTicks = [50, 100, 150];
          scale.domain([0, 300]);
        });

        describe("scaled position along axis", () => {
          it("places the rectangle at the scaled x position for bottom orientation", () => {
            let axis = new Plottable.Axis(scale, "bottom");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);

            assert.strictEqual(annotationRects.size(), annotatedTicks.length, "same number of annotation rects as ticks");

            annotationRects.each(function (d, i) {
              let annotationRect = d3.select(this);
              assert.closeTo(TestMethods.numAttr(annotationRect, "x"), scale.scale(d),
                window.Pixel_CloseTo_Requirement, `rectangle ${i} positioned correctly`);
            });
            axis.destroy();
            svg.remove();
          });

          it("places the rectangle at the scaled x position for top orientation", () => {
            let axis = new Plottable.Axis(scale, "top");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);

            assert.strictEqual(annotationRects.size(), annotatedTicks.length, "same number of annotation rects as ticks");

            annotationRects.each(function (d, i) {
              let annotationRect = d3.select(this);
              assert.closeTo(TestMethods.numAttr(annotationRect, "x"), scale.scale(d),
                window.Pixel_CloseTo_Requirement, `rectangle ${i} positioned correctly`);
            });
            axis.destroy();
            svg.remove();
          });

          it("places the rectangle at the scaled y position for left orientation", () => {
            let axis = new Plottable.Axis(scale, "left");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);

            assert.strictEqual(annotationRects.size(), annotatedTicks.length, "same number of annotation rects as ticks");

            annotationRects.each(function (d, i) {
              let annotationRect = d3.select(this);
              assert.closeTo(TestMethods.numAttr(annotationRect, "y"), scale.scale(d),
                window.Pixel_CloseTo_Requirement, `rectangle ${i} positioned correctly`);
            });
            axis.destroy();
            svg.remove();
          });

          it("places the rectangle at the scaled y position for right orientation", () => {
            let axis = new Plottable.Axis(scale, "right");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);

            assert.strictEqual(annotationRects.size(), annotatedTicks.length, "same number of annotation rects as ticks");

            annotationRects.each(function (d, i) {
              let annotationRect = d3.select(this);
              assert.closeTo(TestMethods.numAttr(annotationRect, "y"), scale.scale(d), window.Pixel_CloseTo_Requirement,
                `rectangle ${i} positioned correctly`);
            });
            axis.destroy();
            svg.remove();
          });
        });

        describe("first row offset position", () => {
          it("places the first row right at the beginning of the annotation area for bottom orientation", () => {
            let axis = new Plottable.Axis(scale, "bottom");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);
            axis.renderTo(svg);

            let firstAnnotationRect = axis.content().select(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);
            assert.closeTo(TestMethods.numAttr(firstAnnotationRect, "y") + TestMethods.numAttr(firstAnnotationRect, "height"),
              axis.height() - axis.margin(), window.Pixel_CloseTo_Requirement, "rectangle positioned correctly");
            axis.destroy();
            svg.remove();
          });

          it("places the first row right at the beginning of the annotation area for top orientation", () => {
            let axis = new Plottable.Axis(scale, "top");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);

            axis.renderTo(svg);

            let firstAnnotationRect = axis.content().select(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);
            assert.closeTo(TestMethods.numAttr(firstAnnotationRect, "y"),
              axis.margin(), window.Pixel_CloseTo_Requirement, "rectangle positioned correctly");
            axis.destroy();
            svg.remove();
          });

          it("places the first row right at the beginning of the annotation area for left orientation", () => {
            let axis = new Plottable.Axis(scale, "left");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);
            axis.renderTo(svg);

            let firstAnnotationRect = axis.content().select(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);
            assert.closeTo(TestMethods.numAttr(firstAnnotationRect, "x"),
              axis.margin(), window.Pixel_CloseTo_Requirement, "rectangle positioned correctly");
            axis.destroy();
            svg.remove();
          });

          it("places the first row right at the beginning of the annotation area for right orientation", () => {
            let axis = new Plottable.Axis(scale, "right");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);
            axis.renderTo(svg);

            let firstAnnotationRect = axis.content().select(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);
            assert.closeTo(TestMethods.numAttr(firstAnnotationRect, "x") + TestMethods.numAttr(firstAnnotationRect, "width"),
              axis.width() - axis.margin(), window.Pixel_CloseTo_Requirement, "rectangle positioned correctly");
            axis.destroy();
            svg.remove();
          });
        });

        describe("additional row offset position", () => {
          it("moves rectangles that would overlap to different rows downwards (orientation: bottom)", () => {
            let axis = new Plottable.Axis(scale, "bottom");
            axis.annotatedTicks([50, 51]);
            axis.annotationsEnabled(true);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);
            let firstAnnotationRect = d3.select(annotationRects[0][0]);
            let secondAnnotationRect = d3.select(annotationRects[0][1]);
            assert.strictEqual(TestMethods.numAttr(secondAnnotationRect, "y") - TestMethods.numAttr(firstAnnotationRect, "y"),
              TestMethods.numAttr(firstAnnotationRect, "height"), "rectangle offset by previous rectangle");
            axis.destroy();
            svg.remove();
          });

          it("moves rectangles that would overlap to different rows upwards (orientation: top)", () => {
            let axis = new Plottable.Axis(scale, "top");
            axis.annotatedTicks([50, 51]);
            axis.annotationsEnabled(true);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);
            let firstAnnotationRect = d3.select(annotationRects[0][0]);
            let secondAnnotationRect = d3.select(annotationRects[0][1]);
            assert.strictEqual(TestMethods.numAttr(firstAnnotationRect, "y") - TestMethods.numAttr(secondAnnotationRect, "y"),
              TestMethods.numAttr(firstAnnotationRect, "height"), "rectangle offset by previous rectangle");
            axis.destroy();
            svg.remove();
          });

          it("moves rectangles that would overlap to different rows leftwards (orientation: left)", () => {
            let axis = new Plottable.Axis(scale, "left");
            axis.annotatedTicks([50, 51]);
            axis.annotationsEnabled(true);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);
            let firstAnnotationRect = d3.select(annotationRects[0][0]);
            let secondAnnotationRect = d3.select(annotationRects[0][1]);
            assert.strictEqual(TestMethods.numAttr(firstAnnotationRect, "x") - TestMethods.numAttr(secondAnnotationRect, "x"),
              TestMethods.numAttr(firstAnnotationRect, "width"), "rectangle offset by previous rectangle");
            axis.destroy();
            svg.remove();
          });

          it("moves rectangles that would overlap to different rows rightwards (orientation: right)", () => {
            let axis = new Plottable.Axis(scale, "right");
            axis.annotatedTicks([50, 51]);
            axis.annotationsEnabled(true);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);
            let firstAnnotationRect = d3.select(annotationRects[0][0]);
            let secondAnnotationRect = d3.select(annotationRects[0][1]);
            assert.strictEqual(TestMethods.numAttr(secondAnnotationRect, "x") - TestMethods.numAttr(firstAnnotationRect, "x"),
              TestMethods.numAttr(firstAnnotationRect, "width"), "rectangle offset by previous rectangle");
            axis.destroy();
            svg.remove();
          });
        });

      });

      it("hides annotations if rectangles are outside the annotation area", () => {
        let scale = new Plottable.Scales.Linear;
        let annotatedTicks = [50, 51, 150];
        scale.domain([0, 300]);

        let axis = new Plottable.Axis(scale, "bottom");
        axis.annotatedTicks(annotatedTicks);
        axis.annotationsEnabled(true);

        let svg = TestMethods.generateSVG(300, 300);
        axis.renderTo(svg);

        let annotationRects = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);

        assert.strictEqual(annotationRects.size(), annotatedTicks.length, "same number of annotation rects as ticks");

        annotationRects.each(function(d, i) {
          let annotationRect = d3.select(this);
          let bbox = this.getBBox();
          let insideAnnotationArea = bbox.x >= 0 && bbox.x + bbox.width <= axis.width() &&
                                     bbox.y >= (<any> axis)._coreSize() &&
                                     bbox.y + bbox.height <= axis.height() - axis.margin();
          if (insideAnnotationArea) {
            assert.strictEqual(annotationRect.attr("visibility"), "visible", `rect ${i} inside margin area should be visible`);
          } else {
            assert.strictEqual(annotationRect.attr("visibility"), "hidden", `rect ${i} outside margin area should be not visible`);
          }
        });
        axis.destroy();
        svg.remove();
      });

      it("shows annotation circles are not hidden regardless if rectangles are hidden", () => {
        let scale = new Plottable.Scales.Linear;
        let annotatedTicks = [50, 51, 150];
        scale.domain([0, 300]);

        let axis = new Plottable.Axis(scale, "bottom");
        axis.annotatedTicks(annotatedTicks);
        axis.annotationsEnabled(true);

        let svg = TestMethods.generateSVG(300, 300);
        axis.renderTo(svg);

        let annotationCircles = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_CIRCLE_CLASS}`);

        assert.strictEqual(annotationCircles.size(), annotatedTicks.length, "same number of annotation circles as ticks");

        annotationCircles.each(function(d, i) {
          let annotationCircle = d3.select(this);
          assert.notStrictEqual(annotationCircle.attr("visibility"), "hidden", `circle ${i} inside margin area should be visible`);
        });
        axis.destroy();
        svg.remove();
      });

      it("does not render the null annotatedTick", () => {
        let annotatedTicks: Date[] = [null];
        let scale = new Plottable.Scales.Time();
        scale.domain([new Date(1994, 11, 17), new Date(1995, 11, 17)]);
        let axis = new Plottable.Axis(scale, "bottom");
        axis.annotationsEnabled(true);
        let svg = TestMethods.generateSVG(300, 300);
        axis.renderTo(svg);

        axis.annotatedTicks(annotatedTicks);

        assert.strictEqual(axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(), 0, "no annotated ticks");

        axis.destroy();
        svg.remove();
      });

      it("only renders unique annotated ticks", () => {
        let annotatedTicks = [150, 150, 200];
        let scale = new Plottable.Scales.Linear();
        scale.domain([100, 200]);
        let axis = new Plottable.Axis(scale, "bottom");
        axis.annotationsEnabled(true);
        let svg = TestMethods.generateSVG(300, 300);
        axis.renderTo(svg);

        axis.annotatedTicks(annotatedTicks);

        let annotatedTickSet = new Plottable.Utils.Set();
        annotatedTicks.forEach((annotatedTick) => {
          annotatedTickSet.add(annotatedTick);
        });
        assert.strictEqual(axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_LABEL_CLASS}`).size(),
          annotatedTickSet.size, "only unique annotations rendered");

        axis.destroy();
        svg.remove();
      });

      it("renders a duplicate tick in the first tier it can fit in", () => {
        let annotatedTicks = [150, 150];
        let scale = new Plottable.Scales.Linear();
        scale.domain([100, 200]);
        let axis = new Plottable.Axis(scale, "bottom");
        axis.annotationsEnabled(true);
        let svg = TestMethods.generateSVG(300, 300);
        axis.renderTo(svg);

        axis.annotatedTicks(annotatedTicks);

        let annotationRects = axis.content().selectAll(`.${Plottable.Axis.ANNOTATION_RECT_CLASS}`);
        assert.strictEqual(annotationRects.size(), 1, "only one annotation rendered");

        let annotationRect = d3.select(annotationRects[0][0]);
        assert.closeTo(TestMethods.numAttr(annotationRect, "y") + TestMethods.numAttr(annotationRect, "height"),
          axis.height() - axis.margin(), window.Pixel_CloseTo_Requirement, "rectangle positioned correctly");

        axis.destroy();
        svg.remove();
      });
    });
  });
});
