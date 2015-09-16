///<reference path="../testReference.ts" />

class CountingPlot extends Plottable.Plot {
  public renders: number = 0;

  public render() {
    ++this.renders;
    return super.render();
  }

  protected _createDrawer(dataset: Plottable.Dataset) {
    let drawer = new Plottable.Drawer(dataset);
    (<any> drawer)._svgElement = "g";
    return drawer;
  }
}

describe("Plots", () => {
  describe("Plot", () => {
    it("Plots default correctly", () => {
      let svg = TestMethods.generateSVG(400, 300);
      let r = new Plottable.Plot();
      (<any> r)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
      r.renderTo(svg);
      TestMethods.verifyClipPath(r);
      svg.remove();
    });

    it("Base Plot functionality works", () => {
      let svg = TestMethods.generateSVG(400, 300);
      let r = new Plottable.Plot();
      (<any> r)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
      r.anchor(svg);
      r.computeLayout();
      let renderArea = (<any> r)._content.select(".render-area");
      assert.isNotNull(renderArea.node(), "there is a render-area");
      svg.remove();
    });

    it("Changes Dataset listeners when the Dataset is changed", () => {
      let dFoo = new Plottable.Dataset(["foo"], {cssClass: "bar"});
      let dBar = new Plottable.Dataset(["bar"], {cssClass: "boo"});
      let r = new CountingPlot();
      r.addDataset(dFoo);

      assert.strictEqual(1, r.renders, "initial render due to addDataset");

      dFoo.data(dFoo.data());
      assert.strictEqual(2, r.renders, "we re-render when our dataset changes");

      r.addDataset(dBar);
      assert.strictEqual(3, r.renders, "we should redraw when we add a dataset");

      dFoo.data(dFoo.data());
      assert.strictEqual(4, r.renders, "we should still listen to the first dataset");

      dFoo.data(dFoo.data());
      assert.strictEqual(5, r.renders, "we should listen to the new dataset");

      r.removeDataset(dFoo);
      assert.strictEqual(6, r.renders, "we re-render on dataset removal");
      dFoo.data(dFoo.data());
      assert.strictEqual(6, r.renders, "we don't listen to removed datasets");
    });

    it("datasets()", () => {
      let dataset1 = new Plottable.Dataset([]);
      let dataset2 = new Plottable.Dataset([]);

      let plot = new Plottable.Plot();
      (<any> plot)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
      plot.addDataset(dataset1);
      plot.addDataset(dataset2);
      assert.deepEqual(plot.datasets(), [dataset1, dataset2], "retrieved Datasets in order they were added");

      plot.datasets([dataset2, dataset1]);
      assert.deepEqual(plot.datasets(), [dataset2, dataset1], "order of Datasets was changed");

      let dataset3 = new Plottable.Dataset([]);
      plot.addDataset(dataset3);
      assert.deepEqual(plot.datasets(), [dataset2, dataset1, dataset3], "adding further Datasets respects the order");

      plot.removeDataset(dataset1);
      assert.deepEqual(plot.datasets(), [dataset2, dataset3], "removing a Dataset leaves the remainder in the same order");

      plot.datasets([]);
      assert.deepEqual(plot.datasets(), [], "the datasets() call first removes all the datasets");
    });

    it("Updates its projectors when the Dataset is changed", () => {
      let d1 = new Plottable.Dataset([{x: 5, y: 6}], {cssClass: "bar"});
      let r = new Plottable.Plot();
      (<any> r)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
      r.addDataset(d1);

      let xScaleCalls: number = 0;
      let yScaleCalls: number = 0;
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      let metadataProjector = (d: any, i: number, m: any) => m.cssClass;
      r.attr("x", (d) => d.x, xScale);
      r.attr("y", (d) => d.y, yScale);
      r.attr("meta", metadataProjector);
      xScale.onUpdate((listenable: Plottable.Scales.Linear) => {
        assert.strictEqual(listenable, xScale, "Callback received the calling scale as the first argument");
        ++xScaleCalls;
      });
      yScale.onUpdate((listenable: Plottable.Scales.Linear) => {
        assert.strictEqual(listenable, yScale, "Callback received the calling scale as the first argument");
        ++yScaleCalls;
      });

      assert.strictEqual(0, xScaleCalls, "initially hasn't made any X callbacks");
      assert.strictEqual(0, yScaleCalls, "initially hasn't made any Y callbacks");

      d1.data(d1.data());
      assert.strictEqual(1, xScaleCalls, "X scale was wired up to datasource correctly");
      assert.strictEqual(1, yScaleCalls, "Y scale was wired up to datasource correctly");

      let d2 = new Plottable.Dataset([{x: 7, y: 8}], {cssClass: "boo"});
      r.removeDataset(d1);
      r.addDataset(d2);
      assert.strictEqual(3, xScaleCalls, "Changing datasource fires X scale listeners (but doesn't coalesce callbacks)");
      assert.strictEqual(3, yScaleCalls, "Changing datasource fires Y scale listeners (but doesn't coalesce callbacks)");

      d1.data(d1.data());
      assert.strictEqual(3, xScaleCalls, "X scale was unhooked from old datasource");
      assert.strictEqual(3, yScaleCalls, "Y scale was unhooked from old datasource");

      d2.data(d2.data());
      assert.strictEqual(4, xScaleCalls, "X scale was hooked into new datasource");
      assert.strictEqual(4, yScaleCalls, "Y scale was hooked into new datasource");

    });

    it("sets the domain automatically when attaching a Scale to an attr", () => {
      let xMin = 5;
      let xMax = 10;
      let dataset = new Plottable.Dataset([{x: xMin}, {x: xMax}]);
      let plot = new Plottable.Plot();
      let svg = TestMethods.generateSVG();
      (<any> plot)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
      plot.addDataset(dataset);

      let scale = new Plottable.Scales.Linear().padProportion(0).snappingDomainEnabled(false);

      plot.attr("x", (d) => d.x);
      plot.attr("y", (d) => 1);
      plot.renderTo(svg);

      plot.attr("x", (d) => d.x, scale);
      assert.deepEqual(scale.domain(), [xMin, xMax], "scale domain scale is auto updated");
      svg.remove();
    });

    it("Plot.project works as intended", () => {
      let r = new Plottable.Plot();
      (<any> r)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
      let s = new Plottable.Scales.Linear().domain([0, 1]).range([0, 10]);
      r.attr("attr", (d) => d.a, s);
      let attrToProjector = (<any> r)._generateAttrToProjector();
      let projector = attrToProjector["attr"];
      assert.strictEqual(projector({"a": 0.5}, 0, null, null), 5, "projector works as intended");
    });

    it("Changing Plot.dataset().data to [] causes scale to contract", () => {
      let ds1 = new Plottable.Dataset([0, 1, 2]);
      let ds2 = new Plottable.Dataset([1, 2, 3]);
      let s = new Plottable.Scales.Linear().padProportion(0);
      let svg1 = TestMethods.generateSVG(100, 100);
      let svg2 = TestMethods.generateSVG(100, 100);
      let plot1 = new Plottable.Plot();
      (<any> plot1)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
      plot1.addDataset(ds1)
           .attr("x", (x: number) => x, s)
           .renderTo(svg1);
      let plot2 = new Plottable.Plot();
      (<any> plot2)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
      plot2.addDataset(ds2)
           .attr("x", (x: number) => x, s)
           .renderTo(svg2);
      assert.deepEqual(s.domain(), [0, 3], "Simple domain combining");
      ds1.data([]);
      assert.deepEqual(s.domain(), [1, 3], "Contracting domain due to projection becoming empty");
      svg1.remove();
      svg2.remove();
    });

    it("selections() with dataset retrieval", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let plot = new Plottable.Plot();

      let dataset1 = new Plottable.Dataset([{value: 0}, {value: 1}, {value: 2}]);
      let dataset2 = new Plottable.Dataset([{value: 1}, {value: 2}, {value: 3}]);

      // Create mock drawers with functioning selector()
      let mockDrawer1 = new Plottable.Drawer(dataset1);
      (<any> mockDrawer1)._svgElementName = "circle";
      mockDrawer1.selector = () => "circle";

      let mockDrawer2 = new Plottable.Drawer(dataset2);
      (<any> mockDrawer2)._svgElementName = "circle";
      mockDrawer2.selector = () => "circle";

      // Mock _createDrawer to return the mock drawers
      (<any> plot)._createDrawer = (dataset: Plottable.Dataset) => {
        if (dataset === dataset1) {
          return mockDrawer1;
        } else {
          return mockDrawer2;
        }
      };

      plot.addDataset(dataset1);
      plot.addDataset(dataset2);
      plot.renderTo(svg);

      // mock drawn items and replace the renderArea on the mock Drawers
      let renderArea1 = svg.append("g");
      renderArea1.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
      mockDrawer1.renderArea(renderArea1);
      let renderArea2 = svg.append("g");
      renderArea2.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 10);
      mockDrawer2.renderArea(renderArea2);

      let selections = plot.selections();
      assert.strictEqual(selections.size(), 2, "all circle selections gotten");

      let oneSelection = plot.selections([dataset1]);
      assert.strictEqual(oneSelection.size(), 1);
      assert.strictEqual(TestMethods.numAttr(oneSelection, "cx"), 100, "retrieved selection in renderArea1");

      let oneElementSelection = plot.selections([dataset2]);
      assert.strictEqual(oneElementSelection.size(), 1);
      assert.strictEqual(TestMethods.numAttr(oneElementSelection, "cy"), 10, "retreived selection in renderArea2");
      svg.remove();
    });

    it("entities() with dataset retrieval", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let plot = new Plottable.Plot();

      let data1 = [{value: 0}, {value: 1}, {value: 2}];
      let data2 = [{value: 0}, {value: 1}, {value: 2}];
      let dataset1 = new Plottable.Dataset(data1);
      let dataset2 = new Plottable.Dataset(data2);

      let data1Points = data1.map((datum: any) => { return {x: datum.value, y: 100}; });
      let data2Points = data2.map((datum: any) => { return {x: datum.value, y: 10}; });

      let data1PointConverter = (datum: any, index: number) => data1Points[index];
      let data2PointConverter = (datum: any, index: number) => data2Points[index];

      // Create mock drawers with functioning selector()
      let mockDrawer1 = new Plottable.Drawer(dataset1);
      (<any> mockDrawer1)._svgElementName = "circle";
      mockDrawer1.selector = () => "circle";
      let mockDrawer2 = new Plottable.Drawer(dataset2);
      (<any> mockDrawer2)._svgElementName = "circle";
      mockDrawer2.selector = () => "circle";

      // Mock _createDrawer to return the mock drawers
      (<any> plot)._createDrawer = (dataset: Plottable.Dataset) => {
        if (dataset === dataset1) {
          return mockDrawer1;
        } else {
          return mockDrawer2;
        }
      };

      plot.addDataset(dataset1);
      plot.addDataset(dataset2);

      (<any> plot)._pixelPoint = (datum: any, index: number, dataset: Plottable.Dataset) => {
        if (dataset === dataset1) {
          return data1PointConverter(datum, index);
        } else {
          return data2PointConverter(datum, index);
        }
      };

      plot.renderTo(svg);

      // mock drawn items and replace the renderArea on the mock Drawers
      let renderArea1 = svg.append("g");
      let renderArea1Selection = renderArea1.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
      mockDrawer1.renderArea(renderArea1);
      let renderArea2 = svg.append("g");
      let renderArea2Selection = renderArea2.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 10);
      mockDrawer2.renderArea(renderArea2);

      let entities = plot.entities();
      assert.lengthOf(entities, data1.length + data2.length, "retrieved one Entity for each value on the Plot");
      let entityData = entities.map((entity) => entity.datum);
      assert.includeMembers(entityData, data1, "includes data1 members");
      assert.includeMembers(entityData, data2, "includes data2 members");
      let entityPositions = entities.map((entity) => entity.position);
      assert.includeMembers(entityPositions, data1.map(data1PointConverter), "includes data1 points");
      assert.includeMembers(entityPositions, data2.map(data2PointConverter), "includes data2 points");

      entities = plot.entities([dataset1]);
      assert.lengthOf(entities, data1.length, "retrieved one Entity for each value in dataset1");
      assert.strictEqual(entities[0].selection.node(), renderArea1Selection.node(), "returns the selection associated with dataset1");
      assert.includeMembers(entities.map((entity) => entity.datum), data1, "includes data1 members");
      assert.includeMembers(entities.map((entity) => entity.position), data1.map(data1PointConverter), "includes data1 points");

      entities = plot.entities([dataset2]);
      assert.lengthOf(entities, data2.length, "retrieved one Entity for each value in dataset2");
      assert.strictEqual(entities[0].selection.node(), renderArea2Selection.node(), "returns the selection associated with dataset1");
      assert.includeMembers(entities.map((entity) => entity.datum), data2, "includes data1 members");
      assert.includeMembers(entities.map((entity) => entity.position), data2.map(data2PointConverter), "includes data2 points");
      svg.remove();
    });

    it("entities() with NaN values", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let plot = new Plottable.Plot();

      let data = [{value: NaN}, {value: 1}, {value: 2}];
      let dataset = new Plottable.Dataset(data);

      let dataPoints = data.map((datum: any) => { return {x: datum.value, y: 10}; });

      let dataPointConverter = (datum: any, index: number) => dataPoints[index];

      // Create mock drawer with already drawn items
      let mockDrawer = new Plottable.Drawer(dataset);
      (<any> mockDrawer)._svgElementName = "circle";
      mockDrawer.selector = () => "circle";

      (<any> plot)._pixelPoint = (datum: any, index: number, dataset: Plottable.Dataset) => {
        return dataPointConverter(datum, index);
      };

      // Mock _createDrawer to return the mock drawer
      (<any> plot)._createDrawer = () => mockDrawer;

      plot.addDataset(dataset);
      plot.renderTo(svg);

      // replace the renderArea with our own
      let renderArea = svg.append("g");
      let dataToPlot = data.filter((datum) => Plottable.Utils.Math.isValidNumber(datum.value));
      let circles = renderArea.selectAll("circles").data(dataToPlot);
      circles.enter().append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
      circles.exit().remove();
      mockDrawer.renderArea(renderArea);

      let entities = plot.entities();
      assert.lengthOf(entities, 2, "returns Entities for all valid data values");

      entities.forEach((entity, loopIndex) => {
        assert.strictEqual(entity.datum, data[entity.index], "entity carries the correct data");
        // use loopIndex because there is no entity for the invalid datum
        assert.strictEqual(circles[0][loopIndex], entity.selection.node(), "entity's selection is correct");
        assert.isNumber(entity.position.x, "position X cannot be NaN");
        assert.isNumber(entity.position.y, "position Y cannot be NaN");
      });
      svg.remove();
    });

    it("entityNearest()", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let plot = new Plottable.Plot();

      let data1 = [{value: 0}, {value: 1}, {value: 2}];
      let data2 = [{value: 0}, {value: 1}, {value: 2}];
      let dataset1 = new Plottable.Dataset(data1);
      let dataset2 = new Plottable.Dataset(data2);

      let data1Points = data1.map((datum: any) => { return {x: datum.value, y: 100}; });
      let data2Points = data2.map((datum: any) => { return {x: datum.value, y: 10}; });

      let data1PointConverter = (datum: any, index: number) => data1Points[index];
      let data2PointConverter = (datum: any, index: number) => data2Points[index];

      // Create mock drawers with already drawn items
      let mockDrawer1 = new Plottable.Drawer(dataset1);
      let renderArea1 = svg.append("g");
      renderArea1.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
      (<any> mockDrawer1).setup = () => (<any> mockDrawer1)._renderArea = renderArea1;
      (<any> mockDrawer1)._svgElementName = "circle";
     mockDrawer1.selector = () => "circle";

      let renderArea2 = svg.append("g");
      renderArea2.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 10);
      let mockDrawer2 = new Plottable.Drawer(dataset2);
      (<any> mockDrawer2).setup = () => (<any> mockDrawer2)._renderArea = renderArea2;
      (<any> mockDrawer2)._svgElementName = "circle";
      mockDrawer2.selector = () => "circle";

      // Mock _createDrawer to return the mock drawers
      (<any> plot)._createDrawer = (dataset: Plottable.Dataset) => {
        if (dataset === dataset1) {
          return mockDrawer1;
        } else {
          return mockDrawer2;
        }
      };

      plot.addDataset(dataset1);
      plot.addDataset(dataset2);

      (<any> plot)._pixelPoint = (datum: any, index: number, dataset: Plottable.Dataset) => {
        if (dataset === dataset1) {
          return data1PointConverter(datum, index);
        } else {
          return data2PointConverter(datum, index);
        }
      };
      plot.renderTo(svg);

      let queryPoint = {x: 1, y: 11};
      let nearestEntity = plot.entityNearest(queryPoint);
      assert.deepEqual(nearestEntity.position, {x: 1, y: 10}, "retrieves the closest point across datasets");

      svg.remove();
    });

    describe("Dataset removal", () => {
      let plot: Plottable.Plot;
      let d1: Plottable.Dataset;
      let d2: Plottable.Dataset;

      beforeEach(() => {
        plot = new Plottable.Plot();
        d1 = new Plottable.Dataset();
        d2 = new Plottable.Dataset();
        plot.addDataset(d1);
        plot.addDataset(d2);
        assert.deepEqual(plot.datasets(), [d1, d2], "datasets as expected");
      });

      it("removeDataset()", () => {
        plot.removeDataset(d2);
        assert.deepEqual(plot.datasets(), [d1], "second dataset removed");
        plot.removeDataset(d1);
        assert.deepEqual(plot.datasets(), [], "all datasets removed");
      });

      it("removeDataset ignores Datasets not in the Plot", () => {
        let d3 = new Plottable.Dataset();
        plot.removeDataset(d3);
        assert.deepEqual(plot.datasets(), [d1, d2], "datasets as expected");
      });
    });

    it("destroy() disconnects plots from its scales", () => {
      let plot2 = new Plottable.Plot();
      let scale = new Plottable.Scales.Linear();
      plot2.attr("attr", (d) => d.a, scale);
      plot2.destroy();
      assert.strictEqual((<any> scale)._callbacks.size, 0, "the plot is no longer attached to the scale");
    });

    it("extent registration works as intended", () => {
      let scale1 = new Plottable.Scales.Linear().padProportion(0);
      let scale2 = new Plottable.Scales.Linear().padProportion(0);

      let d1 = new Plottable.Dataset([1, 2, 3]);
      let d2 = new Plottable.Dataset([4, 99, 999]);
      let d3 = new Plottable.Dataset([-1, -2, -3]);

      let id = (d: number) => d;
      let plot1 = new Plottable.Plot();
      let plot2 = new Plottable.Plot();
      let svg = TestMethods.generateSVG(400, 400);
      (<any> plot1)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
      (<any> plot2)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
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
      let animator = new Plottable.Animators.Easing()
        .startDelay(10)
        .stepDuration(10)
        .stepDelay(0);
      let x = new Plottable.Scales.Linear();
      let y = new Plottable.Scales.Linear();
      let plot = new Plottable.Plots.Bar();
      plot.addDataset(new Plottable.Dataset([])).animated(true);
      let recordedTime = -1;
      let additionalPaint = (x: number) => {
        recordedTime = Math.max(x, recordedTime);
      };
      (<any> plot)._additionalPaint = additionalPaint;
      plot.animator(Plottable.Plots.Animator.MAIN, animator);
      let svg = TestMethods.generateSVG();
      plot.x((d: any) => d.x, x);
      plot.y((d: any) => d.y, y);
      plot.renderTo(svg);
      assert.strictEqual(recordedTime, 20, "additionalPaint passed appropriate time argument");
      svg.remove();
    });

    it("extent calculation done in correct dataset order", () => {
      let categoryScale = new Plottable.Scales.Category();
      let dataset1 = new Plottable.Dataset([{key: "A"}]);
      let dataset2 = new Plottable.Dataset([{key: "B"}]);
      let plot = new Plottable.Plot();
      (<any> plot)._createDrawer = (dataset: Plottable.Dataset) => createMockDrawer(dataset);
      plot.addDataset(dataset2);
      plot.addDataset(dataset1);
      plot.attr("key", (d) => d.key, categoryScale);

      let svg = TestMethods.generateSVG();
      plot.renderTo(svg);

      assert.deepEqual(categoryScale.domain(), ["B", "A"], "extent is in the right order");
      svg.remove();
    });

    it("animated() getter", () => {
      let plot = new Plottable.Plot();
      assert.strictEqual(plot.animated(), false, "by default the plot is not animated");
      assert.strictEqual(plot.animated(true), plot, "toggling animation returns the plot");
      assert.strictEqual(plot.animated(), true, "animated toggled on");
      plot.animated(false);
      assert.strictEqual(plot.animated(), false, "animated toggled off");
    });
  });
});
