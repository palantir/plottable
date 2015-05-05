///<reference path="../../testReference.ts" />

var assert = chai.assert;
class CountingPlot extends Plottable.Plot {
  public renders: number = 0;

  public render() {
    ++this.renders;
    return super.render();
  }
}

describe("Plots", () => {
  describe("Plot", () => {

    it("Plots default correctly", () => {
      var r = new Plottable.Plot();
      assert.isTrue(r.clipPathEnabled, "clipPathEnabled defaults to true");
    });

    it("Base Plot functionality works", () => {
      var svg = TestMethods.generateSVG(400, 300);
      var r = new Plottable.Plot();
      r.anchor(svg);
      r.computeLayout();
      var renderArea = (<any> r)._content.select(".render-area");
      assert.isNotNull(renderArea.node(), "there is a render-area");
      svg.remove();
    });

    it("Changes Dataset listeners when the Dataset is changed", () => {
      var dFoo = new Plottable.Dataset(["foo"], {cssClass: "bar"});
      var dBar = new Plottable.Dataset(["bar"], {cssClass: "boo"});
      var r = new CountingPlot();
      r.addDataset("foo", dFoo);

      assert.strictEqual(1, r.renders, "initial render due to addDataset");

      dFoo.broadcaster.broadcast();
      assert.strictEqual(2, r.renders, "we re-render when our dataset changes");

      r.addDataset("bar", dBar);
      assert.strictEqual(3, r.renders, "we should redraw when we add a dataset");

      dFoo.broadcaster.broadcast();
      assert.strictEqual(4, r.renders, "we should still listen to the first dataset");

      dBar.broadcaster.broadcast();
      assert.strictEqual(5, r.renders, "we should listen to the new dataset");

      r.removeDataset("foo");
      assert.strictEqual(6, r.renders, "we re-render on dataset removal");
      dFoo.broadcaster.broadcast();
      assert.strictEqual(6, r.renders, "we don't listen to removed datasets");

    });

    it("Updates its projectors when the Dataset is changed", () => {
      var d1 = new Plottable.Dataset([{x: 5, y: 6}], {cssClass: "bar"});
      var r = new Plottable.Plot();
      r.addDataset("d1", d1);

      var xScaleCalls: number = 0;
      var yScaleCalls: number = 0;
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      var metadataProjector = (d: any, i: number, m: any) => m.cssClass;
      r.project("x", "x", xScale);
      r.project("y", "y", yScale);
      r.project("meta", metadataProjector);
      xScale.broadcaster.registerListener("unitTest", (listenable: Plottable.Scales.Linear) => {
        assert.strictEqual(listenable, xScale, "Callback received the calling scale as the first argument");
        ++xScaleCalls;
      });
      yScale.broadcaster.registerListener("unitTest", (listenable: Plottable.Scales.Linear) => {
        assert.strictEqual(listenable, yScale, "Callback received the calling scale as the first argument");
        ++yScaleCalls;
      });

      assert.strictEqual(0, xScaleCalls, "initially hasn't made any X callbacks");
      assert.strictEqual(0, yScaleCalls, "initially hasn't made any Y callbacks");

      d1.broadcaster.broadcast();
      assert.strictEqual(1, xScaleCalls, "X scale was wired up to datasource correctly");
      assert.strictEqual(1, yScaleCalls, "Y scale was wired up to datasource correctly");

      var d2 = new Plottable.Dataset([{x: 7, y: 8}], {cssClass: "boo"});
      r.removeDataset("d1");
      r.addDataset(d2);
      assert.strictEqual(3, xScaleCalls, "Changing datasource fires X scale listeners (but doesn't coalesce callbacks)");
      assert.strictEqual(3, yScaleCalls, "Changing datasource fires Y scale listeners (but doesn't coalesce callbacks)");

      d1.broadcaster.broadcast();
      assert.strictEqual(3, xScaleCalls, "X scale was unhooked from old datasource");
      assert.strictEqual(3, yScaleCalls, "Y scale was unhooked from old datasource");

      d2.broadcaster.broadcast();
      assert.strictEqual(4, xScaleCalls, "X scale was hooked into new datasource");
      assert.strictEqual(4, yScaleCalls, "Y scale was hooked into new datasource");

    });

    it("Plot automatically generates a Dataset if only data is provided", () => {
      var data = ["foo", "bar"];
      var r = new Plottable.Plot().addDataset("foo", data);
      var dataset = r.datasets()[0];
      assert.isNotNull(dataset, "A Dataset was automatically generated");
      assert.deepEqual(dataset.data(), data, "The generated Dataset has the correct data");
    });

    it("Plot.project works as intended", () => {
      var r = new Plottable.Plot();
      var s = new Plottable.Scales.Linear().domain([0, 1]).range([0, 10]);
      r.project("attr", "a", s);
      var attrToProjector = (<any> r)._generateAttrToProjector();
      var projector = attrToProjector["attr"];
      assert.strictEqual(projector({"a": 0.5}, 0, null, null), 5, "projector works as intended");
    });

    it("Changing Plot.dataset().data to [] causes scale to contract", () => {
      var ds1 = new Plottable.Dataset([0, 1, 2]);
      var ds2 = new Plottable.Dataset([1, 2, 3]);
      var s = new Plottable.Scales.Linear();
      var svg1 = TestMethods.generateSVG(100, 100);
      var svg2 = TestMethods.generateSVG(100, 100);
      new Plottable.Plot()
        .addDataset(ds1)
        .project("x", (x: number) => x, s)
        .renderTo(svg1);
      new Plottable.Plot()
        .addDataset(ds2)
        .project("x", (x: number) => x, s)
        .renderTo(svg2);
      assert.deepEqual(s.domain(), [0, 3], "Simple domain combining");
      ds1.data([]);
      assert.deepEqual(s.domain(), [1, 3], "Contracting domain due to projection becoming empty");
      svg1.remove();
      svg2.remove();
    });

    it("getAllSelections() with dataset retrieval", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var plot = new Plottable.Plot();

      // Create mock drawers with already drawn items
      var mockDrawer1 = new Plottable.Drawers.AbstractDrawer("ds1");
      var renderArea1 = svg.append("g");
      renderArea1.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
      (<any> mockDrawer1).setup = () => (<any> mockDrawer1)._renderArea = renderArea1;
      (<any> mockDrawer1)._getSelector = () => "circle";

      var renderArea2 = svg.append("g");
      renderArea2.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 10);
      var mockDrawer2 = new Plottable.Drawers.AbstractDrawer("ds2");
      (<any> mockDrawer2).setup = () => (<any> mockDrawer2)._renderArea = renderArea2;
      (<any> mockDrawer2)._getSelector = () => "circle";

      // Mock _getDrawer to return the mock drawers
      (<any> plot)._getDrawer = (key: string) => {
        if (key === "ds1") {
          return mockDrawer1;
        } else {
          return mockDrawer2;
        }
      };

      plot.addDataset("ds1", [{value: 0}, {value: 1}, {value: 2}]);
      plot.addDataset("ds2", [{value: 1}, {value: 2}, {value: 3}]);
      plot.renderTo(svg);

      var selections = plot.getAllSelections();
      assert.strictEqual(selections.size(), 2, "all circle selections gotten");

      var oneSelection = plot.getAllSelections("ds1");
      assert.strictEqual(oneSelection.size(), 1);
      assert.strictEqual(TestMethods.numAttr(oneSelection, "cx"), 100, "retrieved selection in renderArea1");

      var oneElementSelection = plot.getAllSelections(["ds2"]);
      assert.strictEqual(oneElementSelection.size(), 1);
      assert.strictEqual(TestMethods.numAttr(oneElementSelection, "cy"), 10, "retreived selection in renderArea2");

      var nonExcludedSelection = plot.getAllSelections(["ds1"], true);
      assert.strictEqual(nonExcludedSelection.size(), 1);
      assert.strictEqual(TestMethods.numAttr(nonExcludedSelection, "cy"), 10, "retreived non-excluded selection in renderArea2");
      svg.remove();
    });

    it("getAllPlotData() with dataset retrieval", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var plot = new Plottable.Plot();

      var data1 = [{value: 0}, {value: 1}, {value: 2}];
      var data2 = [{value: 0}, {value: 1}, {value: 2}];

      var data1Points = data1.map((datum: any) => { return {x: datum.value, y: 100}; });
      var data2Points = data2.map((datum: any) => { return {x: datum.value, y: 10}; });

      var data1PointConverter = (datum: any, index: number) => data1Points[index];
      var data2PointConverter = (datum: any, index: number) => data2Points[index];

      // Create mock drawers with already drawn items
      var mockDrawer1 = new Plottable.Drawers.AbstractDrawer("ds1");
      var renderArea1 = svg.append("g");
      renderArea1.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
      (<any> mockDrawer1).setup = () => (<any> mockDrawer1)._renderArea = renderArea1;
      (<any> mockDrawer1)._getSelector = () => "circle";
      (<any> mockDrawer1)._getPixelPoint = data1PointConverter;

      var renderArea2 = svg.append("g");
      renderArea2.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 10);
      var mockDrawer2 = new Plottable.Drawers.AbstractDrawer("ds2");
      (<any> mockDrawer2).setup = () => (<any> mockDrawer2)._renderArea = renderArea2;
      (<any> mockDrawer2)._getSelector = () => "circle";
      (<any> mockDrawer2)._getPixelPoint = data2PointConverter;

      // Mock _getDrawer to return the mock drawers
      (<any> plot)._getDrawer = (key: string) => {
        if (key === "ds1") {
          return mockDrawer1;
        } else {
          return mockDrawer2;
        }
      };

      plot.addDataset("ds1", data1);
      plot.addDataset("ds2", data2);
      plot.renderTo(svg);

      var allPlotData = plot.getAllPlotData();
      assert.strictEqual(allPlotData.selection.size(), 2, "all circle selections gotten");
      assert.includeMembers(allPlotData.data, data1, "includes data1 members");
      assert.includeMembers(allPlotData.data, data2, "includes data2 members");
      assert.includeMembers(allPlotData.pixelPoints, data1.map(data1PointConverter), "includes data1 points");
      assert.includeMembers(allPlotData.pixelPoints, data2.map(data2PointConverter), "includes data2 points");

      var singlePlotData = plot.getAllPlotData("ds1");
      var oneSelection = singlePlotData.selection;
      assert.strictEqual(oneSelection.size(), 1);
      assert.strictEqual(TestMethods.numAttr(oneSelection, "cx"), 100, "retrieved selection in renderArea1");
      assert.includeMembers(singlePlotData.data, data1, "includes data1 members");
      assert.includeMembers(singlePlotData.pixelPoints, data1.map(data1PointConverter), "includes data1 points");

      var oneElementPlotData = plot.getAllPlotData(["ds2"]);
      var oneElementSelection = oneElementPlotData.selection;
      assert.strictEqual(oneElementSelection.size(), 1);
      assert.strictEqual(TestMethods.numAttr(oneElementSelection, "cy"), 10, "retreieved selection in renderArea2");
      assert.includeMembers(oneElementPlotData.data, data2, "includes data2 members");
      assert.includeMembers(oneElementPlotData.pixelPoints, data2.map(data2PointConverter), "includes data2 points");
      svg.remove();
    });

    it("getAllPlotData() with NaN pixel points", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var plot = new Plottable.Plot();

      var data = [{value: NaN}, {value: 1}, {value: 2}];

      var dataPoints = data.map((datum: any) => { return {x: datum.value, y: 10}; });

      var dataPointConverter = (datum: any, index: number) => dataPoints[index];

      // Create mock drawer with already drawn items
      var mockDrawer = new Plottable.Drawers.AbstractDrawer("ds");
      var renderArea = svg.append("g");
      var circles = renderArea.selectAll("circles").data(data);
      circles.enter().append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
      circles.exit().remove();
      (<any> mockDrawer).setup = () => (<any> mockDrawer)._renderArea = renderArea;
      (<any> mockDrawer)._getSelector = () => "circle";
      (<any> mockDrawer)._getPixelPoint = dataPointConverter;

      // Mock _getDrawer to return the mock drawer
      (<any> plot)._getDrawer = () => mockDrawer;

      plot.addDataset("ds", data);
      plot.renderTo(svg);

      var oneElementPlotData = plot.getAllPlotData();
      var oneElementSelection = oneElementPlotData.selection;
      assert.strictEqual(oneElementSelection.size(), 2, "finds all selections that do not have NaN pixelPoint");
      assert.lengthOf(oneElementPlotData.pixelPoints, 2, "returns pixelPoints except ones with NaN");
      assert.lengthOf(oneElementPlotData.data, 2, "finds data that do not have NaN pixelPoint");

      oneElementPlotData.pixelPoints.forEach((pixelPoint) => {
        assert.isNumber(pixelPoint.x, "pixelPoint X cannot be NaN");
        assert.isNumber(pixelPoint.y, "pixelPoint Y cannot be NaN");
      });
      svg.remove();
    });

    it("getClosestPlotData", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var plot = new Plottable.Plot();

      var data1 = [{value: 0}, {value: 1}, {value: 2}];
      var data2 = [{value: 0}, {value: 1}, {value: 2}];

      var data1Points = data1.map((datum: any) => { return {x: datum.value, y: 100}; });
      var data2Points = data2.map((datum: any) => { return {x: datum.value, y: 10}; });

      var data1PointConverter = (datum: any, index: number) => data1Points[index];
      var data2PointConverter = (datum: any, index: number) => data2Points[index];

      // Create mock drawers with already drawn items
      var mockDrawer1 = new Plottable.Drawers.AbstractDrawer("ds1");
      var renderArea1 = svg.append("g");
      renderArea1.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
      (<any> mockDrawer1).setup = () => (<any> mockDrawer1)._renderArea = renderArea1;
      (<any> mockDrawer1)._getSelector = () => "circle";
      (<any> mockDrawer1)._getPixelPoint = data1PointConverter;

      var renderArea2 = svg.append("g");
      renderArea2.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 10);
      var mockDrawer2 = new Plottable.Drawers.AbstractDrawer("ds2");
      (<any> mockDrawer2).setup = () => (<any> mockDrawer2)._renderArea = renderArea2;
      (<any> mockDrawer2)._getSelector = () => "circle";
      (<any> mockDrawer2)._getPixelPoint = data2PointConverter;

      // Mock _getDrawer to return the mock drawers
      (<any> plot)._getDrawer = (key: string) => {
        if (key === "ds1") {
          return mockDrawer1;
        } else {
          return mockDrawer2;
        }
      };

      plot.addDataset("ds1", data1);
      plot.addDataset("ds2", data2);
      plot.renderTo(svg);

      var queryPoint = {x: 1, y: 11};
      var closestPlotData = plot.getClosestPlotData(queryPoint);
      assert.deepEqual(closestPlotData.pixelPoints, [{x: 1, y: 10}], "retrieves the closest point across datasets");

      svg.remove();
    });

    describe("Dataset removal", () => {
      var plot: Plottable.Plot;
      var d1: Plottable.Dataset;
      var d2: Plottable.Dataset;

      beforeEach(() => {
        plot = new Plottable.Plot();
        d1 = new Plottable.Dataset();
        d2 = new Plottable.Dataset();
        plot.addDataset("foo", d1);
        plot.addDataset("bar", d2);
        assert.deepEqual(plot.datasets(), [d1, d2], "datasets as expected");
      });

      it("removeDataset can work on keys", () => {
        plot.removeDataset("bar");
        assert.deepEqual(plot.datasets(), [d1], "second dataset removed");
        plot.removeDataset("foo");
        assert.deepEqual(plot.datasets(), [], "all datasets removed");
      });

      it("removeDataset can work on datasets", () => {
        plot.removeDataset(d2);
        assert.deepEqual(plot.datasets(), [d1], "second dataset removed");
        plot.removeDataset(d1);
        assert.deepEqual(plot.datasets(), [], "all datasets removed");
      });

      it("removeDataset ignores inputs that do not correspond to a dataset", () => {
        var d3 = new Plottable.Dataset();
        plot.removeDataset(d3);
        plot.removeDataset("bad key");
        assert.deepEqual(plot.datasets(), [d1, d2], "datasets as expected");
      });

      it("removeDataset functions on inputs that are data arrays, not datasets", () => {
        var a1 = ["foo", "bar"];
        var a2 = [1, 2, 3];
        plot.addDataset(a1);
        plot.addDataset(a2);
        assert.lengthOf(plot.datasets(), 4, "there are four datasets");
        assert.strictEqual(plot.datasets()[3].data(), a2, "second array dataset correct");
        assert.strictEqual(plot.datasets()[2].data(), a1, "first array dataset correct");
        plot.removeDataset(a2);
        plot.removeDataset(a1);
        assert.deepEqual(plot.datasets(), [d1, d2], "datasets as expected");
      });

      it("removeDataset behaves appropriately when the key 'undefined' is used", () => {
        var a = [1, 2, 3];
        plot.addDataset("undefined", a);
        assert.lengthOf(plot.datasets(), 3, "there are three datasets initially");
        plot.removeDataset("foofoofoofoofoofoofoofoo");
        assert.lengthOf(plot.datasets(), 3, "there are three datasets after bad key removal");
        plot.removeDataset(undefined);
        assert.lengthOf(plot.datasets(), 3, "there are three datasets after removing `undefined`");
        plot.removeDataset([94, 93, 92]);
        assert.lengthOf(plot.datasets(), 3, "there are three datasets after removing random dataset");
        plot.removeDataset("undefined");
        assert.lengthOf(plot.datasets(), 2, "the dataset called 'undefined' could be removed");
      });
    });

    it("remove() disconnects plots from its scales", () => {
      var r = new Plottable.Plot();
      var s = new Plottable.Scales.Linear();
      r.project("attr", "a", s);
      r.remove();
      var key2callback = (<any> s).broadcaster._key2callback;
      assert.isUndefined(key2callback.get(r), "the plot is no longer attached to the scale");
    });

    it("extent registration works as intended", () => {
      var scale1 = new Plottable.Scales.Linear();
      var scale2 = new Plottable.Scales.Linear();

      var d1 = new Plottable.Dataset([1, 2, 3]);
      var d2 = new Plottable.Dataset([4, 99, 999]);
      var d3 = new Plottable.Dataset([-1, -2, -3]);

      var id = (d: number) => d;
      var plot1 = new Plottable.Plot();
      var plot2 = new Plottable.Plot();
      var svg = TestMethods.generateSVG(400, 400);
      plot1.attr("null", id, scale1);
      plot2.attr("null", id, scale1);
      plot1.renderTo(svg);
      plot2.renderTo(svg);

      function assertDomainIsClose(actualDomain: number[], expectedDomain: number[], msg: string) {
        // to avoid floating point issues:/
        assert.closeTo(actualDomain[0], expectedDomain[0], 0.01, msg);
        assert.closeTo(actualDomain[1], expectedDomain[1], 0.01, msg);
      }

      plot1.addDataset(d1);
      assertDomainIsClose(scale1.domain(), [1, 3], "scale includes plot1 projected data");

      plot2.addDataset(d2);
      assertDomainIsClose(scale1.domain(), [1, 999], "scale extent includes plot1 and plot2");

      plot2.addDataset(d3);
      assertDomainIsClose(scale1.domain(), [-3, 999], "extent widens further if we add more data to plot2");

      plot2.removeDataset(d3);
      assertDomainIsClose(scale1.domain(), [1, 999], "extent shrinks if we remove dataset");

      plot2.attr("null", id, scale2);
      assertDomainIsClose(scale1.domain(), [1, 3], "extent shrinks further if we project plot2 away");

      svg.remove();
    });

    it("additionalPaint timing works properly", () => {
      var animator = new Plottable.Animators.Base().delay(10).duration(10).maxIterativeDelay(0);
      var x = new Plottable.Scales.Linear();
      var y = new Plottable.Scales.Linear();
      var plot = new Plottable.Plots.Bar(x, y).addDataset([]).animate(true);
      var recordedTime: number = -1;
      var additionalPaint = (x: number) => {
        recordedTime = Math.max(x, recordedTime);
      };
      (<any> plot)._additionalPaint = additionalPaint;
      plot.animator("bars", animator);
      var svg = TestMethods.generateSVG();
      plot.project("x", "x", x);
      plot.project("y", "y", y);
      plot.renderTo(svg);
      assert.strictEqual(recordedTime, 20, "additionalPaint passed appropriate time argument");
      svg.remove();
    });

    it("extent calculation done in correct dataset order", () => {
      var categoryScale = new Plottable.Scales.Category();
      var dataset1 = [{key: "A"}];
      var dataset2 = [{key: "B"}];
      var plot = new Plottable.Plot()
                                   .addDataset("b", dataset2)
                                   .addDataset("a", dataset1);
      plot.project("key", "key", categoryScale);

      plot.datasetOrder(["a", "b"]);

      var svg = TestMethods.generateSVG();
      plot.renderTo(svg);

      assert.deepEqual(categoryScale.domain(), ["A", "B"], "extent is in the right order");
      svg.remove();
    });
  });

  describe("XY Plot", () => {
    var svg: D3.Selection;
    var xScale: Plottable.Scales.Linear;
    var yScale: Plottable.Scales.Linear;
    var xAccessor: any;
    var yAccessor: any;
    var simpleDataset: Plottable.Dataset;
    var plot: Plottable.XYPlot<number, number>;

    before(() => {
      xAccessor = (d: any, i: number, u: any) => d.a + u.foo;
      yAccessor = (d: any, i: number, u: any) => d.b + u.foo;
    });

    beforeEach(() => {
      svg = TestMethods.generateSVG(500, 500);
      simpleDataset = new Plottable.Dataset([{a: -5, b: 6}, {a: -2, b: 2}, {a: 2, b: -2}, {a: 5, b: -6}], {foo: 0});
      xScale = new Plottable.Scales.Linear();
      yScale = new Plottable.Scales.Linear();
      plot = new Plottable.XYPlot(xScale, yScale);
      plot.addDataset(simpleDataset)
          .project("x", xAccessor, xScale)
          .project("y", yAccessor, yScale)
          .renderTo(svg);
    });

    it("plot auto domain scale to visible points", () => {
      xScale.domain([-3, 3]);
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has not been adjusted to visible points");
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points");
      plot.automaticallyAdjustYScaleOverVisiblePoints(false);
      plot.automaticallyAdjustXScaleOverVisiblePoints(true);
      yScale.domain([-6, 6]);
      assert.deepEqual(xScale.domain(), [-6, 6], "domain has been adjusted to visible points");
      svg.remove();
    });

    it("no visible points", () => {
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      xScale.domain([-0.5, 0.5]);
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has been not been adjusted");
      svg.remove();
    });

    it("automaticallyAdjustYScaleOverVisiblePoints disables autoDomain", () => {
      xScale.domain([-2, 2]);
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      plot.renderTo(svg);
      assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been been adjusted");
      svg.remove();
    });

    it("show all data", () => {
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      xScale.domain([-0.5, 0.5]);
      plot.showAllData();
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      assert.deepEqual(xScale.domain(), [-6, 6], "domain has been adjusted to show all data");
      svg.remove();
    });

    it("show all data without auto adjust domain", () => {
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      xScale.domain([-0.5, 0.5]);
      plot.automaticallyAdjustYScaleOverVisiblePoints(false);
      plot.showAllData();
      assert.deepEqual(yScale.domain(), [-7, 7], "domain has been adjusted to show all data");
      assert.deepEqual(xScale.domain(), [-6, 6], "domain has been adjusted to show all data");
      svg.remove();
    });

    it("no cycle in auto domain on plot", () => {
      var zScale = new Plottable.Scales.Linear().domain([-10, 10]);
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      var plot2 = new Plottable.XYPlot(zScale, yScale)
                                    .automaticallyAdjustXScaleOverVisiblePoints(true)
                                    .project("x", xAccessor, zScale)
                                    .project("y", yAccessor, yScale)
                                    .addDataset(simpleDataset);
      var plot3 = new Plottable.XYPlot(zScale, xScale)
                                    .automaticallyAdjustYScaleOverVisiblePoints(true)
                                    .project("x", xAccessor, zScale)
                                    .project("y", yAccessor, xScale)
                                    .addDataset(simpleDataset);
      plot2.renderTo(svg);
      plot3.renderTo(svg);

      xScale.domain([-2, 2]);
      assert.deepEqual(yScale.domain(), [-2.5, 2.5], "y domain is adjusted by x domain using custom algorithm and domainer");
      assert.deepEqual(zScale.domain(), [-2.5, 2.5], "z domain is adjusted by y domain using custom algorithm and domainer");
      assert.deepEqual(xScale.domain(), [-2, 2],     "x domain is not adjusted using custom algorithm and domainer");

      svg.remove();
    });

    it("listeners are deregistered after removal", () => {
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      plot.remove();
      var key2callback = (<any> xScale).broadcaster._key2callback;
      assert.isUndefined(key2callback.get("yDomainAdjustment" + plot.getID()), "the plot is no longer attached to the xScale");
      key2callback = (<any> yScale).broadcaster._key2callback;
      assert.isUndefined(key2callback.get("xDomainAdjustment" + plot.getID()), "the plot is no longer attached to the yScale");
      svg.remove();
    });

    it("listeners are deregistered for changed scale", () => {
      plot.automaticallyAdjustYScaleOverVisiblePoints(true);
      var newScale = new Plottable.Scales.Linear().domain([-10, 10]);
      plot.project("x", xAccessor, newScale);
      xScale.domain([-2, 2]);
      assert.deepEqual(yScale.domain(), [-7, 7], "replaced xScale didn't adjust yScale");
      svg.remove();
    });

  });
});
