///<reference path="../testReference.ts" />

describe("TimeAxis", () => {
  let scale: Plottable.Scales.Time;
  let axis: Plottable.Axes.Time;
  beforeEach(() => {
    scale = new Plottable.Scales.Time();
    axis = new Plottable.Axes.Time(scale, "bottom");
  });

  it("can not initialize vertical time axis", () => {
      assert.throws(() => new Plottable.Axes.Time(scale, "left"), "horizontal");
      assert.throws(() => new Plottable.Axes.Time(scale, "right"), "horizontal");
  });

  it("cannot change time axis orientation to vertical", () => {
      assert.throws(() => axis.orientation("left"), "horizontal");
      assert.throws(() => axis.orientation("right"), "horizontal");
      assert.strictEqual(axis.orientation(), "bottom", "orientation unchanged");
  });

  it("Computing the default ticks doesn't error out for edge cases", () => {
    let svg = TestMethods.generateSVG(400, 100);
    scale.range([0, 400]);

    // very large time span
    assert.doesNotThrow(() => scale.domain([new Date(0, 0, 1, 0, 0, 0, 0), new Date(50000, 0, 1, 0, 0, 0, 0)]));
    axis.renderTo(svg);

    // very small time span
    assert.doesNotThrow(() => scale.domain([new Date(0, 0, 1, 0, 0, 0, 0), new Date(0, 0, 1, 0, 0, 0, 100)]));
    axis.renderTo(svg);

    svg.remove();
  });

  it("Tick labels don't overlap", () => {
    let svg = TestMethods.generateSVG(400, 100);
    scale.range([0, 400]);

    function checkDomain(domain: any[]) {
      scale.domain(domain);
      axis.renderTo(svg);

      function checkLabelsForContainer(container: d3.Selection<void>) {
        let visibleTickLabels = container
                .selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
                .filter(function(d: any, i: number) {
                  return d3.select(this).style("visibility") === "visible";
                });
        let numLabels = visibleTickLabels[0].length;
        let clientRect1: ClientRect;
        let clientRect2: ClientRect;
        for (let i = 0; i < numLabels; i++) {
          for (let j = i + 1; j < numLabels; j++) {
            clientRect1 = (<Element> visibleTickLabels[0][i]).getBoundingClientRect();
            clientRect2 = (<Element> visibleTickLabels[0][j]).getBoundingClientRect();

            assert.isFalse(Plottable.Utils.DOM.clientRectsOverlap(clientRect1, clientRect2), "tick labels don't overlap");
          }
        }
      }

      (<any>axis)._tierLabelContainers.forEach(checkLabelsForContainer);
    }
    // 100 year span
    checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2100, 0, 1, 0, 0, 0, 0)]);
    // 1 year span
    checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 11, 31, 0, 0, 0, 0)]);
    // 1 month span
    checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 1, 1, 0, 0, 0, 0)]);
    // 1 day span
    checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 23, 0, 0, 0)]);
    // 1 hour span
    checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 1, 0, 0, 0)]);
    // 1 minute span
    checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 1, 0, 0)]);
    // 1 second span
    checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 0, 1, 0)]);

    svg.remove();
  });

  it("custom possible axis configurations", () => {
    let svg = TestMethods.generateSVG(800, 100);
    let scale = new Plottable.Scales.Time();
    let axis = new Plottable.Axes.Time(scale, "bottom");
    let configurations = axis.axisConfigurations();
    let newPossibleConfigurations = configurations.slice(0, 3);
    newPossibleConfigurations.forEach(axisConfig => axisConfig.forEach(tierConfig => {
      tierConfig.interval = Plottable.TimeInterval.minute;
      tierConfig.step += 3;
    }));
    axis.axisConfigurations(newPossibleConfigurations);
    let now = new Date();
    let twoMinutesBefore = new Date(now.getTime());
    twoMinutesBefore.setMinutes(now.getMinutes() - 2);
    scale.domain([twoMinutesBefore, now]);
    scale.range([0, 800]);
    axis.renderTo(svg);
    let configs = newPossibleConfigurations[(<any> axis)._mostPreciseConfigIndex];
    assert.deepEqual(configs[0].interval, Plottable.TimeInterval.minute, "axis used new time unit");
    assert.deepEqual(configs[0].step, 4, "axis used new step");
    svg.remove();
  });

  it("renders end ticks on either side", () => {
    let width = 500;
    let svg = TestMethods.generateSVG(width, 100);
    scale.domain([new Date("2010-01-01"), new Date("2014-01-01")]);
    axis.renderTo(svg);
    let firstTick = d3.select(".tick-mark");
    assert.strictEqual(firstTick.attr("x1"), "0", "xPos (x1) of first end tick is at the beginning of the axis container");
    assert.strictEqual(firstTick.attr("x2"), "0", "xPos (x2) of first end tick is at the beginning of the axis container");
    let lastTick = d3.select(d3.selectAll(".tick-mark")[0].pop());
    assert.strictEqual(lastTick.attr("x1"), String(width), "xPos (x1) of last end tick is at the end of the axis container");
    assert.strictEqual(lastTick.attr("x2"), String(width), "xPos (x2) of last end tick is at the end of the axis container");
    svg.remove();
  });

  it("adds a class corresponding to the end-tick for the first and last ticks", () => {
    let width = 500;
    let svg = TestMethods.generateSVG(width, 100);
    scale.domain([new Date("2010-01-01"), new Date("2014-01-01")]);
    axis.renderTo(svg);
    let firstTick = d3.select("." + Plottable.Axis.TICK_MARK_CLASS);
    assert.isTrue(firstTick.classed(Plottable.Axis.END_TICK_MARK_CLASS), "first end tick has the end-tick-mark class");
    let lastTick = d3.select(d3.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0].pop());
    assert.isTrue(lastTick.classed(Plottable.Axis.END_TICK_MARK_CLASS), "last end tick has the end-tick-mark class");
    svg.remove();
  });

  it("tick labels do not overlap with tick marks", () => {
    let svg = TestMethods.generateSVG(400, 100);
    scale = new Plottable.Scales.Time();
    scale.domain([new Date("2009-12-20"), new Date("2011-01-01")]);
    axis = new Plottable.Axes.Time(scale, "bottom");
    axis.renderTo(svg);
    let tickRects = d3.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0].map((mark: Element) => mark.getBoundingClientRect());
    let labelRects = d3.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
        .filter(function(d: Element, i: number) {
          return d3.select(this).style("visibility") === "visible";
        })[0].map((label: Element) => label.getBoundingClientRect());
    labelRects.forEach(function(labelRect: ClientRect) {
      tickRects.forEach(function(tickRect: ClientRect) {
        assert.isFalse(Plottable.Utils.DOM.clientRectsOverlap(labelRect, tickRect), "visible label does not overlap with a tick");
      });
    });
    svg.remove();
  });

  describe("tick labels and tick marks do not overlap", () => {
    it("tick labels do not overlap with tick marks in bottom orientation", () => {
      let svg = TestMethods.generateSVG(400, 100);
      scale = new Plottable.Scales.Time();
      scale.domain([new Date("2009-12-20"), new Date("2011-01-01")]);
      axis = new Plottable.Axes.Time(scale, "bottom");
      axis.renderTo(svg);
      let tickRects = d3.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0].map((mark: Element) => mark.getBoundingClientRect());
      let labelRects = d3.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
          .filter(function(d: Element, i: number) {
            return d3.select(this).style("visibility") === "visible";
          })[0].map((label: Element) => label.getBoundingClientRect());
      labelRects.forEach(function(labelRect: ClientRect) {
        tickRects.forEach(function(tickRect: ClientRect) {
          assert.isFalse(Plottable.Utils.DOM.clientRectsOverlap(labelRect, tickRect), "visible label does not overlap with a tick");
        });
      });
      svg.remove();
    });

    function TickMarkAndLabelOverlap () {
      let tickMarks = d3.selectAll(`.${Plottable.Axis.TICK_MARK_CLASS}:not(.${Plottable.Axis.END_TICK_MARK_CLASS})`);
      assert.operator(tickMarks.size(), ">=", 1, "There is at least one tick mark in the test");
      let tickLabels = d3.selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`)
      .filter(function(d: Element, i: number){
        return window.getComputedStyle(this).visibility !== "hidden";
      });
      assert.operator(tickLabels.size(), ">=", 1, "There is at least one tick label in the test");
      tickMarks.each(function(d, i) {
        let tickMarkRect = this.getBoundingClientRect();
        tickLabels.each(function(e, j) {
          let tickLabelRect = this.getBoundingClientRect();
          let isOverlap = Plottable.Utils.DOM.clientRectsOverlap(tickMarkRect, tickLabelRect);
          assert.isFalse(isOverlap, `Tick mark "${d}" should not overlap with tick label "${this.textContent}"`);
        });
      });
    }

    it("tick labels do not overlap with tick marks in top orientation when tier label position is set to between", () => {
      let svg = TestMethods.generateSVG(400, 100);
      scale = new Plottable.Scales.Time();
      scale.domain([new Date("2010-01-01"), new Date("2014-01-01")]);
      axis = new Plottable.Axes.Time(scale, "top");
      axis.tierLabelPositions(["between", "between"]);
      axis.renderTo(svg);
      TickMarkAndLabelOverlap();
      svg.remove();
    });

    it("tick labels do not overlap with tick marks in top orientation when tier label position is set to center", () => {
     let svg = TestMethods.generateSVG(400, 100);
      scale = new Plottable.Scales.Time();
      scale.domain([new Date("2010-01-01"), new Date("2014-01-01")]);
      axis = new Plottable.Axes.Time(scale, "top");
      axis.tierLabelPositions(["center", "center"]);
      axis.renderTo(svg);
      TickMarkAndLabelOverlap();
      svg.remove();
    });
  });

  it("if the time only uses one tier, there should be no space left for the second tier", () => {
    let svg = TestMethods.generateSVG();
    let xScale = new Plottable.Scales.Time();
    xScale.domain([new Date("2013-03-23 12:00"), new Date("2013-04-03 0:00")]);
    let xAxis = new Plottable.Axes.Time(xScale, "bottom");
    xAxis.margin(0);

    xAxis.axisConfigurations([
        [
           {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")}
        ],
    ]);

    xAxis.renderTo(svg);

    let oneTierSize: number = xAxis.height();

    xAxis.axisConfigurations([
        [
           {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
           {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")}
        ],
    ]);

    let twoTierSize: number = xAxis.height();

    assert.strictEqual(twoTierSize, oneTierSize * 2, "two-tier axis is twice as tall as one-tier axis");

    xAxis.axisConfigurations([
        [
           {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")}
        ],
    ]);

    let initialTierSize: number = xAxis.height();

    assert.strictEqual(initialTierSize, oneTierSize,
                      "2-tier time axis should shrink when presented new configuration with 1 tier");

    svg.remove();
  });

  it("three tier time axis should be possible", () => {
    let svg = TestMethods.generateSVG();
    let xScale = new Plottable.Scales.Time();
    xScale.domain([new Date("2013-03-23 12:00"), new Date("2013-04-03 0:00")]);
    let xAxis = new Plottable.Axes.Time(xScale, "bottom");
    xAxis.margin(0);

    xAxis.renderTo(svg);

    xAxis.axisConfigurations([
        [
           {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
           {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
        ],
    ]);

    let twoTierAxisHeight: number = xAxis.height();

    xAxis.axisConfigurations([
        [
           {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
           {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
           {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
        ],
    ]);

    let threeTierAxisHeight: number = xAxis.height();

    assert.strictEqual(threeTierAxisHeight, twoTierAxisHeight * 3 / 2,
      "three tier height is 3/2 bigger than the two tier height");

    svg.remove();

  });

  it("many tier Axis.Time should not exceed the drawing area", () => {
    let svg = TestMethods.generateSVG(400, 50);
    let xScale = new Plottable.Scales.Time();
    xScale.domain([new Date("2013-03-23 12:00"), new Date("2013-04-03 0:00")]);
    let xAxis = new Plottable.Axes.Time(xScale, "bottom");
    xAxis.margin(0);

    let tiersToCreate = 15;
    let configuration = Array.apply(null, Array(tiersToCreate)).map(() => {
      return {interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e") };
    });
    xAxis.axisConfigurations([configuration]);

    xAxis.renderTo(svg);

    let axisBoundingRect: ClientRect = (<any> xAxis)._element.select(".bounding-box")[0][0].getBoundingClientRect();

    let isInsideAxisBoundingRect = function(innerRect: ClientRect) {
      return Math.floor(innerRect.bottom) <= Math.ceil(axisBoundingRect.bottom) + window.Pixel_CloseTo_Requirement &&
             Math.floor(axisBoundingRect.top) <= Math.ceil(innerRect.top) + window.Pixel_CloseTo_Requirement;
    };

    (<any> xAxis)._element
      .selectAll("." + Plottable.Axes.Time.TIME_AXIS_TIER_CLASS)
      .each(function(e: any, i: number) {
        let sel = d3.select(this);
        let visibility = sel.style("visibility");

        // HACKHACK window.getComputedStyle() is behaving weirdly in IE9. Further investigation required
        if (visibility === "inherit") {
          visibility = getStyleInIE9(sel[0][0]);
        }
        if (isInsideAxisBoundingRect((<Element> sel[0][0]).getBoundingClientRect())) {
          assert.strictEqual(visibility, "visible",
            "time axis tiers inside the axis should be visible. Tier #" + (i + 1));
        } else {
          assert.strictEqual(visibility, "hidden",
            "time axis tiers inside the axis should not be visible. Tier #" + (i + 1));
        }
      });

    svg.remove();

    function getStyleInIE9(element: any) {
      while (element) {
        let visibility = window.getComputedStyle(element).visibility;
        if (visibility !== "inherit") {
          return visibility;
        }
        element = element.parentNode;
      }
      return "visible";
    }

  });

  it("occupied space includes margin, label padding, and tick length", () => {
    let svg = TestMethods.generateSVG(400, 400);
    let xScale = new Plottable.Scales.Time();
    let xAxis = new Plottable.Axes.Time(xScale, "bottom");
    xAxis.margin(100);
    xAxis.anchor(svg);
    xAxis.computeLayout({ x: 0, y: 0}, 400, 400);
    let minimumHeight = xAxis.tickLabelPadding() + xAxis.margin() + xAxis.innerTickLength();
    assert.operator(xAxis.height(), ">=", minimumHeight, "height includes all relevant pieces");
    svg.remove();
  });

  it("tick labels show correctly when display format is set to 'center'", () => {
    let svg = TestMethods.generateSVG(400, 100);
    scale.domain([new Date("2015-09-02"), new Date("2015-09-03")]);
    axis.tierLabelPositions(["center", "center"]);
    axis.renderTo(svg);

    let labels = axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`);
    assert.operator(labels.size(), ">=", 1, "At least one label is selected in testing");

    let axisBoundingRect: ClientRect = (<Element>axis.background().node()).getBoundingClientRect();
    let isInsideAxisBoundingRect = function(innerRect: ClientRect) {
        return (
          Math.floor(axisBoundingRect.left) <= Math.ceil(innerRect.left) &&
          Math.floor(axisBoundingRect.top) <= Math.ceil(innerRect.top) &&
          Math.floor(innerRect.right) <= Math.ceil(axisBoundingRect.right) &&
          Math.floor(innerRect.bottom) <= Math.ceil(axisBoundingRect.bottom)
        );
    };

    labels.each(function(d, i) {
      let labelVisibility = window.getComputedStyle(this).visibility;
      let boundingClientRect = this.getBoundingClientRect();
      let isInside = isInsideAxisBoundingRect(boundingClientRect);
      if (labelVisibility === "hidden") {
        assert.isFalse(isInside, `label ${i} "${this.textContent}" is hidden, should be visible as it is inside the axis bounding box`);
      } else {
        assert.isTrue(isInside, `label ${i} "${this.textContent}" is visible, should be hidden as it is outside the axis bounding box`);
      }
    });
    svg.remove();
  });

  describe("axis annotations", () => {
    describe("formatting annotation ticks", () => {
      it("formats the dates to [{{abbreviated weekday}} {{abbreviated month}} {{day of month}}, {{year}}] by default", () => {
        let axis = new Plottable.Axes.Time(new Plottable.Scales.Time(), "bottom");
        let annotationFormatter = axis.annotationFormatter();
        let testDate = new Date(1995, 11, 17);
        assert.strictEqual(annotationFormatter(testDate), "Sun Dec 17, 1995", "formats to a default customized time formatter");
      });
    });

    it("includes the annotation space in the final size calculation", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 400;
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let xScale = new Plottable.Scales.Time();
      let xAxis = new Plottable.Axes.Time(xScale, "bottom");
      xAxis.margin(100);
      xAxis.annotationsEnabled(true);
      xAxis.annotationTierCount(3);

      xAxis.anchor(svg);
      xAxis.computeLayout({ x: 0, y: 0}, SVG_WIDTH, SVG_HEIGHT);
      let coreHeight = xAxis.tickLabelPadding() + xAxis.innerTickLength();
      let annotationHeight = xAxis.annotationTierCount() * (<any> xAxis)._annotationTierHeight();
      let minimumHeight = coreHeight + xAxis.margin() + annotationHeight;
      assert.operator(xAxis.height(), ">=", minimumHeight, "height includes all relevant pieces");
      xAxis.destroy();
      svg.remove();
    });
  });

});
