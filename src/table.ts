///<reference path="../lib/d3.d.ts" />
///<reference path="../lib/chai/chai.d.ts" />
///<reference path="../lib/chai/chai-assert.d.ts" />
///<reference path="utils.ts" />


class Table implements IRenderable {
  public className: string;

  private rows: IRenderable[][];
  private cols: IRenderable[][];
  private rowMinimums: number[];
  private colMinimums: number[];

  private minHeight: number;
  private minWidth : number;

  private rowWeights: number[];
  private colWeights: number[];

  private rowWeightVal: number;
  private colWeightVal: number;

  private rowWeightSum: number;
  private colWeightSum: number;

  /* Getters */
  public rowMinimum() {return this.minHeight;}
  public colMinimum() {return this.minWidth;}

  /* GetterSetters */
  public rowWeight(newVal: number=null): number {
    if (newVal != null) {this.rowWeightVal = newVal;}
    return this.rowWeightVal;
  }

  public colWeight(newVal: number=null): number {
    if (newVal != null) {this.colWeightVal = newVal;}
    return this.colWeightVal;
  }

  constructor(rows: IRenderable[][], rowWeightVal=0, colWeightVal=0) {
    this.rows = rows;
    this.cols = d3.transpose(rows);
    this.rowWeightVal = rowWeightVal;
    this.colWeightVal = colWeightVal;
    this.className = "table";
  }

  private computeLayout() {
    this.rowMinimums = this.rows.map((row: IRenderable[]) => d3.max(row, (r: IRenderable) => (r != null) ? r.rowMinimum() : 0));
    this.colMinimums = this.cols.map((col: IRenderable[]) => d3.max(col, (r: IRenderable) => (r != null) ? r.colMinimum() : 0));
    this.minWidth  = d3.sum(this.rowMinimums);
    this.minHeight = d3.sum(this.colMinimums);

    this.rowWeights = this.rows.map((row: IRenderable[]) => d3.max(row, (r: IRenderable) => (r != null) ? r.rowWeight() : 0));
    this.colWeights = this.cols.map((col: IRenderable[]) => d3.max(col, (r: IRenderable) => (r != null) ? r.colWeight() : 0));
    this.rowWeightSum = d3.sum(this.rowWeights);
    this.colWeightSum = d3.sum(this.colWeights);
  }

  public render(element: D3.Selection, availableWidth: number, availableHeight: number) {
    chai.assert.operator(availableWidth, '>=', 0, "availableWidth is >= 0");
    chai.assert.operator(availableHeight, '>=', 0, "availableHeight is >= 0");
    this.computeLayout();
    var freeWidth = availableWidth - this.minWidth;
    var freeHeight = availableHeight - this.minHeight;

    if (freeWidth < 0 || freeHeight < 0) {throw "InsufficientSpaceError";}
    var rowProportionalSpace = this.rowWeights.map((w: number) => w / this.rowWeightSum * availableHeight);
    var colProportionalSpace = this.colWeights.map((w: number) => w / this.colWeightSum * availableWidth);
    var sumPair = (p: number[]) => p[0] + p[1];
    var rowHeights = d3.zip(rowProportionalSpace, this.rowMinimums).map(sumPair);
    var colWidths  = d3.zip(colProportionalSpace, this.colMinimums).map(sumPair);

    var yOffset = 0;
    this.rows.forEach((row: IRenderable[], i) => {
      var xOffset = 0;
      row.forEach((renderable, j) => {
        if (renderable == null) {
          return;
        }
        Table.renderChild(element, renderable, xOffset, yOffset, rowHeights[i], colWidths[j]);
        xOffset += colWidths[j];
      });
      yOffset += rowHeights[i];
    });
  }

  private static renderChild(
    parentElement: D3.Selection,
    renderable: IRenderable,
    xOffset: number,
    yOffset: number,
    width: number,
    height: number
  ) {
    var childElement = parentElement.append("g").classed(renderable.className, true);
    Utils.translate(childElement, [xOffset, yOffset]);
    renderable.render(childElement, width, height);
  }



}
