import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

describe("Utils.Color", () => {
  it("lightenColor()", () => {
    const colorHex = "#12fced";
    const oldColor = d3.hsl(colorHex);
    const lightenedColor = Plottable.Utils.Color.lightenColor(colorHex, 1);
    assert.operator(d3.hsl(lightenedColor).l, ">", oldColor.l, "color got lighter");
  });

  it("colorTest()", () => {
    const colorTester = d3.select("body").append("div").classed("color-tester", true);
    const style = colorTester.append("style");
    style.attr("type", "text/css");

    style.text(".plottable-colors-0 { background-color: blue; }");
    const blueHexcode = Plottable.Utils.Color.colorTest(colorTester, "plottable-colors-0");
    assert.strictEqual(blueHexcode, "#0000ff", "hexcode for blue returned");

    style.text(".plottable-colors-2 { background-color: #13EADF; }");
    const hexcode = Plottable.Utils.Color.colorTest(colorTester, "plottable-colors-2");
    assert.strictEqual(hexcode, "#13eadf", "hexcode for blue returned");

    const nullHexcode = Plottable.Utils.Color.colorTest(colorTester, "plottable-colors-11");
    assert.strictEqual(nullHexcode, null, "null hexcode returned");
    colorTester.remove();
  });
});
