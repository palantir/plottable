///<reference path="../lib/d3.d.ts" />

interface IRenderable {
  render: (element: D3.Selection, width: number, height: number) => ();

  rowWeight: (newVal?: number) => number;
  colWeight: (newVal?: number) => number;
  rowMinimum: () => number;
  colMinimum: () => number;

}

class Table implements IRenderable {
  private rows: IRenderable[][];
  private cols: IRenderable[][];
  private rowMinimums: number[];
  private colMinimums: number[];

  private minHeight: number;
  private minWidth : number;

  private rowWeights: number[];
  private colWeights: number[];

  private rowWeight: number;
  private colWeight: number;

  private rowWeightSum: number;
  private colWeightSum: number;

  /* Getters */
  public rowMinimum() {return this.minHeight;}
  public colMinimum() {return this.minWidth;}

  /* GetterSetters */
  public rowWeight(newVal=null) {
    if (newVal != null) {this.rowWeight = newVal;}
    return this.rowWeight;
  }

  public colWeight(newVal=null) {
    if (newVal != null) {this.colWeight = newVal;}
    return this.colWeight;
  }

  constructor(rows: IRenderable[][], rowWeight=0, colWeight=0) {
    this.rows = rows;
    this.cols = d3.transpose(rows);
    this.rowWeight = rowWeight;
    this.colWeight = colWeight;
  }

  private computeLayout() {
    this.rowMinimums: number[] = this.rows.map((row: IRenderable[]) => d3.max(row, (r: IRenderable) => r.minHeight()));
    this.colMinimums: number[] = this.cols.map((col: IRenderable[]) => d3.max(col, (r: IRenderable) => r.minWidth()));
    this.minWidth  = d3.sum(this.rowMinimums);
    this.minHeight = d3.sum(this.colMinimums);

    this.rowWeights: number[] = this.rows.map((row: IRenderable[]) => d3.max(row, (r: IRenderable) => r.rowWeight()));
    this.colWeights: number[] = this.cols.map((col: IRenderable[]) => d3.max(col, (r: IRenderable) => r.colWeight()));
    this.rowWeightSum = d3.sum(rowWeights);
    this.colWeightSum = d3.sum(colWeights);
  }

  public render(element: D3.Selection, availableWidth: number, availableHeight: number) {
    var freeWidth = availableWidth - this.minWidth;
    var freeHeight = availableHeight - this.minHeight;

    if (freeWidth < 0 || freeHeight < 0) {throw "InsufficientSpaceError";}
    var rowProportionalSpace = this.rowWeights.map((w: number) => w / this.rowWeightSum * availableHeight);
    var colProportionalSpace = this.colWeights.map((w: number) => w / this.colWeightSum * availableWidth);
    var sumPair = (p: number[]) => p[0] + p[1];
    var rowHeights = d3.zip(rowProportionalSpace, this.rowMinimums).map(sumPair);
    var colWidths  = d3.zip(colProportionalSpace, this.colMinimums).map(sumPair);

    var yOffset = 0;
    this.rows.forEach((row: IRenderable[], i) {
      var xOffset = 0;
      row.forEach((renderable, j) {
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
