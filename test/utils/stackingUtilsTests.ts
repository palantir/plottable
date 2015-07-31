///<reference path="../testReference.ts" />

describe("Utils", () => {
  describe("StackingUtils", () => {

    var keyAccessor = (d: any) => d.key;
    var valueAccessor = (d: any) => d.value;
    var createDatasets = (dataArray: any[]) => {
      return dataArray.map((data: any[]) => new Plottable.Dataset(data));
    };
    var filter: (value: string) => boolean;

    it("stack() works as expected with positive values", () => {
      var data1 = [{key: "Fred", value: 1}];
      var data2 = [{key: "Fred", value: 1}];
      var data3 = [{key: "Fred", value: 3}];
      var data4 = [{key: "Fred", value: 0}];
      var data5 = [{key: "Fred", value: 2}];

      var datasets = createDatasets([data1, data2, data3, data4, data5]);
      var stackingResult = Plottable.Utils.Stacking.stack(datasets, keyAccessor, valueAccessor);

      assert.strictEqual(stackingResult.get(datasets[0]).get("Fred").offset, 0, "Offset 1 = 0");
      assert.strictEqual(stackingResult.get(datasets[1]).get("Fred").offset, 1, "Offset 2 = 0 + 1");
      assert.strictEqual(stackingResult.get(datasets[2]).get("Fred").offset, 2, "Offset 3 = 0 + 1 + 1");
      assert.strictEqual(stackingResult.get(datasets[3]).get("Fred").offset, 5, "Offset 5 = 0 + 1 + 1 + 3");
      assert.strictEqual(stackingResult.get(datasets[4]).get("Fred").offset, 5, "Offset 5 = 0 + 1 + 1 + 3 + 0");
    });

    it("stack() works as expected with negative values", () => {
      var data1 = [{key: "Fred", value: -1}];
      var data2 = [{key: "Fred", value: -1}];
      var data3 = [{key: "Fred", value: -3}];
      var data4 = [{key: "Fred", value: 0}];
      var data5 = [{key: "Fred", value: -2}];

      var datasets = createDatasets([data1, data2, data3, data4, data5]);
      var stackingResult = Plottable.Utils.Stacking.stack(datasets, keyAccessor, valueAccessor);

      assert.strictEqual(stackingResult.get(datasets[0]).get("Fred").offset, 0, "Offset 1 = 0");
      assert.strictEqual(stackingResult.get(datasets[1]).get("Fred").offset, -1, "Offset 2 = 0 - 1");
      assert.strictEqual(stackingResult.get(datasets[2]).get("Fred").offset, -2, "Offset 3 = 0 - 1 - 1");
      assert.strictEqual(stackingResult.get(datasets[4]).get("Fred").offset, -5, "Offset 5 = 0 - 1 - 1 - 3 - 0");
    });

    it("stack() works as expected with positive and negative values", () => {
      var data1 = [{key: "Fred", value: 1}];
      var data2 = [{key: "Fred", value: 2}];
      var data3 = [{key: "Fred", value: -2}];
      var data4 = [{key: "Fred", value: -3}];
      var data5 = [{key: "Fred", value: 2}];
      var data6 = [{key: "Fred", value: -1}];

      var datasets = createDatasets([data1, data2, data3, data4, data5, data6]);
      var stackingResult = Plottable.Utils.Stacking.stack(datasets, keyAccessor, valueAccessor);

      assert.strictEqual(stackingResult.get(datasets[0]).get("Fred").offset, 0, "Offset 1 = 0");
      assert.strictEqual(stackingResult.get(datasets[1]).get("Fred").offset, 1, "Offset 2 = 0 + 1");
      assert.strictEqual(stackingResult.get(datasets[2]).get("Fred").offset, 0, "Offset 3 = 0");
      assert.strictEqual(stackingResult.get(datasets[3]).get("Fred").offset, -2, "Offset 4 = 0 - 2");
      assert.strictEqual(stackingResult.get(datasets[4]).get("Fred").offset, 3, "Offset 5 = 0 + 1 + 2");
      assert.strictEqual(stackingResult.get(datasets[5]).get("Fred").offset, -5, "Offset 6 = 0 - 2 - 3");
    });

    it("stackedExtent() works as expected with positive values", () => {
      var data1 = [{key: "Fred", value: 1}];
      var data2 = [{key: "Fred", value: 300}];
      var data3 = [{key: "Fred", value: 0}];
      var data4 = [{key: "Fred", value: 2}];

      var datasets = createDatasets([data1, data2, data3, data4]);
      var stackingResult = Plottable.Utils.Stacking.stack(datasets, keyAccessor, valueAccessor);
      filter = null;

      var stackExtents = Plottable.Utils.Stacking.stackedExtent(stackingResult, keyAccessor, filter);
      var expectedStackExtents = [0, 303];

      assert.deepEqual(stackExtents, expectedStackExtents, "all datasets stack up and the sum of their values is 303");
    });

    it("stackedExtent() works as expected with negative values", () => {
      var data1 = [{key: "Barney", value: -1}];
      var data2 = [{key: "Barney", value: -300}];
      var data3 = [{key: "Barney", value: 0}];

      var datasets = createDatasets([data1, data2, data3]);

      var stackingResult = Plottable.Utils.Stacking.stack(datasets, keyAccessor, valueAccessor);
      filter = null;

      var stackExtents = Plottable.Utils.Stacking.stackedExtent(stackingResult, keyAccessor, filter);
      var expectedStackExtents = [-301, 0];

      assert.deepEqual(stackExtents, expectedStackExtents, "all datasets stack down and the sum of their values is -301");
    });

    it("stackedExtent() works as expected with mixed values", () => {
      var data1 = [{key: "Wilma", value: 100}];
      var data2 = [{key: "Wilma", value: -5}];
      var data3 = [{key: "Wilma", value: 0}];
      var data4 = [{key: "Wilma", value: 20}];
      var data5 = [{key: "Wilma", value: -5}];

      var datasets = createDatasets([data1, data2, data3, data4, data5]);

      var stackingResult = Plottable.Utils.Stacking.stack(datasets, keyAccessor, valueAccessor);
      filter = null;

      var stackExtents = Plottable.Utils.Stacking.stackedExtent(stackingResult, keyAccessor, filter);
      var expectedStackExtents = [-10, 120];

      assert.deepEqual(stackExtents, expectedStackExtents, "all datasets stack down and the sum of their values is -301");
    });

    it("stackedExtent() works as expected with mixed values and multiple datapoints", () => {
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

      var datasets = createDatasets([data1, data2, data3]);

      var stackingResult = Plottable.Utils.Stacking.stack(datasets, keyAccessor, valueAccessor);
      filter = null;

      var stackExtents = Plottable.Utils.Stacking.stackedExtent(stackingResult, keyAccessor, filter);
      var expectedStackExtents = [-50, 100];

      assert.deepEqual(stackExtents[0], expectedStackExtents[0], "Barney has the smallest minimum stack (-50)");
      assert.deepEqual(stackExtents[1], expectedStackExtents[1], "Fred has the largest maximum stack (100)");
    });

    it("stackedExtent() works with filter", () => {
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

      var datasets = createDatasets([data1, data2, data3]);

      var stackingResult = Plottable.Utils.Stacking.stack(datasets, keyAccessor, valueAccessor);
      filter = (datum: any) => datum.key === "Fred";

      var stackExtents = Plottable.Utils.Stacking.stackedExtent(stackingResult, keyAccessor, filter);
      var expectedStackExtents = [-5, 100];

      assert.deepEqual(stackExtents[0], expectedStackExtents[0], "Fred has the smallest minimum stack");
      assert.deepEqual(stackExtents[1], expectedStackExtents[1], "Fred has the largest maximum stack");
    });
  });
});
