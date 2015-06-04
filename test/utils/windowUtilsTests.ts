///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Utils", () => {
  describe("WindowUtils", () => {

    it("copyObject()", () => {
      var oldMap: {[key: string]: any} = {};
      oldMap["a"] = 1;
      oldMap["b"] = 2;
      oldMap["c"] = 3;
      oldMap["undefined"] = undefined;
      oldMap["null"] = null;
      oldMap["fun"] = (d: number) => d;
      oldMap["NaN"] = 0 / 0;
      oldMap["inf"] = 1 / 0;

      var map = Plottable.Utils.Window.copyObject(oldMap);

      assert.deepEqual(map, oldMap, "All values were copied.");

      map = Plottable.Utils.Window.copyObject({});

      assert.deepEqual(map, {}, "No values were added.");
    });

  });
});
