///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Regression Tests", () => {
  it("1059-time-type-coercion", () => {
    var data = [
        { date: new Date("2014-09-09"), y: 1 },
        { date: new Date("2014-09-10"), y: 4 },
        { date: new Date("2014-09-11"), y: 9 }
    ];
    var svg = generateSVG();
    var xScale = new Plottable.Scale.Time();
    var yScale = new Plottable.Scale.Linear();

    var line = new Plottable.Plot.Line(data, xScale, yScale);
    line.project("x", "date", xScale);

    line.renderTo(svg);
    svg.remove();
  });
});
