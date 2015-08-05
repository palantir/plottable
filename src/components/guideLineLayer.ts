///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class GuideLineLayer<D> extends Component {

    constructor(orientation: string) {
      super();
    }

    public scale(): QuantitativeScale<D>;
    public scale(scale: QuantitativeScale<D>): GuideLineLayer<D>;
    public scale(scale?: QuantitativeScale<D>): any {
      return;
    }

    public value(): D;
    public value(value: D): GuideLineLayer<D>;
    public value(value?: D): any {
      return;
    }

    public pixelPosition(): number;
    public pixelPosition(pixelPosition: number): GuideLineLayer<D>;
    public pixelPosition(pixelPosition?: number): any {
      return;
    }
  }
}
}
