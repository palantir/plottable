///<reference path="../testReference.ts" />

describe("Utils.Color", () => {
  it("lightenColor()", () => {
    var colorHex = "#12fced";
    var oldColor = d3.hsl(colorHex);
    var lightenedColor = Plottable.Utils.Color.lightenColor(colorHex, 1);
    assert.operator(d3.hsl(lightenedColor).l, ">", oldColor.l, "color got lighter");
  });

  it("colorTest()", () => {
    var colorTester = d3.select("body").append("div").classed("color-tester", true);
    var style = colorTester.append("style");
    style.attr("type", "text/css");

    style.text(".plottable-colors-0 { background-color: blue; }");
    var blueHexcode = Plottable.Utils.Color.colorTest(colorTester, "plottable-colors-0");
    assert.strictEqual(blueHexcode, "#0000ff", "hexcode for blue returned");

    style.text(".plottable-colors-2 { background-color: #13EADF; }");
    var hexcode = Plottable.Utils.Color.colorTest(colorTester, "plottable-colors-2");
    assert.strictEqual(hexcode, "#13eadf", "hexcode for blue returned");

    var nullHexcode = Plottable.Utils.Color.colorTest(colorTester, "plottable-colors-11");
    assert.strictEqual(nullHexcode, null, "null hexcode returned");
    colorTester.remove();
  });
});
