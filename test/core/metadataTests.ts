///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Metadata", () => {
  var xScale: Plottable.Scale.Linear;
  var yScale: Plottable.Scale.Linear;
  var data1 = [{x: 0, y: 0}, {x: 1, y: 1}];
  var data2 = [{x: 2, y: 2}, {x: 3, y: 3}];
  before(() => {
    xScale = new Plottable.Scale.Linear();
    yScale = new Plottable.Scale.Linear();
    xScale.domain([0, 400]);
    yScale.domain([400, 0]);
  });

  it("plot metadata is set properly", () => {
    var d1 = new Plottable.Dataset();
    var r = new Plottable.Plot.AbstractPlot()
                              .addDataset("d1", d1)
                              .addDataset( d1)
                              .addDataset("d2", [])
                              .addDataset([]);
    (<any> r)._datasetKeysInOrder.forEach((key: string) => {
      var plotMetadata = (<any> r)._key2PlotDatasetKey.get(key).plotMetadata;
      assert.propertyVal(plotMetadata, "datasetKey", key, "metadata has correct dataset key");
    });
  });

  it("user metadata is applied", () => {
    var svg = generateSVG(400, 400);
    var metadata = {foo: 10, bar: 20};
    var xAccessor = (d: any, i: number, u: any) => d.x + i * u.foo;
    var yAccessor = (d: any, i: number, u: any) => u.bar;
    var dataset = new Plottable.Dataset(data1, metadata);
    var plot = new Plottable.Plot.Scatter(xScale, yScale)
                                .project("x", xAccessor)
                                .project("y", yAccessor);
    plot.addDataset(dataset);
    plot.renderTo(svg);
    var circles = (<any> plot)._renderArea.selectAll("circle");
    var c1 = d3.select(circles[0][0]);
    var c2 = d3.select(circles[0][1]);
    assert.closeTo(parseFloat(c1.attr("cx")), 0, 0.01, "first circle cx is correct");
    assert.closeTo(parseFloat(c1.attr("cy")), 20, 0.01, "first circle cy is correct");
    assert.closeTo(parseFloat(c2.attr("cx")), 11, 0.01, "second circle cx is correct");
    assert.closeTo(parseFloat(c2.attr("cy")), 20, 0.01, "second circle cy is correct");

    metadata = {foo: 0, bar: 0};
    dataset.metadata(metadata);
    assert.closeTo(parseFloat(c1.attr("cx")), 0, 0.01, "first circle cx is correct after metadata change");
    assert.closeTo(parseFloat(c1.attr("cy")), 0, 0.01, "first circle cy is correct after metadata change");
    assert.closeTo(parseFloat(c2.attr("cx")), 1, 0.01, "second circle cx is correct after metadata change");
    assert.closeTo(parseFloat(c2.attr("cy")), 0, 0.01, "second circle cy is correct after metadata change");

    svg.remove();
  });

  it("user metadata is applied to associated dataset", () => {
    var svg = generateSVG(400, 400);
    var metadata1 = {foo: 10};
    var metadata2 = {foo: 30};
    var xAccessor = (d: any, i: number, u: any) => d.x + (i + 1) * u.foo;
    var yAccessor = () => 0;
    var dataset1 = new Plottable.Dataset(data1, metadata1);
    var dataset2 = new Plottable.Dataset(data2, metadata2);
    var plot = new Plottable.Plot.Scatter(xScale, yScale)
                                .project("x", xAccessor)
                                .project("y", yAccessor);
    plot.addDataset(dataset1);
    plot.addDataset(dataset2);
    plot.renderTo(svg);
    var circles = (<any> plot)._renderArea.selectAll("circle");
    var c1 = d3.select(circles[0][0]);
    var c2 = d3.select(circles[0][1]);
    var c3 = d3.select(circles[0][2]);
    var c4 = d3.select(circles[0][3]);
    assert.closeTo(parseFloat(c1.attr("cx")), 10, 0.01, "first circle is correct");
    assert.closeTo(parseFloat(c2.attr("cx")), 21, 0.01, "second circle is correct");
    assert.closeTo(parseFloat(c3.attr("cx")), 32, 0.01, "third circle is correct");
    assert.closeTo(parseFloat(c4.attr("cx")), 63, 0.01, "fourth circle is correct");

    svg.remove();
  });

  it("plot metadata is applied", () => {
    var svg = generateSVG(400, 400);
    var xAccessor = (d: any, i: number, u: any, m: any) => d.x + (i + 1) * m.foo;
    var yAccessor = () => 0;
    var plot = new Plottable.Plot.Scatter(xScale, yScale)
                                .project("x", xAccessor)
                                .project("y", yAccessor);
    (<any> plot)._getPlotMetadataForDataset = (key: string) => {
      return {
        datasetKey: key,
        foo: 10
      };
    };
    plot.addDataset(data1);
    plot.addDataset(data2);
    plot.renderTo(svg);
    var circles = (<any> plot)._renderArea.selectAll("circle");
    var c1 = d3.select(circles[0][0]);
    var c2 = d3.select(circles[0][1]);
    var c3 = d3.select(circles[0][2]);
    var c4 = d3.select(circles[0][3]);
    assert.closeTo(parseFloat(c1.attr("cx")), 10, 0.01, "first circle is correct");
    assert.closeTo(parseFloat(c2.attr("cx")), 21, 0.01, "second circle is correct");
    assert.closeTo(parseFloat(c3.attr("cx")), 12, 0.01, "third circle is correct");
    assert.closeTo(parseFloat(c4.attr("cx")), 23, 0.01, "fourth circle is correct");

    svg.remove();
  });

  it("plot metadata is per plot", () => {
    var svg = generateSVG(400, 400);
    var xAccessor = (d: any, i: number, u: any, m: any) => d.x + (i + 1) * m.foo;
    var yAccessor = () => 0;
    var plot1 = new Plottable.Plot.Scatter(xScale, yScale)
                                .project("x", xAccessor)
                                .project("y", yAccessor);
    (<any> plot1)._getPlotMetadataForDataset = (key: string) => {
      return {
        datasetKey: key,
        foo: 10
      };
    };
    plot1.addDataset(data1);
    plot1.addDataset(data2);
    var plot2 = new Plottable.Plot.Scatter(xScale, yScale)
                                .project("x", xAccessor)
                                .project("y", yAccessor);
    (<any> plot2)._getPlotMetadataForDataset = (key: string) => {
      return {
        datasetKey: key,
        foo: 20
      };
    };
    plot2.addDataset(data1);
    plot2.addDataset(data2);
    plot1.renderTo(svg);
    plot2.renderTo(svg);
    var circles = (<any> plot1)._renderArea.selectAll("circle");
    var c1 = d3.select(circles[0][0]);
    var c2 = d3.select(circles[0][1]);
    var c3 = d3.select(circles[0][2]);
    var c4 = d3.select(circles[0][3]);
    assert.closeTo(parseFloat(c1.attr("cx")), 10, 0.01, "first circle is correct for first plot");
    assert.closeTo(parseFloat(c2.attr("cx")), 21, 0.01, "second circle is correct for first plot");
    assert.closeTo(parseFloat(c3.attr("cx")), 12, 0.01, "third circle is correct for first plot");
    assert.closeTo(parseFloat(c4.attr("cx")), 23, 0.01, "fourth circle is correct for first plot");

    circles = (<any> plot2)._renderArea.selectAll("circle");
    c1 = d3.select(circles[0][0]);
    c2 = d3.select(circles[0][1]);
    c3 = d3.select(circles[0][2]);
    c4 = d3.select(circles[0][3]);
    assert.closeTo(parseFloat(c1.attr("cx")), 20, 0.01, "first circle is correct for second plot");
    assert.closeTo(parseFloat(c2.attr("cx")), 41, 0.01, "second circle is correct for second plot");
    assert.closeTo(parseFloat(c3.attr("cx")), 22, 0.01, "third circle is correct for second plot");
    assert.closeTo(parseFloat(c4.attr("cx")), 43, 0.01, "fourth circle is correct for second plot");

    svg.remove();
  });

  it("_getExtent works as expected with plot metadata", () => {
    var svg = generateSVG(400, 400);
    var metadata = {foo: 11};
    var id = (d: any) => d;
    var dataset = new Plottable.Dataset(data1, metadata);
    var a = (d: any, i: number, u: any, m: any) => d.x + u.foo + m.foo;
    var plot = new Plottable.Plot.AbstractPlot().project("a", a, xScale);
    (<any> plot)._getPlotMetadataForDataset = (key: string) => {
      return {
        datasetKey: key,
        foo: 5
      };
    };
    plot.addDataset(dataset);
    plot.renderTo(svg);
    assert.deepEqual(dataset._getExtent(a, id), [16, 17], "plot metadata is reflected in extent results");
    dataset.metadata({foo: 0});
    assert.deepEqual(dataset._getExtent(a, id), [5, 6], "plot metadata is reflected in extent results after change user metadata");
    svg.remove();
  });

  it("each plot passes metadata to projectors", () => {
    var svg = generateSVG(400, 400);
    var metadata = {foo: 11};
    var dataset1 = new Plottable.Dataset(data1, metadata);
    var dataset2 = new Plottable.Dataset(data2, metadata);

    var checkPlot = (plot: Plottable.Plot.AbstractPlot) => {
      plot.addDataset("ds1", dataset1)
          .addDataset("ds2", dataset2)
          .project("x", (d: any, i: number, u: any, m: Plottable.Plot.PlotMetadata) => d.x + u.foo + m.datasetKey.length)
          .project("y", (d: any, i: number, u: any, m: Plottable.Plot.PlotMetadata) => d.y + u.foo - m.datasetKey.length);

      // This should not crash. If some metadata is not passed, undefined property error will be raised during accessor call.
      plot.renderTo(svg);
      plot.remove();
    };

    checkPlot(new Plottable.Plot.Area(xScale, yScale));
    checkPlot(new Plottable.Plot.StackedArea(xScale, yScale));
    checkPlot(new Plottable.Plot.VerticalBar(xScale, yScale));
    checkPlot(new Plottable.Plot.StackedBar(xScale, yScale));
    checkPlot(new Plottable.Plot.StackedBar(yScale, xScale, false));
    checkPlot(new Plottable.Plot.ClusteredBar(xScale, yScale));
    checkPlot(new Plottable.Plot.Pie().project("value", "x"));
    checkPlot(new Plottable.Plot.HorizontalBar(xScale, yScale));
    checkPlot(new Plottable.Plot.Scatter(xScale, yScale));
    svg.remove();
  });
});
