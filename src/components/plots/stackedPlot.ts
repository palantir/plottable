///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class Stacked<X, Y> extends Abstract.NewStylePlot<X, Y> {
    private stackedExtent = [0, 0];
    public _isVertical: boolean;

    public _onDatasetUpdate() {
      super._onDatasetUpdate();
      // HACKHACK Caused since onDataSource is called before projectors are set up.  Should be fixed by #803
      if (this._datasetKeysInOrder && this._projectors["x"]  && this._projectors["y"]) {
        this.stack();
      }
    }

    private stack() {
      var datasets = this._getDatasetsInOrder();
      var keyAccessor = this._isVertical ? this._projectors["x"].accessor : this._projectors["y"].accessor;
      var valueAccessor = this._isVertical ? this._projectors["y"].accessor : this._projectors["x"].accessor;

      var positiveValuedData: any[] = datasets.map((dataset) => {
        return dataset.data().map((datum) => {
          var key = keyAccessor(datum);
          var value = valueAccessor(datum);
          value = value >= 0 ? value : 0;
          return {key: key, value: value};
        });
      });
      this._stack(positiveValuedData);

      var negativeValuedData: any[] = datasets.map((dataset) => {
        return dataset.data().map((datum) => {
          var key = keyAccessor(datum);
          var value = valueAccessor(datum);
          value = value <= 0 ? value : 0;
          return {key: key, value: value};
        });
      });
      this._stack(negativeValuedData);

      this.setDatasetStackOffsets(datasets, positiveValuedData, negativeValuedData);

      var maxY = _Util.Methods.max(datasets, (dataset: any) => {
        return _Util.Methods.max(dataset.data(), (datum: any) => {
          return valueAccessor(datum) + datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"];
        });
      });
      this.stackedExtent[1] = Math.max(0, maxY);

      var minY = _Util.Methods.min(datasets, (dataset: any) => {
        return _Util.Methods.min(dataset.data(), (datum: any) => {
          return valueAccessor(datum) + datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"];
        });
      });
      this.stackedExtent[0] = Math.min(minY, 0);
    }

    private _stack(data: any[]) {
      var outFunction = (d: any, y0: number, y: number) => {
        d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"] = y0;
      };

      d3.layout.stack()
               .x((d) => d.key)
               .y((d) => d.value)
               .values((d) => d)
               .out(outFunction)(data);
    }

    private setDatasetStackOffsets(datasets: Dataset[], positiveStackData: any[], negativeStackData: any[]) {
      datasets.forEach((dataset, datasetIndex) => {
        var data = dataset.data();
        var valueAccessor = this._isVertical ? this._projectors["y"].accessor : this._projectors["x"].accessor;
        data.forEach((datum: any, datumIndex: number) => {
          var positiveOffset: number = positiveStackData[datasetIndex][datumIndex]["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"];
          var negativeOffset: number = negativeStackData[datasetIndex][datumIndex]["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"];
          if (valueAccessor(datum) >= 0) {
            datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"] = positiveOffset;
          } else {
            datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"] = negativeOffset;
          }
        });
      });

    }

    public _updateScaleExtents() {
      super._updateScaleExtents();
      var primaryScale: Abstract.Scale<any,number> = this._isVertical ? this._yScale : this._xScale;
      if (!primaryScale) {
        return;
      }
      if (this._isAnchored && this.stackedExtent.length > 0) {
        primaryScale._updateExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT", this.stackedExtent);
      } else {
        primaryScale._removeExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT");
      }
    }
  }
}
}
