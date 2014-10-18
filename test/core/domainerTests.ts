///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Domainer", () => {
  var scale: Plottable.Scale.Linear;
  var domainer: Plottable.Domainer;
  beforeEach(() => {
    scale = new Plottable.Scale.Linear();
    domainer = new Plottable.Domainer();
  });

  it("pad() works in general case", () => {
    scale._updateExtent("1", "x", [100, 200]);
    scale.domainer(new Plottable.Domainer().pad(0.2));
    assert.closeTo(scale.domain()[0], 90, 0.1, "lower bound of domain correct");
    assert.closeTo(scale.domain()[1], 210, 0.1, "upper bound of domain correct");
  });

  it("pad() works for date scales", () => {
    var timeScale = new Plottable.Scale.Time();
    var f = d3.time.format("%x");
    var d1 = f.parse("06/02/2014");
    var d2 = f.parse("06/03/2014");
    timeScale._updateExtent("1", "x", [d1, d2]);
    timeScale.domainer(new Plottable.Domainer().pad());
    var dd1 = timeScale.domain()[0];
    var dd2 = timeScale.domain()[1];
    assert.isDefined(dd1.toDateString, "padDomain produced dates");
    assert.isNotNull(dd1.toDateString, "padDomain produced dates");
    assert.notEqual(d1.valueOf(), dd1.valueOf(), "date1 changed");
    assert.notEqual(d2.valueOf(), dd2.valueOf(), "date2 changed");
    assert.equal(dd1.valueOf(), dd1.valueOf(), "date1 is not NaN");
    assert.equal(dd2.valueOf(), dd2.valueOf(), "date2 is not NaN");
  });

  it("pad() works on log scales", () => {
    var logScale = new Plottable.Scale.Log();
    logScale._updateExtent("1", "x", [10, 100]);
    logScale.range([0, 1]);
    logScale.domainer(domainer.pad(2.0));
    assert.closeTo(logScale.domain()[0], 1, 0.001);
    assert.closeTo(logScale.domain()[1], 1000, 0.001);
    logScale.range([50, 60]);
    logScale.autoDomain();
    assert.closeTo(logScale.domain()[0], 1, 0.001);
    assert.closeTo(logScale.domain()[1], 1000, 0.001);
    logScale.range([-1, -2]);
    logScale.autoDomain();
    assert.closeTo(logScale.domain()[0], 1, 0.001);
    assert.closeTo(logScale.domain()[1], 1000, 0.001);
  });

  it("pad() defaults to [v-1, v+1] if there's only one numeric value", () => {
    domainer.pad();
    var domain = domainer.computeDomain([[5, 5]], scale);
    assert.deepEqual(domain, [4, 6]);
  });

  it("pad() defaults to [v-1 day, v+1 day] if there's only one date value", () => {
    var d = new Date(2000, 5, 5);
    var dayBefore = new Date(2000, 5, 4);
    var dayAfter = new Date(2000, 5, 6);
    var timeScale = new Plottable.Scale.Time();
    // the result of computeDomain() will be number[], but when it
    // gets fed back into timeScale, it will be adjusted back to a Date.
    // That's why I'm using _updateExtent() instead of domainer.computeDomain()
    timeScale._updateExtent("1", "x", [d, d]);
    timeScale.domainer(new Plottable.Domainer().pad());
    assert.deepEqual(timeScale.domain(), [dayBefore, dayAfter]);
  });

  it("pad() only takes the last value", () => {
    domainer.pad(1000).pad(4).pad(0.1);
    var domain = domainer.computeDomain([[100, 200]], scale);
    assert.deepEqual(domain, [95, 205]);
  });

  it("pad() will pad beyond 0 by default", () => {
    domainer.pad(0.1);
    var domain = domainer.computeDomain([[0, 100]], scale);
    assert.deepEqual(domain, [-5, 105]);
  });

  it("pad() works with scales that have 0-size domain", () => {
    scale.domain([5, 5]);
    var domain = domainer.computeDomain([[0, 100]], scale);
    assert.deepEqual(domain, [0, 100]);
    domainer.pad(0.1);
    domain = domainer.computeDomain([[0, 100]], scale);
    assert.deepEqual(domain, [0, 100]);
  });

  it("paddingException(n) will not pad beyond n", () => {
    domainer.pad(0.1).addPaddingException(0, "key").addPaddingException(200);
    var domain = domainer.computeDomain([[0, 100]], scale);
    assert.deepEqual(domain, [0, 105], "padding exceptions can be added by key");
    domain = domainer.computeDomain([[-100, 0]], scale);
    assert.deepEqual(domain, [-105, 0]);
    domain = domainer.computeDomain([[0, 200]], scale);
    assert.deepEqual(domain, [0, 200]);
    domainer.removePaddingException("key");
    domain = domainer.computeDomain([[0, 200]], scale);
    assert.deepEqual(domain, [-10, 200], "paddingExceptions can be removed by key");
    domainer.removePaddingException(200);
    domain = domainer.computeDomain([[0, 200]], scale);
    assert.notEqual(domain[1], 200, "unregistered paddingExceptions can be removed using boolean argument");
  });

  it("paddingException(n) works on dates", () => {
    var a = new Date(2000, 5, 5);
    var b = new Date(2003, 0, 1);
    domainer.pad().addPaddingException(a);
    var timeScale = new Plottable.Scale.Time();
    timeScale._updateExtent("1", "x", [a, b]);
    timeScale.domainer(domainer);
    var domain = timeScale.domain();
    assert.deepEqual(domain[0], a);
    assert.isTrue(b < domain[1]);
  });

  it("include(n) works an expected", () => {
    domainer.addIncludedValue(5);
    var domain = domainer.computeDomain([[0, 10]], scale);
    assert.deepEqual(domain, [0, 10]);
    domain = domainer.computeDomain([[0, 3]], scale);
    assert.deepEqual(domain, [0, 5]);
    domain = domainer.computeDomain([[100, 200]], scale);
    assert.deepEqual(domain, [5, 200]);

    domainer.addIncludedValue(-3).addIncludedValue(0).addIncludedValue(10, "key");
    domain = domainer.computeDomain([[100, 200]], scale);
    assert.deepEqual(domain, [-3, 200]);
    domain = domainer.computeDomain([[0, 0]], scale);
    assert.deepEqual(domain, [-3, 10]);

    domainer.removeIncludedValue("key");
    domain = domainer.computeDomain([[100, 200]], scale);
    assert.deepEqual(domain, [-3, 200]);
    domain = domainer.computeDomain([[-100, -50]], scale);
    assert.deepEqual(domain, [-100, 5]);

    domainer.addIncludedValue(10);
    domain = domainer.computeDomain([[-100, -50]], scale);
    assert.deepEqual(domain, [-100, 10], "unregistered includedValues can be added");
    domainer.removeIncludedValue(10);
    domain = domainer.computeDomain([[-100, -50]], scale);
    assert.deepEqual(domain, [-100, 5], "unregistered includedValues can be removed with addOrRemove argument");
  });

  it("include(n) works on dates", () => {
    var a = new Date(2000, 5, 4);
    var b = new Date(2000, 5, 5);
    var c = new Date(2000, 5, 6);
    var d = new Date(2003, 0, 1);
    domainer.addIncludedValue(b);
    var timeScale = new Plottable.Scale.Time();
    timeScale._updateExtent("1", "x", [c, d]);
    timeScale.domainer(domainer);
    assert.deepEqual(timeScale.domain(), [b, d]);
  });

  it("exceptions are setup properly on an area plot", () => {
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var domainer = yScale.domainer();
    var data = [{x: 0, y: 0, y0: 0}, {x: 5, y: 5, y0: 5}];
    var dataset = new Plottable.Dataset(data);
    var r = new Plottable.Plot.Area(xScale, yScale);
    r.addDataset(dataset);
    var svg = generateSVG();
    r.project("x", "x", xScale);
    r.project("y", "y", yScale);
    r.renderTo(svg);

    function getExceptions() {
      yScale.autoDomain();
      var yDomain = yScale.domain();
      var exceptions: number[] = [];
      if (yDomain[0] === 0) {
          exceptions.push(0);
      }
      if (yDomain[1] === 5) {
          exceptions.push(5);
      }
      return exceptions;
    }

    assert.deepEqual(getExceptions(), [0], "initializing the plot adds a padding exception at 0");
    // assert.deepEqual(getExceptions(), [], "Initially there are no padding exceptions");
    r.project("y0", "y0", yScale);
    assert.deepEqual(getExceptions(), [], "projecting a non-constant y0 removes the padding exception");
    r.project("y0", 0, yScale);
    assert.deepEqual(getExceptions(), [0], "projecting constant y0 adds the exception back");
    r.project("y0", () => 5, yScale);
    assert.deepEqual(getExceptions(), [5], "projecting a different constant y0 removed the old exception and added a new one");
    r.project("y0", "y0", yScale);
    assert.deepEqual(getExceptions(), [], "projecting a non-constant y0 removes the padding exception");
    dataset.data([{x: 0, y: 0, y0: 0}, {x: 5, y: 5, y0: 0}]);
    assert.deepEqual(getExceptions(), [0], "changing to constant values via change in datasource adds exception");
    svg.remove();
  });
});
