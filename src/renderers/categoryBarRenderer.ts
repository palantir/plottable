module Plottable {
  export class CategoryBarRenderer extends BarRenderer {
    // convenience class to smooth the transition, will be going away soon.
    constructor(dataset: any,
        xScale: Scale,
        yScale: QuantitiveScale,
        xAccessor?: IAccessor,
        widthAccessor?: IAccessor,
        yAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, widthAccessor, yAccessor);
      console.log("Plottable.CategoryBarRenderer is deprecated and will be removed in the next version.");
      console.log("Please use Plottable.BarRenderer instead.");
    }
  }
}
