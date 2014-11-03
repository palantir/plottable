///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("TimeAxis", () => {
  var scale: Plottable.Scale.Time;
  var axis: Plottable.Axis.Time;
  beforeEach(() => {
    scale = new Plottable.Scale.Time();
    axis = new Plottable.Axis.Time(scale, "bottom");
  });

  it("can not initialize vertical time axis", () => {
      assert.throws(() => new Plottable.Axis.Time(scale, "left"), "horizontal");
      assert.throws(() => new Plottable.Axis.Time(scale, "right"), "horizontal");
  });

  it("cannot change time axis orientation to vertical", () => {
      assert.throws(() => axis.orient("left"), "horizontal");
      assert.throws(() => axis.orient("right"), "horizontal");
      assert.equal(axis.orient(), "bottom", "orientation unchanged");
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
                .selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS)
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

            assert.isFalse(Plottable._Util.DOM.boxesOverlap(box1, box2), "tick labels don't overlap");
          }
        }
      }

      axis._tierLabelContainers.forEach(checkLabelsForContainer);
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

  it("min interval on time Axis", () => {
    var svg = generateSVG(800, 100);
    var scale = new Plottable.Scale.Time();
    var axis = new Plottable.Axis.Time(scale, "bottom");
    var now = new Date();
    var fourDaysBefore = new Date(now.getTime());
    fourDaysBefore.setDate(now.getDate() - 4);
    scale.domain([fourDaysBefore, now]);
    scale.range([0, 600]);
    axis.renderTo(svg);
    var configs = (<any> axis).tierTickConfigurations;
    assert.deepEqual(configs[0].interval, d3.time.hour, "hour interval satisfy width threshold");
    axis.axisTierIntervals(d3.time.day);
    configs = (<any> axis).tierTickConfigurations;
    assert.deepEqual(configs[0].interval, d3.time.day, "day interval is the min possible interval for tier tick config");
    svg.remove();
  });

  it("custom intervals on time Axis", () => {
    var svg = generateSVG(800, 100);
    var scale = new Plottable.Scale.Time();
    var axis = new Plottable.Axis.Time(scale, "bottom");
    var intervals = axis.axisTierIntervals();
    var onlySecondIntervals = intervals.slice(0, 1);
    onlySecondIntervals[0].tiers = onlySecondIntervals[0].tiers.slice(0, 1);
    onlySecondIntervals[0].tiers[0].steps = [20];
    axis.axisTierIntervals(onlySecondIntervals);
    var now = new Date();
    var twoMinutesBefore = new Date(now.getTime());
    twoMinutesBefore.setMinutes(now.getMinutes() - 2);
    scale.domain([twoMinutesBefore, now]);
    scale.range([0, 800]);
    axis.renderTo(svg);
    var configs = (<any> axis).tierTickConfigurations;
    assert.lengthOf(configs, 1, "only one tier is specify");
    assert.deepEqual(configs[0].interval, d3.time.second, "time axis used custom interval");
    assert.deepEqual(configs[0].step, 20, "time axis used custom step");
    svg.remove();
  });
});
