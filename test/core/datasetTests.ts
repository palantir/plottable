///<reference path="../testReference.ts" />

describe("Dataset", () => {
  it("Updates listeners when the data is changed", () => {
    var ds = new Plottable.Dataset();

    var newData = [1, 2, 3];

    var callbackCalled = false;
    var callback = (listenable: Plottable.Dataset) => {
      assert.strictEqual(listenable, ds, "Callback received the Dataset as the first argument");
      assert.deepEqual(ds.data(), newData, "Dataset arrives with correct data");
      callbackCalled = true;
    };
    ds.onUpdate(callback);

    ds.data(newData);
    assert.isTrue(callbackCalled, "callback was called when the data was changed");
  });

  it("Updates listeners when the metadata is changed", () => {
    var ds = new Plottable.Dataset();

    var newMetadata = "blargh";

    var callbackCalled = false;
    var callback = (listenable: Plottable.Dataset) => {
      assert.strictEqual(listenable, ds, "Callback received the Dataset as the first argument");
      assert.deepEqual(ds.metadata(), newMetadata, "Dataset arrives with correct metadata");
      callbackCalled = true;
    };
    ds.onUpdate(callback);

    ds.metadata(newMetadata);
    assert.isTrue(callbackCalled, "callback was called when the metadata was changed");
  });

  it("Removing listener from dataset should be possible", () => {
    var ds = new Plottable.Dataset();

    var newData1 = [1, 2, 3];
    var newData2 = [4, 5, 6];

    var callbackCalled = false;
    var callback = (listenable: Plottable.Dataset) => {
      assert.strictEqual(listenable, ds, "Callback received the Dataset as the first argument");
      callbackCalled = true;
    };
    ds.onUpdate(callback);

    ds.data(newData1);
    assert.isTrue(callbackCalled, "callback was called when the data was changed");

    callbackCalled = false;
    ds.offUpdate(callback);
    ds.data(newData2);
    assert.isFalse(callbackCalled, "callback was called when the data was changed");
  });
});
