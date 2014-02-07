///<reference path="testReference.ts" />

var assert = chai.assert;

function generateBasicTable(nRows, nCols) {
  // makes a table with exactly nRows * nCols children in a regular grid, with each
  // child being a basic Renderer (todo: maybe change to basic component)
  var emptyDataset: IDataset = {data: [], seriesName: "blah"};
  var rows: Renderer[][] = [];
  var renderers: Renderer[] = [];
  for(var i=0; i<nRows; i++) {
    var cols = [];
    for(var j=0; j<nCols; j++) {
      var r = new Renderer(emptyDataset);
      cols.push(r);
      renderers.push(r);
    }
    rows.push(cols);
  }
  var table = new Table(rows);
  return {"table": table, "renderers": renderers};
}

function assertBBoxEquivalence(bbox, widthAndHeightPair, message) {
  var width = widthAndHeightPair[0];
  var height = widthAndHeightPair[1];
  assert.equal(bbox.width, width, "width: " + message);
  assert.equal(bbox.height, height, "height: " + message);
}

describe("Table layout", () => {

  it("basic table with 2 rows 2 cols lays out properly", () => {
    var tableAndRenderers = generateBasicTable(2,2);
    var table = tableAndRenderers.table;
    var renderers = tableAndRenderers.renderers;

    var svg = d3.select("body").append("svg:svg");
    table.anchor(svg);
    table.computeLayout(0, 0, 400, 400);
    table.render();

    var elements = renderers.map((r) => r.element);
    var translates = elements.map((e) => Utils.getTranslate(e));
    assert.deepEqual(translates[0], [0, 0], "first element is centered at origin");
    assert.deepEqual(translates[1], [200, 0], "second element is located properly");
    assert.deepEqual(translates[2], [0, 200], "third element is located properly");
    assert.deepEqual(translates[3], [200, 200], "fourth element is located properly");
    var bboxes = elements.map((e) => Utils.getBBox(e));
    bboxes.forEach((b) => {
      assert.equal(b.width, 200, "bbox is 200 pixels wide");
      assert.equal(b.height, 200, "bbox is 200 pixels tall");
      });
    svg.remove();
  });

  it("table with 2 rows 2 cols and margin/padding lays out properly", () => {
    var tableAndRenderers = generateBasicTable(2,2);
    var table = tableAndRenderers.table;
    var renderers = tableAndRenderers.renderers;

    table.padding(5,5);

    var svg = d3.select("body").append("svg:svg");
    table.anchor(svg);
    table.computeLayout(0, 0, 415, 415);
    table.render();

    var elements = renderers.map((r) => r.element);
    var translates = elements.map((e) => Utils.getTranslate(e));
    var bboxes = elements.map((e) => Utils.getBBox(e));
    assert.deepEqual(translates[0], [0, 0], "first element is centered properly");
    assert.deepEqual(translates[1], [210, 0], "second element is located properly");
    assert.deepEqual(translates[2], [0, 210], "third element is located properly");
    assert.deepEqual(translates[3], [210, 210], "fourth element is located properly");
    bboxes.forEach((b) => {
      assert.equal(b.width, 205, "bbox is 205 pixels wide");
      assert.equal(b.height, 205, "bbox is 205 pixels tall");
      });
    svg.remove();
  });

  it("table with fixed-size objects on every side lays out properly", () => {
    var svg = d3.select("body").append("svg:svg");
    var tableAndRenderers = generateBasicTable(3,3);
    var table = tableAndRenderers.table;
    var renderers = tableAndRenderers.renderers;
    // [0 1 2] \\
    // [3 4 5] \\
    // [6 7 8] \\
    // First, set everything to have no weight
    renderers.forEach((r) => r.colWeight(0).rowWeight(0).colMinimum(0).rowMinimum(0));
    // give the axis-like objects a minimum
    renderers[1].rowMinimum(30);
    renderers[7].rowMinimum(30);
    renderers[3].colMinimum(50);
    renderers[5].colMinimum(50);
    // finally the center 'plot' object has a weight
    renderers[4].rowWeight(1).colWeight(1);

    table.anchor(svg);
    table.computeLayout(0, 0, 400, 400);
    table.render();

    var elements = renderers.map((r) => r.element);
    var translates = elements.map((e) => Utils.getTranslate(e));
    var bboxes = elements.map((e) => Utils.getBBox(e));
    // test the translates
    assert.deepEqual(translates[1], [50, 0]  , "top axis translate");
    assert.deepEqual(translates[7], [50, 370], "bottom axis translate");
    assert.deepEqual(translates[3], [0, 30]  , "left axis translate");
    assert.deepEqual(translates[5], [350, 30], "right axis translate");
    assert.deepEqual(translates[4], [50, 30] , "plot translate");
    // test the bboxes
    assertBBoxEquivalence(bboxes[1], [300, 30], "top axis bbox");
    assertBBoxEquivalence(bboxes[7], [300, 30], "bottom axis bbox");
    assertBBoxEquivalence(bboxes[3], [50, 340], "left axis bbox");
    assertBBoxEquivalence(bboxes[5], [50, 340], "right axis bbox");
    assertBBoxEquivalence(bboxes[4], [300, 340], "plot bbox");
    svg.remove();
  });
});
