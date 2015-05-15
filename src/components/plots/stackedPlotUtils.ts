///<reference path="../../reference.ts" />

module Plottable {

  export module Plots {
    export interface StackedPlotMetadata extends PlotMetadata {
      offsets: D3.Map<number>;
    }

    export type StackedDatum = {
      key: any;
      value: number;
      offset?: number;
    }
  }

  export class StackedPlotUtils {
    /**
     * Feeds the data through d3's stack layout function which will calculate
     * the stack offsets and use the the function declared in .out to set the offsets on the data.
     */
    public static stack(dataArray: D3.Map<Plots.StackedDatum>[], domainKeys: string[]) {
      var outFunction = (d: Plots.StackedDatum, y0: number, y: number) => {
        d.offset = y0;
      };

      d3.layout.stack()
        .x((d) => d.key)
        .y((d) => +d.value)
        .values((d) => domainKeys.map((domainKey) => d.get(domainKey)))
        .out(outFunction)(dataArray);

      return dataArray;
    }

    public static keyAccessor(plot: XYPlot<any, any>, orientation: string) {
      return orientation === "vertical" ? plot.x().accessor : plot.y().accessor;
    }

    public static valueAccessor(plot: XYPlot<any, any>, orientation: string) {
      return orientation === "vertical" ? plot.y().accessor : plot.x().accessor;
    }

  }
}
