///<reference path="testReference.ts" />

var assert = chai.assert;

var quadraticDataset = makeQuadraticSeries(10);

describe("Renderers", () => {

  describe("base Renderer", () => {
    it("Renderers default correctly", () => {
      var r = new Plottable.Renderer();
      assert.isTrue(r.clipPathEnabled, "clipPathEnabled defaults to true");
    });

    it("Base Renderer functionality works", () => {
      var svg = generateSVG(400, 300);
      var d1 = new Plottable.DataSource(["foo"], {cssClass: "bar"});
      var r = new Plottable.Renderer(d1);
      r._anchor(svg)._computeLayout();
      var renderArea = r.content.select(".render-area");
      assert.isNotNull(renderArea.node(), "there is a render-area");

      var d2 = new Plottable.DataSource(["bar"], {cssClass: "boo"});
      assert.throws(() => r.dataSource(d2), Error);

      svg.remove();
    });

    it("Renderer automatically generates a DataSource if only data is provided", () => {
      var data = ["foo", "bar"];
      var r = new Plottable.Renderer(data);
      var dataSource = r.dataSource();
      assert.isNotNull(dataSource, "A DataSource was automatically generated");
      assert.deepEqual(dataSource.data(), data, "The generated DataSource has the correct data");
    });

    it("Renderer.project works as intended", () => {
      var r = new Plottable.Renderer();
      var s = new Plottable.LinearScale().domain([0, 1]).range([0, 10]);
      r.project("attr", "a", s);
      var attrToProjector = r._generateAttrToProjector();
      var projector = attrToProjector["attr"];
      assert.equal(projector({"a": 0.5}, 0), 5, "projector works as intended");
    });
  });

  describe("XYRenderer functionality", () => {
    it("the accessors properly access data, index, and metadata", () => {
      var svg = generateSVG(400, 400);
      var xScale = new Plottable.LinearScale();
      var yScale = new Plottable.LinearScale();
      xScale.domain([0, 400]);
      yScale.domain([400, 0]);
      var data = [{x: 0, y: 0}, {x: 1, y: 1}];
      var metadata = {foo: 10, bar: 20};
      var xAccessor = (d, i?, m?) => d.x + i * m.foo;
      var yAccessor = (d, i?, m?) => m.bar;
      var dataSource = new Plottable.DataSource(data, metadata);
      var renderer = new Plottable.CircleRenderer(dataSource, xScale, yScale, xAccessor, yAccessor);
      renderer.autorangeDataOnLayout = false;
      renderer.renderTo(svg);
      var circles = renderer.renderArea.selectAll("circle");
      var c1 = d3.select(circles[0][0]);
      var c2 = d3.select(circles[0][1]);
      assert.closeTo(parseFloat(c1.attr("cx")), 0, 0.01, "first circle cx is correct");
      assert.closeTo(parseFloat(c1.attr("cy")), 20, 0.01, "first circle cy is correct");
      assert.closeTo(parseFloat(c2.attr("cx")), 11, 0.01, "second circle cx is correct");
      assert.closeTo(parseFloat(c2.attr("cy")), 20, 0.01, "second circle cy is correct");

      data = [{x: 2, y:2}, {x:4, y:4}];
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

    describe("Basic LineRenderer functionality, with custom accessors", () => {
      // We test all the underlying XYRenderer logic with our CircleRenderer, let's just verify that the line
      // draws properly for the LineRenderer
      var svg: D3.Selection;
      var xScale;
      var yScale;
      var lineRenderer;
      var simpleDataset = new Plottable.DataSource([{foo: 0, bar:0}, {foo:1, bar:1}]);
      var renderArea;
      var verifier = new MultiTestVerifier();

      before(() => {
        svg = generateSVG(500, 500);
        xScale = new Plottable.LinearScale().domain([0, 1]);
        yScale = new Plottable.LinearScale().domain([0, 1]);
        var xAccessor = (d) => d.foo;
        var yAccessor = (d) => d.bar;
        var colorAccessor = (d, i, m) => d3.rgb(d.foo, d.bar, i).toString();
        lineRenderer = new Plottable.LineRenderer(simpleDataset, xScale, yScale, xAccessor, yAccessor);
        lineRenderer.project("stroke", colorAccessor);
        lineRenderer.renderTo(svg);
        renderArea = lineRenderer.renderArea;
      });

      beforeEach(() => {
        verifier.start();
      });

      it("the line renderer drew an appropriate line", () => {
        var path = renderArea.select("path");
        assert.equal(path.attr("d"), "M0,500L500,0", "path-d is correct");
        assert.equal(path.attr("stroke"), "#000000", "path-stroke is correct");
        verifier.end();
      });

      it("rendering is idempotent", () => {
        lineRenderer._render();
        var path = renderArea.select("path");
        assert.equal(path.attr("d"), "M0,500L500,0");
        verifier.end();
      });

      it("rescaled rerender works properly", () => {
        xScale.domain([0, 5]);
        yScale.domain([0, 10]);
        var path = renderArea.select("path");
        assert.equal(path.attr("d"), "M0,500L100,450");
        verifier.end();
      });

      after(() => {
        if (verifier.passed) {svg.remove();};
      });
    });

    describe("Example CircleRenderer with quadratic series", () => {
      var svg: D3.Selection;
      var xScale: Plottable.LinearScale;
      var yScale: Plottable.LinearScale;
      var circleRenderer: Plottable.CircleRenderer;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 300;
      var verifier = new MultiTestVerifier();
      var pixelAreaFull = {xMin: 0, xMax: SVG_WIDTH, yMin: 0, yMax: SVG_HEIGHT};
      var pixelAreaPart = {xMin: 200, xMax: 600, yMin: 100, yMax: 200};
      var dataAreaFull = {xMin: 0, xMax: 9, yMin: 81, yMax: 0};
      var dataAreaPart = {xMin: 3, xMax: 9, yMin: 54, yMax: 27};
      var colorAccessor = (d, i, m) => d3.rgb(d.x, d.y ,i).toString();
      var circlesInArea;

      function getCircleRendererVerifier() {
        // creates a function that verifies that circles are drawn properly after accounting for svg transform
        // and then modifies circlesInArea to contain the number of circles that were discovered in the plot area
        circlesInArea = 0;
        var renderArea = circleRenderer.renderArea;
        var renderAreaTransform = d3.transform(renderArea.attr("transform"));
        var translate = renderAreaTransform.translate;
        var scale     = renderAreaTransform.scale;
        return function (datum, index) {
          // This function takes special care to compute the position of circles after taking svg transformation
          // into account.
          var selection = d3.select(this);
          var elementTransform = d3.transform(selection.attr("transform"));
          var elementTranslate = elementTransform.translate;
          var x = +selection.attr("cx") * scale[0] + translate[0] + elementTranslate[0];
          var y = +selection.attr("cy") * scale[1] + translate[1] + elementTranslate[1];
          if (0 <= x && x <= SVG_WIDTH && 0 <= y && y <= SVG_HEIGHT) {
            circlesInArea++;
            assert.equal(x, xScale.scale(datum.x), "the scaled/translated x is correct");
            assert.equal(y, yScale.scale(datum.y), "the scaled/translated y is correct");
            assert.equal(selection.attr("fill"), colorAccessor(datum, index, null), "fill is correct");
          };
        };
      };

      beforeEach(() => {
        verifier.start();
      });

      before(() => {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.LinearScale().domain([0, 9]);
        yScale = new Plottable.LinearScale().domain([0, 81]);
        circleRenderer = new Plottable.CircleRenderer(quadraticDataset, xScale, yScale);
        circleRenderer.project("fill", colorAccessor);
        circleRenderer.renderTo(svg);
      });

      it("setup is handled properly", () => {
        assert.deepEqual(xScale.range(), [0, SVG_WIDTH], "xScale range was set by the renderer");
        assert.deepEqual(yScale.range(), [SVG_HEIGHT, 0], "yScale range was set by the renderer");
        circleRenderer.renderArea.selectAll("circle").each(getCircleRendererVerifier());
        assert.equal(circlesInArea, 10, "10 circles were drawn");
        verifier.end();
      });

      it("rendering is idempotent", () => {
        circleRenderer._render()._render();
        circleRenderer.renderArea.selectAll("circle").each(getCircleRendererVerifier());
        assert.equal(circlesInArea, 10, "10 circles were drawn");
        verifier.end();
      });

      it("invertXYSelectionArea works", () => {
        var actualDataAreaFull = circleRenderer.invertXYSelectionArea(pixelAreaFull);
        assert.deepEqual(actualDataAreaFull, dataAreaFull, "the full data area is as expected");

        var actualDataAreaPart = circleRenderer.invertXYSelectionArea(pixelAreaPart);

        assert.closeTo(actualDataAreaPart.xMin, dataAreaPart.xMin, 1, "partial xMin is close");
        assert.closeTo(actualDataAreaPart.xMax, dataAreaPart.xMax, 1, "partial xMax is close");
        assert.closeTo(actualDataAreaPart.yMin, dataAreaPart.yMin, 1, "partial yMin is close");
        assert.closeTo(actualDataAreaPart.yMax, dataAreaPart.yMax, 1, "partial yMax is close");
        verifier.end();
      });

      it("getSelectionFromArea works", () => {
        var selectionFull = circleRenderer.getSelectionFromArea(dataAreaFull);
        assert.lengthOf(selectionFull[0], 10, "all 10 circles were selected by the full region");

        var selectionPartial = circleRenderer.getSelectionFromArea(dataAreaPart);
        assert.lengthOf(selectionPartial[0], 2, "2 circles were selected by the partial region");
        verifier.end();
      });

      it("getDataIndicesFromArea works", () => {
        var indicesFull = circleRenderer.getDataIndicesFromArea(dataAreaFull);
        assert.deepEqual(indicesFull, d3.range(10), "all 10 circles were selected by the full region");

        var indicesPartial = circleRenderer.getDataIndicesFromArea(dataAreaPart);
        assert.deepEqual(indicesPartial, [6, 7], "2 circles were selected by the partial region");
        verifier.end();
      });

      describe("after the scale has changed", () => {
        before(() => {
          xScale.domain([0, 3]);
          yScale.domain([0, 9]);
          dataAreaFull = {xMin: 0, xMax: 3, yMin: 9, yMax: 0};
          dataAreaPart = {xMin: 1, xMax: 3, yMin: 6, yMax: 3};
        });

        it("invertXYSelectionArea works", () => {
          var actualDataAreaFull = circleRenderer.invertXYSelectionArea(pixelAreaFull);
          assert.deepEqual(actualDataAreaFull, dataAreaFull, "the full data area is as expected");

          var actualDataAreaPart = circleRenderer.invertXYSelectionArea(pixelAreaPart);

          assert.closeTo(actualDataAreaPart.xMin, dataAreaPart.xMin, 1, "partial xMin is close");
          assert.closeTo(actualDataAreaPart.xMax, dataAreaPart.xMax, 1, "partial xMax is close");
          assert.closeTo(actualDataAreaPart.yMin, dataAreaPart.yMin, 1, "partial yMin is close");
          assert.closeTo(actualDataAreaPart.yMax, dataAreaPart.yMax, 1, "partial yMax is close");
          verifier.end();
        });

        it("getSelectionFromArea works", () => {
          var selectionFull = circleRenderer.getSelectionFromArea(dataAreaFull);
          assert.lengthOf(selectionFull[0], 4, "four circles were selected by the full region");

          var selectionPartial = circleRenderer.getSelectionFromArea(dataAreaPart);
          assert.lengthOf(selectionPartial[0], 1, "one circle was selected by the partial region");
          verifier.end();
        });

        it("getDataIndicesFromArea works", () => {
          var indicesFull = circleRenderer.getDataIndicesFromArea(dataAreaFull);
          assert.deepEqual(indicesFull, [0,1,2,3], "four circles were selected by the full region");

          var indicesPartial = circleRenderer.getDataIndicesFromArea(dataAreaPart);
          assert.deepEqual(indicesPartial, [2], "circle 2 was selected by the partial region");
          verifier.end();
        });

        it("the circles re-rendered properly", () => {
          var renderArea = circleRenderer.renderArea;
          var circles = renderArea.selectAll("circle");
          circles.each(getCircleRendererVerifier());
          assert.equal(circlesInArea, 4, "four circles were found in the render area");
          verifier.end();
        });
      });

      after(() => {
        if (verifier.passed) {svg.remove();};
      });
    });

    describe("Bar Renderer", () => {
      var svg: D3.Selection;
      var xScale: Plottable.LinearScale;
      var yScale: Plottable.LinearScale;
      var barRenderer: Plottable.BarRenderer;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;
      var verifier = new MultiTestVerifier();
      var d0 = {x: -2, dx: 1, y: 1};
      var d1 = {x: 0, dx: 4, y: 4};
      // Choosing data with a negative x value is significant, since there is
      // a potential failure mode involving the xDomain with an initial
      // point below 0
      var dataset = new Plottable.DataSource([d0, d1]);

      before(() => {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.LinearScale().domain([-2, 4]);
        yScale = new Plottable.LinearScale().domain([0, 4]);
        barRenderer = new Plottable.BarRenderer(dataset, xScale, yScale);
        barRenderer._anchor(svg)._computeLayout();
      });

      beforeEach(() => {
        verifier.start();
      });

      it("bars were rendered correctly with padding disabled", () => {
        barRenderer.barPaddingPx = 0;
        barRenderer._render();
        var renderArea = barRenderer.renderArea;
        var bars = renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(bar0.attr("width"), "100", "bar0 width is correct");
        assert.equal(bar1.attr("width"), "400", "bar1 width is correct");
        assert.equal(bar0.attr("height"), "100", "bar0 height is correct");
        assert.equal(bar1.attr("height"), "400", "bar1 height is correct");
        assert.equal(bar0.attr("x"), "0", "bar0 x is correct");
        assert.equal(bar1.attr("x"), "200", "bar1 x is correct");
        verifier.end();
      });

      it("bars were rendered correctly with padding enabled", () => {
        barRenderer.barPaddingPx = 1;
        barRenderer._render();
        var renderArea = barRenderer.renderArea;
        var bars = renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(bar0.attr("width"), "98", "bar0 width is correct");
        assert.equal(bar1.attr("width"), "398", "bar1 width is correct");
        assert.equal(bar0.attr("height"), "100", "bar0 height is correct");
        assert.equal(bar1.attr("height"), "400", "bar1 height is correct");
        assert.equal(bar0.attr("x"), "1", "bar0 x is correct");
        assert.equal(bar1.attr("x"), "201", "bar1 x is correct");
        verifier.end();
      });

      after(() => {
        if (verifier.passed) {svg.remove();};
      });
    });

    describe("Category Bar Renderer", () => {
      var verifier = new MultiTestVerifier();
      var svg: D3.Selection;
      var dataset: Plottable.DataSource;
      var xScale: Plottable.OrdinalScale;
      var yScale: Plottable.LinearScale;
      var renderer: Plottable.CategoryBarRenderer;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;

      before(() => {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.OrdinalScale().domain(["A", "B"]);
        yScale = new Plottable.LinearScale();
        var data = [
          {x: "A", y: 1},
          {x: "B", y: 2}
        ];
        dataset = new Plottable.DataSource(data);

        renderer = new Plottable.CategoryBarRenderer(dataset, xScale, yScale);
        renderer._animate = false;
        renderer.renderTo(svg);
      });

      beforeEach(() => {
        verifier.start();
      });

      it("renders correctly", () => {
        yScale.domain([0, 4]);
        var renderArea = renderer.renderArea;
        var bars = renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(bar0.attr("width"), "10", "bar0 width is correct");
        assert.equal(bar1.attr("width"), "10", "bar1 width is correct");
        assert.equal(bar0.attr("height"), "100", "bar0 height is correct");
        assert.equal(bar1.attr("height"), "200", "bar1 height is correct");
        assert.equal(bar0.attr("x"), "145", "bar0 x is correct");
        assert.equal(bar1.attr("x"), "445", "bar1 x is correct");
        verifier.end();
      });

      after(() => {
        if (verifier.passed) {svg.remove();};
      });
    });
  });
});
