///<reference path="../reference.ts" />

module Plottable {

  interface LayoutAllocation {
    guaranteedWidths : number[];
    guaranteedHeights: number[];
    wantsWidthArr : boolean[];
    wantsHeightArr: boolean[];
  }
  export class Table extends ComponentContainer {
    private rowPadding = 0;
    private colPadding = 0;

    private rows: Component[][];
    private minimumHeights: number[];
    private minimumWidths: number[];

    private rowWeights: number[];
    private colWeights: number[];

    private nRows: number;
    private nCols: number;

    /**
     * Creates a Table.
     *
     * @constructor
     * @param {Component[][]} [rows] A 2-D array of the Components to place in the table.
     * null can be used if a cell is empty.
     */
    constructor(rows: Component[][] = []) {
      super();
      this.classed("table", true);
      this.rows = rows;
      this.nRows = rows.length;
      this.nCols = rows.length > 0 ? d3.max(rows, (r) => r.length) : 0;
      this.rowWeights = this.rows.map((): any => null);
      this.colWeights = d3.transpose(this.rows).map((): any => null);
    }

    /**
     * Adds a Component in the specified cell.
     *
     * @param {number} row The row in which to add the Component.
     * @param {number} col The column in which to add the Component.
     * @param {Component} component The Component to be added.
     */
    public addComponent(row: number, col: number, component: Component): Table {
      this.nRows = Math.max(row + 1, this.nRows);
      this.nCols = Math.max(col + 1, this.nCols);
      this.padTableToSize(this.nRows, this.nCols);

      var currentComponent = this.rows[row][col];
      if (currentComponent != null) {
        throw new Error("Table.addComponent cannot be called on a cell where a component already exists (for the moment)");
      }

      this.rows[row][col] = component;
      this._addComponent(component);
      return this;
    }

    public _removeComponent(c: Component) {
      throw new Error("_removeComponent not yet implemented on Table");
      /* tslint:disable:no-unreachable */
      return this;
      /* tslint:enable:no-unreachable */
    }

    private iterateLayout(availableWidth : number, availableHeight: number) {
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
      var cols = d3.transpose(this.rows);
      var availableWidthAfterPadding  = availableWidth  - this.colPadding * (this.nCols - 1);
      var availableHeightAfterPadding = availableHeight - this.rowPadding * (this.nRows - 1);

      var rowWeights = Table.calcComponentWeights(this.rowWeights, this.rows, (c: Component) => (c == null) || c.isFixedHeight());
      var colWeights = Table.calcComponentWeights(this.colWeights,      cols, (c: Component) => (c == null) || c.isFixedWidth());

      // To give the table a good starting position to iterate from, we give the fixed-width components half-weight
      // so that they will get some initial space allocated to work with
      var heuristicColWeights = colWeights.map((c) => c === 0 ? 0.5 : c);
      var heuristicRowWeights = rowWeights.map((c) => c === 0 ? 0.5 : c);

      var colProportionalSpace = Table.calcProportionalSpace(heuristicColWeights, availableWidthAfterPadding );
      var rowProportionalSpace = Table.calcProportionalSpace(heuristicRowWeights, availableHeightAfterPadding);

      var guaranteedWidths  = Utils.createFilledArray(0, this.nCols);
      var guaranteedHeights = Utils.createFilledArray(0, this.nRows);

      var freeWidth : number;
      var freeHeight: number;

      var nIterations = 0;
      while (true) {
        var offeredHeights = Utils.addArrays(guaranteedHeights, rowProportionalSpace);
        var offeredWidths  = Utils.addArrays(guaranteedWidths,  colProportionalSpace);
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
          xWeights = guarantees.wantsWidthArr.map((x) => x ? 1 : 0);
        } else { // Otherwise, divide free space according to the weights
          xWeights = colWeights;
        }

        var yWeights: number[];
        if (wantsHeight) {
          yWeights = guarantees.wantsHeightArr.map((x) => x ? 1 : 0);
        } else {
          yWeights = rowWeights;
        }

        colProportionalSpace = Table.calcProportionalSpace(xWeights, freeWidth );
        rowProportionalSpace = Table.calcProportionalSpace(yWeights, freeHeight);
        nIterations++;

        var canImproveWidthAllocation  = freeWidth  > 0 && wantsWidth  && freeWidth  !== lastFreeWidth;
        var canImproveHeightAllocation = freeHeight > 0 && wantsHeight && freeHeight !== lastFreeHeight;

        if (!(canImproveWidthAllocation || canImproveHeightAllocation)) {
          break;
        }

        if (nIterations > 5) {
          console.log("More than 5 iterations in Table.iterateLayout; please report the circumstances");
          break;
        }
      }

      // Redo the proportional space one last time, to ensure we use the real weights not the wantsWidth/Height weights
      freeWidth  = availableWidthAfterPadding  - d3.sum(guarantees.guaranteedWidths );
      freeHeight = availableHeightAfterPadding - d3.sum(guarantees.guaranteedHeights);
      colProportionalSpace = Table.calcProportionalSpace(colWeights, freeWidth );
      rowProportionalSpace = Table.calcProportionalSpace(rowWeights, freeHeight);

      return {colProportionalSpace: colProportionalSpace        ,
              rowProportionalSpace: rowProportionalSpace        ,
              guaranteedWidths    : guarantees.guaranteedWidths ,
              guaranteedHeights   : guarantees.guaranteedHeights,
              wantsWidth          : wantsWidth                  ,
              wantsHeight         : wantsHeight                 };
    }

    private determineGuarantees(offeredWidths: number[], offeredHeights: number[]): LayoutAllocation {
      var requestedWidths  = Utils.createFilledArray(0, this.nCols);
      var requestedHeights = Utils.createFilledArray(0, this.nRows);
      var layoutWantsWidth  = Utils.createFilledArray(false, this.nCols);
      var layoutWantsHeight = Utils.createFilledArray(false, this.nRows);
      this.rows.forEach((row: Component[], rowIndex: number) => {
        row.forEach((component: Component, colIndex: number) => {
          var spaceRequest: ISpaceRequest;
          if (component != null) {
            spaceRequest = component._requestedSpace(offeredWidths[colIndex], offeredHeights[rowIndex]);
          } else {
            spaceRequest = {width: 0, height: 0, wantsWidth: false, wantsHeight: false};
          }
          if (spaceRequest.width > offeredWidths[colIndex] || spaceRequest.height > offeredHeights[rowIndex]) {
            throw new Error("Invariant Violation: Component cannot request more space than is offered");
          }

          requestedWidths [colIndex] = Math.max(requestedWidths [colIndex], spaceRequest.width );
          requestedHeights[rowIndex] = Math.max(requestedHeights[rowIndex], spaceRequest.height);
          layoutWantsWidth [colIndex] = layoutWantsWidth [colIndex] || spaceRequest.wantsWidth;
          layoutWantsHeight[rowIndex] = layoutWantsHeight[rowIndex] || spaceRequest.wantsHeight;
        });
      });
      return {guaranteedWidths : requestedWidths  ,
              guaranteedHeights: requestedHeights ,
              wantsWidthArr    : layoutWantsWidth ,
              wantsHeightArr   : layoutWantsHeight};
    }


    public _requestedSpace(offeredWidth : number, offeredHeight: number): ISpaceRequest {
      var layout = this.iterateLayout(offeredWidth , offeredHeight);
      return {width : d3.sum(layout.guaranteedWidths ),
              height: d3.sum(layout.guaranteedHeights),
              wantsWidth: layout.wantsWidth,
              wantsHeight: layout.wantsHeight};
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth ?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth , availableHeight);
      var layout = this.iterateLayout(this.availableWidth , this.availableHeight);

      var sumPair = (p: number[]) => p[0] + p[1];
      var rowHeights = Utils.addArrays(layout.rowProportionalSpace, layout.guaranteedHeights);
      var colWidths  = Utils.addArrays(layout.colProportionalSpace, layout.guaranteedWidths );
      var childYOffset = 0;
      this.rows.forEach((row: Component[], rowIndex: number) => {
        var childXOffset = 0;
        row.forEach((component: Component, colIndex: number) => {
          // recursively compute layout
          if (component != null) {
            component._computeLayout(childXOffset, childYOffset, colWidths[colIndex], rowHeights[rowIndex]);
          }
          childXOffset += colWidths[colIndex] + this.colPadding;
        });
        childYOffset += rowHeights[rowIndex] + this.rowPadding;
      });
      return this;
    }

    public _doRender() {
      // recursively render children
      this.rows.forEach((row: Component[], rowIndex: number) => {
        row.forEach((component: Component, colIndex: number) => {
          if (component != null) {
            component._doRender();
          }
        });
      });
      return this;
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
      this._invalidateLayout();
      return this;
    }

    /**
     * Sets the layout weight of a particular row.
     * Space is allocated to rows based on their weight. Rows with higher weights receive proportionally more space.
     *
     * @param {number} index The index of the row.
     * @param {number} weight The weight to be set on the row.
     * @returns {Table} The calling Table.
     */
    public rowWeight(index: number, weight: number) {
      this.rowWeights[index] = weight;
      this._invalidateLayout();
      return this;
    }

    /**
     * Sets the layout weight of a particular column.
     * Space is allocated to columns based on their weight. Columns with higher weights receive proportionally more space.
     *
     * @param {number} index The index of the column.
     * @param {number} weight The weight to be set on the column.
     * @returns {Table} The calling Table.
     */
    public colWeight(index: number, weight: number) {
      this.colWeights[index] = weight;
      this._invalidateLayout();
      return this;
    }

    public isFixedWidth(): boolean {
      var cols = d3.transpose(this.rows);
      return Table.fixedSpace(cols, (c: Component) => (c == null) || c.isFixedWidth());
    }

    public isFixedHeight(): boolean {
      return Table.fixedSpace(this.rows, (c: Component) => (c == null) || c.isFixedHeight());
    }

    private padTableToSize(nRows: number, nCols: number) {
      for (var i = 0; i<nRows; i++) {
        if (this.rows[i] === undefined) {
          this.rows[i] = [];
          this.rowWeights[i] = null;
        }
        for (var j = 0; j<nCols; j++) {
          if (this.rows[i][j] === undefined) {
            this.rows[i][j] = null;
          }
        }
      }
      for (j = 0; j<nCols; j++) {
        if (this.colWeights[j] === undefined) {
          this.colWeights[j] = null;
        }
      }
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
        var allFixed = fixities.reduce((a, b) => a && b);
        return allFixed ? 0 : 1;
      });
    }

    private static calcProportionalSpace(weights: number[], freeSpace: number): number[] {
      var weightSum = d3.sum(weights);
      if (weightSum === 0) {
        return Utils.createFilledArray(0, weights.length);
      } else {
        return weights.map((w) => freeSpace * w / weightSum);
      }
    }

    private static fixedSpace(componentGroup: Component[][], fixityAccessor: (c: Component) => boolean) {
      var all = (bools: boolean[]) => bools.reduce((a, b) => a && b);
      var groupIsFixed = (components: Component[]) => all(components.map(fixityAccessor));
      return all(componentGroup.map(groupIsFixed));
    }
  }
}
