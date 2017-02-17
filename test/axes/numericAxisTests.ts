import { SimpleSelection } from "../../src/core/interfaces";
import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Axes", () => {
  describe("NumericAxis", () => {
    function assertBoxInside(inner: ClientRect, outer: ClientRect, epsilon = 0, message = "") {
      assert.operator(inner.left, ">", outer.left - epsilon, message + " (box inside (left))");
      assert.operator(inner.right, "<", outer.right + epsilon, message + " (box inside (right))");
      assert.operator(inner.top, ">", outer.top - epsilon, message + " (box inside (top))");
      assert.operator(inner.bottom, "<", outer.bottom + epsilon, message + " (box inside (bottom))");
    }

    function applyVisibleFilter(selection: SimpleSelection<any>) {
      return selection.filter(function() {
        const visibilityAttr =  d3.select(this).style("visibility");
        return visibilityAttr === "visible" || visibilityAttr === "inherit";
      });
    }

    const horizontalOrientations: Plottable.AxisOrientation[] = ["top", "bottom"];
    const verticalOrientations: Plottable.AxisOrientation[] = ["left", "right"];
    const orientations = horizontalOrientations.concat(verticalOrientations);

    const isHorizontalOrientation = (orientation: Plottable.AxisOrientation) => horizontalOrientations.indexOf(orientation) >= 0;

    describe("managing tick labels", () => {
      const verticalTickLabelPositions = ["top", "bottom"];
      const horizontalTickLabelPositions = ["left", "right"];

      horizontalOrientations.forEach((orientation) => {
        it(`throws an error when setting an invalid position on orientation ${orientation}`, () => {
          const scale = new Plottable.Scales.Linear();
          const axis = new Plottable.Axes.Numeric(scale, orientation);
          verticalTickLabelPositions.forEach((position) => {
            (<any> assert).throws(() => axis.tickLabelPosition(position), "horizontal", `cannot set position to ${position}`);
          });
        });
      });

      verticalOrientations.forEach((orientation) => {
        it(`throws an error when setting an invalid position on orientation ${orientation}`, () => {
          const scale = new Plottable.Scales.Linear();
          const axis = new Plottable.Axes.Numeric(scale, orientation);
          horizontalTickLabelPositions.forEach((position) => {
            (<any> assert).throws(() => axis.tickLabelPosition(position), "vertical", `cannot set position to ${position}`);
          });
        });
      });

      orientations.forEach((orientation) => {
        const labelPositions = isHorizontalOrientation(orientation) ? horizontalTickLabelPositions : verticalTickLabelPositions;
        labelPositions.forEach((labelPosition) => {
          it(`draws tick labels ${labelPosition} of the corresponding mark if specified for orientation ${orientation}`, () => {
            const scale = new Plottable.Scales.Linear();
            const axis = new Plottable.Axes.Numeric(scale, orientation);
            const svg = TestMethods.generateSVG();
            axis.tickLabelPosition(labelPosition);
            axis.renderTo(svg);

            const tickLabels = axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`);
            const tickMarks = axis.content().selectAll(`.${Plottable.Axis.TICK_MARK_CLASS}`);
            assert.operator(tickLabels.size(), ">=", 2, "at least two tick labels were drawn");
            assert.strictEqual(tickLabels.size(), tickMarks.size(), "there is one label per mark");

            tickLabels.each(function(d, i) {
              TestMethods.assertBBoxNonIntersection(d3.select(this), d3.select(tickMarks[0][i]));
            });
            svg.remove();
          });
        });
      });

      orientations.forEach((orientation) => {
        it(`does not overlap tick labels in a constrained space for orientation ${orientation}`, () => {
          const svg = TestMethods.generateSVG();
          const constrainedWidth = 50;
          const constrainedHeight = 50;
          svg.attr("width", constrainedWidth);
          svg.attr("height", constrainedHeight);
          const scale = new Plottable.Scales.Linear();
          const axis = new Plottable.Axes.Numeric(scale, orientation);
          axis.renderTo(svg);

          const visibconstickLabels = applyVisibleFilter(axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`));

          visibconstickLabels.each(function(d, i) {
            const labelRect = this.getBoundingClientRect();
            visibconstickLabels[0].slice(i + 1).forEach(function(otherVisibconstickLabel, i2) {
              const labelRect2 = (<Element> otherVisibconstickLabel).getBoundingClientRect();
              const rectOverlap = Plottable.Utils.DOM.clientRectsOverlap(labelRect, labelRect2);
              assert.isFalse(rectOverlap, `tick label ${i} does not overlap with tick label ${i2}`);
            });
          });

          svg.remove();
        });
      });

      orientations.forEach((orientation) => {
        it(`separates tick labels with the same spacing for orientation ${orientation}`, () => {
          const svg = TestMethods.generateSVG();
          const scale = new Plottable.Scales.Linear();
          scale.domain([-2500000, 2500000]);

          const axis = new Plottable.Axes.Numeric(scale, orientation);
          axis.renderTo(svg);

          const visibconstickLabels = applyVisibleFilter(axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`));

          const visibconstickLabelRects = visibconstickLabels[0].map((label: Element) => label.getBoundingClientRect());

          function getClientRectCenter(rect: ClientRect) {
            return isHorizontalOrientation(orientation) ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
          }

          const interval = getClientRectCenter(visibconstickLabelRects[1]) - getClientRectCenter(visibconstickLabelRects[0]);
          d3.pairs(visibconstickLabelRects).forEach((rects, i) => {
            assert.closeTo(getClientRectCenter(rects[1]) - getClientRectCenter(rects[0]),
              interval, window.Pixel_CloseTo_Requirement, `tick label pair ${i} is spaced the same as the first pair`);
          });

          svg.remove();
        });
      });

      orientations.forEach((orientation) => {
        it(`renders numbers in order with a reversed domain for orientation ${orientation}`, () => {
          const svg = TestMethods.generateSVG();
          const scale = new Plottable.Scales.Linear();
          scale.domain([3, 0]);

          const axis = new Plottable.Axes.Numeric(scale, orientation);
          axis.renderTo(svg);

          const tickLabels = applyVisibleFilter(axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`));
          assert.operator(tickLabels.size(), ">", 1, "more than one tick label is shown");

          const tickLabelElementPairs = d3.pairs(tickLabels[0]);
          tickLabelElementPairs.forEach(function(tickLabelElementPair, i) {
            const label1 = d3.select(tickLabelElementPair[0]);
            const label2 = d3.select(tickLabelElementPair[1]);
            const labelNumber1 = parseFloat(label1.text());
            const labelNumber2 = parseFloat(label2.text());
            assert.operator(labelNumber1, ">", labelNumber2, `pair ${i} arranged in descending order from left to right`);
          });

          svg.remove();
        });
      });

      verticalOrientations.forEach((orientation) => {
        it(`ensures that long labels are contained for vertical orientation ${orientation}`, () => {
          const scale = new Plottable.Scales.Linear().domain([400000000, 500000000]);
          const axis = new Plottable.Axes.Numeric(scale, orientation);

          const svg = TestMethods.generateSVG();
          axis.renderTo(svg);

          const tickLabelContainerClass = "tick-label-container";
          const labelContainer = axis.content().select(`.${tickLabelContainerClass}`);
          axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`).each(function() {
            TestMethods.assertBBoxInclusion(labelContainer, d3.select(this));
          });
          svg.remove();
        });
      });

      orientations.forEach((orientation) => {
        it(`draws ticks labels centered with the corresponding tick mark for orientation ${orientation}`, () => {
          const svg = TestMethods.generateSVG();
          const scale = new Plottable.Scales.Linear();
          const axis = new Plottable.Axes.Numeric(scale, orientation);
          axis.renderTo(svg);

          const tickLabels = axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`);
          assert.operator(tickLabels.size(), ">=", 2, "at least two tick labels were drawn");
          const tickMarks = axis.content().selectAll(`.${Plottable.Axis.TICK_MARK_CLASS}`);
          assert.strictEqual(tickLabels.size(), tickMarks.size(), "there is one label per mark");

          tickLabels.each(function(d, i) {
            const tickLabelClientRect = this.getBoundingClientRect();
            const tickMarkClientRect = (<Element> tickMarks[0][i]).getBoundingClientRect();
            const labelCenter = isHorizontalOrientation(orientation) ?
              (tickLabelClientRect.left + tickLabelClientRect.right) / 2 :
              (tickLabelClientRect.top + tickLabelClientRect.bottom) / 2;
            const markCenter = isHorizontalOrientation(orientation) ?
              (tickMarkClientRect.left + tickMarkClientRect.right) / 2 :
              (tickMarkClientRect.top + tickMarkClientRect.bottom) / 2;
            assert.closeTo(labelCenter, markCenter, 1.5, `tick label ${i} is centered on mark`);
          });

          svg.remove();
        });
      });

      it("does not overlap tick marks with tick labels", () => {
        const svg = TestMethods.generateSVG();

        const scale = new Plottable.Scales.Linear();
        scale.domain([175, 185]);
        const axis = new Plottable.Axes.Numeric(scale, "left")
                                      .innerTickLength(50);
        axis.renderTo(svg);

        const tickLabels = applyVisibleFilter(axis.content().selectAll("." + Plottable.Axis.TICK_LABEL_CLASS));

        const tickMarks = applyVisibleFilter(axis.content().selectAll("." + Plottable.Axis.TICK_MARK_CLASS));

        tickLabels.each(function(d, i) {
          const tickLabelRect = this.getBoundingClientRect();
          tickMarks.each(function(d2, i2) {
            const tickMarkRect = this.getBoundingClientRect();
              assert.isFalse(Plottable.Utils.DOM.clientRectsOverlap(tickLabelRect, tickMarkRect),
                `tickMark ${i} and tickLabel ${i2} should not overlap`);
          });
        });
        svg.remove();
      });
    });

    describe("formatting the labels", () => {
      it("formats to the specified formatter", () => {
        const svg = TestMethods.generateSVG();
        const scale = new Plottable.Scales.Linear();

        const formatter = Plottable.Formatters.fixed(2);

        const axis = new Plottable.Axes.Numeric(scale, "left");
        axis.formatter(formatter);
        axis.renderTo(svg);

        const tickLabels = axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`);
        tickLabels.each(function(d, i) {
          const labelText = d3.select(this).text();
          assert.strictEqual(labelText, formatter(d), `formatter used to format tick label ${i}`);
        });

        svg.remove();
      });
    });

    describe("allocating space", () => {
      let svg: SimpleSelection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
      });

      afterEach(function() {
        if (this.currentTest.state === "passed") {
          svg.remove();
        }
      });

      orientations.forEach((orientation) => {
        it(`allocates enough height to show all tick labels for orientation ${orientation}`, () => {
          const scale = new Plottable.Scales.Linear();
          scale.domain([5, -5]);

          const axis = new Plottable.Axes.Numeric(scale, orientation);
          axis.renderTo(svg);

          const visibconstickLabels = applyVisibleFilter(axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`));
          const boundingBox = (<Element> svg.select(".axis").select(".bounding-box").node()).getBoundingClientRect();
          visibconstickLabels.each(function(d, i) {
            const visibconstickLabelRect = this.getBoundingClientRect();
            assertBoxInside(visibconstickLabelRect, boundingBox, 0.5, `tick label ${i} is inside the bounding box`);
          });
        });
      });

      verticalOrientations.forEach((verticalOrientation) => {
        it(`allocates enough width to show long tick labels for orientation ${verticalOrientation}`, () => {
          const scale = new Plottable.Scales.Linear();
          scale.domain([50000000000, -50000000000]);

          const axis = new Plottable.Axes.Numeric(scale, verticalOrientation);
          axis.renderTo(svg);

          const visibconstickLabels = applyVisibleFilter(axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`));
          const boundingBox = (<Element> svg.select(".axis").select(".bounding-box").node()).getBoundingClientRect();
          visibconstickLabels.each(function(d, i) {
            const visibconstickLabelRect = this.getBoundingClientRect();
            assertBoxInside(visibconstickLabelRect, boundingBox, 0, `long tick label ${i} is inside the bounding box`);
          });
        });
      });
    });

    describe("drawing tick marks", () => {
      it("does not draw ticks marks outside of the svg", () => {
        const svg = TestMethods.generateSVG();
        const scale = new Plottable.Scales.Linear();
        const domainMin = 0;
        const domainMax = 3;
        scale.domain([domainMin, domainMax]);
        scale.tickGenerator(function() {
          return Plottable.Utils.Math.range(domainMin, domainMax + 4);
        });
        const axis = new Plottable.Axes.Numeric(scale, "bottom");
        axis.renderTo(svg);
        const tickMarks = axis.content().selectAll(".tick-mark");
        tickMarks.each(function(d, i) {
          const tickMark = d3.select(this);
          const tickMarkPosition = TestMethods.numAttr(tickMark, "x1");
          assert.operator(tickMarkPosition, ">=", 0, `tick mark ${i} drawn right of left edge`);
          assert.operator(tickMarkPosition, "<=", axis.width(), `tick mark ${i} drawn left of right edge`);
        });
        svg.remove();
      });
    });

    describe("using width approximation", () => {
      it("reasonably approximates tick label sizes with approximate measuring", () => {
        const svg = TestMethods.generateSVG();

        const testDomains = [
          [-1, 1],
          [0, 10],
          [0, 999999999],
        ];

        const maxErrorFactor = 1.4;

        testDomains.forEach((testDomain) => {
          const scale = new Plottable.Scales.Linear();
          scale.domain(testDomain);
          const axis = new Plottable.Axes.Numeric(scale, "left");

          axis.usesTextWidthApproximation(true);
          axis.renderTo(svg);
          const widthApprox = axis.width();

          axis.usesTextWidthApproximation(false);
          axis.redraw();
          const widthExact = axis.width();

          assert.operator(widthApprox, "<", (widthExact * maxErrorFactor),
            `approximate domain of [${testDomain[0]},${testDomain[1]}] less than ${maxErrorFactor} times larger than exact scale`);
          assert.operator(widthApprox, ">=", widthExact,
            `approximate domain of [${testDomain[0]},${testDomain[1]}] greater than an exact scale`);
          axis.destroy();
        });

        svg.remove();
      });
    });
  });
});
