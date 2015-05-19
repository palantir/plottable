///<reference path="testReference.ts" />

module Mocks {
  export class FixedSizeComponent extends Plottable.Component {
    public fsWidth: number;
    public fsHeight: number;

    constructor(width = 0, height = 0) {
      super();
      this.fsWidth = width;
      this.fsHeight = height;
    }

    public requestedSpace(availableWidth: number, availableHeight: number): Plottable.SpaceRequest {
      return {
        minWidth: this.fsWidth,
        minHeight: this.fsHeight
      };
    }

    public fixedWidth() {
      return true;
    }

    public fixedHeight() {
      return true;
    }
  }
}
