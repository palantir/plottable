///<reference path="../lib/d3.d.ts" />
///<reference path="utils.ts" />


class MarginBlock implements IRenderable {
  private static default_xMargin = 10;
  private static default_yMargin = 10;
  public element: D3.Selection;
  // private xMargin: number;
  // private yMargin: number;

  constructor(public block: IRenderable, public xMargin = MarginBlock.default_xMargin, public yMargin = MarginBlock.default_yMargin) {
    // this.xMargin = xMargin != null ? xMargin : MarginBlock.default_xMargin;
    // this.yMargin = yMargin != null ? yMargin : MarginBlock.default_yMargin;
  }

  public getRequestedWidth(availableWidth: number, availableHeight: number) {
    return availableWidth;
  }

  public getRequestedHeight(availableWidth: number, availableHeight: number) {
    return availableHeight;
  }

  public render(element: D3.Selection, availableHeight: number, availableWidth: number) {
    this.element = element;
    var childElement = this.element.append("g").classed("margin-interior", true);
    Utils.translate(childElement, [this.xMargin, this.yMargin]);
    this.block.render(childElement, availableHeight-2*this.xMargin, availableWidth-2*this.yMargin);
  }
}


class CornerArrangement implements IRenderable {
  // Arrange so that there are (optional) columns on left + right
  // there are (optional) rows on top + bottom
  // and blank 'corners' at intersections on the edge (hence the name)
  public renderables: IRenderable[];
  public element: D3.Selection;

  constructor(
    public topBlock   : IRenderable,
    public bottomBlock: IRenderable,
    public leftBlock  : IRenderable,
    public rightBlock : IRenderable,
    public insideBlock: IRenderable
  ) {
  }

  public getRequestedWidth(availableWidth: number, availableHeight: number) {
    return availableWidth;
  }

  public getRequestedHeight(availableWidth: number, availableHeight: number) {
    return availableHeight;
  }

  public render(element: D3.Selection, availableHeight: number, availableWidth: number) {
    this.element = element;
    var topHeight    = this.topBlock    == null ? 0 : this.topBlock   .getRequestedHeight(availableHeight, availableWidth);
    var bottomHeight = this.bottomBlock == null ? 0 : this.bottomBlock.getRequestedHeight(availableHeight, availableWidth);
    var leftWidth    = this.leftBlock   == null ? 0 : this.leftBlock  .getRequestedWidth(availableHeight, availableWidth);
    var rightWidth   = this.rightBlock  == null ? 0 : this.rightBlock .getRequestedWidth(availableHeight, availableWidth);
    var insideHeight = availableHeight - topHeight - bottomHeight;
    var insideWidth  = availableWidth  - leftWidth - rightWidth;

    var insideTranslate = [leftWidth, topHeight];
    CornerArrangement.layoutAndRenderBlock(this.element, this.insideBlock, "inside-block", insideTranslate, insideWidth, insideHeight);

    var topTranslate = [leftWidth, 0];
    CornerArrangement.layoutAndRenderBlock(this.element, this.topBlock, "top-block", topTranslate, insideWidth, topHeight);

    var bottomTranslate = [leftWidth, topHeight + insideHeight];
    CornerArrangement.layoutAndRenderBlock(this.element, this.bottomBlock, "bottom-block", bottomTranslate, insideWidth, bottomHeight);

    var leftTranslate = [0, topHeight];
    CornerArrangement.layoutAndRenderBlock(this.element, this.leftBlock, "left-block", leftTranslate, leftWidth, insideHeight);

    var rightTranslate = [leftWidth + insideWidth, topHeight];
    CornerArrangement.layoutAndRenderBlock(this.element, this.rightBlock, "right-block", rightTranslate, rightWidth, insideHeight);

  }

  public static layoutAndRenderBlock(
    parentElement: D3.Selection,
    block: IRenderable,
    className: string,
    translate: number[],
    width: number,
    height: number
  ) {
    if (block != null) {
      var element = parentElement.append("g").classed(className, true);
      Utils.translate(element, translate);
      block.render(element, width, height);
    }
  }
}

class ColumnArrangement implements IRenderable {
  public element: D3.Selection;
  constructor(public blocks: IRenderable[]) {

  }

  public getRequestedWidth(availableWidth: number, availableHeight: number) {
    var requestedWidths = this.blocks.map((b) => b.getRequestedWidth(availableWidth, availableHeight));
    return d3.sum(requestedWidths);
  }

  public getRequestedHeight(availableWidth: number, availableHeight: number) {
    return availableHeight;
  }

  public render(element: D3.Selection, availableHeight: number, availableWidth: number){
    this.element = element;
    var widthOffset = 0;
    this.blocks.forEach((b,i) => {
      var translate = [widthOffset, 0];
      var blockElement = this.element.append("g").classed("column-" + i, true);
      Utils.translate(blockElement, translate);
      var requestedWidth = b.getRequestedWidth(availableHeight, availableWidth);
      b.render(blockElement, availableHeight, requestedWidth);
      widthOffset += requestedWidth;
    });
  }
}

// class RowArrangement implements IRenderable {
//   public element: D3.Selection;
//   constructor(public blocks: IRenderable[]) {
//   }

//   public getRequestedWidth(availableWidth: number, availableHeight: number) {
//     return availableWidth;
//   }

//   public getRequestedHeight(availableWidth: number, availableHeight: number) {
//     var requestedHeights = this.blocks.map((b) => b.getRequestedHeight(availableWidth, availableHeight));
//     return d3.sum(requestedHeights);
//   }

//   public render(element: D3.Selection, availableHeight: number, availableWidth: number){
//     this.element = element;
//     var heightOffset = 0;
//     this.blocks.forEach((b,i) => {
//       var translate = [0, heightOffset];
//       var blockElement = this.element.append("g").classed("row-" + i, true);
//       Utils.translate(blockElement, translate);
//       var requestedHeight = b.getRequestedHeight(availableHeight, availableWidth);
//       b.render(blockElement, availableHeight, requestedWidth);
//       heightOffset += requestedWidth;
//     });
//   }
// }
