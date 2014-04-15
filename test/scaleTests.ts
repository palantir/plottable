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
    assert.notDeepEqual((<any> scale).listener2Callback, (<any> scaleCopy).listener2Callback,
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

  it("scale autorange works as expected with single dataSource", () => {
    var data = [1,2,3,4];
    var dataSource = new Plottable.DataSource(data);
    var scale = new Plottable.LinearScale();
    var identity = (x) => x;
    assert.isFalse((<any> scale).isAutorangeUpToDate, "isAutorangeUpToDate is false by default");
    scale._addPerspective("1x", dataSource, identity);
    assert.isFalse((<any> scale).isAutorangeUpToDate, "isAutorangeUpToDate set to false after adding perspective");
    scale.autorangeDomain();
    assert.isTrue((<any> scale).isAutorangeUpToDate, "isAutorangeUpToDate is true after autoranging");
    assert.deepEqual(scale.domain(), [1,4], "scale domain was autoranged properly");
    dataSource.data([1,2,39,4]);
    assert.isFalse((<any> scale).isAutorangeUpToDate, "isAutorangeUpToDate set to false after modifying data");
    scale.autorangeDomain();
    assert.deepEqual(scale.domain(), [1,39], "scale domain was autoranged properly");
  });
});
