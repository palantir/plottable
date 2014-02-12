///<reference path="testReference.ts" />

var assert = chai.assert;

function makeQuadraticSeries(n: number): IDataset {
  function makePoint(x: number) {
    return {x: x, y: x*x};
  }
  var data = d3.range(n).map(makePoint);
  return {data: data, seriesName: "quadratic-series"};
}

var dataset1 = makeQuadraticSeries(10);

describe("Renderers", () => {

  describe("base Renderer", () => {
    it("Renderers default correctly", () => {
      var r = new Renderer();
      assert.equal(r.colWeight(), 1, "colWeight defaults to 1");
      assert.equal(r.rowWeight(), 1, "rowWeight defaults to 1");
      assert.isTrue(r.clipPathEnabled, "clipPathEnabled defaults to true");
      console.log("wee");
    });

    it("Base renderer functionality works", () => {
      var svg = generateSVG(400, 300);
      var d1 = {data: ["foo"], seriesName: "bar"};
      var r = new Renderer(d1);
      r.anchor(svg).computeLayout();
      var renderArea = r.element.select(".render-area");
      assert.isNotNull(renderArea.node(), "there is a render-area");
      assert.isTrue(renderArea.classed("bar"), "the render area is classed w/ dataset.seriesName");
      assert.deepEqual(r.dataset, d1, "the dataset is set properly");
      var d2 = {data: ["bar"], seriesName: "boo"};
      r.data(d2);
      assert.isFalse(renderArea.classed("bar"), "the renderArea is no longer classed bar");
      assert.isTrue(renderArea.classed("boo"), "the renderArea is now classed boo");
      assert.deepEqual(r.dataset, d2, "the dataset was replaced properly");
      svg.remove();
    });
  });

  describe("CircleRenderer", () => {
    describe("Example CircleRenderer with quadratic series", () => {
      var svg: D3.Selection;
      var xScale: LinearScale;
      var yScale: LinearScale;
      var circleRenderer: CircleRenderer;
      var pixelAreaFull: SelectionArea;
      var pixelAreaPartial: SelectionArea;

      before(() => {
        svg = generateSVG(600, 300);
        xScale = new LinearScale();
        yScale = new LinearScale();
        circleRenderer = new CircleRenderer(dataset1, xScale, yScale);
        circleRenderer.anchor(svg).computeLayout().render();
        pixelAreaFull = {xMin: 0, xMax: 600, yMin: 0, yMax: 300};
        pixelAreaPartial = {xMin: 200, xMax: 600, yMin: 100, yMax: 200};
      });

      it("setup is handled properly", () => {
        assert.deepEqual(xScale.domain(), [0, 9],  "xScale domain was set by the renderer");
        assert.deepEqual(yScale.domain(), [0, 81], "yScale domain was set by the renderer");
        assert.deepEqual(xScale.range(), [0, 600], "xScale range was set by the renderer");
        assert.deepEqual(yScale.range(), [300, 0], "yScale range was set by the renderer");
        assert.lengthOf(circleRenderer.renderArea.selectAll("circle")[0], 10, "10 circles were drawn");
      });

      it("invertXYSelectionArea works", () => {
        var expectedDataAreaFull = {xMin: 0, xMax: 9, yMin: 81, yMax: 0};
        var actualDataAreaFull = circleRenderer.invertXYSelectionArea(pixelAreaFull).data;
        assert.deepEqual(actualDataAreaFull, expectedDataAreaFull, "the full data area is as expected");

        var expectedDataAreaPartial = {xMin: 3, xMax: 9, yMin: 54, yMax: 27};
        var actualDataAreaPartial = circleRenderer.invertXYSelectionArea(pixelAreaPartial).data;

        assert.closeTo(actualDataAreaPartial.xMin, expectedDataAreaPartial.xMin, 1, "partial xMin is close");
        assert.closeTo(actualDataAreaPartial.xMax, expectedDataAreaPartial.xMax, 1, "partial xMax is close");
        assert.closeTo(actualDataAreaPartial.yMin, expectedDataAreaPartial.yMin, 1, "partial yMin is close");
        assert.closeTo(actualDataAreaPartial.yMax, expectedDataAreaPartial.yMax, 1, "partial yMax is close");
      });

      it("getSelectionFromArea works", () => {
        var fullSelectionArea = circleRenderer.invertXYSelectionArea(pixelAreaFull);
        var selectionFull = circleRenderer.getSelectionFromArea(fullSelectionArea);
        assert.lengthOf(selectionFull[0], 10, "all 10 circles were selected by the full region");

        var partialSelectionArea = circleRenderer.invertXYSelectionArea(pixelAreaPartial);
        var selectionPartial = circleRenderer.getSelectionFromArea(partialSelectionArea);
        assert.lengthOf(selectionPartial[0], 2, "2 circles were selected by the partial region");
      });

      it("getDataIndicesFromArea works", () => {
        var fullSelectionArea = circleRenderer.invertXYSelectionArea(pixelAreaFull);
        var indicesFull = circleRenderer.getDataIndicesFromArea(fullSelectionArea);
        assert.deepEqual(indicesFull, d3.range(10), "all 10 circles were selected by the full region");

        var partialSelectionArea = circleRenderer.invertXYSelectionArea(pixelAreaPartial);
        var indicesPartial = circleRenderer.getDataIndicesFromArea(partialSelectionArea);
        assert.deepEqual(indicesPartial, [6, 7], "2 circles were selected by the partial region");
      });

      after(() => {
        svg.remove();
      });

    });
  });
});
