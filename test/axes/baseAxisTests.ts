///<reference path="../testReference.ts" />

describe("BaseAxis", () => {
  it("orientation", () => {
    let scale = new Plottable.Scales.Linear();
    assert.throws(() => new Plottable.Axis(scale, "blargh"), "unsupported");
  });

  it("tickLabelPadding() rejects negative values", () => {
    let scale = new Plottable.Scales.Linear();
    let baseAxis = new Plottable.Axis(scale, "bottom");

    assert.throws(() => baseAxis.tickLabelPadding(-1), "must be positive");
  });

  it("margin() rejects negative values", () => {
    let scale = new Plottable.Scales.Linear();
    let axis = new Plottable.Axis(scale, "right");

    assert.throws(() => axis.margin(-1), "must be positive");
  });

  it("width() + margin()", () => {
    let SVG_WIDTH = 100;
    let SVG_HEIGHT = 500;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    let verticalAxis = new Plottable.Axis(scale, "right");
    verticalAxis.renderTo(svg);

    let defaultWidth = verticalAxis.innerTickLength() + verticalAxis.margin();
    assert.strictEqual(verticalAxis.width(), defaultWidth, "calling width() with no arguments returns currently used width");

    verticalAxis.margin(20);
    defaultWidth = verticalAxis.innerTickLength() + verticalAxis.margin();
    assert.strictEqual(verticalAxis.width(), defaultWidth, "changing the margin size updates the width");

    svg.remove();
  });

  it("height() + margin()", () => {
    let SVG_WIDTH = 500;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    let horizontalAxis = new Plottable.Axis(scale, "bottom");
    horizontalAxis.renderTo(svg);

    let defaultHeight = horizontalAxis.innerTickLength() + horizontalAxis.margin();
    assert.strictEqual(horizontalAxis.height(), defaultHeight, "calling height() with no arguments returns currently used height");

    horizontalAxis.margin(20);
    defaultHeight = horizontalAxis.innerTickLength() + horizontalAxis.margin();
    assert.strictEqual(horizontalAxis.height(), defaultHeight, "changing the margin size updates the height");

    svg.remove();
  });

  it("draws ticks and baseline (horizontal)", () => {
    let SVG_WIDTH = 500;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    scale.domain([0, 10]);
    scale.range([0, SVG_WIDTH]);
    let baseAxis = new Plottable.Axis(scale, "bottom");
    let tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    (<any> baseAxis)._getTickValues = function() { return tickValues; };
    baseAxis.renderTo(svg);

    let tickMarks = svg.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    assert.strictEqual(tickMarks[0].length, tickValues.length, "A tick mark was created for each value");
    let baseline = svg.select(".baseline");

    assert.isNotNull(baseline.node(), "baseline was drawn");
    assert.strictEqual(baseline.attr("x1"), "0");
    assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH));
    assert.strictEqual(baseline.attr("y1"), "0");
    assert.strictEqual(baseline.attr("y2"), "0");

    baseAxis.orientation("top");
    assert.isNotNull(baseline.node(), "baseline was drawn");
    assert.strictEqual(baseline.attr("x1"), "0");
    assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH));
    assert.strictEqual(baseline.attr("y1"), String(baseAxis.height()));
    assert.strictEqual(baseline.attr("y2"), String(baseAxis.height()));

    svg.remove();
  });

  it("draws ticks and baseline (vertical)", () => {
    let SVG_WIDTH = 100;
    let SVG_HEIGHT = 500;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    scale.domain([0, 10]);
    scale.range([0, SVG_HEIGHT]);
    let baseAxis = new Plottable.Axis(scale, "left");
    let tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    (<any> baseAxis)._getTickValues = function() { return tickValues; };
    baseAxis.renderTo(svg);

    let tickMarks = svg.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    assert.strictEqual(tickMarks[0].length, tickValues.length, "A tick mark was created for each value");
    let baseline = svg.select(".baseline");

    assert.isNotNull(baseline.node(), "baseline was drawn");
    assert.strictEqual(baseline.attr("x1"), String(baseAxis.width()));
    assert.strictEqual(baseline.attr("x2"), String(baseAxis.width()));
    assert.strictEqual(baseline.attr("y1"), "0");
    assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT));

    baseAxis.orientation("right");
    assert.isNotNull(baseline.node(), "baseline was drawn");
    assert.strictEqual(baseline.attr("x1"), "0");
    assert.strictEqual(baseline.attr("x2"), "0");
    assert.strictEqual(baseline.attr("y1"), "0");
    assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT));

    svg.remove();
  });

  it("innerTickLength()", () => {
    let SVG_WIDTH = 500;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    scale.domain([0, 10]);
    scale.range([0, SVG_WIDTH]);
    let baseAxis = new Plottable.Axis(scale, "bottom");
    let tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    (<any> baseAxis)._getTickValues = function() { return tickValues; };
    baseAxis.renderTo(svg);
    let secondTickMark = svg.selectAll("." + Plottable.Axis.TICK_MARK_CLASS + ":nth-child(2)");
    assert.strictEqual(secondTickMark.attr("x1"), "50");
    assert.strictEqual(secondTickMark.attr("x2"), "50");
    assert.strictEqual(secondTickMark.attr("y1"), "0");
    assert.strictEqual(secondTickMark.attr("y2"), String(baseAxis.innerTickLength()));

    baseAxis.innerTickLength(10);
    assert.strictEqual(secondTickMark.attr("y2"), String(baseAxis.innerTickLength()), "inner tick length was updated");

    assert.throws(() => baseAxis.innerTickLength(-1), "must be positive");

    svg.remove();
  });

  it("endTickLength()", () => {
    let SVG_WIDTH = 500;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    scale.domain([0, 10]);
    scale.range([0, SVG_WIDTH]);
    let baseAxis = new Plottable.Axis(scale, "bottom");
    let tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    (<any> baseAxis)._getTickValues = () => tickValues;
    baseAxis.renderTo(svg);

    let firstTickMark = svg.selectAll("." + Plottable.Axis.END_TICK_MARK_CLASS);
    assert.strictEqual(firstTickMark.attr("x1"), "0");
    assert.strictEqual(firstTickMark.attr("x2"), "0");
    assert.strictEqual(firstTickMark.attr("y1"), "0");
    assert.strictEqual(firstTickMark.attr("y2"), String(baseAxis.endTickLength()));

    baseAxis.endTickLength(10);
    assert.strictEqual(firstTickMark.attr("y2"), String(baseAxis.endTickLength()), "end tick length was updated");

    assert.throws(() => baseAxis.endTickLength(-1), "must be positive");

    svg.remove();
  });

  it("height is adjusted to greater of innerTickLength or endTickLength", () => {
    let SVG_WIDTH = 500;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    let baseAxis = new Plottable.Axis(scale, "bottom");
    baseAxis.showEndTickLabels(true);
    baseAxis.renderTo(svg);

    let expectedHeight = Math.max(baseAxis.innerTickLength(), baseAxis.endTickLength()) + baseAxis.margin();
    assert.strictEqual(baseAxis.height(), expectedHeight, "height should be equal to the maximum of the two");

    baseAxis.innerTickLength(20);
    assert.strictEqual(baseAxis.height(), 20 + baseAxis.margin(), "height should increase to inner tick length");

    baseAxis.endTickLength(30);
    assert.strictEqual(baseAxis.height(), 30 + baseAxis.margin(), "height should increase to end tick length");

    baseAxis.innerTickLength(10);
    assert.strictEqual(baseAxis.height(), 30 + baseAxis.margin(), "height should not decrease");

    svg.remove();
  });

  it("default alignment based on orientation", () => {
    let scale = new Plottable.Scales.Linear();
    let baseAxis = new Plottable.Axis(scale, "bottom");
    assert.strictEqual(baseAxis.yAlignment(), "top", "y alignment defaults to \"top\" for bottom axis");
    baseAxis = new Plottable.Axis(scale, "top");
    assert.strictEqual(baseAxis.yAlignment(), "bottom", "y alignment defaults to \"bottom\" for top axis");
    baseAxis = new Plottable.Axis(scale, "left");
    assert.strictEqual(baseAxis.xAlignment(), "right", "x alignment defaults to \"right\" for left axis");
    baseAxis = new Plottable.Axis(scale, "right");
    assert.strictEqual(baseAxis.xAlignment(), "left", "x alignment defaults to \"left\" for right axis");
  });

  describe("axis annotations", () => {
    describe("enabling annotations", () => {
      it("has annotations disabled by default", () => {
        let axis = new Plottable.Axis(new Plottable.Scale<{}, number>(), "bottom");
        assert.isFalse(axis.annotationsEnabled(), "annotations are disabled by default");
      });

      it("can set if annotations are enabled", () => {
        let axis = new Plottable.Axis(new Plottable.Scale<{}, number>(), "bottom");
        let annotationsEnabled = axis.annotationsEnabled();
        axis.annotationsEnabled(!annotationsEnabled);
        assert.strictEqual(axis.annotationsEnabled(), !annotationsEnabled, "can set if annotations are enabled");
      });

      it("returns the axis when setting if annotations are enabled", () => {
        let axis = new Plottable.Axis(new Plottable.Scale<{}, number>(), "bottom");
        assert.strictEqual(axis.annotationsEnabled(true), axis, "enabling annotations return calling axis");
      });
    });

    describe("annotating ticks", () => {
      it("has no annotated ticks by default", () => {
        let axis = new Plottable.Axis(new Plottable.Scale<{}, number>(), "bottom");
        assert.deepEqual(axis.annotatedTicks(), [], "no annotated ticks by default");
      });

      it("can set the annotated ticks", () => {
        let axis = new Plottable.Axis(new Plottable.Scale<{}, number>(), "bottom");
        let annotatedTicks = [20, 30, 40];
        axis.annotatedTicks(annotatedTicks);
        assert.deepEqual(axis.annotatedTicks(), annotatedTicks, "can set the annotated ticks");
      });

      it("returns the axis when setting the annotated ticks", () => {
        let axis = new Plottable.Axis(new Plottable.Scale<{}, number>(), "bottom");
        assert.strictEqual(axis.annotatedTicks([]), axis, "setting the annotated ticks returns calling axis");
      });
    });

    describe("formatting annotation ticks", () => {
      it("uses the identity formatter by default", () => {
        let axis = new Plottable.Axis(new Plottable.Scale<{}, number>(), "bottom");
        let annotationFormatter = axis.annotationFormatter();
        let identityFormatter = Plottable.Formatters.identity();
        let test = "testString";
        assert.strictEqual(annotationFormatter(test), identityFormatter(test), "uses the identity formatter by default");
      });

      it("can set the annotation formatter", () => {
        let axis = new Plottable.Axis(new Plottable.Scale<{}, number>(), "bottom");
        let annotationFormatter = (d: any) => "";
        axis.annotationFormatter(annotationFormatter);
        let test = "testString";
        assert.strictEqual(annotationFormatter(test), axis.annotationFormatter()(test), "can set the annotated ticks");
      });

      it("returns the axis when setting the annotation formatter", () => {
        let axis = new Plottable.Axis(new Plottable.Scale<{}, number>(), "bottom");
        assert.strictEqual(axis.annotationFormatter(() => ""), axis, "setting the annotation formatter returns calling axis");
      });
    });

    describe("rendering annotations", () => {
      describe("label content", () => {
        it("re-renders when the annotation formatter is changed", () => {
          let annotatedTicks = ["foo", "bar"];
          let mockScale = new Mocks.Scale<{}, number>();
          mockScale.domain(["foo", "bar"]);
          mockScale.setDomainRangeMapping("foo", 0);
          mockScale.setDomainRangeMapping("bar", 300);
          let axis = new Plottable.Axis(mockScale, "bottom");
          axis.annotationsEnabled(true);
          axis.annotatedTicks(annotatedTicks);
          let svg = TestMethods.generateSVG(300, 300);
          axis.renderTo(svg);

          assert.strictEqual(axis.content().selectAll(".annotation-label").size(), annotatedTicks.length, "annotations have rendered");

          let bazFormatter = (d: any) => d + "baz";
          axis.annotationFormatter(bazFormatter);

          let annotationLabels = axis.content().selectAll(".annotation-label");
          assert.strictEqual(annotationLabels.size(), annotatedTicks.length, "annotations have rendered");

          annotationLabels.each(function(d, i) {
            let d3this = d3.select(this);
            assert.strictEqual(d3this.text(), bazFormatter(annotatedTicks[i]), "new formatter used for annotation labels");
          });
          svg.remove();
        });

        it("can enable annotations after render", () => {
          let annotatedTicks = ["foo", "bar"];
          let mockScale = new Mocks.Scale<{}, number>();
          mockScale.domain(["foo", "bar"]);
          mockScale.setDomainRangeMapping("foo", 0);
          mockScale.setDomainRangeMapping("bar", 300);
          let axis = new Plottable.Axis(mockScale, "bottom");
          axis.annotatedTicks(annotatedTicks);
          let svg = TestMethods.generateSVG(300, 300);
          axis.renderTo(svg);

          assert.strictEqual(axis.content().selectAll(".annotation-label").size(), 0, "no annotations by default");

          axis.annotationsEnabled(true);

          assert.strictEqual(axis.content().selectAll(".annotation-label").size(), annotatedTicks.length, "no annotations by default");

          svg.remove();
        });

        it("can disable annotations after render", () => {
          let annotatedTicks = ["foo", "bar"];
          let mockScale = new Mocks.Scale<{}, number>();
          mockScale.domain(["foo", "bar"]);
          mockScale.setDomainRangeMapping("foo", 0);
          mockScale.setDomainRangeMapping("bar", 300);
          let axis = new Plottable.Axis(mockScale, "bottom");
          axis.annotationsEnabled(true);
          axis.annotatedTicks(annotatedTicks);
          let svg = TestMethods.generateSVG(300, 300);
          axis.renderTo(svg);

          assert.strictEqual(axis.content().selectAll(".annotation-label").size(), annotatedTicks.length, "no annotations by default");

          axis.annotationsEnabled(false);

          assert.strictEqual(axis.content().selectAll(".annotation-label").size(), 0, "no annotations by default");

          svg.remove();
        });

        it("re-renders when annotated ticks are set after render", () => {
          let annotatedTicks = ["foo", "bar"];
          let mockScale = new Mocks.Scale<{}, number>();
          mockScale.domain(["foo", "bar"]);
          mockScale.setDomainRangeMapping("foo", 0);
          mockScale.setDomainRangeMapping("bar", 300);
          let axis = new Plottable.Axis(mockScale, "bottom");
          axis.annotationsEnabled(true);
          let svg = TestMethods.generateSVG(300, 300);
          axis.renderTo(svg);

          assert.strictEqual(axis.content().selectAll(".annotation-label").size(), 0, "no annotations by default");

          axis.annotatedTicks(annotatedTicks);

          assert.strictEqual(axis.content().selectAll(".annotation-label").size(), annotatedTicks.length, "annotated ticks annotated");

          let annotationFormatter = axis.annotationFormatter();
          let annotationLabels = axis.content().selectAll(".annotation-label");
          annotationLabels.each(function(d, i) {
            let d3this = d3.select(this);
            assert.strictEqual(d3this.text(), annotationFormatter(annotatedTicks[i]), "annotated tick has been formatted");
          });
          svg.remove();
        });
      });

      describe("element placement in relation to annotation rectangle", () => {

        let mockScale: Mocks.Scale<string, number>;
        let annotatedTicks: string[];

        beforeEach(() => {
          mockScale = new Mocks.Scale<string, number>();
          annotatedTicks = ["A", "B", "C"];
          mockScale.domain(annotatedTicks);

          // Space out the tick values to not have collisions
          mockScale.setDomainRangeMapping("A", 50);
          mockScale.setDomainRangeMapping("B", 51);
          mockScale.setDomainRangeMapping("C", 240);
        });

        it("renders annotations at the axis baseline extending downwards with a bottom orientation axis", () => {
          let axis = new Plottable.Axis(mockScale, "bottom");
          axis.annotatedTicks(annotatedTicks);
          axis.annotationsEnabled(true);

          let svg = TestMethods.generateSVG(300, 300);
          axis.renderTo(svg);

          let annotationRects = axis.content().selectAll(".annotation-rect");

          axis.content().selectAll(".annotation-circle").each(function (d, i) {
            let annotationCircle = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.strictEqual(TestMethods.numAttr(annotationCircle, "cx"),
              TestMethods.numAttr(correspondingRect, "x"), "circle at start of rectangle");
            assert.strictEqual(TestMethods.numAttr(annotationCircle, "cy"), 0, "circle at the top");
          });

          axis.content().selectAll(".annotation-line").each(function (d, i) {
            let annotationLine = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.strictEqual(TestMethods.numAttr(annotationLine, "x1"),
              TestMethods.numAttr(correspondingRect, "x"), "line at start of rect");
            assert.strictEqual(TestMethods.numAttr(annotationLine, "x2"),
              TestMethods.numAttr(correspondingRect, "x"), "line at start of rect");
            assert.strictEqual(TestMethods.numAttr(annotationLine, "y1"), 0, "line starts at the top");
            assert.strictEqual(TestMethods.numAttr(annotationLine, "y2"),
              TestMethods.numAttr(correspondingRect, "y"), "line goes to the rect");
          });

          axis.content().selectAll(".annotation-label").each(function (d, i) {
            let annotationLabel = d3.select(this);
            let surroundingRect = d3.select(annotationRects[0][i]);
            TestMethods.assertBBoxInclusion(surroundingRect, annotationLabel);
          });
          svg.remove();
        });

        it("renders annotations at the axis baseline extending upwards with a top orientation axis", () => {
          let axis = new Plottable.Axis(mockScale, "top");
          axis.annotatedTicks(annotatedTicks);
          axis.annotationsEnabled(true);

          let svg = TestMethods.generateSVG(300, 300);
          axis.renderTo(svg);

          let annotationRects = axis.content().selectAll(".annotation-rect");

          axis.content().selectAll(".annotation-circle").each(function (d, i) {
            let annotationCircle = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.strictEqual(TestMethods.numAttr(annotationCircle, "cx"),
              TestMethods.numAttr(correspondingRect, "x"), "circle at start of rect");
            assert.strictEqual(TestMethods.numAttr(annotationCircle, "cy"), axis.height(), "circle at the bottom");
          });

          axis.content().selectAll(".annotation-line").each(function (d, i) {
            let annotationLine = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.strictEqual(TestMethods.numAttr(annotationLine, "x1"),
              TestMethods.numAttr(correspondingRect, "x"), "line at tick scaled x position");
            assert.strictEqual(TestMethods.numAttr(annotationLine, "x2"),
              TestMethods.numAttr(correspondingRect, "x"), "line at tick scaled x position");
            assert.strictEqual(TestMethods.numAttr(annotationLine, "y1"), axis.height(), "line starts at the bottom");
            assert.closeTo(TestMethods.numAttr(annotationLine, "y2"),
              TestMethods.numAttr(correspondingRect, "y") + TestMethods.numAttr(correspondingRect, "height"), 1, "line goes to the margin");
          });

          axis.content().selectAll(".annotation-label").each(function (d, i) {
            let annotationLabel = d3.select(this);
            let surroundingRect = d3.select(annotationRects[0][i]);
            TestMethods.assertBBoxInclusion(surroundingRect, annotationLabel);
          });
          svg.remove();
        });

        it("renders annotations at the axis baseline extending leftwards with a left orientation axis", () => {
          let axis = new Plottable.Axis(mockScale, "left");
          axis.annotatedTicks(annotatedTicks);
          axis.annotationsEnabled(true);

          let svg = TestMethods.generateSVG(300, 300);
          axis.renderTo(svg);

          let annotationRects = axis.content().selectAll(".annotation-rect");

          axis.content().selectAll(".annotation-circle").each(function (d, i) {
            let annotationCircle = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.strictEqual(TestMethods.numAttr(annotationCircle, "cx"), axis.width(), "circle at the right");
            assert.strictEqual(TestMethods.numAttr(annotationCircle, "cy"),
              TestMethods.numAttr(correspondingRect, "y"), "circle at tick scaled y position");
          });

          axis.content().selectAll(".annotation-line").each(function (d, i) {
            let annotationLine = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.strictEqual(TestMethods.numAttr(annotationLine, "x1"), axis.width(), "line starts at the right");
            assert.closeTo(TestMethods.numAttr(annotationLine, "x2"),
              TestMethods.numAttr(correspondingRect, "x") + TestMethods.numAttr(correspondingRect, "width"), 1, "line goes to the rect");
            assert.strictEqual(TestMethods.numAttr(annotationLine, "y1"),
              TestMethods.numAttr(correspondingRect, "y"), "line at tick scaled y position");
            assert.strictEqual(TestMethods.numAttr(annotationLine, "y2"),
              TestMethods.numAttr(correspondingRect, "y"), "line at tick scaled y position");
          });

          axis.content().selectAll(".annotation-label").each(function (d, i) {
            let annotationLabel = d3.select(this);
            let surroundingRect = d3.select(annotationRects[0][i]);
            TestMethods.assertBBoxInclusion(surroundingRect, annotationLabel);
          });
          svg.remove();
        });

        it("renders annotations at the axis baseline extending rightwards with a right orientation axis", () => {
          let axis = new Plottable.Axis(mockScale, "right");
          axis.annotatedTicks(annotatedTicks);
          axis.annotationsEnabled(true);

          let svg = TestMethods.generateSVG(300, 300);
          axis.renderTo(svg);

          let annotationRects = axis.content().selectAll(".annotation-rect");

          axis.content().selectAll(".annotation-circle").each(function (d, i) {
            let annotationCircle = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.strictEqual(TestMethods.numAttr(annotationCircle, "cx"), 0, "circle at the left");
            assert.strictEqual(TestMethods.numAttr(annotationCircle, "cy"),
              TestMethods.numAttr(correspondingRect, "y"), "circle at tick scaled y position");
          });

          axis.content().selectAll(".annotation-line").each(function (d, i) {
            let annotationLine = d3.select(this);
            let correspondingRect = d3.select(annotationRects[0][i]);
            assert.strictEqual(TestMethods.numAttr(annotationLine, "x1"), 0, "line starts at the left");
            assert.strictEqual(TestMethods.numAttr(annotationLine, "x2"),
              TestMethods.numAttr(correspondingRect, "x"), "line ends at the rect");
            assert.strictEqual(TestMethods.numAttr(annotationLine, "y1"),
              TestMethods.numAttr(correspondingRect, "y"), "line at tick scaled y position");
            assert.strictEqual(TestMethods.numAttr(annotationLine, "y2"),
              TestMethods.numAttr(correspondingRect, "y"), "line at tick scaled y position");
          });

          axis.content().selectAll(".annotation-label").each(function (d, i) {
            let annotationLabel = d3.select(this);
            let surroundingRect = d3.select(annotationRects[0][i]);
            TestMethods.assertBBoxInclusion(surroundingRect, annotationLabel);
          });
          svg.remove();
        });
      });

      describe("annotation rectangle placement", () => {
        let mockScale: Mocks.Scale<string, number>;
        let annotatedTicks: string[];

        beforeEach(() => {
          mockScale = new Mocks.Scale<string, number>();
          annotatedTicks = ["A", "B", "C"];
          mockScale.domain(annotatedTicks);

          mockScale.setDomainRangeMapping("A", 50);
          mockScale.setDomainRangeMapping("B", 100);
          mockScale.setDomainRangeMapping("C", 150);
        });

        describe("scaled position along axis", () => {
          it("places the rectangle at the scaled x position for bottom orientation", () => {
            let axis = new Plottable.Axis(mockScale, "bottom");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);

            let svg = TestMethods.generateSVG(300, 300);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(".annotation-rect");
            annotationRects.each(function (d) {
              let annotationRect = d3.select(this);
              assert.strictEqual(TestMethods.numAttr(annotationRect, "x"), mockScale.scale(d), "rectangle positioned correctly");
            });
            svg.remove();
          });

          it("places the rectangle at the scaled x position for top orientation", () => {
            let axis = new Plottable.Axis(mockScale, "top");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);

            let svg = TestMethods.generateSVG(300, 300);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(".annotation-rect");
            annotationRects.each(function (d) {
              let annotationRect = d3.select(this);
              assert.strictEqual(TestMethods.numAttr(annotationRect, "x"), mockScale.scale(d), "rectangle positioned correctly");
            });
            svg.remove();
          });

          it("places the rectangle at the scaled y position for left orientation", () => {
            let axis = new Plottable.Axis(mockScale, "left");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);

            let svg = TestMethods.generateSVG(300, 300);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(".annotation-rect");
            annotationRects.each(function (d) {
              let annotationRect = d3.select(this);
              assert.strictEqual(TestMethods.numAttr(annotationRect, "y"), mockScale.scale(d), "rectangle positioned correctly");
            });
            svg.remove();
          });

          it("places the rectangle at the scaled y position for right orientation", () => {
            let axis = new Plottable.Axis(mockScale, "right");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);

            let svg = TestMethods.generateSVG(300, 300);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(".annotation-rect");
            annotationRects.each(function (d) {
              let annotationRect = d3.select(this);
              assert.strictEqual(TestMethods.numAttr(annotationRect, "y"), mockScale.scale(d), "rectangle positioned correctly");
            });
            svg.remove();
          });
        });

        describe("first row offset position", () => {
          it("places the first row right at the beginning of the margin for bottom orientation", () => {
            let axis = new Plottable.Axis(mockScale, "bottom");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);

            let svg = TestMethods.generateSVG(300, 300);
            axis.renderTo(svg);

            let firstAnnotationRect = axis.content().select(".annotation-rect");
            assert.strictEqual(TestMethods.numAttr(firstAnnotationRect, "y"),
              axis.height() - axis.margin(), "rectangle positioned correctly");
            svg.remove();
          });

          it("places the first row right at the beginning of the margin for top orientation", () => {
            let axis = new Plottable.Axis(mockScale, "top");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);

            let svg = TestMethods.generateSVG(300, 300);
            axis.renderTo(svg);

            let firstAnnotationRect = axis.content().select(".annotation-rect");
            assert.strictEqual(TestMethods.numAttr(firstAnnotationRect, "y") + TestMethods.numAttr(firstAnnotationRect, "height"),
              axis.margin(), "rectangle positioned correctly");
            svg.remove();
          });

          it("places the first row right at the beginning of the margin for left orientation", () => {
            let axis = new Plottable.Axis(mockScale, "left");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);

            let svg = TestMethods.generateSVG(300, 300);
            axis.renderTo(svg);

            let firstAnnotationRect = axis.content().select(".annotation-rect");
            assert.strictEqual(TestMethods.numAttr(firstAnnotationRect, "x") + TestMethods.numAttr(firstAnnotationRect, "width"),
              axis.margin(), "rectangle positioned correctly");
            svg.remove();
          });

          it("places the first row right at the beginning of the margin for right orientation", () => {
            let axis = new Plottable.Axis(mockScale, "right");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);

            let svg = TestMethods.generateSVG(300, 300);
            axis.renderTo(svg);

            let firstAnnotationRect = axis.content().select(".annotation-rect");
            assert.strictEqual(TestMethods.numAttr(firstAnnotationRect, "x"),
              axis.width() - axis.margin(), "rectangle positioned correctly");
            svg.remove();
          });
        });

        describe("additional row offset position", () => {
          it("moves rectangles that would overlap to different rows downwards (orientation: bottom)", () => {
            mockScale.setDomainRangeMapping("B", mockScale.scale("A") + 1);
            let axis = new Plottable.Axis(mockScale, "bottom");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);

            let svg = TestMethods.generateSVG(300, 300);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(".annotation-rect");
            let firstAnnotationRect = d3.select(annotationRects[0][0]);
            let secondAnnotationRect = d3.select(annotationRects[0][1]);
            assert.strictEqual(TestMethods.numAttr(secondAnnotationRect, "y") - TestMethods.numAttr(firstAnnotationRect, "y"),
              TestMethods.numAttr(firstAnnotationRect, "height"), "rectangle offset by previous rectangle");
            svg.remove();
          });

          it("moves rectangles that would overlap to different rows upwards (orientation: top)", () => {
            mockScale.setDomainRangeMapping("B", mockScale.scale("A") + 1);
            let axis = new Plottable.Axis(mockScale, "top");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);

            let svg = TestMethods.generateSVG(300, 300);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(".annotation-rect");
            let firstAnnotationRect = d3.select(annotationRects[0][0]);
            let secondAnnotationRect = d3.select(annotationRects[0][1]);
            assert.strictEqual(TestMethods.numAttr(firstAnnotationRect, "y") - TestMethods.numAttr(secondAnnotationRect, "y"),
              TestMethods.numAttr(firstAnnotationRect, "height"), "rectangle offset by previous rectangle");
            svg.remove();
          });

          it("moves rectangles that would overlap to different rows leftwards (orientation: left)", () => {
            mockScale.setDomainRangeMapping("B", mockScale.scale("A") + 1);
            let axis = new Plottable.Axis(mockScale, "left");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);

            let svg = TestMethods.generateSVG(300, 300);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(".annotation-rect");
            let firstAnnotationRect = d3.select(annotationRects[0][0]);
            let secondAnnotationRect = d3.select(annotationRects[0][1]);
            assert.strictEqual(TestMethods.numAttr(firstAnnotationRect, "x") - TestMethods.numAttr(secondAnnotationRect, "x"),
              TestMethods.numAttr(firstAnnotationRect, "width"), "rectangle offset by previous rectangle");
            svg.remove();
          });

          it("moves rectangles that would overlap to different rows rightwards (orientation: right)", () => {
            mockScale.setDomainRangeMapping("B", mockScale.scale("A") + 1);
            let axis = new Plottable.Axis(mockScale, "right");
            axis.annotatedTicks(annotatedTicks);
            axis.annotationsEnabled(true);

            let svg = TestMethods.generateSVG(300, 300);
            axis.renderTo(svg);

            let annotationRects = axis.content().selectAll(".annotation-rect");
            let firstAnnotationRect = d3.select(annotationRects[0][0]);
            let secondAnnotationRect = d3.select(annotationRects[0][1]);
            assert.strictEqual(TestMethods.numAttr(secondAnnotationRect, "x") - TestMethods.numAttr(firstAnnotationRect, "x"),
              TestMethods.numAttr(firstAnnotationRect, "width"), "rectangle offset by previous rectangle");
            svg.remove();
          });
        });

      });

      it("hides annotations if rectangles are outside the margin area", () => {
        let mockScale = new Mocks.Scale<string, number>();
        let annotatedTicks = ["A", "B", "C"];
        mockScale.domain(annotatedTicks);

        mockScale.setDomainRangeMapping("A", 50);
        mockScale.setDomainRangeMapping("B", 51);
        mockScale.setDomainRangeMapping("C", 150);

        let axis = new Plottable.Axis(mockScale, "bottom");
        axis.annotatedTicks(annotatedTicks);
        axis.annotationsEnabled(true);
        axis.margin(25);

        let svg = TestMethods.generateSVG(300, 300);
        axis.renderTo(svg);

        axis.content().selectAll(".annotation-rect").each(function() {
          let annotationRect = d3.select(this);
          let bbox = this.getBBox();
          let insideMargin = bbox.x >= 0 && bbox.x + bbox.width <= axis.width() &&
                             bbox.y >= axis.height() - axis.margin() && bbox.y + bbox.height <= axis.height();
          let visibilityAttr = insideMargin ? "visible" : "hidden";
          assert.strictEqual(annotationRect.attr("visibility"), visibilityAttr, "annotation rect inside margin area");
        });
        svg.remove();
      });

    });
  });
});
