///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Domainer", () => {
  var scale: Plottable.Scales.Linear;
  var domainer: Plottable.Domainer;
  beforeEach(() => {
    scale = new Plottable.Scales.Linear();
    domainer = new Plottable.Domainer();
  });

  it("pad() works in general case", () => {
    scale.addExtentsProvider((scale: Plottable.Scale<number, number>) => [[100, 200]]);
    scale.autoDomain();
    scale.domainer(new Plottable.Domainer().pad(0.2));
    assert.closeTo(scale.domain()[0], 90, 0.1, "lower bound of domain correct");
    assert.closeTo(scale.domain()[1], 210, 0.1, "upper bound of domain correct");
  });

  it("pad() works for date scales", () => {
    var timeScale = new Plottable.Scales.Time();
    var f = d3.time.format("%x");
    var d1 = f.parse("06/02/2014");
    var d2 = f.parse("06/03/2014");
    timeScale.addExtentsProvider((scale: Plottable.Scale<Date, number>) => [[d1, d2]]);
    timeScale.autoDomain();
    timeScale.domainer(new Plottable.Domainer().pad());
    var dd1 = timeScale.domain()[0];
    var dd2 = timeScale.domain()[1];
    assert.isDefined(dd1.toDateString, "padDomain produced dates");
    assert.isNotNull(dd1.toDateString, "padDomain produced dates");
    assert.notEqual(d1.valueOf(), dd1.valueOf(), "date1 changed");
    assert.notEqual(d2.valueOf(), dd2.valueOf(), "date2 changed");
    assert.strictEqual(dd1.valueOf(), dd1.valueOf(), "date1 is not NaN");
    assert.strictEqual(dd2.valueOf(), dd2.valueOf(), "date2 is not NaN");
  });

  it("pad() defaults to [v-1, v+1] if there's only one numeric value", () => {
    domainer.pad();
    var domain = domainer.computeDomain([[5, 5]], scale);
    assert.deepEqual(domain, [4, 6]);
  });

  it("pad() defaults to [v-1 day, v+1 day] if there's only one date value", () => {
    var d = new Date(2000, 5, 5);
    var d2 = new Date(2000, 5, 5);
    var dayBefore = new Date(2000, 5, 4);
    var dayAfter = new Date(2000, 5, 6);
    domainer.pad();
    var domain = domainer.computeDomain([[d, d2]], scale);
    assert.strictEqual(domain[0], dayBefore.valueOf(), "domain start was set to the day before");
    assert.strictEqual(domain[1], dayAfter.valueOf(), "domain end was set to the day after");
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
    domainer.pad(0.1).addPaddingException("keyLeft", 0).addPaddingException("keyRight", 200);
    var domain = domainer.computeDomain([[0, 100]], scale);
    assert.deepEqual(domain, [0, 105], "padding exceptions can be added by key");
    domain = domainer.computeDomain([[-100, 0]], scale);
    assert.deepEqual(domain, [-105, 0]);
    domain = domainer.computeDomain([[0, 200]], scale);
    assert.deepEqual(domain, [0, 200]);
    domainer.removePaddingException("keyLeft");
    domain = domainer.computeDomain([[0, 200]], scale);
    assert.deepEqual(domain, [-10, 200], "paddingExceptions can be removed by key");
    domainer.removePaddingException("keyRight");
    domain = domainer.computeDomain([[0, 200]], scale);
    assert.notEqual(domain[1], 200, "unregistered paddingExceptions can be removed using boolean argument");
  });

  it("paddingException(n) works on dates", () => {
    var startDate = new Date(2000, 5, 5);
    var endDate = new Date(2003, 0, 1);
    var timeScale = new Plottable.Scales.Time();
    timeScale.addExtentsProvider((scale: Plottable.Scale<Date, number>) => [[startDate, endDate]]);
    timeScale.autoDomain();
    domainer.pad().addPaddingException("key", startDate);
    timeScale.domainer(domainer);
    var domain = timeScale.domain();
    assert.deepEqual(domain[0], startDate);
    assert.isTrue(endDate < domain[1]);
  });

  it("include(n) works an expected", () => {
    domainer.addIncludedValue("key1", 5);
    var domain = domainer.computeDomain([[0, 10]], scale);
    assert.deepEqual(domain, [0, 10]);
    domain = domainer.computeDomain([[0, 3]], scale);
    assert.deepEqual(domain, [0, 5]);
    domain = domainer.computeDomain([[100, 200]], scale);
    assert.deepEqual(domain, [5, 200]);

    domainer.addIncludedValue("key2", -3).addIncludedValue("key3", 0).addIncludedValue("key4", 10);
    domain = domainer.computeDomain([[100, 200]], scale);
    assert.deepEqual(domain, [-3, 200]);
    domain = domainer.computeDomain([[0, 0]], scale);
    assert.deepEqual(domain, [-3, 10]);

    domainer.removeIncludedValue("key4");
    domain = domainer.computeDomain([[100, 200]], scale);
    assert.deepEqual(domain, [-3, 200]);
    domain = domainer.computeDomain([[-100, -50]], scale);
    assert.deepEqual(domain, [-100, 5]);

    domainer.addIncludedValue("key5", 10);
    domain = domainer.computeDomain([[-100, -50]], scale);
    assert.deepEqual(domain, [-100, 10], "unregistered includedValues can be added");
    domainer.removeIncludedValue("key5");
    domain = domainer.computeDomain([[-100, -50]], scale);
    assert.deepEqual(domain, [-100, 5], "unregistered includedValues can be removed with addOrRemove argument");
  });

  it("include(n) works on dates", () => {
    var includedDate = new Date(2000, 5, 5);
    var startDate = new Date(2000, 5, 6);
    var endDate = new Date(2003, 0, 1);
    var timeScale = new Plottable.Scales.Time();
    timeScale.addExtentsProvider((scale: Plottable.Scale<Date, number>) => [[startDate, endDate]]);
    timeScale.autoDomain();
    domainer.addIncludedValue("key", includedDate);
    timeScale.domainer(domainer);
    assert.deepEqual(timeScale.domain(), [includedDate, endDate], "domain was expanded to contain included date");
  });

  it("exceptions are setup properly on an area plot", () => {
    var xScale = new Plottable.Scales.Linear();
    var yScale = new Plottable.Scales.Linear();
    var data = [{x: 0, y: 0, y0: 0}, {x: 5, y: 5, y0: 5}];
    var dataset = new Plottable.Dataset(data);
    var r = new Plottable.Plots.Area(xScale, yScale);
    r.addDataset(dataset);
    var svg = TestMethods.generateSVG();
    r.x((d) => d.x, xScale);
    r.y((d) => d.y, yScale);
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
    r.y0((d) => d.y0, yScale);
    assert.deepEqual(getExceptions(), [], "projecting a non-constant y0 removes the padding exception 1");
    r.y0(0, yScale);
    assert.deepEqual(getExceptions(), [0], "projecting constant y0 adds the exception back");
    r.y0(5, yScale);
    assert.deepEqual(getExceptions(), [5], "projecting a different constant y0 removed the old exception and added a new one");
    r.y0((d) => d.y0, yScale);
    assert.deepEqual(getExceptions(), [], "projecting a non-constant y0 removes the padding exception 2");
    dataset.data([{x: 0, y: 0, y0: 0}, {x: 5, y: 5, y0: 0}]);
    assert.deepEqual(getExceptions(), [0], "changing to constant values via change in datasource adds exception");
    svg.remove();
  });
});
