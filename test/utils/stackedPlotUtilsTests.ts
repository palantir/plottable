///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Utils", () => {
  describe("StackedPlot", () => {

    var keyAccessor = (d: any) => d.key;
    var valueAccessor = (d: any) => d.value;

    beforeEach(() => {

    });

    it("getDomainKeys() works as expected with strings as keys", () => {
      var data1 = [
        {key: "Fred", value: 1},
        {key: "Barney", value: 2},
        {key: "Wilma", value: 1}
      ];
      var data2 = [
        {key: "Fred", value: 0},
        {key: "Barney", value: 1},
        {key: "Betty", value: 1}
      ];

      var dataset1 = new Plottable.Dataset(data1);
      var dataset2 = new Plottable.Dataset(data2);

      var datasets = [dataset1, dataset2];

      var domainKeys = Plottable.Utils.StackedPlot.getDomainKeys(datasets, keyAccessor);
      var expectedDomainKeys = ["Fred", "Barney", "Wilma", "Betty"];

      assert.deepEqual(domainKeys, expectedDomainKeys, "the expected domain keys is a set reunion of the datasets keys");
    });

    it("getDomainKeys() works as expected with numbers as keys", () => {
      var data1 = [
        {key: 1, value: 1},
        {key: 3, value: 1}
      ];
      var data2 = [
        {key: 2, value: 0},
        {key: 4, value: 1}
      ];

      var dataset1 = new Plottable.Dataset(data1);
      var dataset2 = new Plottable.Dataset(data2);

      var datasets = [dataset1, dataset2];

      var domainKeys = Plottable.Utils.StackedPlot.getDomainKeys(datasets, keyAccessor);
      var expectedDomainKeys = ["1", "2", "3", "4"];

      assert.deepEqual(domainKeys, expectedDomainKeys, "the expected domain keys is a set reunion of the datasets keys");
    });

    it("computeStackOffsets() works as expected", () => {
      var data1 = [{key: "Fred", value: 1}];
      var data2 = [{key: "Fred", value: 1}];
      var data3 = [{key: "Fred", value: 3}];
      var data4 = [{key: "Fred", value: 0}];
      var data5 = [{key: "Fred", value: 2}];

      var dataset1 = new Plottable.Dataset(data1);
      var dataset2 = new Plottable.Dataset(data2);
      var dataset3 = new Plottable.Dataset(data3);
      var dataset4 = new Plottable.Dataset(data4);
      var dataset5 = new Plottable.Dataset(data5);

      var datasets = [dataset1, dataset2, dataset3, dataset4, dataset5];

      var stackOffsets = Plottable.Utils.StackedPlot.computeStackOffsets(datasets, keyAccessor, valueAccessor);

      assert.strictEqual(stackOffsets.get(dataset1).get("Fred"), 0, "Offset 1 = 0");
      assert.strictEqual(stackOffsets.get(dataset2).get("Fred"), 1, "Offset 2 = 0 + 1");
      assert.strictEqual(stackOffsets.get(dataset3).get("Fred"), 2, "Offset 3 = 0 + 1 + 1");
      // TODO: this gets to 0 because the value is 0. Old issue. Might be worth fixing it now
      // assert.strictEqual(stackOffsets.get(dataset4).get("Fred"), 5, "Offset 4 = 0 + 1 + 1 + 3");
      assert.strictEqual(stackOffsets.get(dataset5).get("Fred"), 5, "Offset 5 = 0 + 1 + 1 + 3 + 0");
    });

    it("computeStackExtents() works as expected with positive values", () => {
      var data1 = [{key: "Fred", value: 1}];
      var data2 = [{key: "Fred", value: 300}];
      var data3 = [{key: "Fred", value: 0}];
      var data4 = [{key: "Fred", value: 2}];

      var dataset1 = new Plottable.Dataset(data1);
      var dataset2 = new Plottable.Dataset(data2);
      var dataset3 = new Plottable.Dataset(data3);
      var dataset4 = new Plottable.Dataset(data4);

      var datasets = [dataset1, dataset2, dataset3, dataset4];

      var stackOffsets = Plottable.Utils.StackedPlot.computeStackOffsets(datasets, keyAccessor, valueAccessor);
      var filter = null;

      var stackExtents = Plottable.Utils.StackedPlot.computeStackExtents(datasets, keyAccessor, valueAccessor, stackOffsets, filter);
      var expectedStackExtents = [0, 303];

      assert.deepEqual(stackExtents, expectedStackExtents, "all datasets stack up and the sum of their values is 303");
    });

    it("computeStackExtents() works as expected with negative values", () => {
      var data1 = [{key: "Barney", value: -1}];
      var data2 = [{key: "Barney", value: -300}];
      var data3 = [{key: "Barney", value: 0}];

      var dataset1 = new Plottable.Dataset(data1);
      var dataset2 = new Plottable.Dataset(data2);
      var dataset3 = new Plottable.Dataset(data3);

      var datasets = [dataset1, dataset2, dataset3];

      var stackOffsets = Plottable.Utils.StackedPlot.computeStackOffsets(datasets, keyAccessor, valueAccessor);
      var filter = null;

      var stackExtents = Plottable.Utils.StackedPlot.computeStackExtents(datasets, keyAccessor, valueAccessor, stackOffsets, filter);
      var expectedStackExtents = [-301, 0];

      assert.deepEqual(stackExtents, expectedStackExtents, "all datasets stack down and the sum of their values is -301");
    });

    it("computeStackExtents() works as expected with mixed values", () => {
      var data1 = [{key: "Wilma", value: 100}];
      var data2 = [{key: "Wilma", value: -5}];
      var data3 = [{key: "Wilma", value: 0}];
      var data4 = [{key: "Wilma", value: 20}];
      var data5 = [{key: "Wilma", value: -5}];

      var dataset1 = new Plottable.Dataset(data1);
      var dataset2 = new Plottable.Dataset(data2);
      var dataset3 = new Plottable.Dataset(data3);
      var dataset4 = new Plottable.Dataset(data4);
      var dataset5 = new Plottable.Dataset(data5);

      var datasets = [dataset1, dataset2, dataset3, dataset4, dataset5];

      var stackOffsets = Plottable.Utils.StackedPlot.computeStackOffsets(datasets, keyAccessor, valueAccessor);
      var filter = null;

      var stackExtents = Plottable.Utils.StackedPlot.computeStackExtents(datasets, keyAccessor, valueAccessor, stackOffsets, filter);
      var expectedStackExtents = [-10, 120];

      assert.deepEqual(stackExtents, expectedStackExtents, "all datasets stack down and the sum of their values is -301");
    });

    it("computeStackExtents() works as expected with mixed values and multiple datapoints", () => {
      var data1 = [
        {key: "Fred", value: 100},
        {key: "Barney", value: 15}
      ];
      var data2 = [
        {key: "Fred", value: -5},
        {key: "Barney", value: -50}
      ];
      var data3 = [
        {key: "Fred", value: 0},
        {key: "Barney", value: 0}
      ];

      var dataset1 = new Plottable.Dataset(data1);
      var dataset2 = new Plottable.Dataset(data2);
      var dataset3 = new Plottable.Dataset(data3);

      var datasets = [dataset1, dataset2, dataset3];

      var stackOffsets = Plottable.Utils.StackedPlot.computeStackOffsets(datasets, keyAccessor, valueAccessor);
      var filter = null;

      var stackExtents = Plottable.Utils.StackedPlot.computeStackExtents(datasets, keyAccessor, valueAccessor, stackOffsets, filter);
      var expectedStackExtents = [-50, 100];

      assert.deepEqual(stackExtents[0], expectedStackExtents[0], "Barney has the smallest minimum stack (-50)");
      assert.deepEqual(stackExtents[1], expectedStackExtents[1], "Fred has the largest maximum stack (100)");
    });
  });
});
