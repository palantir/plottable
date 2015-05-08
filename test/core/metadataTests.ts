///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Metadata", () => {
  var xScale: Plottable.Scales.Linear;
  var yScale: Plottable.Scales.Linear;
  var data1 = [{x: 0, y: 0}, {x: 1, y: 1}];
  var data2 = [{x: 2, y: 2}, {x: 3, y: 3}];
  before(() => {
    xScale = new Plottable.Scales.Linear();
    yScale = new Plottable.Scales.Linear();
    xScale.domain([0, 400]);
    yScale.domain([400, 0]);
  });

  it("plot metadata is set properly", () => {
    var d1 = new Plottable.Dataset();
    var d2 = new Plottable.Dataset();
    var r = new Plottable.Plot()
                              .addDataset(d1)
                              .addDataset(d2);
    (<any> r)._datasetKeysInOrder.forEach((key: string) => {
      var plotMetadata = (<any> r)._key2PlotDatasetKey.get(key).plotMetadata;
      assert.propertyVal(plotMetadata, "datasetKey", key, "metadata has correct dataset key");
    });
  });

  it("Dataset is passed in", () => {
    var svg = TestMethods.generateSVG(400, 400);
    var metadata = {foo: 10, bar: 20};
    var xAccessor = (d: any, i: number, dataset: Plottable.Dataset) => d.x + i * dataset.metadata().foo;
    var yAccessor = (d: any, i: number, dataset: Plottable.Dataset) => dataset.metadata().bar;
    var dataset = new Plottable.Dataset(data1, metadata);
    var plot = new Plottable.Plots.Scatter(xScale, yScale)
                                .project("x", xAccessor)
                                .project("y", yAccessor);
    plot.addDataset(dataset);
    plot.renderTo(svg);
    var circles = plot.getAllSelections();
    var c1 = d3.select(circles[0][0]);
    var c2 = d3.select(circles[0][1]);
    var c1Position = d3.transform(c1.attr("transform")).translate;
    var c2Position = d3.transform(c2.attr("transform")).translate;
    assert.closeTo(parseFloat(c1Position[0]), 0, 0.01, "first circle cx is correct");
    assert.closeTo(parseFloat(c1Position[1]), 20, 0.01, "first circle cy is correct");
    assert.closeTo(parseFloat(c2Position[0]), 11, 0.01, "second circle cx is correct");
    assert.closeTo(parseFloat(c2Position[1]), 20, 0.01, "second circle cy is correct");

    metadata = {foo: 0, bar: 0};
    dataset.metadata(metadata);
    c1Position = d3.transform(c1.attr("transform")).translate;
    c2Position = d3.transform(c2.attr("transform")).translate;

    assert.closeTo(parseFloat(c1Position[0]), 0, 0.01, "first circle cx is correct after metadata change");
    assert.closeTo(parseFloat(c1Position[1]), 0, 0.01, "first circle cy is correct after metadata change");
    assert.closeTo(parseFloat(c2Position[0]), 1, 0.01, "second circle cx is correct after metadata change");
    assert.closeTo(parseFloat(c2Position[1]), 0, 0.01, "second circle cy is correct after metadata change");

    svg.remove();
  });

  it("user metadata is applied to associated dataset", () => {
    var svg = TestMethods.generateSVG(400, 400);
    var metadata1 = {foo: 10};
    var metadata2 = {foo: 30};
    var xAccessor = (d: any, i: number, dataset: Plottable.Dataset) => d.x + (i + 1) * dataset.metadata().foo;
    var yAccessor = () => 0;
    var dataset1 = new Plottable.Dataset(data1, metadata1);
    var dataset2 = new Plottable.Dataset(data2, metadata2);
    var plot = new Plottable.Plots.Scatter(xScale, yScale)
                                .project("x", xAccessor)
                                .project("y", yAccessor);
    plot.addDataset(dataset1);
    plot.addDataset(dataset2);
    plot.renderTo(svg);
    var circles = plot.getAllSelections();
    var c1 = d3.select(circles[0][0]);
    var c2 = d3.select(circles[0][1]);
    var c3 = d3.select(circles[0][2]);
    var c4 = d3.select(circles[0][3]);

    var c1Position = d3.transform(c1.attr("transform")).translate;
    var c2Position = d3.transform(c2.attr("transform")).translate;
    var c3Position = d3.transform(c3.attr("transform")).translate;
    var c4Position = d3.transform(c4.attr("transform")).translate;
    assert.closeTo(parseFloat(c1Position[0]), 10, 0.01, "first circle is correct");
    assert.closeTo(parseFloat(c2Position[0]), 21, 0.01, "second circle is correct");
    assert.closeTo(parseFloat(c3Position[0]), 32, 0.01, "third circle is correct");
    assert.closeTo(parseFloat(c4Position[0]), 63, 0.01, "fourth circle is correct");

    svg.remove();
  });

  it("plot metadata is applied", () => {
    var svg = TestMethods.generateSVG(400, 400);
    var xAccessor = (d: any, i: number, dataset: Plottable.Dataset, m: any) => d.x + (i + 1) * m.foo;
    var yAccessor = () => 0;
    var plot = new Plottable.Plots.Scatter(xScale, yScale)
                                .project("x", xAccessor)
                                .project("y", yAccessor);
    (<any> plot)._getPlotMetadataForDataset = (key: string) => {
      return {
        datasetKey: key,
        foo: 10
      };
    };
    plot.addDataset(new Plottable.Dataset(data1));
    plot.addDataset(new Plottable.Dataset(data2));
    plot.renderTo(svg);
    var circles = plot.getAllSelections();
    var c1 = d3.select(circles[0][0]);
    var c2 = d3.select(circles[0][1]);
    var c3 = d3.select(circles[0][2]);
    var c4 = d3.select(circles[0][3]);

    var c1Position = d3.transform(c1.attr("transform")).translate;
    var c2Position = d3.transform(c2.attr("transform")).translate;
    var c3Position = d3.transform(c3.attr("transform")).translate;
    var c4Position = d3.transform(c4.attr("transform")).translate;
    assert.closeTo(parseFloat(c1Position[0]), 10, 0.01, "first circle is correct");
    assert.closeTo(parseFloat(c2Position[0]), 21, 0.01, "second circle is correct");
    assert.closeTo(parseFloat(c3Position[0]), 12, 0.01, "third circle is correct");
    assert.closeTo(parseFloat(c4Position[0]), 23, 0.01, "fourth circle is correct");

    svg.remove();
  });

  it("plot metadata is per plot", () => {
    var svg = TestMethods.generateSVG(400, 400);
    var xAccessor = (d: any, i: number, dataset: Plottable.Dataset, m: any) => d.x + (i + 1) * m.foo;
    var yAccessor = () => 0;
    var plot1 = new Plottable.Plots.Scatter(xScale, yScale)
                                .project("x", xAccessor)
                                .project("y", yAccessor);
    (<any> plot1)._getPlotMetadataForDataset = (key: string) => {
      return {
        datasetKey: key,
        foo: 10
      };
    };
    var dataset1 = new Plottable.Dataset(data1);
    var dataset2 = new Plottable.Dataset(data2);
    plot1.addDataset(dataset1);
    plot1.addDataset(dataset2);
    var plot2 = new Plottable.Plots.Scatter(xScale, yScale)
                                .project("x", xAccessor)
                                .project("y", yAccessor);
    (<any> plot2)._getPlotMetadataForDataset = (key: string) => {
      return {
        datasetKey: key,
        foo: 20
      };
    };
    plot2.addDataset(dataset1);
    plot2.addDataset(dataset2);
    plot1.renderTo(svg);
    plot2.renderTo(svg);
    var circles = plot1.getAllSelections();
    var c1 = d3.select(circles[0][0]);
    var c2 = d3.select(circles[0][1]);
    var c3 = d3.select(circles[0][2]);
    var c4 = d3.select(circles[0][3]);

    var c1Position = d3.transform(c1.attr("transform")).translate;
    var c2Position = d3.transform(c2.attr("transform")).translate;
    var c3Position = d3.transform(c3.attr("transform")).translate;
    var c4Position = d3.transform(c4.attr("transform")).translate;
    assert.closeTo(parseFloat(c1Position[0]), 10, 0.01, "first circle is correct for first plot");
    assert.closeTo(parseFloat(c2Position[0]), 21, 0.01, "second circle is correct for first plot");
    assert.closeTo(parseFloat(c3Position[0]), 12, 0.01, "third circle is correct for first plot");
    assert.closeTo(parseFloat(c4Position[0]), 23, 0.01, "fourth circle is correct for first plot");

    circles = plot2.getAllSelections();
    c1 = d3.select(circles[0][0]);
    c2 = d3.select(circles[0][1]);
    c3 = d3.select(circles[0][2]);
    c4 = d3.select(circles[0][3]);

    c1Position = d3.transform(c1.attr("transform")).translate;
    c2Position = d3.transform(c2.attr("transform")).translate;
    c3Position = d3.transform(c3.attr("transform")).translate;
    c4Position = d3.transform(c4.attr("transform")).translate;
    assert.closeTo(parseFloat(c1Position[0]), 20, 0.01, "first circle is correct for second plot");
    assert.closeTo(parseFloat(c2Position[0]), 41, 0.01, "second circle is correct for second plot");
    assert.closeTo(parseFloat(c3Position[0]), 22, 0.01, "third circle is correct for second plot");
    assert.closeTo(parseFloat(c4Position[0]), 43, 0.01, "fourth circle is correct for second plot");

    svg.remove();
  });

  it("each plot passes metadata to projectors", () => {
    var svg = TestMethods.generateSVG(400, 400);
    var metadata = {foo: 11};
    var dataset1 = new Plottable.Dataset(data1, metadata);
    var dataset2 = new Plottable.Dataset(data2, metadata);

    var checkPlot = (plot: Plottable.Plot) => {
      var xAccessor = (d: any, i: number, dataset: Plottable.Dataset, m: Plottable.Plots.PlotMetadata) => {
          return d.x + dataset.metadata().foo + m.datasetKey.length;
      };
      var yAccessor = (d: any, i: number, dataset: Plottable.Dataset, m: Plottable.Plots.PlotMetadata) => {
          return d.y + dataset.metadata().foo - m.datasetKey.length;
      };
      plot.addDataset(dataset1)
          .addDataset(dataset2)
          .project("x", xAccessor)
          .project("y", yAccessor);

      // This should not crash. If some metadata is not passed, undefined property error will be raised during accessor call.
      plot.renderTo(svg);
      plot.destroy();
    };

    checkPlot(new Plottable.Plots.Area(xScale, yScale));
    checkPlot(new Plottable.Plots.StackedArea(xScale, yScale));
    checkPlot(new Plottable.Plots.Bar(xScale, yScale));
    checkPlot(new Plottable.Plots.StackedBar(xScale, yScale));
    checkPlot(new Plottable.Plots.StackedBar(yScale, xScale, false));
    checkPlot(new Plottable.Plots.ClusteredBar(xScale, yScale));
    checkPlot(new Plottable.Plots.Pie().sectorValue((d) => d.x));
    checkPlot(new Plottable.Plots.Bar(xScale, yScale, false));
    checkPlot(new Plottable.Plots.Scatter(xScale, yScale));
    svg.remove();
  });
});
