import { assert } from "chai";
import * as d3 from "d3";

import { withFullPrecision } from "../../src/utils/d3ShapeUtils";

describe("Utils D3 Shape", () => {
  it("accepts generators without digits() and preserves their configuration", () => {
    const line = d3.line().x((d) => d[1]).y((d) => d[0]);
    delete line.digits;
    const configuredLine = withFullPrecision(line);
    assert.strictEqual(configuredLine, line, "the original generator is preserved");
    assert.strictEqual(configuredLine([[1, 2], [3, 4]]), "M2,1L4,3", "configured accessors still apply");
  });
});
