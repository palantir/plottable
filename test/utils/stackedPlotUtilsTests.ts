///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Utils", () => {
  describe("StackedPlot", () => {

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
      var accessor = (d: any) => d.key;

      var domainKeys = Plottable.Utils.StackedPlot.getDomainKeys(datasets, accessor);
      var expectedDomainKeys = ["Fred", "Barney", "Wilma", "Betty"];

      assert.deepEqual(domainKeys, expectedDomainKeys, "the expected domain keys is a set reunion of the datasets keys");
    });

    it("getDomainKeys() works as expected with numbers as keys", () => {
      var data1 = [
        {x: 1, y: 1},
        {x: 3, y: 1}
      ];
      var data2 = [
        {x: 2, y: 0},
        {x: 4, y: 1}
      ];

      var dataset1 = new Plottable.Dataset(data1);
      var dataset2 = new Plottable.Dataset(data2);

      var datasets = [dataset1, dataset2];
      var accessor = (d: any) => d.x;

      var domainKeys = Plottable.Utils.StackedPlot.getDomainKeys(datasets, accessor);
      var expectedDomainKeys = ["1", "2", "3", "4"];

      assert.deepEqual(domainKeys, expectedDomainKeys, "the expected domain keys is a set reunion of the datasets keys");
    });

    it("computeStackOffsets() works as expected", () => {

    });

    it("computeStackExtents() works as expected", () => {

    });
  });
});
