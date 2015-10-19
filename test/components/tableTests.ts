///<reference path="../testReference.ts" />

describe("Tables", () => {
  function assertTableRows(table: Plottable.Components.Table, expectedRows: Plottable.Component[][], message: string) {
    expectedRows.forEach((row, rowIndex) => {
      row.forEach((component, columnIndex) => {
        assert.strictEqual(table.componentAt(rowIndex, columnIndex), component,
          `${message} contains the correct entry at [${rowIndex}, ${columnIndex}]`);
      });
    });
  }

  describe("constructor behavior", () => {
    it("adds the \"table\" CSS class", () => {
      const table = new Plottable.Components.Table();
      assert.isTrue(table.hasClass("table"));
    });

    it("can take a 2-D array of Components in the constructor", () => {
      const c00 = new Plottable.Component();
      const c11 = new Plottable.Component();
      const rows = [
        [c00, null],
        [null, c11]
      ];
      const table = new Plottable.Components.Table(rows);

      assertTableRows(table, rows, "constructor initialized Table correctly");
    });
  });

  describe("checking Table contents", () => {
    it("can check if a given Component is in the Table", () => {
      const c0 = new Plottable.Component();
      const table = new Plottable.Components.Table([[c0]]);
      assert.isTrue(table.has(c0), "correctly checks that Component is in the Table");
      table.remove(c0);
      assert.isFalse(table.has(c0), "correctly checks that Component is no longer in the Table");
      table.add(c0, 1, 1);
      assert.isTrue(table.has(c0), "correctly checks that Component is in the Table again");
    });

    it("can retrieve the Component at a given row, column index", () => {
      const c00 = new Plottable.Component();
      const c01 = new Plottable.Component();
      const c10 = new Plottable.Component();
      const c11 = new Plottable.Component();
      const table = new Plottable.Components.Table([
        [c00, c01],
        [c10, c11]
      ]);

      assert.strictEqual(table.componentAt(0, 0), c00, "retrieves the Component at [0, 0]");
      assert.strictEqual(table.componentAt(0, 1), c01, "retrieves the Component at [0, 1]");
      assert.strictEqual(table.componentAt(1, 0), c10, "retrieves the Component at [1, 0]");
      assert.strictEqual(table.componentAt(1, 1), c11, "retrieves the Component at [1, 1]");
    });

    it("returns null when no Component exists at the specified row, column index", () => {
      const c00 = new Plottable.Component();
      const c11 = new Plottable.Component();

      const table = new Plottable.Components.Table();
      table.add(c00, 0, 0);
      table.add(c11, 1, 1);

      assert.isNull(table.componentAt(0, 1), "returns null if an empty cell is queried");
      assert.isNull(table.componentAt(-1, 0), "returns null if a negative row index is passed in");
      assert.isNull(table.componentAt(0, -1), "returns null if a negative column index is passed in");
      assert.isNull(table.componentAt(9001, 0), "returns null if a row index larger than the number of rows is passed in");
      assert.isNull(table.componentAt(0, 9001), "returns null if a column index larger than the number of columns is passed in");
    });
  });

  describe("adding Components", () => {
    it("adds the Component and pads out other empty cells with null", () => {
      const table = new Plottable.Components.Table();
      const c11 = new Plottable.Component();
      table.add(c11, 1, 1);
      assert.strictEqual(table.componentAt(1, 1), c11, "Component was added at the correct position");
      assert.isNull(table.componentAt(0, 0), "Table padded [0, 0] with null");
      assert.isNull(table.componentAt(0, 1), "Table padded [0, 1] with null");
      assert.isNull(table.componentAt(1, 0), "Table padded [1, 0] with null");
    });

    it("throws an Error on trying to add a Component to an occupied cell", () => {
      const c1 = new Plottable.Component();
      const table = new Plottable.Components.Table([[c1]]);
      const c2 = new Plottable.Component();
      assert.throws(() => table.add(c2, 0, 0), Error, "occupied");
    });

    it("throws an Error on trying to add null to the Table", () => {
      const table = new Plottable.Components.Table();
      assert.throws(() => table.add(null, 0, 0), "Cannot add null to a table cell");
    });

    it("detaches a Component from its previous location before adding it", () => {
      const component = new Plottable.Component();
      const svg = TestMethods.generateSVG();
      component.renderTo(svg);
      const table = new Plottable.Components.Table();
      table.add(component, 0, 0);
      assert.isFalse((<Node> svg.node()).hasChildNodes(), "Component was detach()-ed");
      svg.remove();
    });
  });

  describe("removing Components", () => {
    const c1 = new Plottable.Component();
    const c2 = new Plottable.Component();
    const c3 = new Plottable.Component();
    const c4 = new Plottable.Component();
    const c5 = new Plottable.Component();
    const c6 = new Plottable.Component();
    let table: Plottable.Components.Table;

    it("removes the specified Component", () => {
      const tableRows = [
        [c1, c2],
        [c3, c4],
        [c5, c6]
      ];
      table = new Plottable.Components.Table(tableRows);
      table.remove(c4);
      const expectedRows = [
        [c1, c2],
        [c3, null],
        [c5, c6]
      ];
      assertTableRows(table, expectedRows, "the requested element was removed");
      assert.isNull(c4.parent(), "Component disconnected from the Table");
    });

    it("does nothing when component is not found", () => {
      const tableRows = [
        [c1, c2],
        [c3, c4]
      ];
      table = new Plottable.Components.Table(tableRows);
      const expectedRows = tableRows;
      table.remove(c5);
      assertTableRows(table, expectedRows, "removing a nonexistent Component does not affect the table");
    });

    it("has no further effect when called a second time with the same Component", () => {
      const tableRows = [
        [c1, c2, c3],
        [c4, c5, c6]
      ];
      table = new Plottable.Components.Table(tableRows);
      const expectedRows = [
        [null, c2, c3],
        [c4, c5, c6]
      ];
      table.remove(c1);
      assertTableRows(table, expectedRows, "Component was removed");
      table.remove(c1);
      assertTableRows(table, expectedRows, "removing Component again has no further effect");
    });

    it("removes a Component from the Table if the Component becomes detached", () => {
      table = new Plottable.Components.Table([[c1]]);
      c1.detach();
      assert.isNull(table.componentAt(0, 0), "calling detach() on the Component removes it from the Table");
      assert.isNull(c1.parent(), "Component disconnected from the Table");
    });
  });

  describe("requesting space", () => {
    it("is fixed-width if all columns contain only fixed-width Components, non-fixed otherwise", () => {
      const fixedNullsTable = new Plottable.Components.Table([
        [new Mocks.FixedSizeComponent(), null],
        [null, new Mocks.FixedSizeComponent()]
      ]);
      assert.isTrue(fixedNullsTable.fixedWidth(), "width is fixed if all columns contain fixed-width Components or null");

      const someUnfixedTable = new Plottable.Components.Table([
        [new Mocks.FixedSizeComponent(), new Mocks.FixedSizeComponent()],
        [new Plottable.Component(), null]
      ]);
      assert.isFalse(someUnfixedTable.fixedWidth(), "width is not fixed if any column contains a non-fixed-width Component");
    });

    it("is fixed-height if all rows contain only fixed-height Components, non-fixed otherwise", () => {
      const fixedNullsTable = new Plottable.Components.Table([
        [new Mocks.FixedSizeComponent(), null],
        [null, new Mocks.FixedSizeComponent()]
      ]);
      assert.isTrue(fixedNullsTable.fixedHeight(), "height is fixed if all columns contain fixed-height Components or null");

      const someUnfixedTable = new Plottable.Components.Table([
        [new Mocks.FixedSizeComponent(), new Plottable.Component()],
        [new Mocks.FixedSizeComponent(), null]
      ]);
      assert.isFalse(someUnfixedTable.fixedHeight(), "height is not fixed if any row contains a non-fixed-height Component");
    });

    it("requests enough space for largest fixed-size Component in each row and column", () => {
      const BIG_COMPONENT_SIZE = 50;
      const SMALL_COMPONENT_SIZE = 20;

      const unfixedComponent = new Plottable.Component();
      const bigFixedComponent01 = new Mocks.FixedSizeComponent(BIG_COMPONENT_SIZE, BIG_COMPONENT_SIZE);
      const bigFixedComponent10 = new Mocks.FixedSizeComponent(BIG_COMPONENT_SIZE, BIG_COMPONENT_SIZE);
      const smallFixedComponent = new Mocks.FixedSizeComponent(SMALL_COMPONENT_SIZE, SMALL_COMPONENT_SIZE);

      const table = new Plottable.Components.Table([
        [unfixedComponent, bigFixedComponent01],
        [bigFixedComponent10, smallFixedComponent]
      ]);

      const expectedMinWidth = 2 * BIG_COMPONENT_SIZE;
      const expectedMinHeight = 2 * BIG_COMPONENT_SIZE;

      const constrainedSpaceRequest = table.requestedSpace(0, 0);
      TestMethods.verifySpaceRequest(constrainedSpaceRequest, expectedMinWidth, expectedMinHeight,
        "requests enough space for all fixed-size Components when space is constrained");

      const exactlyEnoughSpaceRequest = table.requestedSpace(expectedMinWidth, expectedMinHeight);
      TestMethods.verifySpaceRequest(exactlyEnoughSpaceRequest, expectedMinWidth, expectedMinHeight,
        "requests enough space for all fixed-size Components when given exactly enough space");

      const extraSpaceRequest = table.requestedSpace(2 * expectedMinWidth, 2 * expectedMinHeight);
      TestMethods.verifySpaceRequest(extraSpaceRequest, expectedMinWidth, expectedMinHeight,
        "requests enough space for all fixed-size Components when given extra space");
    });
  });

  describe("layout of constituent Components", () => {
    const FIXED_COMPONENT_SIZE = 50;

    function verifyOrigins(rows: Plottable.Component[][], rowPadding = 0, columnPadding = 0) {
      let expectedOrigin = {
        x: 0,
        y: 0
      };
      rows.forEach((row, r) => {
        let maxHeight = 0;
        expectedOrigin.x = 0;
        row.forEach((component, c) => {
          TestMethods.assertPointsClose(component.origin(), expectedOrigin, 0, `Component at [${r}, ${c}] has the correct origin`);
          expectedOrigin.x += component.width() + columnPadding;
          maxHeight = maxHeight > component.height() ? maxHeight : component.height();
        });
        expectedOrigin.y += maxHeight + rowPadding;
      });
    }

    it("divides available width evenly between non-fixed-width Components", () => {
      const svg = TestMethods.generateSVG();

      const component1 = new Plottable.Component();
      const component2 = new Plottable.Component();
      let tableRows = [[component1, component2]];
      const table = new Plottable.Components.Table(tableRows);
      table.renderTo(svg);
      const twoColumnExpectedWidth = TestMethods.numAttr(svg, "width") / 2;
      assert.strictEqual(component1.width(), twoColumnExpectedWidth, "first Component received half the available width");
      assert.strictEqual(component2.width(), twoColumnExpectedWidth, "second Component received half the available width");
      verifyOrigins(tableRows);

      const component3 = new Plottable.Component();
      table.add(component3, 0, 2);
      tableRows[0].push(component3);
      const threeColumnExpectedWidth = TestMethods.numAttr(svg, "width") / 3;
      assert.strictEqual(component1.width(), threeColumnExpectedWidth, "first Component received one-third of the available width");
      assert.strictEqual(component2.width(), threeColumnExpectedWidth, "second Component received one-third of the available width");
      assert.strictEqual(component3.width(), threeColumnExpectedWidth, "third Component received one-third of the available width");
      verifyOrigins(tableRows);

      table.destroy();
      svg.remove();
    });

    it("gives width to fixed-width Components, then divides remainder between non-fixed-width Components", () => {
      const svg = TestMethods.generateSVG();
      const fixedSizeComponent = new Mocks.FixedSizeComponent(FIXED_COMPONENT_SIZE, FIXED_COMPONENT_SIZE);
      const unfixedComponent1 = new Plottable.Component();
      const unfixedComponent2 = new Plottable.Component();
      const table = new Plottable.Components.Table([[fixedSizeComponent, unfixedComponent1, unfixedComponent2]]);
      table.renderTo(svg);
      const expectedUnfixedWidth = (TestMethods.numAttr(svg, "width") - FIXED_COMPONENT_SIZE) / 2;
      assert.strictEqual(unfixedComponent1.width(), expectedUnfixedWidth,
        "first non-fixed-width Component received half the remaining width");
      assert.strictEqual(unfixedComponent2.width(), expectedUnfixedWidth,
        "second non-fixed-width Component received half the remaining width");

      table.destroy();
      svg.remove();
    });

    it("divides available height evenly between non-fixed-height Components", () => {
      const svg = TestMethods.generateSVG();

      const component1 = new Plottable.Component();
      const component2 = new Plottable.Component();
      let tableRows = [
        [component1],
        [component2]
      ];
      const table = new Plottable.Components.Table(tableRows);
      table.renderTo(svg);
      const twoRowExpectedHeight = TestMethods.numAttr(svg, "height") / 2;
      assert.strictEqual(component1.height(), twoRowExpectedHeight, "first Component received half the available height");
      assert.strictEqual(component2.height(), twoRowExpectedHeight, "second Component received half the available height");
      verifyOrigins(tableRows);

      const component3 = new Plottable.Component();
      table.add(component3, 2, 0);
      tableRows.push([component3]);
      const threeRowExpectedHeight = TestMethods.numAttr(svg, "height") / 3;
      assert.strictEqual(component1.height(), threeRowExpectedHeight, "first Component received one-third of the available height");
      assert.strictEqual(component2.height(), threeRowExpectedHeight, "second Component received one-third of the available height");
      assert.strictEqual(component3.height(), threeRowExpectedHeight, "third Component received one-third of the available height");
      verifyOrigins(tableRows);

      table.destroy();
      svg.remove();
    });

    it("gives height to fixed-height Components, then divides remainder between non-fixed-height Components", () => {
      const svg = TestMethods.generateSVG();
      const fixedSizeComponent = new Mocks.FixedSizeComponent(FIXED_COMPONENT_SIZE, FIXED_COMPONENT_SIZE);
      const unfixedComponent1 = new Plottable.Component();
      const unfixedComponent2 = new Plottable.Component();
      const table = new Plottable.Components.Table([
        [fixedSizeComponent],
        [unfixedComponent1],
        [unfixedComponent2]
      ]);
      table.renderTo(svg);
      const expectedUnfixedHeight = (TestMethods.numAttr(svg, "height") - FIXED_COMPONENT_SIZE) / 2;
      assert.strictEqual(unfixedComponent1.height(), expectedUnfixedHeight,
        "first non-fixed-height Component received half the remaining height");
      assert.strictEqual(unfixedComponent2.height(), expectedUnfixedHeight,
        "second non-fixed-height Component received half the remaining height");

      table.destroy();
      svg.remove();
    });

    it("divides width evenly if there isn't enough width to go around", () => {
      const svg = TestMethods.generateSVG(FIXED_COMPONENT_SIZE, FIXED_COMPONENT_SIZE);
      const fixedComponent1 = new Mocks.FixedSizeComponent(FIXED_COMPONENT_SIZE, FIXED_COMPONENT_SIZE);
      const fixedComponent2 = new Mocks.FixedSizeComponent(FIXED_COMPONENT_SIZE, FIXED_COMPONENT_SIZE);
      const tableRows = [[fixedComponent1, fixedComponent2]];
      const table = new Plottable.Components.Table(tableRows);
      table.renderTo(svg);

      const expectedWidth = FIXED_COMPONENT_SIZE / 2;
      assert.strictEqual(fixedComponent1.width(), expectedWidth, "first fixed-width Component received half the available width");
      assert.strictEqual(fixedComponent2.width(), expectedWidth, "second fixed-width Component received half the available width");
      verifyOrigins(tableRows);

      table.destroy();
      svg.remove();
    });

    it("divides height evenly if there isn't enough hieght to go around", () => {
      const svg = TestMethods.generateSVG(FIXED_COMPONENT_SIZE, FIXED_COMPONENT_SIZE);
      const fixedComponent1 = new Mocks.FixedSizeComponent(FIXED_COMPONENT_SIZE, FIXED_COMPONENT_SIZE);
      const fixedComponent2 = new Mocks.FixedSizeComponent(FIXED_COMPONENT_SIZE, FIXED_COMPONENT_SIZE);
      const tableRows = [
        [fixedComponent1],
        [fixedComponent2]
      ];
      const table = new Plottable.Components.Table(tableRows);
      table.renderTo(svg);

      const expectedHeight = FIXED_COMPONENT_SIZE / 2;
      assert.strictEqual(fixedComponent1.height(), expectedHeight, "first fixed-height Component received half the available height");
      assert.strictEqual(fixedComponent2.height(), expectedHeight, "second fixed-height Component received half the available height");
      verifyOrigins(tableRows);

      table.destroy();
      svg.remove();
    });

    describe("layout with padding and weights", () => {
      it("adds row padding between rows", () => {
        const svg = TestMethods.generateSVG();

        const component1 = new Plottable.Component();
        const component2 = new Plottable.Component();
        const tableRows = [
          [component1],
          [component2]
        ];
        const table = new Plottable.Components.Table(tableRows);
        const rowPadding = 10;
        table.rowPadding(rowPadding);
        table.renderTo(svg);

        const expectedHeight = (TestMethods.numAttr(svg, "height") - rowPadding) / 2;
        assert.strictEqual(component1.height(), expectedHeight, "first non-fixed-height Component received half the remaining height");
        assert.strictEqual(component2.height(), expectedHeight, "second non-fixed-height Component received half the remaining height");
        verifyOrigins(tableRows, rowPadding, 0);

        table.destroy();
        svg.remove();
      });

      it("adds column padding between columns", () => {
        const svg = TestMethods.generateSVG();

        const component1 = new Plottable.Component();
        const component2 = new Plottable.Component();
        const tableRows = [[component1, component2]];
        const table = new Plottable.Components.Table(tableRows);
        const columnPadding = 10;
        table.columnPadding(columnPadding);
        table.renderTo(svg);

        const expectedWidth = (TestMethods.numAttr(svg, "height") - columnPadding) / 2;
        assert.strictEqual(component1.width(), expectedWidth, "first non-fixed-width Component received half the remaining width");
        assert.strictEqual(component2.width(), expectedWidth, "second non-fixed-width Component received half the remaining width");
        verifyOrigins(tableRows, 0, columnPadding);

        table.destroy();
        svg.remove();
      });

      it("allocates height to unfixed rows according to row weights", () => {
        const svg = TestMethods.generateSVG();

        const component0 = new Plottable.Component();
        const component1 = new Plottable.Component();
        const table = new Plottable.Components.Table([
          [component0],
          [component1]
        ]);
        const row0Weight = 1;
        table.rowWeight(0, row0Weight);
        const row1Weight = 2;
        table.rowWeight(1, row1Weight);
        const totalRowWeight = row0Weight + row1Weight;
        table.renderTo(svg);

        assert.strictEqual(component0.height(), TestMethods.numAttr(svg, "width") * row0Weight / totalRowWeight,
          "row 0 received height according to its weight");
        assert.strictEqual(component1.height(), TestMethods.numAttr(svg, "width") * row1Weight / totalRowWeight,
          "row 1 received height according to its weight");

        table.destroy();
        svg.remove();
      });

      it("allocates width to unfixed columns according to column weights", () => {
        const svg = TestMethods.generateSVG();

        const component0 = new Plottable.Component();
        const component1 = new Plottable.Component();
        const table = new Plottable.Components.Table([[component0, component1]]);
        const column0Weight = 1;
        table.columnWeight(0, column0Weight);
        const column1Weight = 2;
        table.columnWeight(1, column1Weight);
        const totalColumnWeight = column0Weight + column1Weight;
        table.renderTo(svg);

        assert.strictEqual(component0.width(), TestMethods.numAttr(svg, "width") * column0Weight / totalColumnWeight,
          "column 0 received width according to its weight");
        assert.strictEqual(component1.width(), TestMethods.numAttr(svg, "width") * column1Weight / totalColumnWeight,
          "column 1 received width according to its weight");

        table.destroy();
        svg.remove();
      });
    });
  });
});
