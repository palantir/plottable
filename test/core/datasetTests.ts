///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Dataset", () => {
  it("Updates listeners when the data is changed", () => {
    var ds = new Plottable.Dataset();

    var newData = [ 1, 2, 3 ];

    var callbackCalled = false;
    var callback: Plottable.Core.IBroadcasterCallback = (listenable: Plottable.Core.IListenable) => {
      assert.equal(listenable, ds, "Callback received the Dataset as the first argument");
      assert.deepEqual(ds.data(), newData, "Dataset arrives with correct data");
      callbackCalled = true;
    };
    ds.broadcaster.registerListener(null, callback);

    ds.data(newData);
    assert.isTrue(callbackCalled, "callback was called when the data was changed");
  });

  it("Updates listeners when the metadata is changed", () => {
    var ds = new Plottable.Dataset();

    var newMetadata = "blargh";

    var callbackCalled = false;
    var callback: Plottable.Core.IBroadcasterCallback = (listenable: Plottable.Core.IListenable) => {
      assert.equal(listenable, ds, "Callback received the Dataset as the first argument");
      assert.deepEqual(ds.metadata(), newMetadata, "Dataset arrives with correct metadata");
      callbackCalled = true;
    };
    ds.broadcaster.registerListener(null, callback);

    ds.metadata(newMetadata);
    assert.isTrue(callbackCalled, "callback was called when the metadata was changed");
  });

  it("_getExtent works as expected", () => {
    var data = [1,2,3,4,1];
    var metadata = {foo: 11};
<<<<<<< HEAD:test/core/dataSourceTests.ts
    var dataSource = new Plottable.DataSource(data, metadata);
    var plot = new Plottable.Abstract.Plot(dataSource);
    var apply = (a: any) => Plottable._Util.Methods.applyAccessor(a, plot);
=======
    var dataset = new Plottable.Dataset(data, metadata);
    var plot = new Plottable.Abstract.Plot(dataset);
    var apply = (a: any) => Plottable.Util.Methods._applyAccessor(a, plot);
>>>>>>> api-breaking-changes:test/core/datasetTests.ts
    var a1 = (d: number, i: number, m: any) => d + i - 2;
    assert.deepEqual(dataset._getExtent(apply(a1)), [-1, 5], "extent for numerical data works properly");
    var a2 = (d: number, i: number, m: any) => d + m.foo;
    assert.deepEqual(dataset._getExtent(apply(a2)), [12, 15], "extent uses metadata appropriately");
    dataset.metadata({foo: -1});
    assert.deepEqual(dataset._getExtent(apply(a2)), [0, 3], "metadata change is reflected in extent results");
    var a3 = (d: number, i: number, m: any) => "_" + d;
    assert.deepEqual(dataset._getExtent(apply(a3)), ["_1", "_2", "_3", "_4"], "extent works properly on string domains (no repeats)");
  });
});
