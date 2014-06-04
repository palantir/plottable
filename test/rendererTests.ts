///<reference path="testReference.ts" />

var assert = chai.assert;

class CountingPlot extends Plottable.Abstract.Plot {
  public renders: number = 0;

  constructor(dataset: any) {
    super(dataset);
  }

  public _render() {
    ++this.renders;
    return super._render();
  }
}


var quadraticDataset = makeQuadraticSeries(10);

describe("Renderers", () => {

  describe("base Renderer", () => {
    it("Renderers default correctly", () => {
      var r = new Plottable.Abstract.Plot();
      assert.isTrue(r.clipPathEnabled, "clipPathEnabled defaults to true");
    });

    it("Base Renderer functionality works", () => {
      var svg = generateSVG(400, 300);
      var d1 = new Plottable.DataSource(["foo"], {cssClass: "bar"});
      var r = new Plottable.Abstract.Plot(d1);
      r._anchor(svg)._computeLayout();
      var renderArea = r.content.select(".render-area");
      assert.isNotNull(renderArea.node(), "there is a render-area");
      svg.remove();
    });

    it("Allows the DataSource to be changed", () => {
      var d1 = new Plottable.DataSource(["foo"], {cssClass: "bar"});
      var r = new Plottable.Abstract.Plot(d1);
      assert.equal(d1, r.dataSource(), "returns the original");

      var d2 = new Plottable.DataSource(["bar"], {cssClass: "boo"});
      r.dataSource(d2);
      assert.equal(d2, r.dataSource(), "returns new datasource");
    });

    it("Changes DataSource listeners when the DataSource is changed", () => {
      var d1 = new Plottable.DataSource(["foo"], {cssClass: "bar"});
      var r = new CountingPlot(d1);

      assert.equal(0, r.renders, "initially hasn't rendered anything");

      d1._broadcast();
      assert.equal(1, r.renders, "we re-render when our datasource changes");

      r.dataSource();
      assert.equal(1, r.renders, "we shouldn't redraw when querying the datasource");

      var d2 = new Plottable.DataSource(["bar"], {cssClass: "boo"});
      r.dataSource(d2);
      assert.equal(2, r.renders, "we should redraw when we change datasource");

      d1._broadcast();
      assert.equal(2, r.renders, "we shouldn't listen to the old datasource");

      d2._broadcast();
      assert.equal(3, r.renders, "we should listen to the new datasource");
    });

    it("Updates its projectors when the DataSource is changed", () => {
      var d1 = new Plottable.DataSource(["foo"], {cssClass: "bar"});
      var r = new Plottable.Abstract.Plot(d1);

      var xScaleCalls: number = 0;
      var yScaleCalls: number = 0;
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      r.project("x", null, xScale);
      r.project("y", null, yScale);
      xScale.registerListener(null, (broadcaster: Plottable.Abstract.Broadcaster) => {
        assert.equal(broadcaster, xScale, "Callback received the calling scale as the first argument");
        ++xScaleCalls;
      });
      yScale.registerListener(null, (broadcaster: Plottable.Abstract.Broadcaster) => {
        assert.equal(broadcaster, yScale, "Callback received the calling scale as the first argument");
        ++yScaleCalls;
      });

      assert.equal(0, xScaleCalls, "initially hasn't made any X callbacks");
      assert.equal(0, yScaleCalls, "initially hasn't made any Y callbacks");

      d1._broadcast();
      assert.equal(1, xScaleCalls, "X scale was wired up to datasource correctly");
      assert.equal(1, yScaleCalls, "Y scale was wired up to datasource correctly");

      var d2 = new Plottable.DataSource(["bar"], {cssClass: "boo"});
      r.dataSource(d2);
      assert.equal(3, xScaleCalls, "Changing datasource fires X scale listeners (but doesn't coalesce callbacks)");
      assert.equal(3, yScaleCalls, "Changing datasource fires Y scale listeners (but doesn't coalesce callbacks)");

      d1._broadcast();
      assert.equal(3, xScaleCalls, "X scale was unhooked from old datasource");
      assert.equal(3, yScaleCalls, "Y scale was unhooked from old datasource");

      d2._broadcast();
      assert.equal(4, xScaleCalls, "X scale was hooked into new datasource");
      assert.equal(4, yScaleCalls, "Y scale was hooked into new datasource");
    });

    it("Renderer automatically generates a DataSource if only data is provided", () => {
      var data = ["foo", "bar"];
      var r = new Plottable.Abstract.Plot(data);
      var dataSource = r.dataSource();
      assert.isNotNull(dataSource, "A DataSource was automatically generated");
      assert.deepEqual(dataSource.data(), data, "The generated DataSource has the correct data");
    });

    it("Renderer.project works as intended", () => {
      var r = new Plottable.Abstract.Plot();
      var s = new Plottable.Scales.Linear().domain([0, 1]).range([0, 10]);
      r.project("attr", "a", s);
      var attrToProjector = r._generateAttrToProjector();
      var projector = attrToProjector["attr"];
      assert.equal(projector({"a": 0.5}, 0), 5, "projector works as intended");
    });
  });

  describe("XYRenderer functionality", () => {
    it("the accessors properly access data, index, and metadata", () => {
      var svg = generateSVG(400, 400);
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      xScale.domain([0, 400]);
      yScale.domain([400, 0]);
      var data = [{x: 0, y: 0}, {x: 1, y: 1}];
      var metadata = {foo: 10, bar: 20};
      var xAccessor = (d: any, i?: number, m?: any) => d.x + i * m.foo;
      var yAccessor = (d: any, i?: number, m?: any) => m.bar;
      var dataSource = new Plottable.DataSource(data, metadata);
      var renderer = new Plottable.Plots.Scatter(dataSource, xScale, yScale)
                                  .project("x", xAccessor)
                                  .project("y", yAccessor);
      renderer.renderTo(svg);
      var circles = renderer.renderArea.selectAll("circle");
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

    describe("Basic AreaRenderer functionality", () => {
      var svg: D3.Selection;
      var xScale = new Plottable.Scales.Linear().domain([0, 1]);
      var yScale = new Plottable.Scales.Linear().domain([0, 1]);
      var xAccessor = (d: any) => d.foo;
      var yAccessor = (d: any) => d.bar;
      var y0Accessor = () => 0;
      var colorAccessor = (d: any, i: number, m: any) => d3.rgb(d.foo, d.bar, i).toString();
      var fillAccessor = () => "steelblue";
      var simpleDataset = new Plottable.DataSource([{foo: 0, bar: 0}, {foo: 1, bar: 1}]);
      var areaRenderer = new Plottable.Plots.Area(simpleDataset, xScale, yScale)
                                  .project("x", xAccessor)
                                  .project("y", yAccessor)
                                  .project("y0", y0Accessor)
                                  .project("fill", fillAccessor)
                                  .project("stroke", colorAccessor);
      var renderArea: D3.Selection;
      var verifier = new MultiTestVerifier();

      before(() => {
        svg = generateSVG(500, 500);
        areaRenderer.renderTo(svg);
        renderArea = areaRenderer.renderArea;
      });

      beforeEach(() => {
        verifier.start();
      });

      it("draws area and line correctly", () => {
        var areaPath = renderArea.select(".area");
        assert.strictEqual(areaPath.attr("d"), "M0,500L500,0L500,500L0,500Z", "area d was set correctly");
        assert.strictEqual(areaPath.attr("fill"), "steelblue", "area fill was set correctly");
        var areaComputedStyle = window.getComputedStyle(areaPath.node());
        assert.strictEqual(areaComputedStyle.stroke, "none", "area stroke renders as \"none\"");

        var linePath = renderArea.select(".line");
        assert.strictEqual(linePath.attr("d"), "M0,500L500,0", "line d was set correctly");
        assert.strictEqual(linePath.attr("stroke"), "#000000", "line stroke was set correctly");
        var lineComputedStyle = window.getComputedStyle(linePath.node());
        assert.strictEqual(lineComputedStyle.fill, "none", "line fill renders as \"none\"");
        verifier.end();
      });

      it("fill colors set appropriately from accessor", () => {
        var areaPath = renderArea.select(".area");
        assert.equal(areaPath.attr("fill"), "steelblue", "fill set correctly");
        verifier.end();
      });

      it("fill colors can be changed by projecting new accessor and re-render appropriately", () => {
        var newFillAccessor = () => "pink";
        areaRenderer.project("fill", newFillAccessor);
        areaRenderer.renderTo(svg);
        renderArea = areaRenderer.renderArea;
        var areaPath = renderArea.select(".area");
        assert.equal(areaPath.attr("fill"), "pink", "fill changed correctly");
        verifier.end();
      });

      it("area fill works for non-zero floor values appropriately, e.g. half the height of the line", () => {
        areaRenderer.project("y0", (d: any) => d.bar/2);
        areaRenderer.renderTo(svg);
        renderArea = areaRenderer.renderArea;
        var areaPath = renderArea.select(".area");
        assert.equal(areaPath.attr("d"), "M0,500L500,0L500,250L0,500Z");
        verifier.end();
      });

      after(() => {
        if (verifier.passed) {svg.remove();};
      });
    });

    describe("LineRenderer", () => {
      it("defaults to no fill", () => {
        var svg = generateSVG(500, 500);
        var data = [{x: 0, y: 0}, {x: 2, y: 2}];
        var xScale = new Plottable.Scales.Linear();
        var yScale = new Plottable.Scales.Linear();
        var lineRenderer = new Plottable.Plots.Line(data, xScale, yScale);
        lineRenderer.renderTo(svg);

        var areaPath = lineRenderer.renderArea.select(".area");
        assert.strictEqual(areaPath.attr("fill"), "none");
        svg.remove();
      });
    });

    describe("Example CircleRenderer with quadratic series", () => {
      var svg: D3.Selection;
      var xScale: Plottable.Scales.Linear;
      var yScale: Plottable.Scales.Linear;
      var circleRenderer: Plottable.Plots.Scatter;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 300;
      var verifier = new MultiTestVerifier();
      var pixelAreaFull = {xMin: 0, xMax: SVG_WIDTH, yMin: 0, yMax: SVG_HEIGHT};
      var pixelAreaPart = {xMin: 200, xMax: 600, yMin: 100, yMax: 200};
      var dataAreaFull = {xMin: 0, xMax: 9, yMin: 81, yMax: 0};
      var dataAreaPart = {xMin: 3, xMax: 9, yMin: 54, yMax: 27};
      var colorAccessor = (d: any, i: number, m: any) => d3.rgb(d.x, d.y ,i).toString();
      var circlesInArea: number;

      function getCircleRendererVerifier() {
        // creates a function that verifies that circles are drawn properly after accounting for svg transform
        // and then modifies circlesInArea to contain the number of circles that were discovered in the plot area
        circlesInArea = 0;
        var renderArea = circleRenderer.renderArea;
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
        xScale = new Plottable.Scales.Linear().domain([0, 9]);
        yScale = new Plottable.Scales.Linear().domain([0, 81]);
        circleRenderer = new Plottable.Plots.Scatter(quadraticDataset, xScale, yScale);
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

      describe("after the scale has changed", () => {
        before(() => {
          xScale.domain([0, 3]);
          yScale.domain([0, 9]);
          dataAreaFull = {xMin: 0, xMax: 3, yMin: 9, yMax: 0};
          dataAreaPart = {xMin: 1, xMax: 3, yMin: 6, yMax: 3};
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
      var verifier = new MultiTestVerifier();
      var svg: D3.Selection;
      var dataset: Plottable.DataSource;
      var xScale: Plottable.Scales.Ordinal;
      var yScale: Plottable.Scales.Linear;
      var renderer: Plottable.Plots.Bar;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;

      before(() => {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scales.Ordinal().domain(["A", "B"]).rangeType("points");
        yScale = new Plottable.Scales.Linear();
        var data = [
          {x: "A", y: 1},
          {x: "B", y: -1.5},
          {x: "B", y: 1} // duplicate X-value
        ];
        dataset = new Plottable.DataSource(data);

        renderer = new Plottable.Plots.Bar(dataset, xScale, yScale);
        renderer.animate(false);
        renderer.renderTo(svg);
      });

      beforeEach(() => {
        yScale.domain([-2, 2]);
        renderer.baseline(0);
        verifier.start();
      });

      it("renders correctly", () => {
        var renderArea = renderer.renderArea;
        var bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(bar0.attr("width"), "10", "bar0 width is correct");
        assert.equal(bar1.attr("width"), "10", "bar1 width is correct");
        assert.equal(bar0.attr("height"), "100", "bar0 height is correct");
        assert.equal(bar1.attr("height"), "150", "bar1 height is correct");
        assert.equal(bar0.attr("x"), "150", "bar0 x is correct");
        assert.equal(bar1.attr("x"), "450", "bar1 x is correct");
        assert.equal(bar0.attr("y"), "100", "bar0 y is correct");
        assert.equal(bar1.attr("y"), "200", "bar1 y is correct");

        var baseline = renderArea.select(".baseline");
        assert.equal(baseline.attr("y1"), "200", "the baseline is in the correct vertical position");
        assert.equal(baseline.attr("y2"), "200", "the baseline is in the correct vertical position");
        assert.equal(baseline.attr("x1"), "0", "the baseline starts at the edge of the chart");
        assert.equal(baseline.attr("x2"), SVG_WIDTH, "the baseline ends at the edge of the chart");
        verifier.end();
      });

      it("baseline value can be changed; renderer updates appropriately", () => {
        renderer.baseline(-1);

        var renderArea = renderer.renderArea;
        var bars = renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(bar0.attr("height"), "200", "bar0 height is correct");
        assert.equal(bar1.attr("height"), "50", "bar1 height is correct");
        assert.equal(bar0.attr("y"), "100", "bar0 y is correct");
        assert.equal(bar1.attr("y"), "300", "bar1 y is correct");

        var baseline = renderArea.select(".baseline");
        assert.equal(baseline.attr("y1"), "300", "the baseline is in the correct vertical position");
        assert.equal(baseline.attr("y2"), "300", "the baseline is in the correct vertical position");
        assert.equal(baseline.attr("x1"), "0", "the baseline starts at the edge of the chart");
        assert.equal(baseline.attr("x2"), SVG_WIDTH, "the baseline ends at the edge of the chart");
        verifier.end();
      });

      it("bar alignment can be changed; renderer updates appropriately", () => {
        renderer.barAlignment("center");
        var renderArea = renderer.renderArea;
        var bars = renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(bar0.attr("width"), "10", "bar0 width is correct");
        assert.equal(bar1.attr("width"), "10", "bar1 width is correct");
        assert.equal(bar0.attr("x"), "145", "bar0 x is correct");
        assert.equal(bar1.attr("x"), "445", "bar1 x is correct");

        renderer.barAlignment("right");
        renderArea = renderer.renderArea;
        bars = renderArea.selectAll("rect");
        bar0 = d3.select(bars[0][0]);
        bar1 = d3.select(bars[0][1]);
        assert.equal(bar0.attr("width"), "10", "bar0 width is correct");
        assert.equal(bar1.attr("width"), "10", "bar1 width is correct");
        assert.equal(bar0.attr("x"), "140", "bar0 x is correct");
        assert.equal(bar1.attr("x"), "440", "bar1 x is correct");

        assert.throws(() => renderer.barAlignment("blargh"), Error);

        verifier.end();
      });

      it("can select and deselect bars", () => {
        var selectedBar = renderer.selectBar(145, 150); // in the middle of bar 0

        assert.isNotNull(selectedBar, "a bar was selected");
        assert.equal(selectedBar.data()[0], dataset.data()[0], "the data in the bar matches the datasource");
        assert.isTrue(selectedBar.classed("selected"), "the bar was classed \"selected\"");

        renderer.deselectAll();
        assert.isFalse(selectedBar.classed("selected"), "the bar is no longer selected");

        selectedBar = renderer.selectBar(-1, -1); // no bars here
        assert.isNull(selectedBar, "returns null if no bar was selected");

        verifier.end();
      });

      after(() => {
        if (verifier.passed) {svg.remove();};
      });
    });

    describe("Horizontal Bar Renderer", () => {
      var verifier = new MultiTestVerifier();
      var svg: D3.Selection;
      var dataset: Plottable.DataSource;
      var yScale: Plottable.Scales.Ordinal;
      var xScale: Plottable.Scales.Linear;
      var renderer: Plottable.Plots.HorizontalBar;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 400;

      before(() => {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        yScale = new Plottable.Scales.Ordinal().domain(["A", "B"]).rangeType("points");
        xScale = new Plottable.Scales.Linear();

        var data = [
          {y: "A", x: 1},
          {y: "B", x: -1.5},
          {y: "B", x: 1} // duplicate Y-value
        ];
        dataset = new Plottable.DataSource(data);

        renderer = new Plottable.Plots.HorizontalBar(dataset, xScale, yScale);
        renderer._animate = false;
        renderer.renderTo(svg);
      });

      beforeEach(() => {
        xScale.domain([-3, 3]);
        renderer.baseline(0);
        verifier.start();
      });

      it("renders correctly", () => {
        var renderArea = renderer.renderArea;
        var bars = renderArea.selectAll("rect");
        assert.lengthOf(bars[0], 3, "One bar was created per data point");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(bar0.attr("height"), "10", "bar0 height is correct");
        assert.equal(bar1.attr("height"), "10", "bar1 height is correct");
        assert.equal(bar0.attr("width"), "100", "bar0 width is correct");
        assert.equal(bar1.attr("width"), "150", "bar1 width is correct");
        assert.equal(bar0.attr("y"), "300", "bar0 y is correct");
        assert.equal(bar1.attr("y"), "100", "bar1 y is correct");
        assert.equal(bar0.attr("x"), "300", "bar0 x is correct");
        assert.equal(bar1.attr("x"), "150", "bar1 x is correct");

        var baseline = renderArea.select(".baseline");
        assert.equal(baseline.attr("x1"), "300", "the baseline is in the correct horizontal position");
        assert.equal(baseline.attr("x2"), "300", "the baseline is in the correct horizontal position");
        assert.equal(baseline.attr("y1"), "0", "the baseline starts at the top of the chart");
        assert.equal(baseline.attr("y2"), SVG_HEIGHT, "the baseline ends at the bottom of the chart");
        verifier.end();
      });

      it("baseline value can be changed; renderer updates appropriately", () => {
        renderer.baseline(-1);

        var renderArea = renderer.renderArea;
        var bars = renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(bar0.attr("width"), "200", "bar0 width is correct");
        assert.equal(bar1.attr("width"), "50", "bar1 width is correct");
        assert.equal(bar0.attr("x"), "200", "bar0 x is correct");
        assert.equal(bar1.attr("x"), "150", "bar1 x is correct");

        var baseline = renderArea.select(".baseline");
        assert.equal(baseline.attr("x1"), "200", "the baseline is in the correct horizontal position");
        assert.equal(baseline.attr("x2"), "200", "the baseline is in the correct horizontal position");
        assert.equal(baseline.attr("y1"), "0", "the baseline starts at the top of the chart");
        assert.equal(baseline.attr("y2"), SVG_HEIGHT, "the baseline ends at the bottom of the chart");
        verifier.end();
      });

      it("bar alignment can be changed; renderer updates appropriately", () => {
        renderer.barAlignment("middle");
        var renderArea = renderer.renderArea;
        var bars = renderArea.selectAll("rect");
        var bar0 = d3.select(bars[0][0]);
        var bar1 = d3.select(bars[0][1]);
        assert.equal(bar0.attr("height"), "10", "bar0 height is correct");
        assert.equal(bar1.attr("height"), "10", "bar1 height is correct");
        assert.equal(bar0.attr("y"), "295", "bar0 y is correct");
        assert.equal(bar1.attr("y"), "95", "bar1 y is correct");

        renderer.barAlignment("bottom");
        renderArea = renderer.renderArea;
        bars = renderArea.selectAll("rect");
        bar0 = d3.select(bars[0][0]);
        bar1 = d3.select(bars[0][1]);
        assert.equal(bar0.attr("height"), "10", "bar0 height is correct");
        assert.equal(bar1.attr("height"), "10", "bar1 height is correct");
        assert.equal(bar0.attr("y"), "290", "bar0 y is correct");
        assert.equal(bar1.attr("y"), "90", "bar1 y is correct");

        assert.throws(() => renderer.barAlignment("blargh"), Error);

        verifier.end();
      });

      after(() => {
        if (verifier.passed) {svg.remove();};
      });
    });

    describe("Grid Renderer", () => {
      var SVG_WIDTH  = 400;
      var SVG_HEIGHT = 200;
      var DATA       = [
        {x: "A", y: "U", magnitude: 0},
        {x: "B", y: "U", magnitude: 2},
        {x: "A", y: "V", magnitude: 16},
        {x: "B", y: "V", magnitude: 8},
      ];

      var VERIFY_CELLS = (cells: any[]) => {
        assert.equal(cells.length, 4);

        var cellAU = d3.select(cells[0]);
        var cellBU = d3.select(cells[1]);
        var cellAV = d3.select(cells[2]);
        var cellBV = d3.select(cells[3]);

        assert.equal(cellAU.attr("height"), "100", "cell 'AU' height is correct");
        assert.equal(cellAU.attr("width"), "200", "cell 'AU' width is correct");
        assert.equal(cellAU.attr("x"), "0", "cell 'AU' x coord is correct");
        assert.equal(cellAU.attr("y"), "100", "cell 'AU' x coord is correct");
        assert.equal(cellAU.attr("fill"), "#000000", "cell 'AU' color is correct");

        assert.equal(cellBU.attr("height"), "100", "cell 'BU' height is correct");
        assert.equal(cellBU.attr("width"), "200", "cell 'BU' width is correct");
        assert.equal(cellBU.attr("x"), "200", "cell 'BU' x coord is correct");
        assert.equal(cellBU.attr("y"), "100", "cell 'BU' x coord is correct");
        assert.equal(cellBU.attr("fill"), "#212121", "cell 'BU' color is correct");

        assert.equal(cellAV.attr("height"), "100", "cell 'AV' height is correct");
        assert.equal(cellAV.attr("width"), "200", "cell 'AV' width is correct");
        assert.equal(cellAV.attr("x"), "0", "cell 'AV' x coord is correct");
        assert.equal(cellAV.attr("y"), "0", "cell 'AV' x coord is correct");
        assert.equal(cellAV.attr("fill"), "#ffffff", "cell 'AV' color is correct");

        assert.equal(cellBV.attr("height"), "100", "cell 'BV' height is correct");
        assert.equal(cellBV.attr("width"), "200", "cell 'BV' width is correct");
        assert.equal(cellBV.attr("x"), "200", "cell 'BV' x coord is correct");
        assert.equal(cellBV.attr("y"), "0", "cell 'BV' x coord is correct");
        assert.equal(cellBV.attr("fill"), "#777777", "cell 'BV' color is correct");
      };

      it("renders correctly", () => {
        var xScale: Plottable.Scales.Ordinal = new Plottable.Scales.Ordinal();
        var yScale: Plottable.Scales.Ordinal = new Plottable.Scales.Ordinal();
        var colorScale: Plottable.Scales.InterpolatedColor = new Plottable.Scales.InterpolatedColor(["black", "white"]);
        var svg: D3.Selection = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var renderer: Plottable.Plots.Grid = new Plottable.Plots.Grid(DATA, xScale, yScale, colorScale)
                                                            .project("fill", "magnitude");
        renderer.renderTo(svg);
        VERIFY_CELLS(renderer.renderArea.selectAll("rect")[0]);
        svg.remove();
      });


      it("renders correctly when data is set after construction", () => {
        var xScale: Plottable.Scales.Ordinal = new Plottable.Scales.Ordinal();
        var yScale: Plottable.Scales.Ordinal = new Plottable.Scales.Ordinal();
        var colorScale: Plottable.Scales.InterpolatedColor = new Plottable.Scales.InterpolatedColor(["black", "white"]);
        var svg: D3.Selection = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var renderer: Plottable.Plots.Grid = new Plottable.Plots.Grid(null, xScale, yScale, colorScale)
                                                            .project("fill", "magnitude");
        renderer.renderTo(svg);
        renderer.dataSource().data(DATA);
        VERIFY_CELLS(renderer.renderArea.selectAll("rect")[0]);
        svg.remove();
      });

      it("can invert y axis correctly", () => {
        var xScale: Plottable.Scales.Ordinal = new Plottable.Scales.Ordinal();
        var yScale: Plottable.Scales.Ordinal = new Plottable.Scales.Ordinal();
        var colorScale: Plottable.Scales.InterpolatedColor = new Plottable.Scales.InterpolatedColor(["black", "white"]);
        var svg: D3.Selection = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var renderer: Plottable.Plots.Grid = new Plottable.Plots.Grid(null, xScale, yScale, colorScale)
                                                            .project("fill", "magnitude");
        renderer.renderTo(svg);

        yScale.domain(["U", "V"]);
        renderer.dataSource().data(DATA);

        var cells = renderer.renderArea.selectAll("rect")[0];
        var cellAU = d3.select(cells[0]);
        var cellAV = d3.select(cells[2]);
        cellAU.attr("fill", "#000000");
        cellAU.attr("x", "0");
        cellAU.attr("y", "100");

        cellAV.attr("fill", "#ffffff");
        cellAV.attr("x", "0");
        cellAV.attr("y", "0");

        yScale.domain(["V", "U"]);
        cells = renderer.renderArea.selectAll("rect")[0];
        cellAU = d3.select(cells[0]);
        cellAV = d3.select(cells[2]);
        cellAU.attr("fill", "#000000");
        cellAU.attr("x", "0");
        cellAU.attr("y", "0");

        cellAV.attr("fill", "#ffffff");
        cellAV.attr("x", "0");
        cellAV.attr("y", "100");

        svg.remove();
      });
    });


  });
});
