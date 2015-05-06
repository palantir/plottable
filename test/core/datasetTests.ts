///<reference path="../testReference.ts" />

var assert = chai.assert;

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

  it("_getExtent works as expected with user metadata", () => {
    var data = [1, 2, 3, 4, 1];
    var metadata = {foo: 11};
    var id = (d: any) => d;
    var dataset = new Plottable.Dataset(data, metadata);
    var a1 = (d: number, i: number, m: any) => d + i - 2;
    assert.deepEqual(dataset._getExtent(a1, id), [-1, 5], "extent for numerical data works properly");
    var a2 = (d: number, i: number, m: any) => d + m.foo;
    assert.deepEqual(dataset._getExtent(a2, id), [12, 15], "extent uses metadata appropriately");
    dataset.metadata({foo: -1});
    assert.deepEqual(dataset._getExtent(a2, id), [0, 3], "metadata change is reflected in extent results");
    var a3 = (d: number, i: number, m: any) => "_" + d;
    assert.deepEqual(dataset._getExtent(a3, id), ["_1", "_2", "_3", "_4"], "extent works properly on string domains (no repeats)");
    var a_toString = (d: any) => (d + 2).toString();
    var coerce = (d: any) => +d;
    assert.deepEqual(dataset._getExtent(a_toString, coerce), [3, 6], "type coercion works as expected");
  });
});
