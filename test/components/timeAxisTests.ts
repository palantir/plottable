///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("TimeAxis", () => {
  var scale: Plottable.Scales.Time;
  var axis: Plottable.Axes.Time;
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
      assert.equal(axis.orientation(), "bottom", "orientation unchanged");
  });

  it("Computing the default ticks doesn't error out for edge cases", () => {
    var svg = generateSVG(400, 100);
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
    var svg = generateSVG(400, 100);
    scale.range([0, 400]);

    function checkDomain(domain: any[]) {
      scale.domain(domain);
      axis.renderTo(svg);

      function checkLabelsForContainer(container: D3.Selection) {
        var visibleTickLabels = container
                .selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
                .filter(function(d: any, i: number) {
                  return d3.select(this).style("visibility") === "visible";
                });
        var numLabels = visibleTickLabels[0].length;
        var box1: ClientRect;
        var box2: ClientRect;
        for (var i = 0; i < numLabels; i++) {
          for (var j = i + 1; j < numLabels; j++) {
            box1 = visibleTickLabels[0][i].getBoundingClientRect();
            box2 = visibleTickLabels[0][j].getBoundingClientRect();

            assert.isFalse(Plottable.Utils.DOM.boxesOverlap(box1, box2), "tick labels don't overlap");
          }
        }
      }

      (<any>axis).tierLabelContainers.forEach(checkLabelsForContainer);
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
    var svg = generateSVG(800, 100);
    var scale = new Plottable.Scales.Time();
    var axis = new Plottable.Axes.Time(scale, "bottom");
    var configurations = axis.axisConfigurations();
    var newPossibleConfigurations = configurations.slice(0, 3);
    newPossibleConfigurations.forEach(axisConfig => axisConfig.forEach(tierConfig => {
      tierConfig.interval = d3.time.minute;
      tierConfig.step += 3;
    }));
    axis.axisConfigurations(newPossibleConfigurations);
    var now = new Date();
    var twoMinutesBefore = new Date(now.getTime());
    twoMinutesBefore.setMinutes(now.getMinutes() - 2);
    scale.domain([twoMinutesBefore, now]);
    scale.range([0, 800]);
    axis.renderTo(svg);
    var configs = newPossibleConfigurations[(<any> axis).mostPreciseConfigIndex];
    assert.deepEqual(configs[0].interval, d3.time.minute, "axis used new time unit");
    assert.deepEqual(configs[0].step, 4, "axis used new step");
    svg.remove();
  });

  it("renders end ticks on either side", () => {
    var width = 500;
    var svg = generateSVG(width, 100);
    scale.domain(["2010", "2014"]);
    axis.renderTo(svg);
    var firstTick = d3.select(".tick-mark");
    assert.equal(firstTick.attr("x1"), 0, "xPos (x1) of first end tick is at the beginning of the axis container");
    assert.equal(firstTick.attr("x2"), 0, "xPos (x2) of first end tick is at the beginning of the axis container");
    var lastTick = d3.select(d3.selectAll(".tick-mark")[0].pop());
    assert.equal(lastTick.attr("x1"), width, "xPos (x1) of last end tick is at the end of the axis container");
    assert.equal(lastTick.attr("x2"), width, "xPos (x2) of last end tick is at the end of the axis container");
    svg.remove();
  });

  it("adds a class corresponding to the end-tick for the first and last ticks", () => {
    var width = 500;
    var svg = generateSVG(width, 100);
    scale.domain(["2010", "2014"]);
    axis.renderTo(svg);
    var firstTick = d3.select("." + Plottable.Axis.TICK_MARK_CLASS);
    assert.isTrue(firstTick.classed(Plottable.Axis.END_TICK_MARK_CLASS), "first end tick has the end-tick-mark class");
    var lastTick = d3.select(d3.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0].pop());
    assert.isTrue(lastTick.classed(Plottable.Axis.END_TICK_MARK_CLASS), "last end tick has the end-tick-mark class");
    svg.remove();
  });

  it("tick labels do not overlap with tick marks", () => {
    var svg = generateSVG(400, 100);
    scale = new Plottable.Scales.Time();
    scale.domain([new Date("2009-12-20"), new Date("2011-01-01")]);
    axis = new Plottable.Axes.Time(scale, "bottom");
    axis.renderTo(svg);
    var tickRects = d3.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0].map((mark: Element) => mark.getBoundingClientRect());
    var labelRects = d3.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
        .filter(function(d: Element, i: number) {
          return d3.select(this).style("visibility") === "visible";
        })[0].map((label: Element) => label.getBoundingClientRect());
    labelRects.forEach(function(labelRect: ClientRect) {
      tickRects.forEach(function(tickRect: ClientRect) {
        assert.isFalse(Plottable.Utils.DOM.boxesOverlap(labelRect, tickRect), "visible label does not overlap with a tick");
      });
    });
    svg.remove();
  });

  it("if the time only uses one tier, there should be no space left for the second tier", () => {
    var svg = generateSVG();
    var xScale = new Plottable.Scales.Time();
    xScale.domain([new Date("2013-03-23 12:00"), new Date("2013-04-03 0:00")]);
    var xAxis = new Plottable.Axes.Time(xScale, "bottom");
    xAxis.gutter(0);

    xAxis.axisConfigurations([
        [
           {interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e")}
        ],
    ]);

    xAxis.renderTo(svg);

    var oneTierSize: number = xAxis.height();

    xAxis.axisConfigurations([
        [
           {interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
           {interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e")}
        ],
    ]);

    var twoTierSize: number = xAxis.height();

    assert.strictEqual(twoTierSize, oneTierSize * 2, "two-tier axis is twice as tall as one-tier axis");


    xAxis.axisConfigurations([
        [
           {interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e")}
        ],
    ]);

    var initialTierSize: number = xAxis.height();

    assert.strictEqual(initialTierSize, oneTierSize,
                      "2-tier time axis should shrink when presented new configuration with 1 tier");

    svg.remove();
  });

  it("three tier time axis should be possible", () => {

    var svg = generateSVG();
    var xScale = new Plottable.Scales.Time();
    xScale.domain([new Date("2013-03-23 12:00"), new Date("2013-04-03 0:00")]);
    var xAxis = new Plottable.Axes.Time(xScale, "bottom");
    xAxis.gutter(0);

    xAxis.renderTo(svg);

    xAxis.axisConfigurations([
        [
           {interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
           {interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
        ],
    ]);

    var twoTierAxisHeight: number = xAxis.height();

    xAxis.axisConfigurations([
        [
           {interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
           {interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
           {interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e")},
        ],
    ]);

    var threeTierAxisHeight: number = xAxis.height();

    assert.strictEqual(threeTierAxisHeight, twoTierAxisHeight * 3 / 2,
      "three tier height is 3/2 bigger than the two tier height");

    svg.remove();

  });

  it("many tier Axis.Time should not exceed the drawing area", () => {
    var svg = generateSVG(400, 50);
    var xScale = new Plottable.Scales.Time();
    xScale.domain([new Date("2013-03-23 12:00"), new Date("2013-04-03 0:00")]);
    var xAxis = new Plottable.Axes.Time(xScale, "bottom");

    var tiersToCreate = 15;
    var configuration = Array.apply(null, Array(tiersToCreate)).map(() => {
      return {interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e") };
    });
    xAxis.axisConfigurations([configuration]);

    xAxis.renderTo(svg);

    var axisBoundingRect: ClientRect = (<any> xAxis).element.select(".bounding-box")[0][0].getBoundingClientRect();

    var isInsideAxisBoundingRect = function(innerRect: ClientRect) {
      return Math.floor(innerRect.bottom)     <= Math.ceil(axisBoundingRect.bottom) + window.Pixel_CloseTo_Requirement &&
             Math.floor(axisBoundingRect.top) <= Math.ceil(innerRect.top) + window.Pixel_CloseTo_Requirement;
    };

    var numberOfVisibleTiers = (<any> xAxis).element
      .selectAll("." + Plottable.Axes.Time.TIME_AXIS_TIER_CLASS)
      .each(function(e: any, i: number) {
        var sel = d3.select(this);
        var visibility = sel.style("visibility");

        //HACKHACK window.getComputedStyle() is behaving weirdly in IE9. Further investigation required
        if (visibility === "inherit") {
          visibility = getStyleInIE9(sel[0][0]);
        }
        if (isInsideAxisBoundingRect(sel[0][0].getBoundingClientRect())) {
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
        var visibility = window.getComputedStyle(element).visibility;
        if (visibility !== "inherit") {
          return visibility;
        }
        element = element.parentNode;
      }
      return "visible";
    }

  });

});
