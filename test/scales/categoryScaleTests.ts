import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Scales", () => {
  describe("Category Scale", () => {
    describe("Basic usage", () => {

      let scale: Plottable.Scales.Category;

      beforeEach(() => {
        scale = new Plottable.Scales.Category();
      });

      it("updates rangeBand when domain changes", () => {
        scale.range([0, 2679]);

        scale.domain(["1", "2", "3", "4"]);
        assert.closeTo(scale.rangeBand(), 399, 1);

        scale.domain(["1", "2", "3", "4", "5"]);
        assert.closeTo(scale.rangeBand(), 329, 1);
      });

      it("computes the correct stepWidth", () => {
        scale.range([0, 3000]);

        scale.domain(["1", "2", "3", "4"]);
        const widthSum = scale.rangeBand() * (1 + scale.innerPadding());
        assert.closeTo(scale.stepWidth(), widthSum, 1e-5, "step width is the sum of innerPadding width and band width");
      });

      it("interacts well with BarPlot and data swapping", () => {
        // This unit test taken from SLATE, see SLATE-163 a fix for SLATE-102
        const xScale = new Plottable.Scales.Category();
        const yScale = new Plottable.Scales.Linear();
        const dA = {x: "A", y: 2};
        const dB = {x: "B", y: 2};
        const dC = {x: "C", y: 2};
        const dataset = new Plottable.Dataset([dA, dB]);
        const barPlot = new Plottable.Plots.Bar();
        barPlot.addDataset(dataset);
        barPlot.x((d: any) => d.x, xScale);
        barPlot.y((d: any) => d.y, yScale);
        const div = TestMethods.generateDiv();
        assert.deepEqual(xScale.domain(), [], "before anchoring, the bar plot doesn't proxy data to the scale");
        barPlot.renderTo(div);
        assert.deepEqual(xScale.domain(), ["A", "B"], "after anchoring, the bar plot's data is on the scale");

        iterateDataChanges([], [dA, dB, dC], []);
        assert.lengthOf(xScale.domain(), 0);

        iterateDataChanges([dA], [dB]);
        assert.lengthOf(xScale.domain(), 1);
        iterateDataChanges([], [dA, dB, dC]);
        assert.lengthOf(xScale.domain(), 3);

        div.remove();

        function iterateDataChanges(...dataChanges: any[]) {
          dataChanges.forEach((dataChange) => {
            dataset.data(dataChange);
          });
        }
      });
    });

    describe("Extent calculation", () => {
      let scale: Plottable.Scales.Category;

      beforeEach(() => {
        scale = new Plottable.Scales.Category();
      });

      it("gives the unique values when domain is stringy", () => {
        const values = ["1", "3", "2", "1"];
        const computedExtent = scale.extentOfValues(values);

        assert.deepEqual(computedExtent, ["1", "3", "2"], "the extent is made of all the unique values in the domain");
      });

      it("gives the unique values even when domain is numeric", () => {
        const values = [1, 3, 2, 1];
        const computedExtent = scale.extentOfValues(<any>values);

        assert.deepEqual(computedExtent, [1, 3, 2], "the extent is made of all the unique values in the domain");
      });
    });

  });
});
