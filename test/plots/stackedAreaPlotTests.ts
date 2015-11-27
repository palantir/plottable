///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("StackedAreaPlot", () => {
    describe("setting the x property", () => {
      let svg: d3.Selection<void>;
      let stackedAreaPlot: Plottable.Plots.StackedArea<number>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        let data1 = [
          {x: 1},
          {x: 3}
        ];
        let dataset1 = new Plottable.Dataset(data1);
        dataset1.metadata({ bar: 7 });
        let data2 = [
          {x: 1},
          {x: 3}
        ];
        let dataset2 = new Plottable.Dataset(data2);
        dataset2.metadata({ bar: 10 });
        stackedAreaPlot = new Plottable.Plots.StackedArea<number>();
        stackedAreaPlot.addDataset(dataset1);
        stackedAreaPlot.addDataset(dataset2);
        stackedAreaPlot.y(0, new Plottable.Scales.Linear());
      });

      it("can set the x property accessor to a constant value", () => {
        let constantValue = 10;
        assert.strictEqual(stackedAreaPlot.x(constantValue), stackedAreaPlot, "setter returns calling object");
        stackedAreaPlot.renderTo(svg);

        let stackedAreas = stackedAreaPlot.content().selectAll("path");
        assert.strictEqual(stackedAreas.size(),
          stackedAreaPlot.datasets().length, "same number of area selections as datasets");

        stackedAreas.each(function(data, i) {
          let stackedAreaSelection = d3.select(this);
          let areaVertices = TestMethods.areaVertices(stackedAreaSelection);
          let areaXs = areaVertices.map((areaVertex) => areaVertex.x).slice(0, -2);
          data.forEach((datum: any, index: number) => {
            assert.closeTo(areaXs[index], constantValue, window.Pixel_CloseTo_Requirement, `x pixel value at index ${i} correctly set`);
          });
          let areaEdgeXs = areaVertices.map((areaVertex) => areaVertex.x).slice(-2).reverse();
          assert.closeTo(areaEdgeXs[0], constantValue, window.Pixel_CloseTo_Requirement, "left edge x pixel value correctly set");
          assert.closeTo(areaEdgeXs[1], constantValue, window.Pixel_CloseTo_Requirement, "right edge x pixel value correctly set");
        });
        stackedAreaPlot.destroy();
        svg.remove();
      });

      it("can set the x property accessor to be dependent on the input data", () => {
        let accessor = (d: {x: number}, i: number, ds: Plottable.Dataset) => d.x * 100 + i * 10 + ds.metadata().bar;
        assert.strictEqual(stackedAreaPlot.x(accessor), stackedAreaPlot, "setter returns calling object");
        assert.strictEqual(stackedAreaPlot.x().accessor, accessor, `property set for datum`);
        stackedAreaPlot.renderTo(svg);

        let stackedAreas = stackedAreaPlot.content().selectAll("path");
        assert.strictEqual(stackedAreas.size(),
          stackedAreaPlot.datasets().length, "same number of area selections as datasets");

        stackedAreas.each(function(data, i) {
          let stackedAreaSelection = d3.select(this);
          let areaVertices = TestMethods.areaVertices(stackedAreaSelection);
          let areaXs = areaVertices.map((areaVertex) => areaVertex.x).slice(0, -2);
          data.forEach((datum: any, datumIndex: number) => {
            let x = accessor(datum, datumIndex, stackedAreaPlot.datasets()[i]);
            assert.closeTo(areaXs[datumIndex], x, window.Pixel_CloseTo_Requirement, `x pixel value at index ${i} correctly set`);
          });
          let areaEdgeXs = areaVertices.map((areaVertex) => areaVertex.x).slice(-2).reverse();
          assert.closeTo(areaEdgeXs[0], accessor(data[0], 0, stackedAreaPlot.datasets()[i]),
            window.Pixel_CloseTo_Requirement, "left edge x pixel value correctly set");
          assert.closeTo(areaEdgeXs[1], accessor(data[data.length - 1], data.length - 1, stackedAreaPlot.datasets()[i]),
            window.Pixel_CloseTo_Requirement, "right edge x pixel value correctly set");
        });
        stackedAreaPlot.destroy();
        svg.remove();
      });

      it("can set the x property scale", () => {
        let accessor = (d: {x: number}) => d.x;
        let linearScale = new Plottable.Scales.Linear();
        assert.strictEqual(stackedAreaPlot.x(accessor, linearScale), stackedAreaPlot, "setter returns calling object");
        assert.strictEqual(stackedAreaPlot.x().accessor, accessor, `property set for datum`);
        stackedAreaPlot.renderTo(svg);

        let stackedAreas = stackedAreaPlot.content().selectAll("path");
        assert.strictEqual(stackedAreas.size(),
          stackedAreaPlot.datasets().length, "same number of area selections as datasets");

        stackedAreas.each(function(data, i) {
          let stackedAreaSelection = d3.select(this);
          let areaVertices = TestMethods.areaVertices(stackedAreaSelection);
          let areaXs = areaVertices.map((areaVertex) => areaVertex.x).slice(0, -2);
          data.forEach((datum: any, index: number) => {
            let x = linearScale.scale(accessor(datum));
            assert.closeTo(areaXs[index], x, window.Pixel_CloseTo_Requirement, `x pixel value at index ${i} correctly set`);
          });
          let areaEdgeXs = areaVertices.map((areaVertex) => areaVertex.x).slice(-2).reverse();
          assert.closeTo(areaEdgeXs[0], linearScale.scale(accessor(data[0])),
            window.Pixel_CloseTo_Requirement, "left edge x pixel value correctly set");
          assert.closeTo(areaEdgeXs[1], linearScale.scale(accessor(data[data.length - 1])),
            window.Pixel_CloseTo_Requirement, "right edge x pixel value correctly set");
        });
        stackedAreaPlot.destroy();
        svg.remove();
      });
    });

    describe("setting the y property", () => {
      let svg: d3.Selection<void>;
      let stackedAreaPlot: Plottable.Plots.StackedArea<number>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        let data1 = [
          {y: 1},
          {y: 3}
        ];
        let dataset1 = new Plottable.Dataset(data1);
        dataset1.metadata({ bar: 7 });
        let data2 = [
          {y: 5},
          {y: 3}
        ];
        let dataset2 = new Plottable.Dataset(data2);
        dataset2.metadata({ bar: 10 });
        stackedAreaPlot = new Plottable.Plots.StackedArea<number>();
        stackedAreaPlot.addDataset(dataset1);
        stackedAreaPlot.addDataset(dataset2);
        stackedAreaPlot.x((d, i) => i);
      });

      function calculateStackedYs(yAccessor: Plottable.Accessor<number>) {
        let stackedYDataArray: number[][] = [];
        stackedAreaPlot.datasets().forEach((dataset, datasetIndex, datasets) => {
          let stackedYData = dataset.data().map((d, i) => yAccessor(d, i, dataset));
          if (datasetIndex === 0) {
            stackedYDataArray[datasetIndex] = stackedYData;
            return;
          }
          stackedYDataArray[datasetIndex] = dataset.data().map((d, i) => {
            return yAccessor(d, i, dataset) + stackedYDataArray[datasetIndex - 1][i];
          });
        });
        return stackedYDataArray;
      }

      it("can set to a constant value", () => {
        let constantValue = 10;
        assert.strictEqual(stackedAreaPlot.y(constantValue), stackedAreaPlot, "setter returns calling object");
        stackedAreaPlot.destroy();
        svg.remove();
      });

      it("can set to be dependent on the input data", () => {
        let accessor = (d: {y: number}, i: number, ds: Plottable.Dataset) => d.y * 100 + i * 10 + ds.metadata().bar;
        assert.strictEqual(stackedAreaPlot.y(accessor), stackedAreaPlot, "setter returns calling object");
        assert.strictEqual(stackedAreaPlot.y().accessor, accessor, "accessor set");
        stackedAreaPlot.destroy();
        svg.remove();
      });

      it("can set the property scale", () => {
        let accessor = (d: {y: number}) => d.y;
        let linearScale = new Plottable.Scales.Linear();
        assert.strictEqual(stackedAreaPlot.y(accessor, linearScale), stackedAreaPlot, "setter returns calling object");
        assert.strictEqual(stackedAreaPlot.y().accessor, accessor, "accessor set");
        stackedAreaPlot.renderTo(svg);

        let stackedAreas = stackedAreaPlot.content().selectAll("path");
        assert.strictEqual(stackedAreas.size(),
          stackedAreaPlot.datasets().length, "same number of area selections as datasets");

        let stackedYs = calculateStackedYs(accessor);
        stackedAreas.each(function(data, i) {
          let stackedAreaSelection = d3.select(this);
          let areaVertices = TestMethods.areaVertices(stackedAreaSelection);
          let areaYs = areaVertices.map((areaVertex) => areaVertex.y).slice(0, -2);
          data.forEach((datum: any, datumIndex: number) => {
            let y = linearScale.scale(stackedYs[i][datumIndex]);
            assert.closeTo(areaYs[datumIndex], y, window.Pixel_CloseTo_Requirement, `y pixel value at index ${i} correctly set`);
          });
          let areaEdgeYs = areaVertices.map((areaVertex) => areaVertex.y).slice(-2).reverse();
          if (i === 0) {
            assert.closeTo(areaEdgeYs[0], linearScale.scale(0),
              window.Pixel_CloseTo_Requirement, "left edge y pixel value correctly set");
            assert.closeTo(areaEdgeYs[1], linearScale.scale(0),
              window.Pixel_CloseTo_Requirement, "right edge y pixel value correctly set");
          } else {
            assert.closeTo(areaEdgeYs[0], linearScale.scale(stackedYs[i - 1][0]),
              window.Pixel_CloseTo_Requirement, "left edge y pixel value correctly set");
            assert.closeTo(areaEdgeYs[1], linearScale.scale(stackedYs[i - 1][data.length - 1]),
              window.Pixel_CloseTo_Requirement, "right edge y pixel value correctly set");
          }

        });
        stackedAreaPlot.destroy();
        svg.remove();
      });
    });

    describe("setting the y0 property", () => {
      let stackedAreaPlot: Plottable.Plots.StackedArea<number>;

      beforeEach(() => {
        let data1 = [
          {foo: 1},
          {foo: 3}
        ];
        let dataset1 = new Plottable.Dataset(data1);
        dataset1.metadata({ bar: 7 });
        let data2 = [
          {foo: 1},
          {foo: 3}
        ];
        let dataset2 = new Plottable.Dataset(data2);
        dataset2.metadata({ bar: 10 });
        stackedAreaPlot = new Plottable.Plots.StackedArea<number>();
        stackedAreaPlot.addDataset(dataset1);
        stackedAreaPlot.addDataset(dataset2);
        stackedAreaPlot.x((d, i) => i);
        stackedAreaPlot.y((d, i) => i);
      });

      it("defaults to the 0 constant value", () => {
        assert.strictEqual(stackedAreaPlot.y0().accessor(null, 0, null), 0, "property set to 0");
        stackedAreaPlot.destroy();
      });

      it("can set the y0 property accessor to a constant value", () => {
        let constantValue = 10;
        stackedAreaPlot.y0(constantValue);
        assert.strictEqual(stackedAreaPlot.y0().accessor(null, 0, null), constantValue, "property set to constant value");
        stackedAreaPlot.destroy();
      });

      it("can set the y0 property accessor to be dependent on the input data", () => {
        let accessor = (d: {foo: number}, i: number, ds: Plottable.Dataset) => d.foo * 100 + i * 10 + ds.metadata().bar;
        stackedAreaPlot.y0(accessor);
        assert.strictEqual(stackedAreaPlot.y0().accessor, accessor, `property set for datum`);
        stackedAreaPlot.destroy();
      });
    });

    describe("rendering on edge case scenarios", () => {
      it("renders nothing when no data", () => {
        let svg = TestMethods.generateSVG();
        let stackedAreaPlot = new Plottable.Plots.StackedArea();
        stackedAreaPlot.x(() => null);
        // HACKHACK https://github.com/palantir/plottable/issues/2712 y scale must be set.
        stackedAreaPlot.y(() => null, new Plottable.Scales.Linear());
        stackedAreaPlot.renderTo(svg);
        assert.strictEqual(stackedAreaPlot.selections().size(), 0, "no areas rendered");
        stackedAreaPlot.destroy();
        svg.remove();
      });

      it("coerces strings to numbers for calculating offsets", () => {
        let svg = TestMethods.generateSVG();
        let data0 = [
          { x: 2, y: "2" },
          { x: 3, y: 2 }
        ];
        let data1 = [
          { x: 2, y: "0" },
          { x: 3, y: "2" }
        ];
        let data2 = [
          { x: 2, y: 2 },
          { x: 3, y: 2 }
        ];
        let xScale = new Plottable.Scales.Linear();
        let yScale = new Plottable.Scales.Linear();

        let plot = new Plottable.Plots.StackedArea<number>();
        let dataset0 = new Plottable.Dataset(data0);
        plot.addDataset(dataset0);
        let dataset1 = new Plottable.Dataset(data1);
        plot.addDataset(dataset1);
        let dataset2 = new Plottable.Dataset(data2);
        plot.addDataset(dataset2);
        plot.x((d: any) => d.x, xScale).y((d: any) => d.y, yScale);
        plot.renderTo(svg);

        let stackedAreaSelections = plot.content().selectAll("path");
        let stackedAreaSelection0 = d3.select(stackedAreaSelections[0][0]);
        let stackedAreaSelection1 = d3.select(stackedAreaSelections[0][1]);
        let stackedAreaSelection2 = d3.select(stackedAreaSelections[0][2]);

        let areaVertices0 = TestMethods.areaVertices(stackedAreaSelection0);
        let areaYs0 = areaVertices0.map((areaVertex) => areaVertex.y).slice(0, -2);
        let areaVertices1 = TestMethods.areaVertices(stackedAreaSelection1);
        let areaYs1 = areaVertices1.map((areaVertex) => areaVertex.y).slice(0, -2);
        let areaVertices2 = TestMethods.areaVertices(stackedAreaSelection2);
        let areaYs2 = areaVertices2.map((areaVertex) => areaVertex.y).slice(0, -2);

        assert.closeTo(areaYs0[0], yScale.scale(<any> data0[0].y), window.Pixel_CloseTo_Requirement,
          "dataset0 should have no offset");
        assert.closeTo(areaYs1[0], yScale.scale(<any> data0[0].y), window.Pixel_CloseTo_Requirement,
          "dataset1 should be offset with previous datasets");
        assert.closeTo(areaYs2[0], yScale.scale(data2[0].y + parseFloat(<any> data1[0].y) + parseFloat(<any> data0[0].y)),
          window.Pixel_CloseTo_Requirement, "dataset2 should be offset with previous datasets");
        plot.destroy();
        svg.remove();
      });

      it("coerces null to 0 for calculating offsets", () => {
        let svg = TestMethods.generateSVG();
        let data0 = [
          { x: 2, y: 2 },
          { x: 3, y: 2 }
        ];
        let data1 = [
          { x: 2, y: null },
          { x: 3, y: 2 }
        ];
        let data2 = [
          { x: 2, y: 2 },
          { x: 3, y: 2 }
        ];
        let xScale = new Plottable.Scales.Linear();
        let yScale = new Plottable.Scales.Linear();

        let plot = new Plottable.Plots.StackedArea<number>();
        let dataset0 = new Plottable.Dataset(data0);
        plot.addDataset(dataset0);
        let dataset1 = new Plottable.Dataset(data1);
        plot.addDataset(dataset1);
        let dataset2 = new Plottable.Dataset(data2);
        plot.addDataset(dataset2);
        plot.x((d: any) => d.x, xScale).y((d: any) => d.y, yScale);
        plot.renderTo(svg);

        let stackedAreaSelections = plot.content().selectAll("path");
        let stackedAreaSelection0 = d3.select(stackedAreaSelections[0][0]);
        let stackedAreaSelection1 = d3.select(stackedAreaSelections[0][1]);
        let stackedAreaSelection2 = d3.select(stackedAreaSelections[0][2]);

        let areaVertices0 = TestMethods.areaVertices(stackedAreaSelection0);
        let areaYs0 = areaVertices0.map((areaVertex) => areaVertex.y).slice(0, -2);
        let areaVertices1 = TestMethods.areaVertices(stackedAreaSelection1);
        let areaYs1 = areaVertices1.map((areaVertex) => areaVertex.y).slice(0, -2);
        let areaVertices2 = TestMethods.areaVertices(stackedAreaSelection2);
        let areaYs2 = areaVertices2.map((areaVertex) => areaVertex.y).slice(0, -2);

        assert.closeTo(areaYs0[0], yScale.scale(data0[0].y), window.Pixel_CloseTo_Requirement,
          "dataset0 should have no offset");
        assert.closeTo(areaYs1[0], yScale.scale(data0[0].y), window.Pixel_CloseTo_Requirement,
          "dataset1 should be offset with dataset0");
        assert.closeTo(areaYs2[0], yScale.scale(data2[0].y + data0[0].y), window.Pixel_CloseTo_Requirement,
          "dataset2 should be offset with only dataset0");
        plot.destroy();
        svg.remove();
      });
    });

    describe("downsampling", () => {
      let stackedAreaPlot: Plottable.Plots.StackedArea<any>;

      beforeEach(() => {
        stackedAreaPlot = new Plottable.Plots.StackedArea();
      });

      it("enables and disables downsampling", () => {
        assert.strictEqual(stackedAreaPlot.downsamplingEnabled(), false, "downsampling is disabled by default");
        stackedAreaPlot.downsamplingEnabled(true);
        assert.strictEqual(stackedAreaPlot.downsamplingEnabled(), true, "downsampling can be enabled by user");
        stackedAreaPlot.downsamplingEnabled(false);
        assert.strictEqual(stackedAreaPlot.downsamplingEnabled(), false, "downsampling can be disabled by user");
      });

      it("renders correctly when downsampling is enabled", () => {
        let svg = TestMethods.generateSVG(5, 10);
        let xScale = new Plottable.Scales.Linear();
        xScale.domain([0, 5]);
        let yScale = new Plottable.Scales.Linear();
        yScale.domain([0, 5]);
        let data1 = [
          { x: 1, y: 1}, // start point should not be removed
          { x: 2, y: 1}, // points should be removed
          { x: 3, y: 1}, // points should not be removed
          { x: 4, y: 1}, // end point should not be removed
        ];

        let data2 = [
          { x: 1, y: 1},
          { x: 2, y: 2},
          { x: 3, y: 3},
          { x: 4, y: 2},
        ];

        let plot = new Plottable.Plots.StackedArea<number>();
        plot.y((d) => d.y, yScale);
        plot.x((d) => d.x, xScale);
        plot.addDataset(new Plottable.Dataset(data1));
        plot.addDataset(new Plottable.Dataset(data2));
        plot.downsamplingEnabled(true);
        new Plottable.Components.Table([[plot]]).renderTo(svg);
        let areas = plot.content().selectAll(".area");

        let expectedRenderIndex = [0, 2, 3];

        let dataset = [data1, data2];
        let EPSILON = 0.05;
        assert.strictEqual(areas[0].length, dataset.length, "correct number of areas are drawn.");

        let previousAreaValue = expectedRenderIndex.map((d) => 0);

        dataset.forEach((d, i) => {
          let area = d3.select(areas[0][i]);
          let expectedAreaData = expectedRenderIndex.map((d) => dataset[i][d]);
          let areaPoints = TestMethods.normalizePath(area.attr("d")).match(/(\-?\d+\.?\d*)(,|\s)(-?\d+\.?\d*)/g);
          assert.strictEqual(areaPoints.length, expectedRenderIndex.length * 2, `correct number of points in area are drawn in area ${i}`);
          let topPoints = areaPoints.slice(0, areaPoints.length / 2);
          let bottomPoints = areaPoints.slice(areaPoints.length / 2, areaPoints.length).reverse();
          topPoints.forEach((point, i) => {
            let topCoordinates = topPoints[i].split(/,|\s/);
            let bottomCoordinates = bottomPoints[i].split(/,|\s/);
            let height = yScale.invert(+topCoordinates[1]) - yScale.invert(+bottomCoordinates[1]);
            assert.closeTo(height, expectedAreaData[i].y, EPSILON, `the height of area with (x: ${+topCoordinates[0]}) are correct`);
            assert.closeTo(yScale.invert(+topCoordinates[1]), previousAreaValue[i] + expectedAreaData[i].y, EPSILON,
              `the top y value of area with (x: ${+topCoordinates[0]}) are correct`);
            previousAreaValue[i] = previousAreaValue[i] + expectedAreaData[i].y;
          });
        });
        svg.remove();
      });
    });
  });
});
