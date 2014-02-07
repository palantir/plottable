///<reference path="reference.ts" />

class Table extends Component {
  public rowPadding = 0;
  public colPadding = 0;
  public xMargin = 0;
  public yMargin = 0;
  private CLASS_TABLE_CONTAINER = "table-container";

  private rows: Component[][];
  private cols: Component[][];
  private nRows: number;
  private nCols: number;
  private rowMinimums: number[];
  private colMinimums: number[];

  private minHeight: number;
  private minWidth : number;

  private rowWeights: number[];
  private colWeights: number[];

  private rowWeightSum: number;
  private colWeightSum: number;

  /* Getters */
  public rowMinimum(): number;
  public rowMinimum(newVal: number): Component;
  public rowMinimum(newVal?: number): any {
    if (newVal != null) {
      throw new Error("Row minimum cannot be directly set on Table.");
      return this;
    } else {
      this.rowMinimums = this.rows.map((row: Component[]) => d3.max(row, (r: Component) => r.rowMinimum()));
      this.minHeight = d3.sum(this.rowMinimums) + this.rowPadding * (this.rows.length - 1) + 2 * this.yMargin;
      return this.minHeight;
    }
  }

  public colMinimum(): number;
  public colMinimum(newVal: number): Component;
  public colMinimum(newVal?: number): any {
    if (newVal != null) {
      throw new Error("Col minimum cannot be directly set on Table.");
      return this;
    } else {
      this.colMinimums = this.cols.map((col: Component[]) => d3.max(col, (r: Component) => r.colMinimum()));
      this.minWidth  = d3.sum(this.colMinimums) + this.colPadding * (this.cols.length - 1) + 2 * this.xMargin;
      return this.minWidth;
    }
  }

  constructor(rows: Component[][], rowWeightVal=1, colWeightVal=1) {
    super();
    // Clean out any null components and replace them with base Components
    var cleanOutNulls = (c: Component) => c == null ? new Component() : c;
    rows = rows.map((row: Component[]) => row.map(cleanOutNulls));
    this.rows = rows;
    this.cols = d3.transpose(rows);
    this.nRows = this.rows.length;
    this.nCols = this.cols.length;
    this.classed(this.CLASS_TABLE_CONTAINER, true);
    super.rowWeight(rowWeightVal).colWeight(colWeightVal);
  }

  public anchor(element: D3.Selection) {
    super.anchor(element);
    // recursively anchor children
    this.rows.forEach((row: Component[], rowIndex: number) => {
      row.forEach((component: Component, colIndex: number) => {
        component.anchor(this.element.append("g"));
      });
    });
  }

  public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(xOffset, yOffset, availableWidth, availableHeight);

    // calculate the amount of free space by recursive col-/row- Minimum() calls
    var freeWidth = this.availableWidth - this.colMinimum();
    var freeHeight = this.availableHeight - this.rowMinimum();
    if (freeWidth < 0 || freeHeight < 0) {
      throw "InsufficientSpaceError";
    }

    // distribute remaining height to rows
    var rowProportionalSpace = Table.rowProportionalSpace(this.rows, freeHeight);
    var colProportionalSpace = Table.colProportionalSpace(this.cols, freeWidth);

    var sumPair = (p: number[]) => p[0] + p[1];
    var rowHeights = d3.zip(rowProportionalSpace, this.rowMinimums).map(sumPair);
    var colWidths  = d3.zip(colProportionalSpace, this.colMinimums).map(sumPair);
    chai.assert.closeTo(d3.sum(rowHeights) + (this.nRows - 1) * this.rowPadding + 2 * this.yMargin, this.availableHeight, 1, "row heights sum to available height");
    chai.assert.closeTo(d3.sum(colWidths ) + (this.nCols - 1) * this.colPadding + 2 * this.xMargin, this.availableWidth , 1, "col widths sum to available width");

    var childYOffset = this.yMargin;
    this.rows.forEach((row: Component[], rowIndex: number) => {
      var childXOffset = this.xMargin;
      row.forEach((component: Component, colIndex: number) => {
        // recursively compute layout
        component.computeLayout(childXOffset, childYOffset, colWidths[colIndex], rowHeights[rowIndex]);
        childXOffset += colWidths[colIndex] + this.colPadding;
      });
      chai.assert.operator(childXOffset - this.colPadding - this.xMargin, "<=", this.availableWidth + 0.1, "final xOffset was <= availableWidth");
      childYOffset += rowHeights[rowIndex] + this.rowPadding;
    });
    chai.assert.operator(childYOffset - this.rowPadding - this.yMargin, "<=", this.availableHeight + 0.1, "final yOffset was <= availableHeight");
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
    if (weightSum == 0) {
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
  }
}
