import { SimpleSelection } from "../../src/core/interfaces";
import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("TimeAxis", () => {

  let orientations: ["top", "bottom"] = ["top", "bottom"];

  describe("setting the orientation", () => {
    it("throws an error when setting a vertical orientation", () => {
      let scale = new Plottable.Scales.Time();
      assert.throws(() => new Plottable.Axes.Time(scale, "left" as any), "horizontal");
      assert.throws(() => new Plottable.Axes.Time(scale, "right" as any), "horizontal");
    });

    it("cannot change to a vertical orientation", () => {
      let scale = new Plottable.Scales.Time();
      let originalOrientation: "bottom" = "bottom";
      let axis = new Plottable.Axes.Time(scale, originalOrientation);
      assert.throws(() => axis.orientation("left" as any), "horizontal");
      assert.throws(() => axis.orientation("right" as any), "horizontal");
      assert.strictEqual(axis.orientation(), originalOrientation, "orientation unchanged");
      axis.destroy();
    });
  });

  describe("rendering in edge case scenarios", () => {
    it("does not error when setting the domain to a large span", () => {
      let scale = new Plottable.Scales.Time();
      let axis = new Plottable.Axes.Time(scale, "bottom");
      let svg = TestMethods.generateSVG();
      axis.renderTo(svg);

      // very large time span
      assert.doesNotThrow(() => scale.domain([new Date(0, 0, 1, 0, 0, 0, 0), new Date(5000, 0, 1, 0, 0, 0, 0)]));
      axis.destroy();
      svg.remove();
    });

    it("does not error when setting the domain to a small span", () => {
      let scale = new Plottable.Scales.Time();
      let axis = new Plottable.Axes.Time(scale, "bottom");
      let svg = TestMethods.generateSVG();
      axis.renderTo(svg);

      // very small time span
      assert.doesNotThrow(() => scale.domain([new Date(0, 0, 1, 0, 0, 0, 0), new Date(0, 0, 1, 0, 0, 0, 100)]));
      axis.destroy();
      svg.remove();
    });
  });

  function assertVisibleLabelsDoNotOverlap(axis: Plottable.Axes.Time) {
    axis.content().selectAll<Element, any>(`.${Plottable.Axis.TICK_LABEL_CLASS}-container`).each(function(d, i) {
      let container = d3.select(this);
      let visibleTickLabels = container
        .selectAll<Element, any>(`.${Plottable.Axis.TICK_LABEL_CLASS}`)
        .filter(function() {
          return d3.select(this).style("visibility") === "visible";
        });
      visibleTickLabels.each(function(d2, j) {
        let clientRect1 = this.getBoundingClientRect();
        visibleTickLabels.filter((d3, k) => k > j).each(function(d3, k) {
          let clientRect2 = this.getBoundingClientRect();
          assert.isFalse(Plottable.Utils.DOM.clientRectsOverlap(clientRect1, clientRect2), "tick labels don't overlap");
        });
      });
    });
  }

  orientations.forEach((orientation) => {
    let domains = [
      // 100 year span
      [new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2100, 0, 1, 0, 0, 0, 0)],
      // 1 year span
      [new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 11, 31, 0, 0, 0, 0)],
      // 1 month span
      [new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 1, 1, 0, 0, 0, 0)],
      // 1 day span
      [new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 23, 0, 0, 0)],
      // 1 hour span
      [new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 1, 0, 0, 0)],
      // 1 minute span
      [new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 1, 0, 0)],
      // 1 second span
      [new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 0, 1, 0)],
    ];

    it(`does not overlap visible tick labels with orientation ${orientation}`, () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Time();
      let axis = new Plottable.Axes.Time(scale, orientation);
      axis.renderTo(svg);

      domains.forEach((domain) => {
        scale.domain(domain);
        assertVisibleLabelsDoNotOverlap(axis);
      });

      axis.destroy();
      svg.remove();
    });
  });

  function assertTickMarksAndLabelsDoNotOverlap(axis: Plottable.Axes.Time) {
    let tickMarks = axis.content().selectAll<Element, any>(`.${Plottable.Axis.TICK_MARK_CLASS}:not(.${Plottable.Axis.END_TICK_MARK_CLASS})`);
    assert.operator(tickMarks.size(), ">=", 1, "There is at least one tick mark in the test");
    let tickLabels = axis.content().selectAll<Element, any>(`.${Plottable.Axis.TICK_LABEL_CLASS}`).filter(function(d, i) {
        return d3.select(this).style("visibility") !== "hidden";
    });
    assert.operator(tickLabels.size(), ">=", 1, "There is at least one tick label in the test");
    tickMarks.each(function(tickMark, i) {
      let tickMarkRect = this.getBoundingClientRect();
      tickLabels.each(function(tickLabel, j) {
        let tickLabelRect = this.getBoundingClientRect();
        let isOverlap = Plottable.Utils.DOM.clientRectsOverlap(tickMarkRect, tickLabelRect);
        assert.isFalse(isOverlap, `Tick mark ${i} should not overlap with tick label ${j}`);
      });
    });
  }

  let tierLabelPositions = ["center", "between"];
  orientations.forEach((orientation) => {
    tierLabelPositions.forEach((tierLabelPosition) => {
      it(`does not overlap labels with tick marks when label position is ${tierLabelPosition} and orientation ${orientation}`, () => {
        let scale = new Plottable.Scales.Time();
        let axis = new Plottable.Axes.Time(scale, orientation);
        let svg = TestMethods.generateSVG();
        axis.tierLabelPositions([tierLabelPosition, tierLabelPosition]);
        axis.renderTo(svg);
        assertTickMarksAndLabelsDoNotOverlap(axis);
        svg.remove();
      });
    });
  });

  describe("drawing tick marks", () => {
    let axis: Plottable.Axes.Time;
    let svg: SimpleSelection<void>;

    beforeEach(() => {
      let scale = new Plottable.Scales.Time();
      axis = new Plottable.Axes.Time(scale, "bottom");
      svg = TestMethods.generateSVG();
    });

    afterEach(() => {
      axis.destroy();
    });

    it("renders end ticks at the two edges", () => {
      axis.renderTo(svg);
      let firstTick = axis.content().select(`.${Plottable.Axis.TICK_MARK_CLASS}`);
      assert.strictEqual(firstTick.attr("x1"), "0", "first tick mark at beginning of axis");
      assert.strictEqual(firstTick.attr("x2"), "0", "first tick mark at beginning of axis");
      let lastTick = axis.content().select(`.${Plottable.Axis.TICK_MARK_CLASS}:last-child`);
      assert.strictEqual(lastTick.attr("x1"), svg.attr("width"), "last end tick mark at end of axis");
      assert.strictEqual(lastTick.attr("x2"), svg.attr("width"), "last end tick mark at end of axis");
      svg.remove();
    });

    it("adds the end-tick class to the first and last ticks", () => {
      axis.renderTo(svg);
      let firstTick = axis.content().select(`.${Plottable.Axis.TICK_MARK_CLASS}`);
      assert.isTrue(firstTick.classed(Plottable.Axis.END_TICK_MARK_CLASS), "first end tick has end-tick-mark class");
      let lastTick = axis.content().select(`.${Plottable.Axis.TICK_MARK_CLASS}:last-child`);
      assert.isTrue(lastTick.classed(Plottable.Axis.END_TICK_MARK_CLASS), "last end tick has end-tick-mark class");
      svg.remove();
    });

    it("sets the length of the end ticks to the specified value when tierLabelPosition is set to center", () => {
      axis.tierLabelPositions(["center", "center"]);
      axis.renderTo(svg);
      let endTicks = axis.content().selectAll<Element, any>(`.${Plottable.Axis.END_TICK_MARK_CLASS}`);
      assert.operator(endTicks.size(), ">=", 1, "At least one end tick mark is selected in the test");
      endTicks.each(function(d, i){
        let endTick = d3.select(this);
        let tickLength = Math.abs(TestMethods.numAttr(endTick, "y1") - TestMethods.numAttr(endTick, "y2"));
        assert.closeTo(tickLength, axis.endTickLength(), window.Pixel_CloseTo_Requirement,
          `end tick mark ${i} length should equal the specified amount`);
      });
      svg.remove();
    });
  });

  describe("formatting annotation ticks", () => {
    it("formats the dates to '{{abbreviated weekday}} {{abbreviated month}} {{day of month}}, {{year}}' by default", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Time();
      let axis = new Plottable.Axes.Time(scale, "bottom");
      axis.annotationsEnabled(true);

      let testDate = new Date((scale.domain()[0].valueOf() + scale.domain()[1].valueOf()) / 2);
      axis.annotatedTicks([testDate]);
      let defaultFormatter = Plottable.Formatters.time("%a %b %d, %Y");

      let annotationFormatter = axis.annotationFormatter();
      assert.strictEqual(annotationFormatter(testDate), defaultFormatter(testDate), "formats to a default customized time formatter");

      axis.renderTo(svg);

      let annotationLabels = axis.content().selectAll<Element, any>(".annotation-label");
      annotationLabels.each(function(d, i) {
        let annotationLabel = d3.select(this);
        assert.strictEqual(annotationLabel.text(), defaultFormatter(d), "formats to a default customized time formatter");
      });
      svg.remove();
    });
  });

  describe("calculating space", () => {
    let axis: Plottable.Axes.Time;
    let svg: SimpleSelection<void>;

    beforeEach(() => {
      let scale = new Plottable.Scales.Time();
      axis = new Plottable.Axes.Time(scale, "bottom");
      svg = TestMethods.generateSVG();
    });

    afterEach(() => {
      axis.destroy();
    });

    it("grows in height for each added tier", () => {
      axis.axisConfigurations([
        [
          {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
        ],
      ]);
      axis.renderTo(svg);

      let oneTierHeight = axis.height();

      axis.axisConfigurations([
        [
          {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
          {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
        ],
      ]);

      let twoTierHeight = axis.height();

      assert.operator(twoTierHeight, ">", oneTierHeight, "two-tiered a taller than one-tiered");

      axis.axisConfigurations([
        [
          {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
          {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
          {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
        ],
      ]);

      let threeTierHeight = axis.height();

      assert.operator(threeTierHeight, ">", twoTierHeight, "three-tiered is taller than the two-tiered");

      svg.remove();
    });

    it("shrinks in height if a newly set configuration provides less tiers", () => {
      axis.axisConfigurations([
        [
          {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
          {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
        ],
      ]);
      axis.renderTo(svg);

      let twoTierHeight = axis.height();

      axis.axisConfigurations([
        [
          {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
        ],
      ]);

      let newHeight = axis.height();

      assert.operator(newHeight, "<", twoTierHeight, "two-tier time axis shrinks when changed to 1 tier");

      svg.remove();
    });

    it("includes the margin, label padding, and tick length in the height", () => {
      axis.margin(100);
      axis.anchor(svg);
      axis.computeLayout({ x: 0, y: 0 }, 400, 400);
      let minimumHeight = axis.tickLabelPadding() + axis.margin() + axis.innerTickLength();
      assert.operator(axis.height(), ">=", minimumHeight, "height includes all relevant pieces");
      svg.remove();
    });

    it("includes the annotation space in the height", () => {
      axis.annotationsEnabled(true);
      axis.annotationTierCount(2);

      axis.anchor(svg);
      axis.computeLayout({ x: 0, y: 0}, TestMethods.numAttr(svg, "width"), TestMethods.numAttr(svg, "height"));
      let twoAnnotationTierHeight = axis.height();

      axis.annotationTierCount(3);
      axis.computeLayout({ x: 0, y: 0}, TestMethods.numAttr(svg, "width"), TestMethods.numAttr(svg, "height"));

      assert.operator(axis.height(), ">", twoAnnotationTierHeight, "height includes all relevant pieces");
      axis.destroy();
      svg.remove();
    });
  });

  describe("drawing tiers", () => {
    it("draws all of tiers within the component space", () => {
      let svg = TestMethods.generateSVG();
      let constrainedHeight = 50;
      svg.attr("height", constrainedHeight);
      let scale = new Plottable.Scales.Time();
      let axis = new Plottable.Axes.Time(scale, "bottom");

      let tiersToCreate = 15;
      let configuration = Array.apply(null, Array(tiersToCreate)).map(() => {
        return {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e") };
      });
      axis.axisConfigurations([configuration]);

      axis.renderTo(svg);

      let axisBoundingRect = (<Element> svg.select(".axis").select(".bounding-box").node()).getBoundingClientRect();

      let isInsideAxisBoundingRect = function(innerRect: ClientRect) {
        return Math.floor(innerRect.bottom) <= Math.ceil(axisBoundingRect.bottom) + window.Pixel_CloseTo_Requirement &&
              Math.floor(axisBoundingRect.top) <= Math.ceil(innerRect.top) + window.Pixel_CloseTo_Requirement;
      };

      axis.content()
        .selectAll<Element, any>(`.${Plottable.Axes.Time.TIME_AXIS_TIER_CLASS}`)
        .each(function(d, i) {
          let tier = d3.select(this);
          let visibility = tier.style("visibility");

          // HACKHACK window.getComputedStyle() is behaving weirdly in IE9. Further investigation required
          if (visibility === "inherit") {
            visibility = getStyleInIE9(tier.node());
          }
          if (isInsideAxisBoundingRect(tier.node().getBoundingClientRect())) {
            assert.strictEqual(visibility, "visible", `tier ${i} inside axis should be visible`);
          } else {
            assert.strictEqual(visibility, "hidden", `tier ${i} outside axis should not be visible`);
          }
        });

      svg.remove();
      axis.destroy();

      function getStyleInIE9(element: Element) {
        while (element) {
          let visibility = window.getComputedStyle(element).visibility;
          if (visibility !== "inherit") {
            return visibility;
          }
          element = <Element> element.parentNode;
        }
        return "visible";
      }
    });
  });

  describe("configuring the label presentation", () => {
    it("allows usage of a custom configuration list", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Time();
      let axis = new Plottable.Axes.Time(scale, "bottom");
      let formatter = Plottable.Formatters.time("%a %e");
      axis.axisConfigurations([
        [
          {interval: Plottable.TimeInterval.day, step: 2, formatter: formatter},
        ],
      ]);
      axis.renderTo(svg);
      let tickLabels = axis.content().selectAll<Element, any>(".tick-label");
      tickLabels.each(function(d, i) {
        let tickLabel = d3.select(this);
        assert.strictEqual(tickLabel.text(), formatter(d), "formats to a customized time formatter");
      });
      axis.destroy();
      svg.remove();
    });
  });

  describe("limiting timeinterval precision", () => {
    it("uses default axis config when maxTimeIntervalPrecision not set", () => {
      let svg = TestMethods.generateSVG();
      let axis = new Plottable.Axes.Time(new Plottable.Scales.Time(), "bottom");

      axis.renderTo(svg);
      let config = axis.currentAxisConfiguration();
      assert.strictEqual(config.length, 2, "2 tiers");
      assert.strictEqual(config[0].interval, "hour");
      assert.strictEqual(config[1].interval, "day");

      axis.destroy();
      svg.remove();
    });

    it("still works when maxTimeIntervalPrecision is set high", () => {
      let svg = TestMethods.generateSVG();
      let axis = new Plottable.Axes.Time(new Plottable.Scales.Time(), "bottom");

      axis.maxTimeIntervalPrecision("minute")
      axis.renderTo(svg);
      let config = axis.currentAxisConfiguration();
      assert.strictEqual(config.length, 2, "2 tiers");
      assert.strictEqual(config[0].interval, "hour");
      assert.strictEqual(config[1].interval, "day");

      axis.destroy();
      svg.remove();
    });

    it("limits axis config when maxTimeIntervalPrecision is set", () => {
      let svg = TestMethods.generateSVG();
      let axis = new Plottable.Axes.Time(new Plottable.Scales.Time(), "bottom");

      axis.maxTimeIntervalPrecision("day")
      axis.renderTo(svg);
      let config = axis.currentAxisConfiguration();
      // day/month is most precise valid config after hour/day
      assert.strictEqual(config.length, 2, "2 tiers");
      assert.strictEqual(config[0].interval, "day");
      assert.strictEqual(config[1].interval, "month");

      axis.destroy();
      svg.remove();
    });
  });
});
