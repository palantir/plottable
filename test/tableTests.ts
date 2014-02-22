///<reference path="testReference.ts" />

var assert = chai.assert;

function generateBasicTable(nRows, nCols) {
  // makes a table with exactly nRows * nCols children in a regular grid, with each
  // child being a basic component
  var rows: Component[][] = [];
  var components: Component[] = [];
  for(var i=0; i<nRows; i++) {
    var cols = [];
    for(var j=0; j<nCols; j++) {
      var r = new Component().rowWeight(1).colWeight(1);
      cols.push(r);
      components.push(r);
    }
    rows.push(cols);
  }
  var table = new Table(rows);
  return {"table": table, "components": components};
}

describe("Tables", () => {
  it("tables are classed properly", () => {
    var table = new Table([[]]);
    assert.isTrue(table.classed("table"));
  });

  it("tables transform null instances into base components", () => {
    var table = new Table([[null]]); // table with a single null component
    var component = (<any> table).rows[0][0];
    assert.isNotNull(component, "the component is not null");
    assert.equal(component.constructor.name, "Component", "the component is a base Component");
  });

  it("tables with insufficient space throw Insufficient Space", () => {
    var svg = generateSVG(200, 200);
    var c = new Component().rowMinimum(300).colMinimum(300);
    var t = new Table([[c]]);
    t.anchor(svg);
    assert.throws(() => t.computeLayout(), Error, "Insufficient Space");
    svg.remove();
  });

  it("basic table with 2 rows 2 cols lays out properly", () => {
    var tableAndcomponents = generateBasicTable(2,2);
    var table = tableAndcomponents.table;
    var components = tableAndcomponents.components;

    var svg = generateSVG();
    table.anchor(svg).computeLayout().render();

    var elements = components.map((r) => r.element);
    var translates = elements.map((e) => getTranslate(e));
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
    var tableAndcomponents = generateBasicTable(2,2);
    var table = tableAndcomponents.table;
    var components = tableAndcomponents.components;

    table.padding(5,5);

    var svg = generateSVG(415, 415);
    table.anchor(svg).computeLayout().render();

    var elements = components.map((r) => r.element);
    var translates = elements.map((e) => getTranslate(e));
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
    var svg = generateSVG();
    var tableAndcomponents = generateBasicTable(3,3);
    var table = tableAndcomponents.table;
    var components = tableAndcomponents.components;
    // [0 1 2] \\
    // [3 4 5] \\
    // [6 7 8] \\
    // First, set everything to have no weight
    components.forEach((r) => r.colWeight(0).rowWeight(0).colMinimum(0).rowMinimum(0));
    // give the axis-like objects a minimum
    components[1].rowMinimum(30);
    components[7].rowMinimum(30);
    components[3].colMinimum(50);
    components[5].colMinimum(50);
    // finally the center 'plot' object has a weight
    components[4].rowWeight(1).colWeight(1);

    table.anchor(svg).computeLayout().render();

    var elements = components.map((r) => r.element);
    var translates = elements.map((e) => getTranslate(e));
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

  it("you can't set colMinimum or rowMinimum on tables directly", () => {
    var table = new Table([[]]);
    assert.throws(() => table.rowMinimum(3), Error, "cannot be directly set");
    assert.throws(() => table.colMinimum(3), Error, "cannot be directly set");
  });

  it("tables guess weights intelligently", () => {
    var c1 = new Component().rowWeight(0).colWeight(0);
    var c2 = new Component().rowWeight(0).colWeight(0);
    var table = new Table([[c1], [c2]]);
    assert.equal(table.rowWeight(), 0, "the first table guessed 0 for rowWeight");
    assert.equal(table.colWeight(), 0, "the first table guessed 0 for rowWeight");

    c1.rowWeight(0);
    c2.rowWeight(3);

    assert.equal(table.rowWeight(), 1, "the table now guesses 1 for rowWeight");
    assert.equal(table.colWeight(), 0, "the table still guesses 0 for colWeight");

    assert.equal(table.rowWeight(2), table, "rowWeight returned the table");
    assert.equal(table.rowWeight(), 2, "the rowWeight was overridden explicitly");
  });
});
