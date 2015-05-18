///<reference path="../../reference.ts" />

module Plottable {

  export class Stacked<X, Y> extends XYPlot<X, Y> {
    protected _isVertical: boolean;

    public _updateStackOffsets(
        keyAccessor: Accessor<any>,
        valueAccessor: Accessor<any>,
        datasetKeys: string[],
        keyToPlotDatasetKey: D3.Map<Plots.PlotDatasetKey>) {

      var domainKeys = StackedPlotUtils.getDomainKeys(keyAccessor, datasetKeys, keyToPlotDatasetKey);

      var dataMapArray = StackedPlotUtils.generateDefaultMapArray
        (keyAccessor, valueAccessor, domainKeys, datasetKeys, keyToPlotDatasetKey);

      var positiveDataMapArray: D3.Map<Plots.StackedDatum>[] = dataMapArray.map((dataMap) => {
        return Utils.Methods.populateMap(domainKeys, (domainKey) => {
          return { key: domainKey, value: Math.max(0, dataMap.get(domainKey).value) || 0 };
        });
      });

      var negativeDataMapArray: D3.Map<Plots.StackedDatum>[] = dataMapArray.map((dataMap) => {
        return Utils.Methods.populateMap(domainKeys, (domainKey) => {
          return { key: domainKey, value: Math.min(dataMap.get(domainKey).value, 0) || 0 };
        });
      });

      var stackOffsets = StackedPlotUtils.generateStackOffsets(
        StackedPlotUtils.stack(positiveDataMapArray, domainKeys),
        StackedPlotUtils.stack(negativeDataMapArray, domainKeys),
        keyAccessor,
        valueAccessor,
        datasetKeys,
        keyToPlotDatasetKey);

      for (var datasetKey in stackOffsets) {
        var plotMetadata = <Plots.StackedPlotMetadata> keyToPlotDatasetKey.get(datasetKey).plotMetadata;
        plotMetadata.offsets = stackOffsets[datasetKey];
      }
    }
  }
}
