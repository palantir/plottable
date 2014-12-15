///<reference path="../../testReference.ts" />

var assert = chai.assert;
describe("Plots", () => {
  describe("New Style Plots", () => {
    var p: Plottable.Plot.AbstractPlot;
    var oldWarn = Plottable._Util.Methods.warn;

    beforeEach(() => {
      p = new Plottable.Plot.AbstractPlot();
      (<any> p)._getDrawer = (k: string) => new Plottable._Drawer.Element(k).svgElement("rect");
    });

    afterEach(() => {
      Plottable._Util.Methods.warn = oldWarn;
    });

    it("Datasets can be added and removed as expected", () => {
      p.addDataset("foo", [1,2,3]);
      var d2 = new Plottable.Dataset([4,5,6]);
      p.addDataset("bar", d2);
      p.addDataset([7,8,9]);
      var d4 = new Plottable.Dataset([10,11,12]);
      p.addDataset(d4);

      assert.deepEqual((<any> p)._datasetKeysInOrder, ["foo", "bar", "_0", "_1"], "dataset keys as expected");
      var datasets = p.datasets();
      assert.deepEqual(datasets[0].data(), [1,2,3]);
      assert.equal(datasets[1], d2);
      assert.deepEqual(datasets[2].data(), [7,8,9]);
      assert.equal(datasets[3], d4);

      p.removeDataset("foo");
      p.removeDataset("_0");

      assert.deepEqual((<any> p)._datasetKeysInOrder, ["bar", "_1"]);
      assert.lengthOf(p.datasets(), 2);
    });

    it("Datasets are listened to appropriately", () => {
      var callbackCounter = 0;
      var callback = () => callbackCounter++;
      (<any> p)._onDatasetUpdate = callback;
      var d = new Plottable.Dataset([1,2,3]);
      p.addDataset("foo", d);
      assert.equal(callbackCounter, 1, "adding dataset triggers listener");
      d.data([1,2,3,4]);
      assert.equal(callbackCounter, 2, "modifying data triggers listener");
      p.removeDataset("foo");
      assert.equal(callbackCounter, 3, "removing dataset triggers listener");
    });

    it("Datasets can be reordered", () => {
      p.addDataset("foo", [1]);
      p.addDataset("bar", [2]);
      p.addDataset("baz", [3]);
      assert.deepEqual(p.datasetOrder(), ["foo", "bar", "baz"]);
      p.datasetOrder(["bar", "baz", "foo"]);
      assert.deepEqual(p.datasetOrder(), ["bar", "baz", "foo"]);
      var warned = 0;
      Plottable._Util.Methods.warn = () => warned++; // suppress expected warnings
      p.datasetOrder(["blah", "blee", "bar", "baz", "foo"]);
      assert.equal(warned, 1);
      assert.deepEqual(p.datasetOrder(), ["bar", "baz", "foo"]);
    });

    it("Has proper warnings", () => {
      var warned = 0;
      Plottable._Util.Methods.warn = () => warned++;
      p.addDataset("_foo", []);
      assert.equal(warned, 1);
      p.addDataset("2", []);
      p.addDataset("4", []);

      // get warning for not a permutation
      p.datasetOrder(["_bar", "4", "2"]);
      assert.equal(warned, 2);

      // do not get warning for a permutation
      p.datasetOrder(["2", "_foo", "4"]);
      assert.equal(warned, 2);
    });
  });
});
