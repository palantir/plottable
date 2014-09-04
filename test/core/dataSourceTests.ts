///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("DataSource", () => {
  it("Updates listeners when the data is changed", () => {
    var ds = new Plottable.DataSource();

    var newData = [ 1, 2, 3 ];

    var callbackCalled = false;
    var callback: Plottable.Core.IBroadcasterCallback = (listenable: Plottable.Core.IListenable) => {
      assert.equal(listenable, ds, "Callback received the DataSource as the first argument");
      assert.deepEqual(ds.data(), newData, "DataSource arrives with correct data");
      callbackCalled = true;
    };
    ds.broadcaster.registerListener(null, callback);

    ds.data(newData);
    assert.isTrue(callbackCalled, "callback was called when the data was changed");
  });

  it("Updates listeners when the metadata is changed", () => {
    var ds = new Plottable.DataSource();

    var newMetadata = "blargh";

    var callbackCalled = false;
    var callback: Plottable.Core.IBroadcasterCallback = (listenable: Plottable.Core.IListenable) => {
      assert.equal(listenable, ds, "Callback received the DataSource as the first argument");
      assert.deepEqual(ds.metadata(), newMetadata, "DataSource arrives with correct metadata");
      callbackCalled = true;
    };
    ds.broadcaster.registerListener(null, callback);

    ds.metadata(newMetadata);
    assert.isTrue(callbackCalled, "callback was called when the metadata was changed");
  });

  it("_getExtent works as expected", () => {
    var data = [1,2,3,4,1];
    var metadata = {foo: 11};
    var dataSource = new Plottable.DataSource(data, metadata);
    var plot = new Plottable.Abstract.Plot(dataSource);
    var apply = (a: any) => Plottable.Util.Methods._applyAccessor(a, plot);
    var a1 = (d: number, i: number, m: any) => d + i - 2;
    assert.deepEqual(dataSource._getExtent(apply(a1)), [-1, 5], "extent for numerical data works properly");
    var a2 = (d: number, i: number, m: any) => d + m.foo;
    assert.deepEqual(dataSource._getExtent(apply(a2)), [12, 15], "extent uses metadata appropriately");
    dataSource.metadata({foo: -1});
    assert.deepEqual(dataSource._getExtent(apply(a2)), [0, 3], "metadata change is reflected in extent results");
    var a3 = (d: number, i: number, m: any) => "_" + d;
    assert.deepEqual(dataSource._getExtent(apply(a3)), ["_1", "_2", "_3", "_4"], "extent works properly on string domains (no repeats)");
  });
});
