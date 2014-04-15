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
  describe("autoranging behavior", () => {
    var data: any[];
    var dataSource: Plottable.DataSource;
    var scale: Plottable.LinearScale;
    beforeEach(() => {
      data = [{foo: 2, bar: 1}, {foo: 5, bar: -20}, {foo: 0, bar: 0}];
      dataSource = new Plottable.DataSource(data);
      scale = new Plottable.LinearScale();
    });

    it("scale autoDomain flag is not overwritten without explicitly setting the domain", () => {
      scale._addPerspective("1", dataSource, "foo");
      scale.autorangeDomain().padDomain().nice();
      assert.isTrue(scale._autoDomain, "the autoDomain flag is still set after autoranginging and padding and nice-ing");
      scale.domain([0, 5]);
      assert.isFalse(scale._autoDomain, "the autoDomain flag is false after domain explicitly set");
    });

    it("scale autorange works as expected with single dataSource", () => {
      assert.isFalse((<any> scale).isAutorangeUpToDate, "isAutorangeUpToDate is false by default");
      scale._addPerspective("1x", dataSource, "foo");
      assert.isFalse((<any> scale).isAutorangeUpToDate, "isAutorangeUpToDate set to false after adding perspective");
      scale.autorangeDomain();
      assert.isTrue((<any> scale).isAutorangeUpToDate, "isAutorangeUpToDate is true after autoranging");
      assert.deepEqual(scale.domain(), [0, 5], "scale domain was autoranged properly");
      data.push({foo: 100, bar: 200});
      dataSource.data(data);
      dataSource._broadcast();
      assert.isFalse((<any> scale).isAutorangeUpToDate, "isAutorangeUpToDate set to false after modifying data");
      scale.autorangeDomain();
      assert.deepEqual(scale.domain(), [0, 100], "scale domain was autoranged properly");
    });

    it("scale reference counting works as expected", () => {
      scale._addPerspective("1x", dataSource, "foo");
      scale._addPerspective("2x", dataSource, "foo");
      scale.autorangeDomain();
      scale._removePerspective("1x");
      scale.autorangeDomain();
      assert.isTrue((<any> scale).isAutorangeUpToDate, "scale autorange up to date");
      dataSource._broadcast();
      assert.isFalse((<any> scale).isAutorangeUpToDate, "scale was still listening to dataSource after one perspective deregistered");
      scale._removePerspective("2x");
      scale.autorangeDomain();
      assert.isTrue((<any> scale).isAutorangeUpToDate, "scale autorange up to date");
      dataSource._broadcast();
      assert.isTrue((<any> scale).isAutorangeUpToDate, "scale not listening to the dataSource after all perspectives removed");
    });

    it("scale perspectives can be removed appropriately", () => {
      assert.isTrue(scale._autoDomain, "autoDomain enabled1");
      scale._addPerspective("1x", dataSource, "foo");
      scale._addPerspective("2x", dataSource, "bar");
      assert.isTrue(scale._autoDomain, "autoDomain enabled2");
      assert.deepEqual(scale.domain(), [-20, 5], "scale domain includes both perspectives");
      assert.isTrue(scale._autoDomain, "autoDomain enabled3");
      scale._removePerspective("1x");
      assert.isTrue(scale._autoDomain, "autoDomain enabled4");
      assert.deepEqual(scale.domain(), [-20, 1], "only the bar accessor is active");
      scale._addPerspective("2x", dataSource, "foo");
      assert.isTrue(scale._autoDomain, "autoDomain enabled5");
      assert.deepEqual(scale.domain(), [0, 5], "the bar accessor was overwritten");
    });
  });
});
