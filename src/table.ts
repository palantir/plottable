///<reference path="../lib/d3.d.ts" />

interface ILayoutPacket {
  minWidth: number;
  minHeight: number;
  weightWidth: number;
  weightHeight: number;
  alignment: string;
}

interface IRenderable {
  render: (element: D3.Selection, width: number, height: number) => ();

  layoutPacket: ILayoutPacket;
}

class Table implements IRenderable {
  public layoutPacket: ILayoutPacket;

  private rowMinimums: number[];
  private colMinimums: number[];

  private rowWeights: number[];
  private colWeights: number[];

  private rowWeightSum: number;
  private colWeightSum: number;

  private static getMinimumHeight(row: IRenderable[]) {

  }

  constructor(private rows: IRenderable[][], private widthWeight: number, private heightWeight: number) {
    private columns = d3.transpose(this.rows);
  }

  private computeLayout() {
    var getPacket = (r: IRenderable) => r.layoutPacket;

    var rowPackets: ILayoutPacket[][] = this.rows.map((row: IRenderable[]) => row.map(getPacket));
    var colPackets: ILayoutPacket[][] = d3.transpose(rowPackets);

    this.rowMinHeights: number[] = rowPackets.map((rPackets) => d3.max(rPackets, (p) => p.minHeight));
    this.colMinWidths : number[] = colPackets.map((cPackets) => d3.max(cPackets, (p) => p.minWidth));

    this.rowWeights: number[] = rowPackets.map((rPackets) => d3.max(rPackets, (p) => p.minHeight));
    this.colWeights: number[] = colPackets.map((cPackets) => d3.max(cPackets, (p) => p.minWidth));

    this.rowWeightSum = d3.sum(rowWeights);
    this.colWeightSum = d3.sum(colWeights);
  }

  public render(element: D3.Selection, availableHeight: number, availableWidth: number) {

  }
}
