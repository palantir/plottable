///<reference path="../reference.ts" />

module Plottable {
export module Component {
  interface _LayoutAllocation {
    guaranteedWidths : number[];
    guaranteedHeights: number[];
    wantsWidthArr : boolean[];
    wantsHeightArr: boolean[];
  }

  export interface _IterateLayoutResult {
    colProportionalSpace: number[];
    rowProportionalSpace: number[];
    guaranteedWidths    : number[];
    guaranteedHeights   : number[];
    wantsWidth          : boolean;
    wantsHeight         : boolean;
  };

  export class Table extends AbstractComponentContainer {
    private _rowPadding = 0;
    private _colPadding = 0;

    private _rows: AbstractComponent[][] = [];

    private _rowWeights: number[] = [];
    private _colWeights: number[] = [];

    private _nRows = 0;
    private _nCols = 0;

    private _calculatedLayout: _IterateLayoutResult = null;

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
    constructor(rows: AbstractComponent[][] = []) {
      super();
      this.classed("table", true);
      rows.forEach((row, rowIndex) => {
        row.forEach((component, colIndex) => {
          this.addComponent(rowIndex, colIndex, component);
        });
      });
    }

    /**
     * Adds a Component in the specified cell. The cell must be unoccupied.
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
    public addComponent(row: number, col: number, component: AbstractComponent): Table {
      if (this._addComponent(component)) {
        this._nRows = Math.max(row + 1, this._nRows);
        this._nCols = Math.max(col + 1, this._nCols);
        this._padTableToSize(this._nRows, this._nCols);

        var currentComponent = this._rows[row][col];
        if (currentComponent) {
          throw new Error("Table.addComponent cannot be called on a cell where a component already exists (for the moment)");
        }

        this._rows[row][col] = component;
      }
      return this;
    }

    public _removeComponent(component: AbstractComponent) {
      super._removeComponent(component);
      var rowpos: number;
      var colpos: number;
      outer : for (var i = 0; i < this._nRows; i++) {
        for (var j = 0; j < this._nCols; j++) {
          if (this._rows[i][j] === component) {
            rowpos = i;
            colpos = j;
            break outer;
          }
        }
      }

      if (rowpos !== undefined) {
        this._rows[rowpos][colpos] = null;
      }
    }

    private _iterateLayout(availableWidth : number, availableHeight: number): _IterateLayoutResult {
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
      var rows = this._rows;
      var cols = d3.transpose(this._rows);
      var availableWidthAfterPadding  = availableWidth  - this._colPadding * (this._nCols - 1);
      var availableHeightAfterPadding = availableHeight - this._rowPadding * (this._nRows - 1);

      var rowWeights = Table._calcComponentWeights(this._rowWeights, rows, (c: AbstractComponent) => (c == null) || c._isFixedHeight());
      var colWeights = Table._calcComponentWeights(this._colWeights,  cols, (c: AbstractComponent) => (c == null) || c._isFixedWidth());

      // To give the table a good starting position to iterate from, we give the fixed-width components half-weight
      // so that they will get some initial space allocated to work with
      var heuristicColWeights = colWeights.map((c) => c === 0 ? 0.5 : c);
      var heuristicRowWeights = rowWeights.map((c) => c === 0 ? 0.5 : c);

      var colProportionalSpace = Table._calcProportionalSpace(heuristicColWeights, availableWidthAfterPadding );
      var rowProportionalSpace = Table._calcProportionalSpace(heuristicRowWeights, availableHeightAfterPadding);

      var guaranteedWidths  = _Util.Methods.createFilledArray(0, this._nCols);
      var guaranteedHeights = _Util.Methods.createFilledArray(0, this._nRows);

      var freeWidth : number;
      var freeHeight: number;

      var nIterations = 0;
      while (true) {
        var offeredHeights = _Util.Methods.addArrays(guaranteedHeights, rowProportionalSpace);
        var offeredWidths  = _Util.Methods.addArrays(guaranteedWidths,  colProportionalSpace);
        var guarantees = this._determineGuarantees(offeredWidths, offeredHeights);
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
          xWeights = _Util.Methods.addArrays(xWeights, colWeights);
        } else { // Otherwise, divide free space according to the weights
          xWeights = colWeights;
        }

        var yWeights: number[];
        if (wantsHeight) {
          yWeights = guarantees.wantsHeightArr.map((x) => x ? 0.1 : 0);
          yWeights = _Util.Methods.addArrays(yWeights, rowWeights);
        } else {
          yWeights = rowWeights;
        }

        colProportionalSpace = Table._calcProportionalSpace(xWeights, freeWidth );
        rowProportionalSpace = Table._calcProportionalSpace(yWeights, freeHeight);
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
      colProportionalSpace = Table._calcProportionalSpace(colWeights, freeWidth );
      rowProportionalSpace = Table._calcProportionalSpace(rowWeights, freeHeight);

      return {colProportionalSpace: colProportionalSpace        ,
              rowProportionalSpace: rowProportionalSpace        ,
              guaranteedWidths    : guarantees.guaranteedWidths ,
              guaranteedHeights   : guarantees.guaranteedHeights,
              wantsWidth          : wantsWidth                  ,
              wantsHeight         : wantsHeight                 };
    }

    private _determineGuarantees(offeredWidths: number[], offeredHeights: number[]): _LayoutAllocation {
      var requestedWidths  = _Util.Methods.createFilledArray(0, this._nCols);
      var requestedHeights = _Util.Methods.createFilledArray(0, this._nRows);
      var layoutWantsWidth  = _Util.Methods.createFilledArray(false, this._nCols);
      var layoutWantsHeight = _Util.Methods.createFilledArray(false, this._nRows);
      this._rows.forEach((row: AbstractComponent[], rowIndex: number) => {
        row.forEach((component: AbstractComponent, colIndex: number) => {
          var spaceRequest: _SpaceRequest;
          if (component != null) {
            spaceRequest = component._requestedSpace(offeredWidths[colIndex], offeredHeights[rowIndex]);
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


    public _requestedSpace(offeredWidth : number, offeredHeight: number): _SpaceRequest {
      this._calculatedLayout = this._iterateLayout(offeredWidth , offeredHeight);
      return {width : d3.sum(this._calculatedLayout.guaranteedWidths ),
              height: d3.sum(this._calculatedLayout.guaranteedHeights),
              wantsWidth: this._calculatedLayout.wantsWidth,
              wantsHeight: this._calculatedLayout.wantsHeight};
    }

    // xOffset is relative to parent element, not absolute
    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth ?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth , availableHeight);
      var layout = this._useLastCalculatedLayout() ? this._calculatedLayout : this._iterateLayout(this.width(), this.height());

      this._useLastCalculatedLayout(true);

      var childYOffset = 0;
      var rowHeights = _Util.Methods.addArrays(layout.rowProportionalSpace, layout.guaranteedHeights);
      var colWidths  = _Util.Methods.addArrays(layout.colProportionalSpace, layout.guaranteedWidths );
      this._rows.forEach((row: AbstractComponent[], rowIndex: number) => {
        var childXOffset = 0;
        row.forEach((component: AbstractComponent, colIndex: number) => {
          // recursively compute layout
          if (component != null) {
            component._computeLayout(childXOffset, childYOffset, colWidths[colIndex], rowHeights[rowIndex]);
          }
          childXOffset += colWidths[colIndex] + this._colPadding;
        });
        childYOffset += rowHeights[rowIndex] + this._rowPadding;
      });
    }

    /**
     * Sets the row and column padding on the Table.
     *
     * @param {number} rowPadding The padding above and below each row, in pixels.
     * @param {number} colPadding the padding to the left and right of each column, in pixels.
     * @returns {Table} The calling Table.
     */
    public padding(rowPadding: number, colPadding: number) {
      this._rowPadding = rowPadding;
      this._colPadding = colPadding;
      this._invalidateLayout();
      return this;
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
      this._rowWeights[index] = weight;
      this._invalidateLayout();
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
      this._colWeights[index] = weight;
      this._invalidateLayout();
      return this;
    }

    public _isFixedWidth(): boolean {
      var cols = d3.transpose(this._rows);
      return Table._fixedSpace(cols, (c: AbstractComponent) => (c == null) || c._isFixedWidth());
    }

    public _isFixedHeight(): boolean {
      return Table._fixedSpace(this._rows, (c: AbstractComponent) => (c == null) || c._isFixedHeight());
    }

    private _padTableToSize(nRows: number, nCols: number) {
      for (var i = 0; i<nRows; i++) {
        if (this._rows[i] === undefined) {
          this._rows[i] = [];
          this._rowWeights[i] = null;
        }
        for (var j = 0; j<nCols; j++) {
          if (this._rows[i][j] === undefined) {
            this._rows[i][j] = null;
          }
        }
      }
      for (j = 0; j<nCols; j++) {
        if (this._colWeights[j] === undefined) {
          this._colWeights[j] = null;
        }
      }
    }

    private static _calcComponentWeights(setWeights: number[],
                                        componentGroups: AbstractComponent[][],
                                        fixityAccessor: (c: AbstractComponent) => boolean) {
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

    private static _calcProportionalSpace(weights: number[], freeSpace: number): number[] {
      var weightSum = d3.sum(weights);
      if (weightSum === 0) {
        return _Util.Methods.createFilledArray(0, weights.length);
      } else {
        return weights.map((w) => freeSpace * w / weightSum);
      }
    }

    private static _fixedSpace(componentGroup: AbstractComponent[][], fixityAccessor: (c: AbstractComponent) => boolean) {
      var all = (bools: boolean[]) => bools.reduce((a, b) => a && b, true);
      var group_isFixed = (components: AbstractComponent[]) => all(components.map(fixityAccessor));
      return all(componentGroup.map(group_isFixed));
    }
  }
}
}
