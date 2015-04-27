///<reference path="../reference.ts" />

module Plottable {
export module Components {
  type _LayoutAllocation = {
    guaranteedHeights: number[];
    guaranteedWidths: number[];
    wantsHeightArr: boolean[];
    wantsWidthArr: boolean[];
  }

  export type _IterateLayoutResult = {
    colProportionalSpace: number[];
    guaranteedHeights: number[];
    guaranteedWidths: number[];
    rowProportionalSpace: number[];
    wantsHeight: boolean;
    wantsWidth: boolean;
  };

  export class Table extends ComponentContainer {
    private calculatedLayout: _IterateLayoutResult = null;
    private colPadding = 0;
    private colWeights: number[] = [];
    private numCols = 0;
    private numRows = 0;
    private rows: Component[][] = [];
    private rowPadding = 0;
    private rowWeights: number[] = [];

    /**
     * Constructs a Table.
     *
     * A Table is used to combine multiple Components in the form of a grid. A
     * common case is combining a y-axis, x-axis, and the plotted data via
     * ```typescript
     * new Table([[yAxis, plot],
     *            [null,  xAxis]]);
     * ```
     *
     * @constructor
     * @param {Component[][]} [rows] A 2-D array of the Components to place in the table.
     * null can be used if a cell is empty. (default = [])
     */
    constructor(rows: Component[][] = []) {
      super();
      this.classed("table", true);
      rows.forEach((row, rowIndex) => {
        row.forEach((component, colIndex) => {
          if (component != null) {
            this.addComponent(rowIndex, colIndex, component);
          }
        });
      });
    }

    /**
     * Adds a Component in the specified cell.
     *
     * If the cell is already occupied, there are 3 cases
     *  - Component + Component => Group containing both components
     *  - Component + Group => Component is added to the group
     *  - Group + Component => Component is added to the group
     *
     * For example, instead of calling `new Table([[a, b], [null, c]])`, you
     * could call
     * ```typescript
     * var table = new Table();
     * table.addComponent(0, 0, a);
     * table.addComponent(0, 1, b);
     * table.addComponent(1, 1, c);
     * ```
     *
     * @param {number} row The row in which to add the Component.
     * @param {number} col The column in which to add the Component.
     * @param {Component} component The Component to be added.
     * @returns {Table} The calling Table.
     */
    public addComponent(row: number, col: number, component: Component): Table {

      if (component == null) {
        throw Error("Cannot add null to a table cell");
      }

      var currentComponent = this.rows[row] && this.rows[row][col];

      if (currentComponent) {
        component = component.above(currentComponent);
      }

      if (this._addComponent(component)) {
        this.numRows = Math.max(row + 1, this.numRows);
        this.numCols = Math.max(col + 1, this.numCols);
        this.padTableToSize(this.numRows, this.numCols);

        this.rows[row][col] = component;
      }
      return this;
    }

    /**
     * Sets the layout weight of a particular column.
     * Space is allocated to columns based on their weight. Columns with higher weights receive proportionally more space.
     *
     * Please see `rowWeight` docs for an example.
     *
     * @param {number} index The index of the column.
     * @param {number} weight The weight to be set on the column.
     * @returns {Table} The calling Table.
     */
    public colWeight(index: number, weight: number) {
      this.colWeights[index] = weight;
      this.invalidateLayout();
      return this;
    }

    public computeLayout(offeredXOrigin?: number, offeredYOrigin?: number, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(offeredXOrigin, offeredYOrigin, availableWidth , availableHeight);
      var layout = this.useLastCalculatedLayout() ? this.calculatedLayout : this.iterateLayout(this.width(), this.height());

      this.useLastCalculatedLayout(true);

      var childYOrigin = 0;
      var rowHeights = Utils.Methods.addArrays(layout.rowProportionalSpace, layout.guaranteedHeights);
      var colWidths  = Utils.Methods.addArrays(layout.colProportionalSpace, layout.guaranteedWidths );
      this.rows.forEach((row: Component[], rowIndex: number) => {
        var childXOrigin = 0;
        row.forEach((component: Component, colIndex: number) => {
          // recursively compute layout
          if (component != null) {
            component.computeLayout(childXOrigin, childYOrigin, colWidths[colIndex], rowHeights[rowIndex]);
          }
          childXOrigin += colWidths[colIndex] + this.colPadding;
        });
        childYOrigin += rowHeights[rowIndex] + this.rowPadding;
      });
    }

    public isFixedWidth(): boolean {
      var cols = d3.transpose(this.rows);
      return Table.fixedSpace(cols, (c: Component) => (c == null) || c.isFixedWidth());
    }

    public isFixedHeight(): boolean {
      return Table.fixedSpace(this.rows, (c: Component) => (c == null) || c.isFixedHeight());
    }

    /**
     * Sets the row and column padding on the Table.
     *
     * @param {number} rowPadding The padding above and below each row, in pixels.
     * @param {number} colPadding the padding to the left and right of each column, in pixels.
     * @returns {Table} The calling Table.
     */
    public padding(rowPadding: number, colPadding: number) {
      this.rowPadding = rowPadding;
      this.colPadding = colPadding;
      this.invalidateLayout();
      return this;
    }

    public removeComponent(component: Component) {
      super.removeComponent(component);
      var rowpos: number;
      var colpos: number;
      outer : for (var i = 0; i < this.numRows; i++) {
        for (var j = 0; j < this.numCols; j++) {
          if (this.rows[i][j] === component) {
            rowpos = i;
            colpos = j;
            break outer;
          }
        }
      }

      if (rowpos !== undefined) {
        this.rows[rowpos][colpos] = null;
      }
    }

    public requestedSpace(offeredWidth: number, offeredHeight: number): _SpaceRequest {
      this.calculatedLayout = this.iterateLayout(offeredWidth , offeredHeight);
      return {width : d3.sum(this.calculatedLayout.guaranteedWidths ),
              height: d3.sum(this.calculatedLayout.guaranteedHeights),
              wantsWidth: this.calculatedLayout.wantsWidth,
              wantsHeight: this.calculatedLayout.wantsHeight};
    }

    /**
     * Sets the layout weight of a particular row.
     * Space is allocated to rows based on their weight. Rows with higher weights receive proportionally more space.
     *
     * A common case would be to have one row take up 2/3rds of the space,
     * and the other row take up 1/3rd.
     *
     * Example:
     *
     * ```JavaScript
     * plot = new Plottable.Component.Table([
     *  [row1],
     *  [row2]
     * ]);
     *
     * // assign twice as much space to the first row
     * plot
     *  .rowWeight(0, 2)
     *  .rowWeight(1, 1)
     * ```
     *
     * @param {number} index The index of the row.
     * @param {number} weight The weight to be set on the row.
     * @returns {Table} The calling Table.
     */
    public rowWeight(index: number, weight: number) {
      this.rowWeights[index] = weight;
      this.invalidateLayout();
      return this;
    }

    private static calcComponentWeights(setWeights: number[],
                                        componentGroups: Component[][],
                                        fixityAccessor: (c: Component) => boolean) {
      // If the row/col weight was explicitly set, then return it outright
      // If the weight was not explicitly set, then guess it using the heuristic that if all components are fixed-space
      // then weight is 0, otherwise weight is 1
      return setWeights.map((w, i) => {
        if (w != null) {
          return w;
        }
        var fixities = componentGroups[i].map(fixityAccessor);
        var allFixed = fixities.reduce((a, b) => a && b, true);
        return allFixed ? 0 : 1;
      });
    }

    private static calcProportionalSpace(weights: number[], freeSpace: number): number[] {
      var weightSum = d3.sum(weights);
      if (weightSum === 0) {
        return Utils.Methods.createFilledArray(0, weights.length);
      } else {
        return weights.map((w) => freeSpace * w / weightSum);
      }
    }

    private static fixedSpace(componentGroup: Component[][], fixityAccessor: (c: Component) => boolean) {
      var all = (bools: boolean[]) => bools.reduce((a, b) => a && b, true);
      var group_isFixed = (components: Component[]) => all(components.map(fixityAccessor));
      return all(componentGroup.map(group_isFixed));
    }

    private determineGuarantees(offeredWidths: number[], offeredHeights: number[]): _LayoutAllocation {
      var requestedWidths  = Utils.Methods.createFilledArray(0, this.numCols);
      var requestedHeights = Utils.Methods.createFilledArray(0, this.numRows);
      var layoutWantsWidth  = Utils.Methods.createFilledArray(false, this.numCols);
      var layoutWantsHeight = Utils.Methods.createFilledArray(false, this.numRows);
      this.rows.forEach((row: Component[], rowIndex: number) => {
        row.forEach((component: Component, colIndex: number) => {
          var spaceRequest: _SpaceRequest;
          if (component != null) {
            spaceRequest = component.requestedSpace(offeredWidths[colIndex], offeredHeights[rowIndex]);
          } else {
            spaceRequest = {width: 0, height: 0, wantsWidth: false, wantsHeight: false};
          }

          var allocatedWidth = Math.min(spaceRequest.width, offeredWidths[colIndex]);
          var allocatedHeight = Math.min(spaceRequest.height, offeredHeights[rowIndex]);

          requestedWidths [colIndex] = Math.max(requestedWidths [colIndex], allocatedWidth );
          requestedHeights[rowIndex] = Math.max(requestedHeights[rowIndex], allocatedHeight);
          layoutWantsWidth [colIndex] = layoutWantsWidth [colIndex] || spaceRequest.wantsWidth;
          layoutWantsHeight[rowIndex] = layoutWantsHeight[rowIndex] || spaceRequest.wantsHeight;
        });
      });
      return {guaranteedWidths : requestedWidths  ,
              guaranteedHeights: requestedHeights ,
              wantsWidthArr    : layoutWantsWidth ,
              wantsHeightArr   : layoutWantsHeight};
    }

    /*
     * Given availableWidth and availableHeight, figure out how to allocate it between rows and columns using an iterative algorithm.
     *
     * For both dimensions, keeps track of "guaranteedSpace", which the fixed-size components have requested, and
     * "proportionalSpace", which is being given to proportionally-growing components according to the weights on the table.
     * Here is how it works (example uses width but it is the same for height). First, columns are guaranteed no width, and
     * the free width is allocated to columns based on their colWeights. Then, in determineGuarantees, every component is
     * offered its column's width and may request some amount of it, which increases that column's guaranteed
     * width. If there are some components that were not satisfied with the width they were offered, and there is free
     * width that has not already been guaranteed, then the remaining width is allocated to the unsatisfied columns and the
     * algorithm runs again. If all components are satisfied, then the remaining width is allocated as proportional space
     * according to the colWeights.
     *
     * The guaranteed width for each column is monotonically increasing as the algorithm iterates. Since it is deterministic
     * and monotonically increasing, if the freeWidth does not change during an iteration it implies that no further progress
     * is possible, so the algorithm will not continue iterating on that dimension's account.
     *
     * If the algorithm runs more than 5 times, we stop and just use whatever we arrived at. It's not clear under what
     * circumstances this will happen or if it will happen at all. A message will be printed to the console if this occurs.
     *
     */
    private iterateLayout(availableWidth: number, availableHeight: number): _IterateLayoutResult {
      var rows = this.rows;
      var cols = d3.transpose(this.rows);
      var availableWidthAfterPadding  = availableWidth  - this.colPadding * (this.numCols - 1);
      var availableHeightAfterPadding = availableHeight - this.rowPadding * (this.numRows - 1);

      var rowWeights = Table.calcComponentWeights(this.rowWeights, rows, (c: Component) => (c == null) || c.isFixedHeight());
      var colWeights = Table.calcComponentWeights(this.colWeights,  cols, (c: Component) => (c == null) || c.isFixedWidth());

      // To give the table a good starting position to iterate from, we give the fixed-width components half-weight
      // so that they will get some initial space allocated to work with
      var heuristicColWeights = colWeights.map((c) => c === 0 ? 0.5 : c);
      var heuristicRowWeights = rowWeights.map((c) => c === 0 ? 0.5 : c);

      var colProportionalSpace = Table.calcProportionalSpace(heuristicColWeights, availableWidthAfterPadding );
      var rowProportionalSpace = Table.calcProportionalSpace(heuristicRowWeights, availableHeightAfterPadding);

      var guaranteedWidths  = Utils.Methods.createFilledArray(0, this.numCols);
      var guaranteedHeights = Utils.Methods.createFilledArray(0, this.numRows);

      var freeWidth: number;
      var freeHeight: number;

      var nIterations = 0;
      while (true) {
        var offeredHeights = Utils.Methods.addArrays(guaranteedHeights, rowProportionalSpace);
        var offeredWidths  = Utils.Methods.addArrays(guaranteedWidths,  colProportionalSpace);
        var guarantees = this.determineGuarantees(offeredWidths, offeredHeights);
        guaranteedWidths = guarantees.guaranteedWidths;
        guaranteedHeights = guarantees.guaranteedHeights;
        var wantsWidth  = guarantees.wantsWidthArr .some((x: boolean) => x);
        var wantsHeight = guarantees.wantsHeightArr.some((x: boolean) => x);

        var lastFreeWidth  = freeWidth ;
        var lastFreeHeight = freeHeight;
        freeWidth  = availableWidthAfterPadding  - d3.sum(guarantees.guaranteedWidths );
        freeHeight = availableHeightAfterPadding - d3.sum(guarantees.guaranteedHeights);
        var xWeights: number[];
        if (wantsWidth) { // If something wants width, divide free space between components that want more width
          xWeights = guarantees.wantsWidthArr.map((x) => x ? 0.1 : 0);
          xWeights = Utils.Methods.addArrays(xWeights, colWeights);
        } else { // Otherwise, divide free space according to the weights
          xWeights = colWeights;
        }

        var yWeights: number[];
        if (wantsHeight) {
          yWeights = guarantees.wantsHeightArr.map((x) => x ? 0.1 : 0);
          yWeights = Utils.Methods.addArrays(yWeights, rowWeights);
        } else {
          yWeights = rowWeights;
        }

        colProportionalSpace = Table.calcProportionalSpace(xWeights, freeWidth );
        rowProportionalSpace = Table.calcProportionalSpace(yWeights, freeHeight);
        nIterations++;

        var canImproveWidthAllocation  = freeWidth  > 0 && freeWidth  !== lastFreeWidth;
        var canImproveHeightAllocation = freeHeight > 0 && freeHeight !== lastFreeHeight;

        if (!(canImproveWidthAllocation || canImproveHeightAllocation)) {
          break;
        }

        if (nIterations > 5) {
          break;
        }
      }

      // Redo the proportional space one last time, to ensure we use the real weights not the wantsWidth/Height weights
      freeWidth  = availableWidthAfterPadding  - d3.sum(guarantees.guaranteedWidths );
      freeHeight = availableHeightAfterPadding - d3.sum(guarantees.guaranteedHeights);
      colProportionalSpace = Table.calcProportionalSpace(colWeights, freeWidth );
      rowProportionalSpace = Table.calcProportionalSpace(rowWeights, freeHeight);

      return {colProportionalSpace: colProportionalSpace,
              rowProportionalSpace: rowProportionalSpace,
              guaranteedWidths: guarantees.guaranteedWidths,
              guaranteedHeights: guarantees.guaranteedHeights,
              wantsWidth: wantsWidth,
              wantsHeight: wantsHeight};
    }

    private padTableToSize(nRows: number, nCols: number) {
      for (var i = 0; i < nRows; i++) {
        if (this.rows[i] === undefined) {
          this.rows[i] = [];
          this.rowWeights[i] = null;
        }
        for (var j = 0; j < nCols; j++) {
          if (this.rows[i][j] === undefined) {
            this.rows[i][j] = null;
          }
        }
      }
      for (j = 0; j < nCols; j++) {
        if (this.colWeights[j] === undefined) {
          this.colWeights[j] = null;
        }
      }
    }
  }
}
}
