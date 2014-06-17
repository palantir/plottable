///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Domainer", () => {
  var scale: Plottable.Scale.Linear;
  var domainer: Plottable.Domainer;
  beforeEach(() => {
    scale = new Plottable.Scale.Linear();
    domainer = new Plottable.Domainer();
  });

  it("pad() works in general case", () => {
    scale.updateExtent(1, "x", [100, 200]);
    scale.domainer(new Plottable.Domainer().pad(0.2));
    assert.deepEqual(scale.domain(), [90, 210]);
  });

  it("pad() works for date scales", () => {
    var timeScale = new Plottable.Scale.Time();
    var f = d3.time.format("%x");
    var d1 = f.parse("06/02/2014");
    var d2 = f.parse("06/03/2014");
    timeScale.updateExtent(1, "x", [d1, d2]);
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
    // That's why I'm using updateExtent() instead of domainer.computeDomain()
    timeScale.updateExtent(1, "x", [d, d]);
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

  it("addPaddingException(n) will not pad beyond n", () => {
    domainer.pad(0.1).addPaddingException(0).addPaddingException(200);
    var domain = domainer.computeDomain([[0, 100]], scale);
    assert.deepEqual(domain, [0, 105]);
    domain = domainer.computeDomain([[-100, 0]], scale);
    assert.deepEqual(domain, [-105, 0]);
    domain = domainer.computeDomain([[0, 200]], scale);
    assert.deepEqual(domain, [0, 200]);
  });
});
