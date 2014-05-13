///<reference path="../reference.ts" />

module Plottable {

  interface IComponentPosition {
    component: Component;
    row: number;
    col: number;
  }
  interface LayoutAllocation {
    xAllocations: number[];
    yAllocations: number[];
    unsatisfiedXArr: boolean[];
    unsatisfiedYArr: boolean[];
  }
  export class Table extends Component {
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
      if (this.element != null) {
        throw new Error("addComponent cannot be called after anchoring (for the moment)");
      }

      this.nRows = Math.max(row + 1, this.nRows);
      this.nCols = Math.max(col + 1, this.nCols);
      this.padTableToSize(this.nRows, this.nCols);

      var currentComponent = this.rows[row][col];
      if (currentComponent != null) {
        throw new Error("addComponent cannot be called on a cell where a component already exists (for the moment)");
      }

      this.rows[row][col] = component;
      return this;
    }

    public _anchor(element: D3.Selection) {
      super._anchor(element);
      // recursively anchor children
      this.rows.forEach((row: Component[], rowIndex: number) => {
        row.forEach((component: Component, colIndex: number) => {
          if (component != null) {
            component._anchor(this.content);
          }
        });
      });
      return this;
    }

    private determineAllocations(xAllocations: number[], yAllocations: number[],
      xProportionalSpace: number[], yProportionalSpace: number[]
    ): LayoutAllocation {
      var xRequested = Utils.repeat(0, this.nCols);
      var yRequested = Utils.repeat(0, this.nRows);
      var layoutUnsatisfiedX = Utils.repeat(false, this.nCols);
      var layoutUnsatisfiedY = Utils.repeat(false, this.nRows);
      this.rows.forEach((row: Component[], rowIndex: number) => {
        row.forEach((component: Component, colIndex: number) => {
          var x = xAllocations[colIndex] + xProportionalSpace[colIndex];
          var y = yAllocations[rowIndex] + yProportionalSpace[rowIndex];
          var requestedXY: IXYPacket = component != null
                    ? component.requestedXY(x, y)
                    : {x: 0, y: 0, unsatisfiedX: false, unsatisfiedY: false};
          if (requestedXY.x > x || requestedXY.y > y) {
            throw new Error("Invariant Violation: Component cannot request more space than is offered");
          }
          xRequested[colIndex] = Math.max(xRequested[colIndex], requestedXY.x);
          yRequested[rowIndex] = Math.max(yRequested[rowIndex], requestedXY.y);
          layoutUnsatisfiedX[colIndex] = layoutUnsatisfiedX[colIndex] || requestedXY.unsatisfiedX;
          layoutUnsatisfiedY[rowIndex] = layoutUnsatisfiedY[rowIndex] || requestedXY.unsatisfiedY;
        });
      });
      return {xAllocations: xRequested,
              yAllocations: yRequested,
              unsatisfiedXArr: layoutUnsatisfiedX,
              unsatisfiedYArr: layoutUnsatisfiedY}
    }


    /**
     * Given availableWidth and availableHeight, figure out how to allocate it between rows and columns using an iterative algorithm.
     *
     * For both dimensions, keeps track of "guaranteedSpace", which the fixed-size components have requested, and
     * "variableSpace", which is being given to proportionally-growing components according to the weights on the table.
     * Here is how it works (example uses width but it is the same for height). First, columns are guaranteed no width, and
     * the free width is allocated to columns based on their colWeights. Then, in determineAllocations, every component is
     * offered its column's width and may request some amount of it for rendering, which increases that column's guaranteed
     * width. If there are some components that were not satisfied with the width they were offered, and there is free
     * width that has not already been guaranteed, then the remaining width is allocated to the unsatisfied columns and the
     * algorithm runs again. If all components are satisfied, then the remaining width is allocated as proportional space
     * according to the colWeights.
     * The guaranteed width will monotonically increase in the number of iterations. We also stop the iteration if we see
     * that the freeWidth didn't change in the last run, since that implies that further iterations will not result in an
     * improved layout.
     * If the algorithm runs more than 5 times, we stop and just use whatever we arrived at. It's not clear under what
     * circumstances this will happen or if it will happen at all.
     *
     */
    private iterateLayout(availableX: number, availableY: number) {
      var cols = d3.transpose(this.rows);
      var availableXAfterPadding = availableX - this.colPadding * (this.nCols - 1);
      var availableYAfterPadding = availableY - this.rowPadding * (this.nRows - 1);


      var rowWeights = Table.calcComponentWeights(this.rowWeights, this.rows, (c: Component) => (c == null) || c.isFixedHeight());
      var colWeights = Table.calcComponentWeights(this.colWeights,      cols, (c: Component) => (c == null) || c.isFixedWidth());

      // To give the table a good starting position to iterate from, we give the fixed-width components half-weight
      // so that they will get some initial space allocated to work with
      var heuristicColWeights = colWeights.map((c) => c === 0 ? 0.5 : c);
      var heuristicRowWeights = rowWeights.map((c) => c === 0 ? 0.5 : c);

      var xProportionalSpace = Table.calcProportionalSpace(heuristicColWeights, availableXAfterPadding);
      var yProportionalSpace = Table.calcProportionalSpace(heuristicRowWeights, availableYAfterPadding);

      var xAllocations = Utils.repeat(0, this.nCols);
      var yAllocations = Utils.repeat(0, this.nRows);

      var freeX = availableXAfterPadding;
      var freeY = availableYAfterPadding;
      var lastFreeX = 0;
      var lastFreeY = 0;
      var unsatisfiedX = true;
      var unsatisfiedY = true;
      var id = (x: boolean) => x;

      var nIterations = 0;
      while ((freeX > 1 && unsatisfiedX && freeX !== lastFreeX) || (freeY > 1 && unsatisfiedY && freeY !== lastFreeY)) {
        var layout = this.determineAllocations(xAllocations, yAllocations, xProportionalSpace, yProportionalSpace)
        unsatisfiedX = layout.unsatisfiedXArr.some(id);
        unsatisfiedY = layout.unsatisfiedYArr.some(id);

        lastFreeX = freeX;
        lastFreeY = freeY;
        freeX = availableXAfterPadding - d3.sum(layout.xAllocations);
        freeY = availableYAfterPadding - d3.sum(layout.yAllocations);
        var xWeights: number[];
        if (unsatisfiedX) {
          xWeights = layout.unsatisfiedXArr.map((x) => x ? 1 : 0);
        } else {
          xWeights = colWeights;
        }

        var yWeights: number[];
        if (unsatisfiedY) {
          yWeights = layout.unsatisfiedYArr.map((x) => x ? 1 : 0);
        } else {
          yWeights = rowWeights;
        }

        xProportionalSpace = Table.calcProportionalSpace(xWeights, freeX);
        yProportionalSpace = Table.calcProportionalSpace(yWeights, freeY);
        nIterations++;

        if (nIterations > 5) {
          console.log("More than 5 iterations in Table.iterateLayout; please report the circumstances https://github.com/palantir/plottable/");
          break;
        }
      }
      return {xProportionalSpace: xProportionalSpace,
              yProportionalSpace: yProportionalSpace,
              xAllocations: layout.xAllocations,
              yAllocations: layout.yAllocations,
              unsatisfiedX: unsatisfiedX,
              unsatisfiedY: unsatisfiedY};
    }

    public requestedXY(availableX: number, availableY: number): IXYPacket {
      var layout = this.iterateLayout(availableX, availableY);
      return {x: d3.sum(layout.xAllocations),
              y: d3.sum(layout.yAllocations),
              unsatisfiedX: layout.unsatisfiedX,
              unsatisfiedY: layout.unsatisfiedY};
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableX?: number, availableY?: number) {
      super._computeLayout(xOffset, yOffset, availableX, availableY);
      var layout = this.iterateLayout(this.availableX, this.availableY);

      var sumPair = (p: number[]) => p[0] + p[1];
      var rowHeights = d3.zip(layout.yProportionalSpace, layout.yAllocations).map(sumPair);
      var colWidths  = d3.zip(layout.xProportionalSpace, layout.xAllocations).map(sumPair);
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
        var numGroups = weights.length;
        return weights.map((w) => freeSpace / numGroups);
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
