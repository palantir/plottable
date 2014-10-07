///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {

  describe("Stacked Plot Stacking", () => {
    var stackedPlot: Plottable.Abstract.Stacked<number, number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;

    beforeEach(() => {
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      stackedPlot = new Plottable.Abstract.Stacked(xScale, yScale);

      (<any> stackedPlot)._getDrawer = (key: string) => new Plottable.Abstract._Drawer(key);
      stackedPlot._isVertical = true;
    });

    it("uses positive offset on stacking the 0 value", () => {
      var data1 = [
        {x: 1, y: 1},
        {x: 3, y: 1}
      ];
      var data2 = [
        {x: 1, y: 0},
        {x: 3, y: 1}
      ];
      var data3 = [
        {x: 1, y: -1},
        {x: 3, y: 1}
      ];
      var data4 = [
        {x: 1, y: 1},
        {x: 3, y: 1}
      ];
      var data5 = [
        {x: 1, y: 0},
        {x: 3, y: 1}
      ];

      stackedPlot.addDataset(data1);
      stackedPlot.addDataset(data2);
      stackedPlot.addDataset(data3);
      stackedPlot.addDataset(data4);
      stackedPlot.addDataset(data5);

      assert.strictEqual((<any> data2[0])["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"], 1, "positive offset was used");
      assert.strictEqual((<any> data5[0])["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"], 2, "positive offset was used");
    });

    it("uses negative offset on stacking the 0 value on all negative/0 valued data", () => {
      var data1 = [
        {x: 1, y: -2}
      ];
      var data2 = [
        {x: 1, y: 0}
      ];
      var data3 = [
        {x: 1, y: -1}
      ];
      var data4 = [
        {x: 1, y: 0}
      ];

      stackedPlot.addDataset(data1);
      stackedPlot.addDataset(data2);
      stackedPlot.addDataset(data3);
      stackedPlot.addDataset(data4);

      assert.strictEqual((<any> data2[0])["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"], -2, "positive offset was used");
      assert.strictEqual((<any> data4[0])["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"], -3, "positive offset was used");
    });
  });
});
