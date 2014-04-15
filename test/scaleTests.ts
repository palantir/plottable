///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Scales", () => {
  it("Scale's copy() works correctly", () => {
    var testCallback: Plottable.IBroadcasterCallback = (broadcaster: Plottable.Broadcaster) => {
      return true; // doesn't do anything
    };
    var scale = new Plottable.Scale(d3.scale.linear());
    scale.registerListener(null, testCallback);
    var scaleCopy = scale.copy();
    assert.deepEqual(scale.domain(), scaleCopy.domain(), "Copied scale has the same domain as the original.");
    assert.deepEqual(scale.range(), scaleCopy.range(), "Copied scale has the same range as the original.");
    assert.notDeepEqual((<any> scale).listenerCallbacks, (<any> scaleCopy).listenerCallbacks,
                              "Registered callbacks are not copied over");
  });

  it("Scale alerts listeners when its domain is updated", () => {
    var scale = new Plottable.QuantitiveScale(d3.scale.linear());
    var callbackWasCalled = false;
    var testCallback: Plottable.IBroadcasterCallback = (broadcaster: Plottable.Broadcaster) => {
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

  it("QuantitiveScale.widenDomain() functions correctly", () => {
    var scale = new Plottable.QuantitiveScale(d3.scale.linear());
    assert.deepEqual(scale.domain(), [0, 1], "Initial domain is [0, 1]");
    scale.widenDomain([1, 2]);
    assert.deepEqual(scale.domain(), [0, 2], "Domain was wided to [0, 2]");
    scale.widenDomain([-1, 1]);
    assert.deepEqual(scale.domain(), [-1, 2], "Domain was wided to [-1, 2]");
    scale.widenDomain([0, 1]);
    assert.deepEqual(scale.domain(), [-1, 2], "Domain does not get shrink if \"widened\" to a smaller value");
  });

  it("Linear Scales default to a domain of [Infinity, -Infinity]", () => {
    var scale = new Plottable.LinearScale();
    var domain = scale.domain();
    assert.deepEqual(domain, [Infinity, -Infinity]);
  });

  describe("Ordinal Scales", () => {
    it("defaults to \"points\" range type", () => {
      var scale = new Plottable.OrdinalScale();
      assert.deepEqual(scale.rangeType(), "points");
    });

    it("rangeBand returns 0 when in \"points\" mode", () => {
      var scale = new Plottable.OrdinalScale();
      assert.deepEqual(scale.rangeType(), "points");
      assert.deepEqual(scale.rangeBand(), 0);
    });

    it("rangeBands are updated when we switch to \"bands\" mode", () => {
      var scale = new Plottable.OrdinalScale();
      scale.rangeType("bands");
      assert.deepEqual(scale.rangeType(), "bands");
      scale.range([0, 2679]);

      scale.domain([1,2,3,4]);
      assert.deepEqual(scale.rangeBand(), 399);

      scale.domain([1,2,3,4,5]);
      assert.deepEqual(scale.rangeBand(), 329);
    });
  });

  describe("Color Scales", () => {
    it("accepts categorical string types", () => {
      var scale = new Plottable.ColorScale("10");
      scale.domain([0,1,2]);
      assert.equal("#1f77b4", scale.scale(0));
      assert.equal("#2ca02c", scale.scale(1));
      assert.equal("#ff7f0e", scale.scale(2));
    });

    it("linearly interpolates colors in L*a*b color space", () => {
      var scale = new Plottable.ColorScale("reds");
      scale.domain([0, 1]);
      assert.equal("#b10026", scale.scale(1));
      assert.equal("#d9151f", scale.scale(0.9));
    });

    it("accepts array types with color hex values", () => {
      var scale = new Plottable.ColorScale(["#000", "#FFF"]);
      scale.domain([0, 16]);
      assert.equal("#000000", scale.scale(0));
      assert.equal("#ffffff", scale.scale(16));
      assert.equal("#777777", scale.scale(8));
    });

    it("accepts array types with color names", () => {
      var scale = new Plottable.ColorScale(["black", "white"]);
      scale.domain([0, 16]);
      assert.equal("#000000", scale.scale(0));
      assert.equal("#ffffff", scale.scale(16));
      assert.equal("#777777", scale.scale(8));
    });

    it("overflow scale values clamp to range", () => {
      var scale = new Plottable.ColorScale(["black", "white"]);
      scale.domain([0, 16]);
      assert.equal("#000000", scale.scale(0));
      assert.equal("#ffffff", scale.scale(16));
      assert.equal("#000000", scale.scale(-100));
      assert.equal("#ffffff", scale.scale(100));
    });
  });

});
