///<reference path="../lib/d3.d.ts" />
///<reference path="../lib/lodash.d.ts" />
///<reference path="../lib/chai/chai.d.ts" />
///<reference path="../lib/chai/chai-assert.d.ts" />
///<reference path="utils.ts" />
///<reference path="component.ts" />


class Table extends Component {
  public rowPadding = 5;
  public colPadding = 5;
  public xMargin = 5;
  public yMargin = 5;

  private components: Component[];
  private tables: Table[];

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
      return this.minWidth;
    }
  }

  constructor(rows: Component[][], rowWeightVal=1, colWeightVal=1) {
    super();
    this.rows = rows;
    this.cols = d3.transpose(rows);
    this.nRows = this.rows.length;
    this.nCols = this.cols.length;
    this.components = <Component[]> _.flatten(this.rows);
    this.tables = <Table[]> this.components.filter((x) => x != null && x.computeLayout != null)
    super.rowWeight(rowWeightVal);
    super.colWeight(colWeightVal);
  }

  public computeLayout() {
    this.tables.forEach((t) => t.computeLayout());
    this.rowMinimums = this.rows.map((row: Component[]) => d3.max(row, (r: Component) => (r != null) ? r.rowMinimum() : 0));
    this.colMinimums = this.cols.map((col: Component[]) => d3.max(col, (r: Component) => (r != null) ? r.colMinimum() : 0));
    this.minWidth  = d3.sum(this.colMinimums) + this.colPadding * (this.cols.length - 1) + 2 * this.xMargin;
    this.minHeight = d3.sum(this.rowMinimums) + this.rowPadding * (this.rows.length - 1) + 2 * this.yMargin;

    this.rowWeights = this.rows.map((row: Component[]) => d3.max(row, (r: Component) => (r != null) ? r.rowWeight() : 0));
    this.colWeights = this.cols.map((col: Component[]) => d3.max(col, (r: Component) => (r != null) ? r.colWeight() : 0));
    this.rowWeightSum = d3.sum(this.rowWeights);
    this.colWeightSum = d3.sum(this.colWeights);
  }

  public render(element: D3.Selection, availableWidth: number, availableHeight: number) {
    var rect = element.append("rect");
    rect.attr("width", availableWidth).attr("height", availableHeight).classed("table-rect", true);
    chai.assert.operator(availableWidth, '>=', 0, "availableWidth is >= 0");
    chai.assert.operator(availableHeight, '>=', 0, "availableHeight is >= 0");
    this.computeLayout();
    var freeWidth = availableWidth - this.minWidth;
    var freeHeight = availableHeight - this.minHeight;

    if (freeWidth < 0 || freeHeight < 0) {throw "InsufficientSpaceError";}
    if (this.rowWeightSum === 0) {
      var nRows = this.rowWeights.length;
      var rowProportionalSpace = this.rowWeights.map((w) => freeHeight / nRows);
    } else {
      var rowProportionalSpace = this.rowWeights.map((w: number) => w / this.rowWeightSum * freeHeight);
    }
    if (this.colWeightSum === 0) {
      var nCols = this.colWeights.length;
      var colProportionalSpace = this.colWeights.map((w) => freeWidth / nCols);
    } else {
      var colProportionalSpace = this.colWeights.map((w: number) => w / this.colWeightSum * freeWidth);
    }
    var sumPair = (p: number[]) => p[0] + p[1];
    var rowHeights = d3.zip(rowProportionalSpace, this.rowMinimums).map(sumPair);
    var colWidths  = d3.zip(colProportionalSpace, this.colMinimums).map(sumPair);

    chai.assert.closeTo(d3.sum(rowHeights) + (this.nRows - 1) * this.rowPadding + 2 * this.yMargin, availableHeight, 1, "row heights sum to available height");
    chai.assert.closeTo(d3.sum(colWidths) + (this.nCols - 1) * this.colPadding + 2 * this.xMargin, availableWidth, 1, "col widths sum to available width");
    var yOffset = this.yMargin;
    this.rows.forEach((row: Component[], i) => {
      var xOffset = this.xMargin;
      row.forEach((component, j) => {
        if (component == null) {
          xOffset += colWidths[j];
          return;
        }
        Table.renderChild(element, component, xOffset, yOffset, colWidths[j], rowHeights[i]);
        xOffset += colWidths[j] + this.colPadding;
      });
      chai.assert.operator(xOffset - this.colPadding - this.xMargin, "<=", availableWidth, "final xOffset was <= availableWidth");
      yOffset += rowHeights[i] + this.rowPadding;
    });
    chai.assert.operator(yOffset - this.rowPadding - this.yMargin, "<=", availableHeight, "final xOffset was <= availableHeight");
  }

  private static renderChild(
    parentElement: D3.Selection,
    component: Component,
    xOffset: number,
    yOffset: number,
    width: number,
    height: number
  ) {
    var childElement = parentElement.append("g");
    Utils.translate(childElement, [xOffset, yOffset]);
    component.render(childElement, width, height);
  }



}
