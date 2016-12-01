///<reference path="../testReference.ts" />

describe("Gridlines", () => {
  let svg: d3.Selection<void>;
  let xScale: Plottable.Scales.Linear;
  let yScale: Plottable.Scales.Linear;
  let gridlines: Plottable.Components.Gridlines;

  beforeEach(() => {
    svg = TestMethods.generateSVG();
    xScale = new Plottable.Scales.Linear();
    xScale.domain([0, 10]);

    yScale = new Plottable.Scales.Linear();
    yScale.domain([0, 10]);
    gridlines = new Plottable.Components.Gridlines(xScale, yScale);
  });

  it("sets ranges of scales to the Gridlines dimensions when layout is computed", () => {
    gridlines.renderTo(svg);

    assert.deepEqual(xScale.range(), [0, TestMethods.numAttr(svg, "width")], "x scale range extends to the width of the svg");
    assert.deepEqual(yScale.range(), [TestMethods.numAttr(svg, "height"), 0], "y scale range extends to the height of the svg");

    svg.remove();
  });

  it("draws gridlines on ticks of its scales and updates when scale update", () => {
    gridlines.renderTo(svg);

    let xGridlines = gridlines.content().select(".x-gridlines").selectAll("line");
    let xTicks = xScale.ticks();
    assert.strictEqual(xGridlines.size(), xTicks.length, "There is an x gridline for each x tick");
    xGridlines.each(function(gridline, i) {
      const x = TestMethods.numAttr(d3.select(this), "x1");
      assert.closeTo(x, xScale.scale(xTicks[i]), window.Pixel_CloseTo_Requirement, "x gridline drawn on ticks");
    });

    let yGridlines = gridlines.content().select(".y-gridlines").selectAll("line");
    let yTicks = yScale.ticks();
    assert.strictEqual(yGridlines.size(), yTicks.length, "There is a y gridline for each y tick");
    yGridlines.each(function(gridline, i) {
      const y = TestMethods.numAttr(d3.select(this), "y1");
      assert.closeTo(y, yScale.scale(yTicks[i]), window.Pixel_CloseTo_Requirement, "y gridline drawn on ticks");
    });

    xScale.domain([0, 8]);
    yScale.domain([0, 8]);

    xGridlines = gridlines.content().select(".x-gridlines").selectAll("line");
    xTicks = xScale.ticks();
    xGridlines.each(function(gridline, i) {
      const x = TestMethods.numAttr(d3.select(this), "x1");
      assert.closeTo(x, xScale.scale(xTicks[i]), window.Pixel_CloseTo_Requirement, "x gridline is updated");
    });

    yGridlines = gridlines.content().select(".y-gridlines").selectAll("line");
    yTicks = yScale.ticks();
    yGridlines.each(function(gridline, i) {
      const y = TestMethods.numAttr(d3.select(this), "y1");
      assert.closeTo(y, yScale.scale(yTicks[i]), window.Pixel_CloseTo_Requirement, "y gridline is updated");
    });
    svg.remove();
  });

  it("draws gridlines on category ticks and updates when scale update", () => {
    let check = function(lines: d3.Selection<any>, scale: Plottable.Scales.Category, axis: string) {
      let ticks = scale.domain();
      assert.strictEqual(lines.size(), ticks.length, "There is a " + axis + " gridline for each " + axis + " tick");
      lines.each(function(gridline: any, i: number) {
        const v = TestMethods.numAttr(d3.select(this), axis + "1");
        assert.closeTo(v, scale.scale(ticks[i]), window.Pixel_CloseTo_Requirement, axis + " gridline drawn on ticks");
      });
    };
    let ys: Plottable.Scales.Category = new Plottable.Scales.Category().domain(["a", "b", "c"]);
    let xs: Plottable.Scales.Category = new Plottable.Scales.Category().domain(["x", "y", "z"]);
    let categoryGrid: Plottable.Components.Gridlines = new Plottable.Components.Gridlines(xs, ys);

    categoryGrid.renderTo(svg);

    check(categoryGrid.content().select(".y-gridlines").selectAll("line"), ys, "y");
    check(categoryGrid.content().select(".x-gridlines").selectAll("line"), xs, "x");

    ys.domain(["a", "b", "c", "d", "e"]);
    xs.domain(["v", "w", "x", "y", "z"]);

    check(categoryGrid.content().select(".y-gridlines").selectAll("line"), ys, "y");
    check(categoryGrid.content().select(".x-gridlines").selectAll("line"), xs, "x");

    svg.remove();
  });

  it("throws error on not-allowed scales", () => {
    // HACKHACK #2661: Cannot assert errors being thrown with description
    const colorScale = new Plottable.Scales.Color();
    (<any> assert).throw(() => new Plottable.Components.Gridlines(<any> colorScale, null), Error,
      "xScale needs to inherit from Scale.QuantitativeScale", "can't set xScale to color scale");
    (<any> assert).throw(() => new Plottable.Components.Gridlines(null, <any> colorScale), Error,
      "yScale needs to inherit from Scale.QuantitativeScale", "can't set yScale to color scale");

     svg.remove();
  });
});
