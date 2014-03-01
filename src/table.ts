///<reference path="reference.ts" />

class Table extends Component {
  private static CSS_CLASS = "table";
  private rowPadding = 0;
  private colPadding = 0;

  private rows: Component[][];
  private cols: Component[][];
  private nRows: number;
  private nCols: number;
  private rowMinimums: number[];
  private colMinimums: number[];

  private rowWeights: number[];
  private colWeights: number[];

  private rowWeightSum: number;
  private colWeightSum: number;

  private guessRowWeight = true;
  private guessColWeight = true;

  constructor(rows: Component[][] = []) {
    super();
    this.classed(Table.CSS_CLASS, true);
    var cleanOutNulls = (c: Component) => c == null ? new Component() : c;
    rows = rows.map((row: Component[]) => row.map(cleanOutNulls));
    this.rows = rows;
    this.cols = d3.transpose(this.rows);
  }

  public addComponent(row: number, col: number, component: Component): Table {
    if (this.element != null) {
      throw new Error("addComponent cannot be called after anchoring (for the moment)");
    }

    this.padTableToSize(row + 1, col + 1);

    if (this.rows[row][col].constructor.name !== "Component") {
      // The bsae component is only used as a placeholder component
      throw new Error("addComponent cannot be called on a cell where a component already exists (for the moment)");
    }

    this.rows[row][col] = component;
    this.cols = d3.transpose(this.rows);
    return this;
  }

  private padTableToSize(nRows: number, nCols: number) {
    for (var i=0; i<nRows; i++) {
      if (this.rows[i] == undefined) {
        this.rows[i] = [];
      }
      for (var j=0; j<nCols; j++) {
        if (this.rows[i][j] == undefined) {
          this.rows[i][j] = new Component();
        }
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

    // distribute remaining height to rows
    var rowProportionalSpace = Table.rowProportionalSpace(this.rows, freeHeight);
    var colProportionalSpace = Table.colProportionalSpace(this.cols, freeWidth);

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

  private static rowProportionalSpace(rows: Component[][], freeHeight: number) {
    return Table.calculateProportionalSpace(rows, freeHeight, (c: Component) => c.rowWeight());
  }
  private static colProportionalSpace(cols: Component[][], freeWidth: number) {
    return Table.calculateProportionalSpace(cols, freeWidth, (c: Component) => c.colWeight());
  }
  private static calculateProportionalSpace(componentGroups: Component[][], freeSpace: number, spaceAccessor: (c: Component) => number) {
    var weights = componentGroups.map((group) => d3.max(group, spaceAccessor));
    var weightSum = d3.sum(weights);
    if (weightSum === 0) {
      var numGroups = componentGroups.length;
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

  public rowWeight(): number;
  public rowWeight(newVal: number): Table;
  public rowWeight(newVal?: number): any {
    if (newVal != null || !this.guessRowWeight) {
      this.guessRowWeight = false;
      return super.rowWeight(newVal);
    } else {
      var componentWeights: number[][] = this.rows.map((r) => r.map((c) => c.rowWeight()));
      var biggestWeight = d3.max(componentWeights.map((ws) => d3.max(ws)));
      return biggestWeight > 0 ? 1 : 0;
    }
  }

  public colWeight(): number;
  public colWeight(newVal: number): Table;
  public colWeight(newVal?: number): any {
    if (newVal != null || !this.guessColWeight) {
      this.guessColWeight = false;
      return super.colWeight(newVal);
    } else {
      var componentWeights: number[][] = this.rows.map((r) => r.map((c) => c.colWeight()));
      var biggestWeight = d3.max(componentWeights.map((ws) => d3.max(ws)));
      return biggestWeight > 0 ? 1 : 0;
    }
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
      this.colMinimums = this.cols.map((col: Component[]) => d3.max(col, (r: Component) => r.colMinimum()));
      return d3.sum(this.colMinimums) + this.colPadding * (this.cols.length - 1);
    }
  }

  public padding(rowPadding: number, colPadding: number) {
    this.rowPadding = rowPadding;
    this.colPadding = colPadding;
    return this;
  }
}
