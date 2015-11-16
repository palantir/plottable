///<reference path="../testReference.ts" />

describe("Scales", () => {
  describe("QuantitativeScale", () => {
    describe("computing extents", () => {
      // HACKHACK #2336: QuantitativeScales don't take min/max of stringy values correctly
      it.skip("gives the minimum and maxiumum when the domain is stringy", () => {
        const values = ["11", "3", "2", "1"];
        const scale = new Plottable.QuantitativeScale();
        const computedExtent = scale.extentOfValues(values);

        assert.deepEqual(computedExtent, ["1", "11"], "the extent is the miminum and the maximum value in the domain");
      });

      it("gives the minimum and maxiumum when the domain is numeric", () => {
        const values = [11, 3, 2, 1];
        const scale = new Plottable.QuantitativeScale();
        const computedExtent = scale.extentOfValues(values);

        assert.deepEqual(computedExtent, [1, 11], "the extent is the miminum and the maximum value in the domain");
      });
    });
  });
});
