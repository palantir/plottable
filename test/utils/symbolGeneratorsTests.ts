///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("SymbolGenerators", () => {
  describe("d3Symbol", () => {
    it("throws an error if invalid symbol type is used", () => {
      assert.throws(() => Plottable.SymbolGenerators.d3Symbol("aaa"), Error, "invalid D3 symbol type");
    });
  });
});
