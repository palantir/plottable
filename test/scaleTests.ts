///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Scales", () => {
  it("Scale's copy() works correctly", () => {
    var testCallback: Plottable.IBroadcasterCallback = (broadcaster: Plottable.Abstract.Broadcaster) => {
      return true; // doesn't do anything
    };
    var scale = new Plottable.Scale.Linear();
    scale.registerListener(null, testCallback);
    var scaleCopy = scale.copy();
    assert.deepEqual(scale.domain(), scaleCopy.domain(), "Copied scale has the same domain as the original.");
    assert.deepEqual(scale.range(), scaleCopy.range(), "Copied scale has the same range as the original.");
    assert.notDeepEqual((<any> scale).listener2Callback, (<any> scaleCopy).listener2Callback,
                              "Registered callbacks are not copied over");
  });

  it("Scale alerts listeners when its domain is updated", () => {
    var scale = new Plottable.Scale.Linear();
    var callbackWasCalled = false;
    var testCallback: Plottable.IBroadcasterCallback = (broadcaster: Plottable.Abstract.Broadcaster) => {
      assert.equal(broadcaster, scale, "Callback received the calling scale as the first argument");
      callbackWasCalled = true;
    };
    scale.registerListener(null, testCallback);
    scale.domain([0, 10]);
    assert.isTrue(callbackWasCalled, "The registered callback was called");

    scale.domain([0.08, 9.92]);
    callbackWasCalled = false;
    scale.nice();
    assert.isTrue(callbackWasCalled, "The registered callback was called when nice() is used to set the domain");

    callbackWasCalled = false;
    scale.padDomain(0.2);
    assert.isTrue(callbackWasCalled, "The registered callback was called when padDomain() is used to set the domain");
  });
  describe("autoranging behavior", () => {
    var data: any[];
    var dataSource: Plottable.DataSource;
    var scale: Plottable.Scale.Linear;
    beforeEach(() => {
      data = [{foo: 2, bar: 1}, {foo: 5, bar: -20}, {foo: 0, bar: 0}];
      dataSource = new Plottable.DataSource(data);
      scale = new Plottable.Scale.Linear();
    });

    it("scale autoDomain flag is not overwritten without explicitly setting the domain", () => {
      scale.updateExtent(1, "x", d3.extent(data, (e) => e.foo));
      scale.autoDomain().padDomain().nice();
      assert.isTrue(scale._autoDomainAutomatically, "the autoDomain flag is still set after autoranginging and padding and nice-ing");
      scale.domain([0, 5]);
      assert.isFalse(scale._autoDomainAutomatically, "the autoDomain flag is false after domain explicitly set");
    });

    it("scale autorange works as expected with single dataSource", () => {
      var renderer = new Plottable.Abstract.Plot()
                        .dataSource(dataSource)
                        .project("x", "foo", scale);
      assert.deepEqual(scale.domain(), [0, 5], "scale domain was autoranged properly");
      data.push({foo: 100, bar: 200});
      dataSource.data(data);
      assert.deepEqual(scale.domain(), [0, 100], "scale domain was autoranged properly");
    });

    it("scale reference counting works as expected", () => {
      var renderer1 = new Plottable.Abstract.Plot()
                          .dataSource(dataSource)
                          .project("x", "foo", scale);
      var renderer2 = new Plottable.Abstract.Plot()
                          .dataSource(dataSource)
                          .project("x", "foo", scale);
      var otherScale = new Plottable.Scale.Linear();
      renderer1.project("x", "foo", otherScale);
      dataSource.data([{foo: 10}, {foo: 11}]);
      assert.deepEqual(scale.domain(), [10, 11], "scale was still listening to dataSource after one perspective deregistered");
      renderer2.project("x", "foo", otherScale);
      // "scale not listening to the dataSource after all perspectives removed"
      assert.throws(() => dataSource.deregisterListener(scale));
    });

    it("scale perspectives can be removed appropriately", () => {
      assert.isTrue(scale._autoDomainAutomatically, "autoDomain enabled1");
      scale.updateExtent(1, "x", d3.extent(data, (e) => e.foo));
      scale.updateExtent(2, "x", d3.extent(data, (e) => e.bar));
      assert.isTrue(scale._autoDomainAutomatically, "autoDomain enabled2");
      assert.deepEqual(scale.domain(), [-20, 5], "scale domain includes both perspectives");
      assert.isTrue(scale._autoDomainAutomatically, "autoDomain enabled3");
      scale.removeExtent(1, "x");
      assert.isTrue(scale._autoDomainAutomatically, "autoDomain enabled4");
      assert.deepEqual(scale.domain(), [-20, 1], "only the bar accessor is active");
      scale.updateExtent(2, "x", d3.extent(data, (e) => e.foo));
      assert.isTrue(scale._autoDomainAutomatically, "autoDomain enabled5");
      assert.deepEqual(scale.domain(), [0, 5], "the bar accessor was overwritten");
    });
  });

  describe("Quantitive Scales", () => {
    it("autorange defaults to [0, 1] if no perspectives set", () => {
      var scale = new Plottable.Scale.Linear();
      scale.domain([]);
      scale.autoDomain();
      var d = scale.domain();
      assert.equal(d[0], 0);
      assert.equal(d[1], 1);
    });

    it("autoPad defaults to [v-1, v+1] if there's only one value", () => {
      var scale = new Plottable.Scale.Linear();
      scale.domain([5,5]);
      scale.padDomain();
      assert.deepEqual(scale.domain(), [4, 6]);
    });

    it("autoPad works in general case", () => {
      var scale = new Plottable.Scale.Linear();
      scale.domain([100, 200]);
      scale.padDomain(0.20);
      assert.deepEqual(scale.domain(), [90, 210]);
    });

    it("autoPad works for date scales", () => {
      var scale = new Plottable.Scale.Time();
      var f = d3.time.format("%x");
      var d1 = f.parse("06/02/2014");
      var d2 = f.parse("06/03/2014");
      scale.domain([d1, d2]);
      scale.padDomain();
      var dd1 = scale.domain()[0];
      var dd2 = scale.domain()[1];
      assert.isDefined(dd1.toDateString, "padDomain produced dates");
      assert.isNotNull(dd1.toDateString, "padDomain produced dates");
      assert.notEqual(d1.valueOf(), dd1.valueOf(), "date1 changed");
      assert.notEqual(d2.valueOf(), dd2.valueOf(), "date2 changed");
      assert.equal(dd1.valueOf(), dd1.valueOf(), "date1 is not NaN");
      assert.equal(dd2.valueOf(), dd2.valueOf(), "date2 is not NaN");
    });
  });

  describe("Ordinal Scales", () => {
    it("defaults to \"bands\" range type", () => {
      var scale = new Plottable.Scale.Ordinal();
      assert.deepEqual(scale.rangeType(), "bands");
    });

    it("rangeBand returns 0 when in \"points\" mode", () => {
      var scale = new Plottable.Scale.Ordinal().rangeType("points");
      assert.deepEqual(scale.rangeType(), "points");
      assert.deepEqual(scale.rangeBand(), 0);
    });

    it("rangeBand is updated when domain changes in \"bands\" mode", () => {
      var scale = new Plottable.Scale.Ordinal();
      scale.rangeType("bands");
      assert.deepEqual(scale.rangeType(), "bands");
      scale.range([0, 2679]);

      scale.domain([1,2,3,4]);
      assert.deepEqual(scale.rangeBand(), 399);

      scale.domain([1,2,3,4,5]);
      assert.deepEqual(scale.rangeBand(), 329);
    });

    it("rangeType triggers broadcast", () => {
      var scale = new Plottable.Scale.Ordinal();
      var callbackWasCalled = false;
      var testCallback: Plottable.IBroadcasterCallback = (broadcaster: Plottable.Abstract.Broadcaster) => {
        assert.equal(broadcaster, scale, "Callback received the calling scale as the first argument");
        callbackWasCalled = true;
      };
      scale.registerListener(null, testCallback);
      scale.rangeType("points");
      assert.isTrue(callbackWasCalled, "The registered callback was called");
    });
  });

  describe("Color Scales", () => {
    it("accepts categorical string types and ordinal domain", () => {
      var scale = new Plottable.Scale.Color("10");
      scale.domain(["yes", "no", "maybe"]);
      assert.equal("#1f77b4", scale.scale("yes"));
      assert.equal("#ff7f0e", scale.scale("no"));
      assert.equal("#2ca02c", scale.scale("maybe"));
    });
  });

  describe("Interpolated Color Scales", () => {
    it("default scale uses reds and a linear scale type", () => {
      var scale = new Plottable.Scale.InterpolatedColor();
      scale.domain([0, 16]);
      assert.equal("#ffffff", scale.scale(0));
      assert.equal("#feb24c", scale.scale(8));
      assert.equal("#b10026", scale.scale(16));
    });

    it("linearly interpolates colors in L*a*b color space", () => {
      var scale = new Plottable.Scale.InterpolatedColor("reds");
      scale.domain([0, 1]);
      assert.equal("#b10026", scale.scale(1));
      assert.equal("#d9151f", scale.scale(0.9));
    });

    it("accepts array types with color hex values", () => {
      var scale = new Plottable.Scale.InterpolatedColor(["#000", "#FFF"]);
      scale.domain([0, 16]);
      assert.equal("#000000", scale.scale(0));
      assert.equal("#ffffff", scale.scale(16));
      assert.equal("#777777", scale.scale(8));
    });

    it("accepts array types with color names", () => {
      var scale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
      scale.domain([0, 16]);
      assert.equal("#000000", scale.scale(0));
      assert.equal("#ffffff", scale.scale(16));
      assert.equal("#777777", scale.scale(8));
    });

    it("overflow scale values clamp to range", () => {
      var scale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
      scale.domain([0, 16]);
      assert.equal("#000000", scale.scale(0));
      assert.equal("#ffffff", scale.scale(16));
      assert.equal("#000000", scale.scale(-100));
      assert.equal("#ffffff", scale.scale(100));
    });

    it("can be converted to a different range", () => {
      var scale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
      scale.domain([0, 16]);
      assert.equal("#000000", scale.scale(0));
      assert.equal("#ffffff", scale.scale(16));
      scale.colorRange("reds");
      assert.equal("#b10026", scale.scale(16));
    });

    it("can be converted to a different scale type", () => {
      var scale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
      scale.domain([0, 16]);
      assert.equal("#000000", scale.scale(0));
      assert.equal("#ffffff", scale.scale(16));
      assert.equal("#777777", scale.scale(8));

      scale.scaleType("log");
      assert.equal("#000000", scale.scale(0));
      assert.equal("#ffffff", scale.scale(16));
      assert.equal("#e3e3e3", scale.scale(8));
    });
  });
});
