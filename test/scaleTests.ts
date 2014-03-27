///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Scales", () => {
  it("Scale's copy() works correctly", () => {
    var testCallback: Plottable.IBroadcasterCallback = (broadcaster: Plottable.IBroadcaster) => {
      return true; // doesn't do anything
    };
    var scale = new Plottable.Scale(d3.scale.linear());
    scale.registerListener(testCallback);
    var scaleCopy = scale.copy();
    assert.deepEqual(scale.domain(), scaleCopy.domain(), "Copied scale has the same domain as the original.");
    assert.deepEqual(scale.range(), scaleCopy.range(), "Copied scale has the same range as the original.");
    assert.notDeepEqual((<any> scale)._broadcasterCallbacks, (<any> scaleCopy)._broadcasterCallbacks,
                              "Registered callbacks are not copied over");
  });

  it("Scale alerts listeners when its domain is updated", () => {
    var scale = new Plottable.QuantitiveScale(d3.scale.linear());
    var callbackWasCalled = false;
    var testCallback: Plottable.IBroadcasterCallback = (broadcaster: Plottable.IBroadcaster) => {
      assert.equal(broadcaster, scale, "Callback received the calling scale as the first argument");
      callbackWasCalled = true;
    };
    scale.registerListener(testCallback);
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

  it("Ordinal Scales can map both numeric and string values, but not other types", () => {
    var scale = new Plottable.OrdinalScale();
    var domainValues = ["A", "B"];
    scale.domain(domainValues);
    var scaledValues = domainValues.map((v: string) => scale.scale(v));
    assert.operator(scaledValues[0], "<", scaledValues[1], "'A' is mapped before 'B'");
    assert.equal(scale.scale(0), 0, "Numeric values map to themselves");
    assert.throws(() => scale.scale(null), Error, "Unsupported");
    assert.throws(() => scale.scale(true), Error, "Unsupported");
  });
});
