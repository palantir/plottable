///<reference path="../testReference.ts" />

describe("Utils.Color", () => {
  it("lightenColor()", () => {
    let colorHex = "#12fced";
    let oldColor = d3.hsl(colorHex);
    let lightenedColor = Plottable.Utils.Color.lightenColor(colorHex, 1);
    assert.operator(d3.hsl(lightenedColor).l, ">", oldColor.l, "color got lighter");
  });

  it("colorTest()", () => {
    let colorTester = d3.select("body").append("div").classed("color-tester", true);
    let style = colorTester.append("style");
    style.attr("type", "text/css");

    style.text(".plottable-colors-0 { background-color: blue; }");
    let blueHexcode = Plottable.Utils.Color.colorTest(colorTester, "plottable-colors-0");
    assert.strictEqual(blueHexcode, "#0000ff", "hexcode for blue returned");

    style.text(".plottable-colors-2 { background-color: #13EADF; }");
    let hexcode = Plottable.Utils.Color.colorTest(colorTester, "plottable-colors-2");
    assert.strictEqual(hexcode, "#13eadf", "hexcode for blue returned");

    let nullHexcode = Plottable.Utils.Color.colorTest(colorTester, "plottable-colors-11");
    assert.strictEqual(nullHexcode, null, "null hexcode returned");
    colorTester.remove();
  });
});
