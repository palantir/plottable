///<reference path="testReference.ts" />

var assert = chai.assert;

describe("DataSource", () => {
  it("Updates listeners when the data is changed", () => {
    var ds = new Plottable.DataSource();

    var newData = [ 1, 2, 3 ];

    var callbackCalled = false;
    var callback: Plottable.IBroadcasterCallback = (broadcaster: Plottable.IBroadcaster) => {
      assert.equal(broadcaster, ds, "Callback received the DataSource as the first argument");
      assert.deepEqual(ds.data(), newData, "DataSource arrives with correct data");
      callbackCalled = true;
    };
    ds.registerListener(callback);

    ds.data(newData);
    assert.isTrue(callbackCalled, "callback was called when the data was changed");
  });

  it("Updates listeners when the metadata is changed", () => {
    var ds = new Plottable.DataSource();

    var newMetadata = "blargh";

    var callbackCalled = false;
    var callback: Plottable.IBroadcasterCallback = (broadcaster: Plottable.IBroadcaster) => {
      assert.equal(broadcaster, ds, "Callback received the DataSource as the first argument");
      assert.deepEqual(ds.metadata(), newMetadata, "DataSource arrives with correct metadata");
      callbackCalled = true;
    };
    ds.registerListener(callback);

    ds.metadata(newMetadata);
    assert.isTrue(callbackCalled, "callback was called when the metadata was changed");
  });
});
