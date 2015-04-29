///<reference path="testReference.ts" />

module Mocks {
  export class FixedSizeComponent extends Plottable.Component {
    public fixedWidth: number;
    public fixedHeight: number;

    constructor(width = 0, height = 0) {
      super();
      this.fixedWidth = width;
      this.fixedHeight = height;
      this.fixedWidthFlag = true;
      this.fixedHeightFlag = true;
    }

    public requestedSpace(availableWidth: number, availableHeight: number): Plottable._SpaceRequest {
      return {
        width:  this.fixedWidth,
        height: this.fixedHeight,
        wantsWidth: availableWidth < this.fixedWidth,
        wantsHeight: availableHeight < this.fixedHeight
      };
    }
  }
}
