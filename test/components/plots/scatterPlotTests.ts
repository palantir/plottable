///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("ScatterPlot", () => {
    it("the accessors properly access data, index, and metadata", () => {
      var svg = generateSVG(400, 400);
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      xScale.domain([0, 400]);
      yScale.domain([400, 0]);
      var data = [{x: 0, y: 0}, {x: 1, y: 1}];
      var metadata = {foo: 10, bar: 20};
      var xAccessor = (d: any, i?: number, m?: any) => d.x + i * m.foo;
      var yAccessor = (d: any, i?: number, m?: any) => m.bar;
      var dataSource = new Plottable.DataSource(data, metadata);
      var renderer = new Plottable.Plot.Scatter(dataSource, xScale, yScale)
                                  .project("x", xAccessor)
                                  .project("y", yAccessor);
      renderer.renderTo(svg);
      var circles = renderer._renderArea.selectAll("circle");
      var c1 = d3.select(circles[0][0]);
      var c2 = d3.select(circles[0][1]);
      assert.closeTo(parseFloat(c1.attr("cx")), 0, 0.01, "first circle cx is correct");
      assert.closeTo(parseFloat(c1.attr("cy")), 20, 0.01, "first circle cy is correct");
      assert.closeTo(parseFloat(c2.attr("cx")), 11, 0.01, "second circle cx is correct");
      assert.closeTo(parseFloat(c2.attr("cy")), 20, 0.01, "second circle cy is correct");

      data = [{x: 2, y: 2}, {x: 4, y: 4}];
      dataSource.data(data);
      assert.closeTo(parseFloat(c1.attr("cx")), 2, 0.01, "first circle cx is correct after data change");
      assert.closeTo(parseFloat(c1.attr("cy")), 20, 0.01, "first circle cy is correct after data change");
      assert.closeTo(parseFloat(c2.attr("cx")), 14, 0.01, "second circle cx is correct after data change");
      assert.closeTo(parseFloat(c2.attr("cy")), 20, 0.01, "second circle cy is correct after data change");

      metadata = {foo: 0, bar: 0};
      dataSource.metadata(metadata);
      assert.closeTo(parseFloat(c1.attr("cx")), 2, 0.01, "first circle cx is correct after metadata change");
      assert.closeTo(parseFloat(c1.attr("cy")), 0, 0.01, "first circle cy is correct after metadata change");
      assert.closeTo(parseFloat(c2.attr("cx")), 4, 0.01, "second circle cx is correct after metadata change");
      assert.closeTo(parseFloat(c2.attr("cy")), 0, 0.01, "second circle cy is correct after metadata change");

      svg.remove();
    });

    describe("Example ScatterPlot with quadratic series", () => {
      var svg: D3.Selection;
      var xScale: Plottable.Scale.Linear;
      var yScale: Plottable.Scale.Linear;
      var circlePlot: Plottable.Plot.Scatter;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 300;
      var verifier = new MultiTestVerifier();
      var pixelAreaFull = {xMin: 0, xMax: SVG_WIDTH, yMin: 0, yMax: SVG_HEIGHT};
      var pixelAreaPart = {xMin: 200, xMax: 600, yMin: 100, yMax: 200};
      var dataAreaFull = {xMin: 0, xMax: 9, yMin: 81, yMax: 0};
      var dataAreaPart = {xMin: 3, xMax: 9, yMin: 54, yMax: 27};
      var colorAccessor = (d: any, i: number, m: any) => d3.rgb(d.x, d.y ,i).toString();
      var circlesInArea: number;
      var quadraticDataset = makeQuadraticSeries(10);

      function getCirclePlotVerifier() {
        // creates a function that verifies that circles are drawn properly after accounting for svg transform
        // and then modifies circlesInArea to contain the number of circles that were discovered in the plot area
        circlesInArea = 0;
        var renderArea = circlePlot._renderArea;
        var renderAreaTransform = d3.transform(renderArea.attr("transform"));
        var translate = renderAreaTransform.translate;
        var scale     = renderAreaTransform.scale;
        return function (datum: any, index: number) {
          // This function takes special care to compute the position of circles after taking svg transformation
          // into account.
          var selection = d3.select(this);
          var elementTransform = d3.transform(selection.attr("transform"));
          var elementTranslate = elementTransform.translate;
          var x = +selection.attr("cx") * scale[0] + translate[0] + elementTranslate[0];
          var y = +selection.attr("cy") * scale[1] + translate[1] + elementTranslate[1];
          if (0 <= x && x <= SVG_WIDTH && 0 <= y && y <= SVG_HEIGHT) {
            circlesInArea++;
            assert.closeTo(x, xScale.scale(datum.x), 0.01, "the scaled/translated x is correct");
            assert.closeTo(y, yScale.scale(datum.y), 0.01, "the scaled/translated y is correct");
            assert.equal(selection.attr("fill"), colorAccessor(datum, index, null), "fill is correct");
          };
        };
      };

      beforeEach(() => {
        verifier.start();
      });

      before(() => {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scale.Linear().domain([0, 9]);
        yScale = new Plottable.Scale.Linear().domain([0, 81]);
        circlePlot = new Plottable.Plot.Scatter(quadraticDataset, xScale, yScale);
        circlePlot.project("fill", colorAccessor);
        circlePlot.renderTo(svg);
      });

      it("setup is handled properly", () => {
        assert.deepEqual(xScale.range(), [0, SVG_WIDTH], "xScale range was set by the renderer");
        assert.deepEqual(yScale.range(), [SVG_HEIGHT, 0], "yScale range was set by the renderer");
        circlePlot._renderArea.selectAll("circle").each(getCirclePlotVerifier());
        assert.equal(circlesInArea, 10, "10 circles were drawn");
        verifier.end();
      });

      it("rendering is idempotent", () => {
        circlePlot._render();
        circlePlot._render();
        circlePlot._renderArea.selectAll("circle").each(getCirclePlotVerifier());
        assert.equal(circlesInArea, 10, "10 circles were drawn");
        verifier.end();
      });

      describe("after the scale has changed", () => {
        before(() => {
          xScale.domain([0, 3]);
          yScale.domain([0, 9]);
          dataAreaFull = {xMin: 0, xMax: 3, yMin: 9, yMax: 0};
          dataAreaPart = {xMin: 1, xMax: 3, yMin: 6, yMax: 3};
        });

        it("the circles re-rendered properly", () => {
          var renderArea = circlePlot._renderArea;
          var circles = renderArea.selectAll("circle");
          circles.each(getCirclePlotVerifier());
          assert.equal(circlesInArea, 4, "four circles were found in the render area");
          verifier.end();
        });
      });

      after(() => {
        if (verifier.passed) {svg.remove();};
      });
    });
  });
});
