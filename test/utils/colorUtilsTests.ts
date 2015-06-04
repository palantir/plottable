///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Utils.Color", () => {
  it("lightenColor()", () => {
    var colorHex = "#12fced";
    var oldColor = d3.hsl(colorHex);
    var lightenedColor = Plottable.Utils.Color.lightenColor(colorHex, 1);
    assert.operator(d3.hsl(lightenedColor).l, ">", oldColor.l, "color got lighter");
  });
});
