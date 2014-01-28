///<reference path="../lib/chai/chai.d.ts" />
///<reference path="../lib/chai/chai-assert.d.ts" />
///<reference path="../lib/mocha/mocha.d.ts" />
///<reference path="../lib/d3.d.ts" />

///<reference path="../src/axis.ts" />
///<reference path="../src/table.ts" />
///<reference path="../src/renderer.ts" />
///<reference path="../src/utils.ts" />

var assert = chai.assert;

function generateSVG(width, height) {
  return d3.select("body").append("svg:svg").attr("width", width).attr("height", height);
}

function generateBasicTable(nRows, nCols) {
  // makes a table with exactly nRows * nCols children in a regular grid, with each
  // child being a basic Renderer (todo: maybe change to basic renderable)
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

describe("Table layout", () => {

  it("basic table with 2 rows 2 cols lays out properly", () => {
    var tableAndRenderers = generateBasicTable(2,2);
    var table = tableAndRenderers.table;
    var renderers = tableAndRenderers.renderers;

    table.xMargin = 0;
    table.yMargin = 0;
    table.rowPadding = 0;
    table.colPadding = 0;

    var svg = generateSVG(400,400);
    table.computeLayout();
    table.render(svg, 400, 400);

    var elements = renderers.map((r) => r.element);
    var translates = elements.map((e) => Utils.getTranslate(e));
    chai.assert.deepEqual(translates[0], [0, 0], "first element is centered at origin");
    chai.assert.deepEqual(translates[1], [200, 0], "second element is located properly");
    chai.assert.deepEqual(translates[2], [0, 200], "third element is located properly");
    chai.assert.deepEqual(translates[3], [200, 200], "fourth element is located properly");
    var bboxes = elements.map((e) => Utils.getBBox(e));
    bboxes.forEach((b) => {
      chai.assert.equal(b.width, 200, "bbox is 200 pixels wide");
      chai.assert.equal(b.height, 200, "bbox is 200 pixels tall");
      });
  });

})
