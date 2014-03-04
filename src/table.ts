///<reference path="reference.ts" />

class Table extends Component {
  private static CSS_CLASS = "table";
  private rowPadding = 0;
  private colPadding = 0;

  private rows: Component[][];
  private rowMinimums: number[];
  private colMinimums: number[];

  private rowWeights: number[];
  private colWeights: number[];


  constructor(rows: Component[][] = []) {
    super();
    this.classed(Table.CSS_CLASS, true);
    var cleanOutNulls = (c: Component) => c == null ? new Component() : c;
    rows = rows.map((row: Component[]) => row.map(cleanOutNulls));
    this.rows = rows;
    this.rowWeights = this.rows.map(() => null);
    this.colWeights = d3.transpose(this.rows).map(() => null);
  }

  public addComponent(row: number, col: number, component: Component): Table {
    if (this.element != null) {
      throw new Error("addComponent cannot be called after anchoring (for the moment)");
    }

    this.padTableToSize(row + 1, col + 1);

    var currentComponent = <any> this.rows[row][col];
    if (currentComponent.constructor.name !== "Component") {
      // The bsae component is only used as a placeholder component
      throw new Error("addComponent cannot be called on a cell where a component already exists (for the moment)");
    }

    this.rows[row][col] = component;
    return this;
  }

  private padTableToSize(nRows: number, nCols: number) {
    for (var i=0; i<nRows; i++) {
      if (this.rows[i] === undefined) {
        this.rows[i] = [];
        this.rowWeights[i] = null;
      }
      for (var j=0; j<nCols; j++) {
        if (this.rows[i][j] === undefined) {
          this.rows[i][j] = new Component();
        }
      }
    }
    for (j=0; j<nCols; j++) {
      if (this.colWeights[j] === undefined) {
        this.colWeights[j] = null;
      }
    }
  }

  public anchor(element: D3.Selection) {
    super.anchor(element);
    // recursively anchor children
    this.rows.forEach((row: Component[], rowIndex: number) => {
      row.forEach((component: Component, colIndex: number) => {
        component.anchor(this.element.append("g"));
      });
    });
    return this;
  }

  public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(xOffset, yOffset, availableWidth, availableHeight);

    // calculate the amount of free space by recursive col-/row- Minimum() calls
    var freeWidth = this.availableWidth - this.colMinimum();
    var freeHeight = this.availableHeight - this.rowMinimum();
    if (freeWidth < 0 || freeHeight < 0) {
      throw new Error("Insufficient Space");
    }

    var cols = d3.transpose(this.rows);
    var rowWeights = Table.calcComponentWeights(this.rowWeights, this.rows, (c: Component) => c.isFixedHeight());
    var colWeights = Table.calcComponentWeights(this.colWeights,      cols, (c: Component) => c.isFixedWidth());
    // distribute remaining height to rows
    var rowProportionalSpace = Table.calcProportionalSpace(rowWeights, freeHeight);
    var colProportionalSpace = Table.calcProportionalSpace(colWeights, freeWidth);

    var sumPair = (p: number[]) => p[0] + p[1];
    var rowHeights = d3.zip(rowProportionalSpace, this.rowMinimums).map(sumPair);
    var colWidths  = d3.zip(colProportionalSpace, this.colMinimums).map(sumPair);

    var childYOffset = 0;
    this.rows.forEach((row: Component[], rowIndex: number) => {
      var childXOffset = 0;
      row.forEach((component: Component, colIndex: number) => {
        // recursively compute layout
        component.computeLayout(childXOffset, childYOffset, colWidths[colIndex], rowHeights[rowIndex]);
        childXOffset += colWidths[colIndex] + this.colPadding;
      });
      childYOffset += rowHeights[rowIndex] + this.rowPadding;
    });
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

  public render() {
    // recursively render children
    this.rows.forEach((row: Component[], rowIndex: number) => {
      row.forEach((component: Component, colIndex: number) => {
        component.render();
      });
    });
    return this;
  }

  /* Getters */

  public rowWeight(index: number, weight: number) {
    this.rowWeights[index] = weight;
    return this;
  }

  public colWeight(index: number, weight: number) {
    this.colWeights[index] = weight;
    return this;
  }

  public rowMinimum(): number;
  public rowMinimum(newVal: number): Table;
  public rowMinimum(newVal?: number): any {
    if (newVal != null) {
      throw new Error("Row minimum cannot be directly set on Table");
    } else {
      this.rowMinimums = this.rows.map((row: Component[]) => d3.max(row, (r: Component) => r.rowMinimum()));
      return d3.sum(this.rowMinimums) + this.rowPadding * (this.rows.length - 1);
    }
  }

  public colMinimum(): number;
  public colMinimum(newVal: number): Table;
  public colMinimum(newVal?: number): any {
    if (newVal != null) {
      throw new Error("Col minimum cannot be directly set on Table");
    } else {
      var cols = d3.transpose(this.rows);
      this.colMinimums = cols.map((col: Component[]) => d3.max(col, (r: Component) => r.colMinimum()));
      return d3.sum(this.colMinimums) + this.colPadding * (cols.length - 1);
    }
  }

  public padding(rowPadding: number, colPadding: number) {
    this.rowPadding = rowPadding;
    this.colPadding = colPadding;
    return this;
  }

  private static fixedSpace(componentGroup: Component[][], fixityAccessor: (c: Component) => boolean) {
    var all = (bools: boolean[]) => bools.reduce((a, b) => a && b);
    var groupIsFixed = (components: Component[]) => all(components.map(fixityAccessor));
    return all(componentGroup.map(groupIsFixed));
  }

  public isFixedWidth(): boolean {
    var cols = d3.transpose(this.rows);
    return Table.fixedSpace(cols, (c: Component) => c.isFixedWidth());
  }

  public isFixedHeight(): boolean {
    return Table.fixedSpace(this.rows, (c: Component) => c.isFixedHeight());
  }
}
