///<reference path="testReference.ts" />

var assert = chai.assert;


function generateBasicTable(nRows, nCols) {
  // makes a table with exactly nRows * nCols children in a regular grid, with each
  // child being a basic component
  var table = new Plottable.Table();
  var rows: Plottable.Component[][] = [];
  var components: Plottable.Component[] = [];
  for(var i = 0; i<nRows; i++) {
    for(var j = 0; j<nCols; j++) {
      var r = new Plottable.Component();
      table.addComponent(i, j, r);
      components.push(r);
    }
  }
  return {"table": table, "components": components};
}

describe("Tables", () => {
  it("tables are classed properly", () => {
    var table = new Plottable.Table();
    assert.isTrue(table.classed("table"));
  });

  it("padTableToSize works properly", () => {
    var t = new Plottable.Table();
    assert.deepEqual((<any> t).rows, [], "the table rows is an empty list");
    (<any> t).padTableToSize(1,1);
    var rows = (<any> t).rows;
    var row = rows[0];
    var firstComponent = row[0];
    assert.lengthOf(rows, 1, "there is one row");
    assert.lengthOf(row, 1, "the row has one element");
    assert.isNull(firstComponent, "the row only has a null component");

    (<any> t).padTableToSize(5,2);
    assert.lengthOf(rows, 5, "there are five rows");
    rows.forEach((r) => assert.lengthOf(r, 2, "there are two columsn per row"));
    assert.equal(rows[0][0], firstComponent, "the first component is unchanged");
  });

  it("table constructor can take a list of lists of components", () => {
    var c0 = new Plottable.Component();
    var row1 = [null, c0];
    var row2 = [new Plottable.Component(), null];
    var table = new Plottable.Table([row1, row2]);
    assert.equal((<any> table).rows[0][1], c0, "the component is in the right spot");
    var c1 = new Plottable.Component();
    table.addComponent(2, 2, c1);
    assert.equal((<any> table).rows[2][2], c1, "the inserted component went to the right spot");
  });

  it("tables can be constructed by adding components in matrix style", () => {
    var table = new Plottable.Table();
    var c1 = new Plottable.Component();
    var c2 = new Plottable.Component();
    table.addComponent(0, 0, c1);
    table.addComponent(1, 1, c2);
    var rows = (<any> table).rows;
    assert.lengthOf(rows, 2, "there are two rows");
    assert.lengthOf(rows[0], 2, "two cols in first row");
    assert.lengthOf(rows[1], 2, "two cols in second row");
    assert.equal(rows[0][0], c1, "first component added correctly");
    assert.equal(rows[1][1], c2, "second component added correctly");
    assert.isNull(rows[0][1], "component at (0, 1) is null");
    assert.isNull(rows[1][0], "component at (1, 0) is null");
  });

  it("can't add a component where one already exists", () => {
    var c1 = new Plottable.Table();
    var c2 = new Plottable.Table();
    var t = new Plottable.Table();
    t.addComponent(0, 2, c1);
    t.addComponent(0, 0, c2);
    assert.throws(() => t.addComponent(0, 2, c2), Error, "component already exists");
  });

  it("addComponent works even if a component is added with a high column and low row index", () => {
    // Solves #180, a weird bug
    var t = new Plottable.Table();
    var svg = generateSVG();
    t.addComponent(1, 0, new Plottable.Component());
    t.addComponent(0, 2, new Plottable.Component());
    t.renderTo(svg); //would throw an error without the fix (tested);
    svg.remove();
  });


  it("tables with insufficient space throw Insufficient Space", () => {
    var svg = generateSVG(200, 200);
    var c = new Plottable.Component().minimumHeight(300).minimumWidth(300);
    var t = new Plottable.Table().addComponent(0, 0, c);
    t._anchor(svg);
    assert.throws(() => t._computeLayout(), Error, "Insufficient Space");
    svg.remove();
  });

  it("basic table with 2 rows 2 cols lays out properly", () => {
    var tableAndcomponents = generateBasicTable(2,2);
    var table = tableAndcomponents.table;
    var components = tableAndcomponents.components;
    // force the components to have non-fixed layout; eg. as if they were renderers
    components.forEach((c) => {
      c._fixedWidth = false;
      c._fixedHeight = false;
    });

    var svg = generateSVG();
    table.renderTo(svg);

    var elements = components.map((r) => r.element);
    var translates = elements.map((e) => getTranslate(e));
    assert.deepEqual(translates[0], [0, 0], "first element is centered at origin");
    assert.deepEqual(translates[1], [200, 0], "second element is located properly");
    assert.deepEqual(translates[2], [0, 200], "third element is located properly");
    assert.deepEqual(translates[3], [200, 200], "fourth element is located properly");
    var bboxes = elements.map((e) => Plottable.Utils.getBBox(e));
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
    // force the components to have non-fixed layout; eg. as if they were renderers
    components.forEach((c) => {
      c._fixedWidth = false;
      c._fixedHeight = false;
    });

    table.padding(5,5);

    var svg = generateSVG(415, 415);
    table.renderTo(svg);

    var elements = components.map((r) => r.element);
    var translates = elements.map((e) => getTranslate(e));
    var bboxes = elements.map((e) => Plottable.Utils.getBBox(e));
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
    components.forEach((r) => r.minimumWidth(0).minimumHeight(0));
    // give the axis-like objects a minimum
    components[1].minimumHeight(30);
    components[7].minimumHeight(30);
    components[3].minimumWidth(50);
    components[5].minimumWidth(50);
    components[4]._fixedWidth = false;
    components[4]._fixedHeight = false;
    // finally the center 'plot' object has a weight

    table.renderTo(svg);

    var elements = components.map((r) => r.element);
    var translates = elements.map((e) => getTranslate(e));
    var bboxes = elements.map((e) => Plottable.Utils.getBBox(e));
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

  it("you can't set minimumWidth or minimumHeight on tables directly", () => {
    var table = new Plottable.Table();
    assert.throws(() => table.minimumHeight(3), Error, "cannot be directly set");
    assert.throws(() => table.minimumWidth(3), Error, "cannot be directly set");
  });

  it("table space fixity calculates properly", () => {
    var tableAndcomponents = generateBasicTable(3,3);
    var table = tableAndcomponents.table;
    var components = tableAndcomponents.components;
    assert.isTrue(table.isFixedWidth(), "fixed width when all subcomponents fixed width");
    assert.isTrue(table.isFixedHeight(), "fixedHeight when all subcomponents fixed height");
    components[0]._fixedWidth = false;
    assert.isFalse(table.isFixedWidth(), "width not fixed when some subcomponent width not fixed");
    assert.isTrue(table.isFixedHeight(), "the height is still fixed when some subcomponent width not fixed");
    components[8]._fixedHeight = false;
    components[0]._fixedWidth = true;
    assert.isTrue(table.isFixedWidth(), "width fixed again once no subcomponent width not fixed");
    assert.isFalse(table.isFixedHeight(), "height unfixed now that a subcomponent has unfixed height");
  });
});
