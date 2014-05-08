///<reference path="../reference.ts" />

module Plottable {

  interface IComponentPosition {
    component: Component;
    row: number;
    col: number;
  }
  interface LayoutIteration {
    xAllocations: number[];
    yAllocations: number[];
    unsatisfiedComponents: IComponentPosition[];

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

      this.nRows = Math.max(row, this.nRows);
      this.nCols = Math.max(col, this.nCols);
      this.padTableToSize(this.nRows + 1, this.nCols + 1);

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

    private determineAllocations(unsatisfied: IComponentPosition[],
      xAllocations: number[], yAllocations: number[],
      xProportionalSpace: number[], yProportionalSpace: number[]
    ) {
      var nextIterationUnsatisfied: IComponentPosition[] = [];
      var xRequested = Utils.repeat(0, this.nCols);
      var yRequested = Utils.repeat(0, this.nRows);
      unsatisfied.forEach((u) => {
        var x = xAllocations[u.col] + xProportionalSpace[u.col];
        var y = yAllocations[u.row] + yProportionalSpace[u.row];
        var requestedXY = u.component != null ? u.component.requestedXY(x, y) : [0, 0];
        xRequested[u.col] = Math.max(xRequested[u.col], requestedXY[0]);
        yRequested[u.row] = Math.max(yRequested[u.row], requestedXY[1]);
        var unsatisfiedX = u.component != null && u.component.isFixedWidth()  && requestedXY[0] === x;
        var unsatisfiedY = u.component != null && u.component.isFixedHeight() && requestedXY[1] === y;
        if (unsatisfiedX || unsatisfiedY) {
          nextIterationUnsatisfied.push(u);
        }
      });
      return {xAllocations: xRequested, yAllocations: yRequested, unsatisfiedComponents: nextIterationUnsatisfied}
    }

    private generateComponentPositions() {
      var out: IComponentPosition[] = [];
      this.rows.forEach((row: Component[], rowIndex: number) => {
        row.forEach((component: Component, colIndex: number) => {
          out.push({component: component, row: rowIndex, col: colIndex});
        });
      });
      return out;
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableX?: number, availableY?: number) {
      super._computeLayout(xOffset, yOffset, availableX, availableY);

      var cols = d3.transpose(this.rows);
      var rowWeights = Table.calcComponentWeights(this.rowWeights, this.rows, (c: Component) => (c == null) || c.isFixedHeight());
      var colWeights = Table.calcComponentWeights(this.colWeights,      cols, (c: Component) => (c == null) || c.isFixedWidth());

      var heuristicColWeights = colWeights.map((c) => c === 0 ? 0.5 : c);
      var heuristicRowWeights = rowWeights.map((c) => c === 0 ? 0.5 : c);

      var xProportionalSpace = Table.calcProportionalSpace(heuristicColWeights, this.availableX);
      var yProportionalSpace = Table.calcProportionalSpace(heuristicRowWeights, this.availableY);

      var xAllocations = Utils.repeat(0, this.nCols);
      var yAllocations = Utils.repeat(0, this.nRows);
      var unsatisfied = this.generateComponentPositions();

      var freeX = this.availableX - d3.sum(xAllocations);
      var freeY = this.availableY - d3.sum(yAllocations);

      var nIterations = 0;
      while ((freeX > 0 || freeY > 0) && unsatisfied.length > 0) {
        var layout = this.determineAllocations(unsatisfied, xAllocations, yAllocations, xProportionalSpace, yProportionalSpace)
        unsatisfied = layout.unsatisfiedComponents;
        xAllocations = layout.xAllocations;
        yAllocations = layout.yAllocations;

        freeX = this.availableX - d3.sum(xAllocations);
        freeY = this.availableY - d3.sum(yAllocations);
        xProportionalSpace = Table.calcProportionalSpace(colWeights, freeX);
        yProportionalSpace = Table.calcProportionalSpace(rowWeights, freeY);
        nIterations++;

        if (freeX < 0 || freeY < 0) {
          throw new Error("Insufficient Space");
        }
      }

      var sumPair = (p: number[]) => p[0] + p[1];
      var rowHeights = d3.zip(yProportionalSpace, yAllocations).map(sumPair);
      var colWidths  = d3.zip(xProportionalSpace, xAllocations).map(sumPair);
      console.log(rowHeights, colWidths);
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

    public minimumHeight(): number;
    public minimumHeight(newVal: number): Table;
    public minimumHeight(newVal?: number): any {
      if (newVal != null) {
        throw new Error("minimumHeight cannot be directly set on Table");
      } else {
        this.minimumHeights = this.rows.map((row: Component[]) => d3.max(row, (r: Component) => (r == null) ? 0 : r.minimumHeight()));
        return d3.sum(this.minimumHeights) + this.rowPadding * (this.rows.length - 1);
      }
    }

    public minimumWidth(): number;
    public minimumWidth(newVal: number): Table;
    public minimumWidth(newVal?: number): any {
      if (newVal != null) {
        throw new Error("minimumWidth cannot be directly set on Table");
      } else {
        var cols = d3.transpose(this.rows);
        this.minimumWidths = cols.map((col: Component[]) => d3.max(col, (c: Component) => (c == null) ? 0 : c.minimumWidth()));
        return d3.sum(this.minimumWidths) + this.colPadding * (cols.length - 1);
      }
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
