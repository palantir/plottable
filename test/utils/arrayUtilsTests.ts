import { assert } from "chai";

import * as Plottable from "../../src";

describe("Utils", () => {
  describe("ArrayUtils", () => {

    it("uniq()", () => {
      const strings = ["foo", "bar", "foo", "foo", "baz", "bam"];
      assert.deepEqual(Plottable.Utils.Array.uniq(strings), ["foo", "bar", "baz", "bam"]);
    });

    it("uniq() preserves string key equality and the first original value", () => {
      const values = [1, "1", "__proto__", "__proto__", 2, "2"];
      assert.deepEqual(Plottable.Utils.Array.uniq(values), [1, "__proto__", 2]);
    });

  });
});
